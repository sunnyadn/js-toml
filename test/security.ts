import { describe, it, expect } from 'vitest';
import { load, SyntaxParseError } from '../src/index.js';

describe('Security', () => {
  describe('Radix-prefixed integer literal length cap', () => {
    // Each of these inputs would, on an unpatched build, run the hand-written
    // `parseBigInt` loop `O(n^2)` times.  With the 1000-digit cap they are
    // rejected at the interpreter callsite in microseconds.
    it('should reject 0x literals longer than 1000 hex digits', () => {
      const toml = `x = 0x${'f'.repeat(1001)}`;
      expect(() => load(toml)).toThrow(SyntaxParseError);
    });

    it('should reject 0o literals longer than 1000 octal digits', () => {
      const toml = `x = 0o${'7'.repeat(1001)}`;
      expect(() => load(toml)).toThrow(SyntaxParseError);
    });

    it('should reject 0b literals longer than 1000 binary digits', () => {
      const toml = `x = 0b${'1'.repeat(1001)}`;
      expect(() => load(toml)).toThrow(SyntaxParseError);
    });

    it('should accept 0x literals up to the 1000-digit cap', () => {
      const toml = `x = 0x${'1'.repeat(1000)}`;
      const result = load(toml) as { x: bigint };
      // 4 bits per hex digit, leading `1` so result has 1000*4 - 3 bits set
      expect(typeof result.x).toBe('bigint');
      expect(result.x.toString(16)).toBe('1'.repeat(1000));
    });

    it('should reject the literal in microseconds, not seconds', () => {
      const toml = `x = 0x${'f'.repeat(50_000)}`;
      const t0 = process.hrtime.bigint();
      expect(() => load(toml)).toThrow(SyntaxParseError);
      const elapsedMs = Number(process.hrtime.bigint() - t0) / 1e6;
      // Unpatched build needs ~200 ms here; the cap should make it < 50 ms
      // even on slow CI runners.
      expect(elapsedMs).toBeLessThan(500);
    });
  });

  describe('Falsy-primitive duplicate-key bypass (GHSA-m34p-749j-x6m6)', () => {
    // A falsy-typed value (false, 0, 0.0, -0.0, nan, "") followed by a table,
    // dotted-key sub-table, or array-of-tables sharing the same name must be a
    // duplicate-key parse error, not a silent overwrite. The interpreter used
    // `if (object[key])` (truthy test) instead of `if (key in object)`.
    const falsyValues = [
      'false',
      '0',
      '0x0',
      '0o0',
      '0b0',
      '0.0',
      '-0.0',
      'nan',
      '""',
    ];

    it('should reject the advisory PoC (boolean false shadowed by a table)', () => {
      const toml = `isAdmin = false\n[isAdmin]\nforced = "yes"`;
      expect(() => load(toml)).toThrow(SyntaxParseError);
    });

    falsyValues.forEach((value) => {
      it(`should reject a [stdTable] redefining a key valued ${value}`, () => {
        expect(() => load(`k = ${value}\n[k]\nx = 1`)).toThrow(
          SyntaxParseError
        );
      });

      it(`should reject a dotted-key sub-table over a key valued ${value}`, () => {
        expect(() => load(`k = ${value}\nk.b = "x"`)).toThrow(SyntaxParseError);
      });

      it(`should reject an array-of-tables over a key valued ${value}`, () => {
        expect(() => load(`k = ${value}\n[[k]]\nb = 1`)).toThrow(
          SyntaxParseError
        );
      });
    });

    it('should still accept a single falsy primitive value', () => {
      expect(load('k = false')).toEqual({ k: false });
      expect(load('k = 0')).toEqual({ k: 0 });
      expect(load('k = ""')).toEqual({ k: '' });
    });

    it('should still accept a falsy value alongside an unrelated table', () => {
      const result = load(`flag = false\n[other]\nx = 1`);
      expect(result).toEqual({ flag: false, other: { x: 1 } });
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should not allow __proto__ pollution', () => {
      const toml = `
[__proto__]
polluted = true
`;

      const result = load(toml);

      const testObj = {};
      expect('polluted' in testObj).toBe(false);
      expect('polluted' in Object.prototype).toBe(false);

      expect(result).toHaveProperty('__proto__');
      expect(result['__proto__']).toHaveProperty('polluted', true);
    });

    it('should not allow constructor pollution', () => {
      const toml = `
[constructor]
[constructor.prototype]
polluted = true
`;

      const result = load(toml);

      const testObj = {};
      expect('polluted' in testObj).toBe(false);
      expect('polluted' in Object.prototype).toBe(false);

      expect(result).toHaveProperty('constructor');
    });

    it('should reproduce the authentication bypass scenario', () => {
      const toml = `
[__proto__]
isAdmin = true
`;

      // Simulate the vulnerable authentication function
      const isAdmin = (user: Record<string, unknown>) => {
        return user.isAdmin === true;
      };

      // Parse the malicious TOML
      load(toml);

      // Create a user object that should not be admin
      const user = { username: 'foo' };

      // This should return false (user is not admin)
      // If prototype pollution occurred, this would return true
      expect(isAdmin(user)).toBe(false);
      expect('isAdmin' in user).toBe(false);
    });

    it('should handle dotted __proto__ keys safely', () => {
      const toml = `
[table.__proto__]
polluted = true
`;

      const result = load(toml);

      const testObj = {};
      expect('polluted' in testObj).toBe(false);
      expect('polluted' in Object.prototype).toBe(false);

      expect('table' in result).toBe(true);
      expect('__proto__' in result['table']).toBe(true);
    });

    it('should handle inline table __proto__ safely', () => {
      const toml = `
obj = { __proto__ = { polluted = true } }
`;

      const result = load(toml);

      const testObj = {};
      expect('polluted' in testObj).toBe(false);
      expect('polluted' in Object.prototype).toBe(false);

      expect(result).toHaveProperty('obj');
    });
  });

  it('should not allow pollution via array of tables syntax', () => {
    const toml = `
[[__proto__]]
polluted = true
`;
    const result = load(toml);

    expect('polluted' in Object.prototype).toBe(false);
    expect('polluted' in Array.prototype).toBe(false);

    expect(result).toHaveProperty('__proto__');
    expect(Array.isArray(result['__proto__'])).toBe(true);
    expect(result['__proto__'][0]).toEqual({ polluted: true });
  });

  it('should handle deeply nested __proto__ keys safely', () => {
    const toml = `
[a.b.__proto__.c]
polluted = true
`;
    const result = load(toml);

    const testObj = {};
    expect('polluted' in testObj).toBe(false);

    const resultObj = result as Record<
      string,
      Record<string, Record<string, Record<string, unknown>>>
    >;
    expect(resultObj.a.b['__proto__'].c).toEqual({ polluted: true });
  });

  it('should treat "prototype" as a regular key', () => {
    const toml = `
[prototype]
polluted = true
`;
    const result = load(toml);

    const testObj = {};
    expect('polluted' in testObj).toBe(false);

    expect(result).toHaveProperty('prototype');
    expect(result['prototype']).toEqual({ polluted: true });
  });
});

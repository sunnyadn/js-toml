import { describe, it, expect } from 'vitest';
import { load } from '../src/index.js';

describe('Security', () => {
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

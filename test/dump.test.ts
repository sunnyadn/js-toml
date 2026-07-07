import { describe, it, expect } from 'vitest';
import { dump } from '../src/dump/index.js';
import { load } from '../src/load/index.js';

describe('dump', () => {
  it('should dump primitives properly', () => {
    const obj = {
      str: 'hello',
      escaped_str: 'hello "world" \\ \n',
      int: 42,
      float: 3.1415,
      bool_t: true,
      bool_f: false,
    };

    const toml = dump(obj);
    expect(toml).toMatchInlineSnapshot(`
          "str = "hello"
          escaped_str = "hello \\"world\\" \\\\ \\n"
          int = 42
          float = 3.1415
          bool_t = true
          bool_f = false
          "
        `);

    // Round trip test
    expect(load(toml)).toEqual(obj);
  });

  it('should dump datetime', () => {
    const date = new Date('1979-05-27T07:32:00Z');
    const obj = { dob: date };

    const toml = dump(obj);
    expect(toml).toBe(`dob = 1979-05-27T07:32:00.000Z\n`);
  });

  it('should dump inline arrays', () => {
    const obj = {
      arr_int: [1, 2, 3],
      arr_str: ['a', 'b', 'c'],
      arr_mixed: [1, 'a', true],
    };

    const toml = dump(obj);
    expect(toml).toMatchInlineSnapshot(`
          "arr_int = [1, 2, 3]
          arr_str = ["a", "b", "c"]
          arr_mixed = [1, "a", true]
          "
        `);

    expect(load(toml)).toEqual(obj);
  });

  it('should dump simple tables', () => {
    const obj = {
      title: 'Config',
      server: {
        host: '127.0.0.1',
        port: 8080,
      },
    };

    const toml = dump(obj);
    expect(toml).toMatchInlineSnapshot(`
          "title = "Config"

          [server]
          host = "127.0.0.1"
          port = 8080
          "
        `);

    expect(load(toml)).toEqual(obj);
  });

  it('should dump nested tables', () => {
    const obj = {
      a: {
        b: {
          c: {
            val: 1,
          },
        },
      },
    };

    const toml = dump(obj);
    expect(toml).toMatchInlineSnapshot(`
          "[a.b.c]
          val = 1
          "
        `);

    expect(load(toml)).toEqual(obj);
  });

  it('should dump array of tables', () => {
    const obj = {
      products: [
        { name: 'Hammer', sku: 738594937 },
        {},
        { name: 'Nail', sku: 284758393, color: 'gray' },
      ],
    };

    const toml = dump(obj);
    expect(toml).toMatchInlineSnapshot(`
          "[[products]]
          name = "Hammer"
          sku = 738594937

          [[products]]

          [[products]]
          name = "Nail"
          sku = 284758393
          color = "gray"
          "
        `);

    expect(load(toml)).toEqual(obj);
  });

  it('should handle options.forceQuotes', () => {
    const obj = { foo: 'bar' };
    const toml = dump(obj, { forceQuotes: true });
    expect(toml).toBe(`"foo" = "bar"\n`);
  });

  it('should handle options.ignoreUndefined', () => {
    const obj = {
      valid: 'value',
      ignored: undefined,
      badType: Symbol('a'),
    };

    const toml = dump(obj, { ignoreUndefined: true });
    expect(toml).toBe(`valid = "value"\n`);

    // Default should throw
    expect(() => dump(obj)).toThrow();
  });

  it('should handle sparse arrays and deep undefined elimination with ignoreUndefined: true', () => {
    const obj = {
      a: [{ x: 1 }, undefined, { y: 2 }],
      b: [undefined, undefined, { z: 3 }],
    };

    const toml = dump(obj, { ignoreUndefined: true });
    expect(toml).toMatchInlineSnapshot(`
          "[[a]]
          x = 1

          [[a]]
          y = 2

          [[b]]
          z = 3
          "
        `);
  });

  it('should throw on sparse array if ignoreUndefined is false', () => {
    const obj = {
      a: [undefined, undefined, { z: 3 }],
    };
    expect(() => dump(obj)).toThrow(
      'Cannot dump unsupported value type: undefined'
    );
  });

  it('should throw when called with a non-plain-object input', () => {
    expect(() =>
      dump('not an object' as unknown as Record<string, unknown>)
    ).toThrow('dump requires a plain object (TOML table) as input');
    expect(() => dump(42 as unknown as Record<string, unknown>)).toThrow(
      'dump requires a plain object (TOML table) as input'
    );
    expect(() => dump([] as unknown as Record<string, unknown>)).toThrow(
      'dump requires a plain object (TOML table) as input'
    );
  });

  it('should throw on unsupported value types (Symbol)', () => {
    const obj = { s: Symbol('a') };
    expect(() => dump(obj as unknown as Record<string, unknown>)).toThrow(
      'Cannot dump unsupported type: symbol'
    );
  });

  it('should throw when dumping an invalid Date', () => {
    const obj = { d: new Date('invalid') };
    expect(() => dump(obj)).toThrow('Cannot dump invalid Date');
  });

  // TOML 1.1 documents must round-trip through dump(), while dump() itself
  // keeps emitting TOML 1.0-compatible syntax only (documented decision).
  it('should round-trip TOML 1.1 syntax through 1.0-only dump output', () => {
    const input = `table = {
  esc = "\\e[1m\\x61",
  time = 13:37,
  nested = { x = 1,
             y = 2, },
}`;
    const loaded = load(input);
    const dumped = dump(loaded);

    // dump() output stays TOML 1.0: single-line inline tables, no trailing
    // commas, and only 1.0 escape sequences.
    expect(dumped).toMatchInlineSnapshot(`
      "[table]
      esc = "\\u001b[1ma"
      time = "13:37:00"

      [table.nested]
      x = 1
      y = 2
      "
    `);

    expect(load(dumped)).toEqual(loaded);
  });

  it('should round-trip seconds-less date-times as full-precision 1.0 datetimes', () => {
    const input = 'odt = 1987-07-05T17:45Z';
    const loaded = load(input);
    const dumped = dump(loaded);

    expect(dumped).toBe('odt = 1987-07-05T17:45:00.000Z\n');
    expect(load(dumped)).toEqual(loaded);
  });
});

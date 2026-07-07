import { load, SyntaxParseError } from '../src/index.js';

it('should support inline tables', () => {
  const input = `name = { first = "Tom", last = "Preston-Werner" }
point = { x = 1, y = 2 }
animal = { type.name = "pug" }`;
  const result = load(input);

  expect(result).toEqual({
    name: { first: 'Tom', last: 'Preston-Werner' },
    point: { x: 1, y: 2 },
    animal: { type: { name: 'pug' } },
  });
});

it('should support empty inline tables', () => {
  const input = 'a = {}';
  const result = load(input);

  expect(result).toEqual({ a: {} });
});

it('should support all value types in inline tables', () => {
  const input = `a = { b = 1, c = "2", d = true, e = 1979-05-27T07:32:00Z, f = [1, 2, 3], g = { h = 4 } }`;
  const result = load(input);

  expect(result).toEqual({
    a: {
      b: 1,
      c: '2',
      d: true,
      e: new Date(Date.UTC(1979, 4, 27, 7, 32, 0)),
      f: [1, 2, 3],
      g: { h: 4 },
    },
  });
});

// Flipped for TOML 1.1: inline tables may span multiple lines and end with a
// trailing comma (toml-lang/toml CHANGELOG 1.1.0 #904). These inputs threw in
// TOML 1.0.
it('should support an inline table spanning multiple lines', () => {
  const input = `json_like = {
          first = "Tom",
          last = "Preston-Werner"
}`;
  const result = load(input);

  expect(result).toEqual({
    json_like: { first: 'Tom', last: 'Preston-Werner' },
  });
});

it('should support trailing commas in inline tables', () => {
  const input = 'a = { b = 1, }';
  const result = load(input);

  expect(result).toEqual({ a: { b: 1 } });
});

it('should support values spanning multiple lines in an inline table', () => {
  const input = `a = { b = """multi
line
string""" }`;
  const result = load(input);

  expect(result).toEqual({ a: { b: 'multi\nline\nstring' } });
});

it('should throw error if adding keys outside the inline table', () => {
  const input = `[product]
type = { name = "Nail" }
type.edible = false  # INVALID`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if adding keys to an already defined table in an inline table', () => {
  const input = `[product]
type.name = "Nail"
type = { edible = false }  # INVALID`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support use inline tables as values in arrays', () => {
  const input = `points = [ { x = 1, y = 2, z = 3 },
           { x = 7, y = 8, z = 9 },
           { x = 2, y = 4, z = 8 } ]
`;
  const result = load(input);

  expect(result).toEqual({
    points: [
      { x: 1, y: 2, z: 3 },
      { x: 7, y: 8, z: 9 },
      { x: 2, y: 4, z: 8 },
    ],
  });
});

// TOML 1.1: inline tables may span multiple lines and end with a trailing comma
// (toml-lang/toml CHANGELOG 1.1.0 #904; ABNF `inline-table-keyvals` uses
// `ws-comment-newline` around key/value pairs and allows `[ inline-table-sep ]`).

it('should support a trailing comma followed by a newline before the closing brace', () => {
  const input = `a = {
  b = 1,
  c = "two",
}`;
  const result = load(input);

  expect(result).toEqual({ a: { b: 1, c: 'two' } });
});

it('should support newlines before and after the separator comma', () => {
  const input = `t1 = {a=1,
b=2}
t2 = {a=1
,b=2}`;
  const result = load(input);

  expect(result).toEqual({ t1: { a: 1, b: 2 }, t2: { a: 1, b: 2 } });
});

it('should support empty inline tables containing only newlines', () => {
  const input = `a = {
}`;
  const result = load(input);

  expect(result).toEqual({ a: {} });
});

it('should support nested multi-line inline tables', () => {
  const input = `a = { b = {
  c = 1,
  d = { e = 2,
        f = 3 },
}, g = 4 }`;
  const result = load(input);

  expect(result).toEqual({
    a: { b: { c: 1, d: { e: 2, f: 3 } }, g: 4 },
  });
});

it('should support comments inside multi-line inline tables', () => {
  // TOML 1.1.0 ABNF: `ws-comment-newline = *( wschar / [ comment ] newline )`,
  // so a comment inside an inline table must be followed by a newline.
  const input = `a = { # comment after the opening brace
  b = 1, # comment after a value
  # comment on its own line
  c = 2,
}`;
  const result = load(input);

  expect(result).toEqual({ a: { b: 1, c: 2 } });
});

it('should support multi-line inline tables inside arrays', () => {
  const input = `points = [ { x = 1,
  y = 2 }, {
  x = 3,
  y = 4,
} ]`;
  const result = load(input);

  expect(result).toEqual({
    points: [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ],
  });
});

it('should throw error if a comment right before the closing brace has no newline', () => {
  // TOML 1.1.0 ABNF: in `ws-comment-newline` a comment is always followed by a
  // newline, so `}` on the same line gets swallowed by the comment.
  const input = 'a = { b = 1 # comment }';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if a newline appears between key and equals sign in an inline table', () => {
  // TOML 1.1.0 ABNF: `keyval-sep = ws %x3D ws` — no newline allowed around `=`.
  const input = `a = { b
= 1 }`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if a newline appears between equals sign and value in an inline table', () => {
  // TOML 1.1.0 ABNF: `keyval-sep = ws %x3D ws` — no newline allowed around `=`.
  const input = `a = { b =
1 }`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

// Regression guard for the keyValInterior lookahead in InlineTableNewline:
// it scans horizontal whitespace only, so each newline in a run is validated
// independently and the last one still catches an illegal `=`/`.`.
it('should handle runs of newlines inside inline tables', () => {
  expect(load('a = {\n\n\nb = 1 }')).toEqual({ a: { b: 1 } });
  expect(() => load('a = { b\n\n\n= 1 }')).toThrow(SyntaxParseError);
});

it('should throw error for an unterminated inline table at end of input', () => {
  const input = `a = { b = 1,
  c = 2`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error for a comma without any key/value pair', () => {
  const input = `a = {
, }`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error for a lone carriage return inside an inline table', () => {
  // TOML 1.1.0 ABNF: `newline = %x0A / %x0D.0A` — a bare CR is not a newline.
  const input = 'a = {\r b = 1 }';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

import { load, SyntaxParseError } from '../src';

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

  expect(result).toEqual({a: {}});
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
      g: {h: 4},
    },
  });
});

it('should throw error if an inline table spans multiple lines', () => {
  const input = `a = {
  b = 1
}`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if any terminating commas are found in inline tables', () => {
  const input = 'a = { b = 1, }';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support values spanning multiple lines in an inline table', () => {
  const input = `a = { b = """multi
line
string""" }`;
  const result = load(input);

  expect(result).toEqual({a: {b: 'multi\nline\nstring'}});
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
`
  const result = load(input);

  expect(result).toEqual({points: [{x: 1, y: 2, z: 3}, {x: 7, y: 8, z: 9}, {x: 2, y: 4, z: 8}]});
});

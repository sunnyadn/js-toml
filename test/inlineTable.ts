import { load, SyntaxParseError } from '../src';

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

  expect(result).toEqual({ a: { b: 'multi\nline\nstring' } });
});

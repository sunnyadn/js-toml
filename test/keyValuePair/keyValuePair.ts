import {load, SyntaxParseError} from "../../src";

it('should parse key value pair without whitespace', () => {
  const input = "key=\"value\"";
  const result = load(input);

  expect(result).toEqual({key: "value"});
});

it('should parse key value pair with whitespace', () => {
  const input = "key = \"value\"";
  const result = load(input);

  expect(result).toEqual({key: "value"});
});

it('should throw error if value is missing', () => {
  const input = "key = # INVALID";

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if no new line after a key-value pair', () => {
  const input = "first = \"Tom\" last = \"Preston-Werner\" # INVALID";

  expect(() => load(input)).toThrow(SyntaxParseError);
});
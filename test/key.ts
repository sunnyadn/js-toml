import {load, SyntaxParseError} from "../src";

it('should support bare keys', () => {
  const input = `key = "value"
bare_key = "value"
bare-key = "value"
1234 = "value"`;
  const result = load(input);

  expect(result).toEqual({key: "value", bare_key: "value", "bare-key": "value", "1234": "value"});
});

it('should support quoted keys', () => {
  const input = `"127.0.0.1" = "value"
"character encoding" = "value"
"ʎǝʞ" = "value"
'key2' = "value"
'quoted "value"' = "value"`;
  const result = load(input);

  expect(result).toEqual({
    "127.0.0.1": "value",
    "character encoding": "value",
    "ʎǝʞ": "value",
    key2: "value",
    "quoted \"value\"": "value"
  });
});

it('should throw error if bare key is empty', () => {
  const input = "= \"no key name\"  # INVALID";

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support empty double-quoted keys', () => {
  const input = '"" = "blank"     # VALID but discouraged';
  const result = load(input);

  expect(result).toEqual({"": "blank"});
});

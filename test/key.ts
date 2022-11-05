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

it('should support empty single-quoted keys', () => {
  const input = "'' = 'blank'     # VALID but discouraged";
  const result = load(input);

  expect(result).toEqual({"": "blank"});
});

it('should support dotted keys', () => {
  const input = `name = "Orange"
physical.color = "orange"
physical.shape = "round"
site."google.com" = true`;
  const result = load(input);

  expect(result).toEqual({name: "Orange", physical: {color: "orange", shape: "round"}, site: {"google.com": true}});
});

it('should support whitespace around dots', () => {
  const input = `fruit.name = "banana"     # this is best practice
fruit. color = "yellow"    # same as fruit.color
fruit . flavor = "banana"   # same as fruit.flavor`;
  const result = load(input);

  expect(result).toEqual({fruit: {name: "banana", color: "yellow", flavor: "banana"}});
});

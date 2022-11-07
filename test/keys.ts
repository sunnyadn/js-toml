import {load, SyntaxParseError} from "../src";

it('should support bare keys', () => {
  const input = `key = "value"
bare_key = "value"
bare-key = "value"
1234 = "value"`;
  const result = load(input);

  expect(result).toEqual({key: "value", bare_key: "value", "bare-key": "value", "1234": "value"});
});

it('should support integer keys', () => {
  const input = `1234 = "value"
0xDEADBEEF = "value"
0o755 = "value"
0b11010110 = "value"`;
  const result = load(input);

  expect(result).toEqual({"1234": "value", "0xDEADBEEF": "value", "0o755": "value", "0b11010110": "value"});
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

it('should throw error if a key is duplicated', () => {
  const input = `# DO NOT DO THIS
name = "Tom"
name = "Pradyun"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error when a bare key has the same name as a quoted key', () => {
  const input = `# THIS WILL NOT WORK
spelling = "favorite"
"spelling" = "favourite"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should parse if a key has not been directly defined', () => {
  const input = `# This makes the key "fruit" into a table.
fruit.apple.smooth = true

# So then you can add to the table "fruit" like so:
fruit.orange = 2`;
  const result = load(input);

  expect(result).toEqual({fruit: {apple: {smooth: true}, orange: 2}});
});

it('should throw error if overwrite a primitive value with object', () => {
  const input = `# THE FOLLOWING IS INVALID

# This defines the value of fruit.apple to be an integer.
fruit.apple = 1

# But then this treats fruit.apple like it's a table.
# You can't turn an integer into a table.
fruit.apple.smooth = true`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support out-of-order dotted keys', () => {
  const input = `# VALID BUT DISCOURAGED

apple.type = "fruit"
orange.type = "fruit"

apple.skin = "thin"
orange.skin = "thick"

apple.color = "red"
orange.color = "orange"`;
  const result = load(input);

  expect(result).toEqual({
    apple: {type: "fruit", skin: "thin", color: "red"},
    orange: {type: "fruit", skin: "thick", color: "orange"}
  });
});

it('should support ordered dotted keys', () => {
  const input = `# RECOMMENDED

apple.type = "fruit"
apple.skin = "thin"
apple.color = "red"

orange.type = "fruit"
orange.skin = "thick"
orange.color = "orange"`;
  const result = load(input);

  expect(result).toEqual({
    apple: {type: "fruit", skin: "thin", color: "red"},
    orange: {type: "fruit", skin: "thick", color: "orange"}
  });
});

it('should support dotted keys only containing digits', () => {
  const input = '3.14159 = "pi"';
  const result = load(input);

  expect(result).toEqual({"3": {"14159": "pi"}});
});

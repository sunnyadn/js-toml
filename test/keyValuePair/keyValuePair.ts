import {load} from "../../src";

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
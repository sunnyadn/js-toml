import {load} from "../../src";

it('should parse key value pair', () => {
  const input = "key=\"value\"";
  const result = load(input);

  expect(result).toEqual({key: "value"});
});
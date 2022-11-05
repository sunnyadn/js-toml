import {load} from "../src";

it('should support bare keys', () => {
  const input = `key = "value"
bare_key = "value"
bare-key = "value"
1234 = "value"`;
  const result = load(input);

  expect(result).toEqual({key: "value", bare_key: "value", "bare-key": "value", "1234": "value"});
});

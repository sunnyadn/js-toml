import {load} from "../../src";

it('should ignore full-line comment', () => {
  const input = "# This is a full-line comment";
  const result = load(input);

  expect(result).toEqual({});
});

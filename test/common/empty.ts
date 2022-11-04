import {load} from "../../src";

it('should parse empty string', () => {
  const input = "";
  const result = load(input);

  expect(result).toEqual({});
});
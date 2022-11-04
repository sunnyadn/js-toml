import {load} from "../../src";

it('should parse empty string', function () {
  const input = "";
  const result = load(input);

  expect(result).toEqual({});
});
import {load} from "../../src";

it('should ignore full-line comment', () => {
  const input = "# This is a full-line comment";
  const result = load(input);

  expect(result).toEqual({});
});

it('should ignore comment at the end of a line', () => {
  const input = "key = \"value\" # This is a comment";
  const result = load(input);

  expect(result).toEqual({key: "value"});
});

it('should not ignore comment in a string', () => {
  const input = "key = \"# This is not a comment\"";
  const result = load(input);

  expect(result).toEqual({key: "# This is not a comment"});
});

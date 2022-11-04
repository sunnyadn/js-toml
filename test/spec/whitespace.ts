import {load} from "../../src";

it('should treat tab(0x09) as whitespace', () => {
  const input = '\t';
  const result = load(input);

  expect(result).toEqual({});
});

it('should treat space(0x20) as whitespace', () => {
  const input = ' ';
  const result = load(input);

  expect(result).toEqual({});
});
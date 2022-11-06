import {load} from "../src";

it('should support decimal integers', () => {
  const input = `int1 = +99
int2 = 42
int3 = 0
int4 = -17`;
  const result = load(input);

  expect(result).toEqual({int1: 99, int2: 42, int3: 0, int4: -17});
});

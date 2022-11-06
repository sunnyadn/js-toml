import {load} from "../src";

it('should support decimal integers', () => {
  const input = `int1 = +99
int2 = 42
int3 = 0
int4 = -17`;
  const result = load(input);

  expect(result).toEqual({int1: 99, int2: 42, int3: 0, int4: -17});
});

it('should support underscores in integers', () => {
  const input = `int5 = 1_000
int6 = 5_349_221
int7 = 53_49_221  # Indian number system grouping
int8 = 1_2_3_4_5  # VALID but discouraged`;
  const result = load(input);

  expect(result).toEqual({int5: 1000, int6: 5349221, int7: 5349221, int8: 12345});
});

import {load, SyntaxParseError} from "../src";

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

it('should throw error if leading zeros are used', () => {
  expect(() => load("int = 042")).toThrow(SyntaxParseError);
  expect(() => load("int = +042")).toThrow(SyntaxParseError);
  expect(() => load("int = -042")).toThrow(SyntaxParseError);
});

it('should support zeroes in integers', () => {
  const input = `int12 = 0
int13 = +0
int14 = -0`;
  const result = load(input);

  expect(result).toEqual({int12: 0, int13: 0, int14: 0});
});

it('should support hexadecimal octal and binary integers', () => {
  const input = `# hexadecimal with prefix \`0x\`
hex1 = 0xDEADBEEF
hex2 = 0xdeadbeef
hex3 = 0xdead_beef

# octal with prefix \`0o\`
oct1 = 0o01234567
oct2 = 0o755 # useful for Unix file permissions

# binary with prefix \`0b\`
bin1 = 0b11010110`;
  const result = load(input);

  expect(result).toEqual({hex1: 3735928559, hex2: 3735928559, hex3: 3735928559, oct1: 342391, oct2: 493, bin1: 214});
});

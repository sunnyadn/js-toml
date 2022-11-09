import { load, SyntaxParseError } from '../src';

it('should support floats', () => {
  const input = `# fractional
flt1 = +1.0
flt2 = 3.1415
flt3 = -0.01

# exponent
flt4 = 5e+22
flt5 = 1e06
flt6 = -2E-2

# both
flt7 = 6.626e-34
`;
  const result = load(input);

  expect(result).toEqual({
    flt1: 1.0,
    flt2: 3.1415,
    flt3: -0.01,
    flt4: 5e22,
    flt5: 1e6,
    flt6: -2e-2,
    flt7: 6.626e-34,
  });
});

it('should throw error if decimal point is not surrounded by digits', () => {
  expect(() => load('invalid_float_1 = .7')).toThrowError(SyntaxParseError);
  expect(() => load('invalid_float_2 = 7.')).toThrowError(SyntaxParseError);
  expect(() => load('invalid_float_3 = 3.e+20')).toThrowError(SyntaxParseError);
});

it('should support underscores in floats', () => {
  const input = 'flt8 = 224_617.445_991_228';
  const result = load(input);

  expect(result).toEqual({ flt8: 224617.445991228 });
});

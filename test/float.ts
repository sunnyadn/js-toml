import { load } from '../src';

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

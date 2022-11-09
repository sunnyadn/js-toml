import { load } from '../src';

it('should support booleans', () => {
  const input = `bool1 = true
bool2 = false`;
  const result = load(input);

  expect(result).toEqual({ bool1: true, bool2: false });
});

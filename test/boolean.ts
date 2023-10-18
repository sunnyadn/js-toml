import { load } from '../src/index.js';

it('should support booleans', () => {
  const input = `bool1 = true
bool2 = false`;
  const result = load(input);

  expect(result).toEqual({ bool1: true, bool2: false });
});

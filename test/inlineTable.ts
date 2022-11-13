import { load } from '../src';

it('should support empty inline tables', () => {
  const input = 'a = {}';
  const result = load(input);

  expect(result).toEqual({ a: {} });
});
import { load } from '../src';

it('should support table headers', () => {
  const input = '[table]';
  const result = load(input);

  expect(result).toEqual({ table: {} });
});

import { load } from '../src/index.js';

it('should parse empty string', () => {
  const input = '';
  const result = load(input);

  expect(result).toEqual({});
});

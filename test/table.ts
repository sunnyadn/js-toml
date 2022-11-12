import { load } from '../src';

it('should support table headers', () => {
  const input = '[table]';
  const result = load(input);

  expect(result).toEqual({ table: {} });
});

it('should support tables', () => {
  const input = `[table-1]
key1 = "some string"
key2 = 123

[table-2]
key1 = "another string"
key2 = 456`;
  const result = load(input);

  expect(result).toEqual({
    'table-1': { key1: 'some string', key2: 123 },
    'table-2': { key1: 'another string', key2: 456 },
  });
});

it('should support tables with dots and quotes in their names', () => {
  const input = `[dog."tater.man"]
type.name = "pug"`;
  const result = load(input);

  expect(result).toEqual({ dog: { 'tater.man': { type: { name: 'pug' } } } });
});

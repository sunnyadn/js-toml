import { load } from '../src';

it('should support arrays of tables', () => {
  const input = `[[products]]
name = "Hammer"
sku = 738594937

[[products]]  # empty table within the array

[[products]]
name = "Nail"
sku = 284758393

color = "gray"`;
  const result = load(input);

  expect(result).toEqual({
    products: [
      { name: 'Hammer', sku: 738594937 },
      {},
      {
        name: 'Nail',
        sku: 284758393,
        color: 'gray',
      },
    ],
  });
});

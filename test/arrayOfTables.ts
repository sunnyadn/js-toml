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

it('should support sub-tables and sub-arrays of tables within arrays of tables', () => {
  const input = `[[fruits]]
name = "apple"

[fruits.physical]  # subtable
color = "red"
shape = "round"

[[fruits.varieties]]  # nested array of tables
name = "red delicious"

[[fruits.varieties]]
name = "granny smith"


[[fruits]]
name = "banana"

[[fruits.varieties]]
name = "plantain"`;
  const result = load(input);

  expect(result).toEqual({
    fruits: [{
      name: "apple",
      physical: {color: "red", shape: "round"},
      varieties: [{name: "red delicious"}, {name: "granny smith"}]
    }, {name: "banana", varieties: [{name: "plantain"}]}]
  });
});

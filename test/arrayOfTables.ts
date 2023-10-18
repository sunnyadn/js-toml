import { load, SyntaxParseError } from '../src/index.js';

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
    fruits: [
      {
        name: 'apple',
        physical: { color: 'red', shape: 'round' },
        varieties: [{ name: 'red delicious' }, { name: 'granny smith' }],
      },
      { name: 'banana', varieties: [{ name: 'plantain' }] },
    ],
  });
});

it('should throw error if redefine a table as an array of tables', () => {
  const input = `# INVALID TOML DOC
[fruit.physical]  # subtable, but to which parent element should it belong?
color = "red"
shape = "round"

[[fruit]]  # parser must throw an error upon discovering that "fruit" is
           # an array rather than a table
name = "apple"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if attempt to append to statically defined array', () => {
  const input = `# INVALID TOML DOC
fruits = []

[[fruits]] # Not allowed`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if define a normal table with the same name as an array of tables', () => {
  const input = `# INVALID TOML DOC
[[fruits]]
name = "apple"

[[fruits.varieties]]
name = "red delicious"

# INVALID: This table conflicts with the previous array of tables
[fruits.varieties]
name = "granny smith"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if define an array of tables with the same name as a normal table', () => {
  const input = `[fruits.physical]
color = "red"
shape = "round"

# INVALID: This array of tables conflicts with the previous table
[[fruits.physical]]
color = "green"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

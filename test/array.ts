import { load } from '../src';

it('should support arrays', () => {
  const input = `integers = [ 1, 2, 3 ]
colors = [ "red", "yellow", "green" ]
nested_arrays_of_ints = [ [ 1, 2 ], [3, 4, 5] ]
nested_mixed_array = [ [ 1, 2 ], ["a", "b", "c"] ]
string_array = [ "all", 'strings', """are the same""", '''type''' ]

# Mixed-type arrays are allowed
numbers = [ 0.1, 0.2, 0.5, 1, 2, 5 ]
contributors = [
  "Foo Bar <foo@example.com>",
  { name = "Baz Qux", email = "bazqux@example.com", url = "https://example.com/bazqux" }
]`;
  const result = load(input);

  expect(result).toEqual({
    integers: [1, 2, 3],
    colors: ['red', 'yellow', 'green'],
    nested_arrays_of_ints: [
      [1, 2],
      [3, 4, 5],
    ],
    nested_mixed_array: [
      [1, 2],
      ['a', 'b', 'c'],
    ],
    string_array: ['all', 'strings', 'are the same', 'type'],
    numbers: [0.1, 0.2, 0.5, 1, 2, 5],
    contributors: [
      'Foo Bar <foo@example.com>',
      {
        name: 'Baz Qux',
        email: 'bazqux@example.com',
        url: 'https://example.com/bazqux',
      },
    ],
  });
});

it('should support empty arrays', () => {
  const input = `empty_array = []
empty_nested_array = [ [] ]`;
  const result = load(input);

  expect(result).toEqual({
    empty_array: [],
    empty_nested_array: [[]],
  });
});

it('should support arrays spanning multiple lines', () => {
  const input = `integers2 = [
  1, 2, 3
]

integers3 = [
  1,
  2, # this is ok
]`;
  const result = load(input);

  expect(result).toEqual({ integers2: [1, 2, 3], integers3: [1, 2] });
});

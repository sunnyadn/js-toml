import { load, SyntaxParseError } from '../src';

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

it('should support whitespaces around table keys', () => {
  const input = `[a.b.c]            # this is best practice
[ d.e.f ]          # same as [d.e.f]
[ g .  h  . i ]    # same as [g.h.i]
[ j . "ʞ" . 'l' ]  # same as [j."ʞ".'l']`;
  const result = load(input);

  expect(result).toEqual({
    a: { b: { c: {} } },
    d: { e: { f: {} } },
    g: { h: { i: {} } },
    j: { ʞ: { l: {} } },
  });
});

it('should ignore indentation', () => {
  const input = `  [a]
  b = 1`;
  const result = load(input);

  expect(result).toEqual({ a: { b: 1 } });
});

it('should support creating super tables', () => {
  const input = `# [x] you
# [x.y] don't
# [x.y.z] need these
[x.y.z.w] # for this to work

[x] # defining a super-table afterward is ok
`;
  const result = load(input);

  expect(result).toEqual({ x: { y: { z: { w: {} } } } });
});

it('should throw an error if a table is redefined', () => {
  const input = `# DO NOT DO THIS

[fruit]
apple = "red"

[fruit]
orange = "orange"`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw an error if overwriting a value with a table', () => {
  const input = `# DO NOT DO THIS EITHER

[fruit]
apple = "red"

[fruit.apple]
texture = "smooth"`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support defining tables out-of-order', () => {
  const input = `# VALID BUT DISCOURAGED
[fruit.apple]
[animal]
[fruit.orange]`;
  const result = load(input);

  expect(result).toEqual({ fruit: { apple: {}, orange: {} }, animal: {} });
});

it('should support defining tables in order', () => {
  const input = `# RECOMMENDED
[fruit.apple]
[fruit.orange]
[animal]`;
  const result = load(input);

  expect(result).toEqual({ fruit: { apple: {}, orange: {} }, animal: {} });
});

it('should support recognizing top-level table', () => {
  const input = `# Top-level table begins.
name = "Fido"
breed = "pug"

# Top-level table ends.
[owner]
name = "Regina Dogman"
member_since = 1999-08-04`;
  const result = load(input);

  expect(result).toEqual({
    name: 'Fido',
    breed: 'pug',
    owner: {
      name: 'Regina Dogman',
      member_since: new Date(Date.UTC(1999, 7, 4)),
    },
  });
});

it('should create a table for each key part before the last one with dotted keys', () => {
  const input = `fruit.apple.color = "red"
# Defines a table named fruit
# Defines a table named fruit.apple

fruit.apple.taste.sweet = true
# Defines a table named fruit.apple.taste
# fruit and fruit.apple were already created`;
  const result = load(input);

  expect(result).toEqual({
    fruit: { apple: { color: 'red', taste: { sweet: true } } },
  });
});

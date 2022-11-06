import {load} from "../src";

it('should support escaped characters', () => {
  const input = `str = "I'm a string. \\"You can quote me\\". Name\\tJos\\u00E9\\nLocation\\tSF."`;
  const result = load(input);

  expect(result).toEqual({str: "I'm a string. \"You can quote me\". Name\tJosé\nLocation\tSF."});
});

it('should support multi-line basic strings', () => {
  const input = `str1 = """
Roses are red
Violets are blue"""

# On a Unix system, the above multi-line string will most likely be the same as:
str2 = "Roses are red\\nViolets are blue"

# On a Windows system, it will most likely be equivalent to:
str3 = "Roses are red\\r\\nViolets are blue"`;
  const result = load(input);

  expect(result).toEqual({
    str1: "Roses are red\nViolets are blue",
    str2: "Roses are red\nViolets are blue",
    str3: "Roses are red\r\nViolets are blue"
  });
});

it('should support whitespace trimming in multi-line basic strings', () => {
  const input = `# The following strings are byte-for-byte equivalent:
str1 = "The quick brown fox jumps over the lazy dog."

str2 = """
The quick brown \\


  fox jumps over \\
    the lazy dog."""

str3 = """\\
       The quick brown \\
       fox jumps over \\
       the lazy dog.\\
       """`;
  const result = load(input);

  expect(result).toEqual({
    str1: "The quick brown fox jumps over the lazy dog.",
    str2: "The quick brown fox jumps over the lazy dog.",
    str3: "The quick brown fox jumps over the lazy dog."
  });
});

it('should support quotation marks in multi-line basic strings', () => {
  const input = `str4 = """Here are two quotation marks: "". Simple enough."""`;
  const result = load(input);

  expect(result).toEqual({str4: 'Here are two quotation marks: "". Simple enough.',});
});

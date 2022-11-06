import {load, SyntaxParseError} from "../src";

it('should support escaped characters', () => {
  const input = `str = "I'm a string. \\"You can quote me\\". Name\\tJos\\u00E9\\nLocation\\tSF."`;
  const result = load(input);

  expect(result).toEqual({str: "I'm a string. \"You can quote me\". Name\tJosé\nLocation\tSF."});
});

it('should support unicode escape sequences', () => {
  const input = `str = "Jos\\u00E9 \\U0001F47B"`;
  const result = load(input);

  expect(result).toEqual({str: "José 👻"});
});

it('should throw error if unsupported escape sequence is used', () => {
  const input = `str = "I'm a string. \\z"`;

  expect(() => load(input)).toThrow(SyntaxParseError);
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

it('should throw error when there are three adjacent quotation marks in multi-line basic strings', () => {
  const input = `str5 = """Here are three quotation marks: """."""  # INVALID`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support escaped quotation marks in multi-line basic strings', () => {
  const input = `str5 = """Here are three quotation marks: ""\\"."""
str6 = """Here are fifteen quotation marks: ""\\"""\\"""\\"""\\"""\\"."""`;
  const result = load(input);

  expect(result).toEqual({
    str5: 'Here are three quotation marks: """.',
    str6: 'Here are fifteen quotation marks: """"""""""""""".'
  });
});

it('should support quotation marks right after and before the opening and closing delimiters in multi-line basic strings', () => {
  const input = `# "This," she said, "is just a pointless statement."
str7 = """"This," she said, "is just a pointless statement.""""`;

  const result = load(input);
  expect(result).toEqual({str7: '"This," she said, "is just a pointless statement."',});
});

it('should not escape in a literal string', () => {
  const input = `# What you see is what you get.
winpath  = 'C:\\Users\\nodejs\\templates'
winpath2 = '\\\\ServerX\\admin$\\system32\\'
quoted   = 'Tom "Dubs" Preston-Werner'
regex    = '<\\i\\c*\\s*>'`;
  const result = load(input);

  expect(result).toEqual({
    winpath: 'C:\\Users\\nodejs\\templates',
    winpath2: '\\\\ServerX\\admin$\\system32\\',
    quoted: 'Tom "Dubs" Preston-Werner',
    regex: '<\\i\\c*\\s*>'
  });
});

it('should support multi-line literal strings', () => {
  const input = `regex2 = '''I [dw]on't need \\d{2} apples'''
lines  = '''
The first newline is
trimmed in raw strings.
   All other whitespace
   is preserved.
'''`;
  const result = load(input);

  expect(result).toEqual({
    regex2: "I [dw]on't need \\d{2} apples",
    lines: "The first newline is\ntrimmed in raw strings.\n   All other whitespace\n   is preserved.\n"
  });
});

it('should support quotation marks in multi-line literal strings', () => {
  const input = `quot15 = '''Here are fifteen quotation marks: """""""""""""""'''`;
  const result = load(input);

  expect(result).toEqual({quot15: 'Here are fifteen quotation marks: """""""""""""""',});
});

it('should throw error when there are three adjacent apostrophes in multi-line literal strings', () => {
  const input = `apos15 = '''Here are fifteen apostrophes: ''''''''''''''''''  # INVALID`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support three adjacent apostrophes in basic strings', () => {
  const input = `apos15 = "Here are fifteen apostrophes: '''''''''''''''"`;
  const result = load(input);

  expect(result).toEqual({apos15: "Here are fifteen apostrophes: '''''''''''''''"});
});

it('should support apostrophes inside multi-line literal strings', () => {
  const input = `# 'That,' she said, 'is still pointless.'
str = ''''That,' she said, 'is still pointless.''''`;
  const result = load(input);

  expect(result).toEqual({str: "'That,' she said, 'is still pointless.'"});
});

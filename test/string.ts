import { load, SyntaxParseError } from '../src/index.js';

it('should support escaped characters', () => {
  const input = `str = "I'm a string. \\"You can quote me\\". Name\\tJos\\u00E9\\nLocation\\tSF."
otherEscape = "\\b \\f \\\\"`;
  const result = load(input);

  expect(result).toEqual({
    str: 'I\'m a string. "You can quote me". Name\tJosé\nLocation\tSF.',
    otherEscape: '\b \f \\',
  });
});

it('should support unicode escape sequences', () => {
  const input = `str = "Jos\\u00E9 \\U0001F47B"`;
  const result = load(input);

  expect(result).toEqual({ str: 'José 👻' });
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
    str1: 'Roses are red\nViolets are blue',
    str2: 'Roses are red\nViolets are blue',
    str3: 'Roses are red\r\nViolets are blue',
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
    str1: 'The quick brown fox jumps over the lazy dog.',
    str2: 'The quick brown fox jumps over the lazy dog.',
    str3: 'The quick brown fox jumps over the lazy dog.',
  });
});

it('should support escape sequences in multi-line basic strings', () => {
  const input = `str = "I'm a string. \\"You can quote me\\". Name\\tJos\\u00E9\\nLocation\\tSF."
otherEscape = "\\b \\f \\\\"`;
  const result = load(input);

  expect(result).toEqual({
    str: 'I\'m a string. "You can quote me". Name\tJosé\nLocation\tSF.',
    otherEscape: '\b \f \\',
  });
});

it('should support unicode escape sequences in multi-line basic strings', () => {
  const input = `str = """Jos\\u00E9 \\U0001F47B"""`;
  const result = load(input);

  expect(result).toEqual({ str: 'José 👻' });
});

it('should throw error if unsupported control character is not escaped in multi-line basic strings', () => {
  const input = `str = """
\b
"""`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support quotation marks in multi-line basic strings', () => {
  const input = `str4 = """Here are two quotation marks: "". Simple enough."""`;
  const result = load(input);

  expect(result).toEqual({
    str4: 'Here are two quotation marks: "". Simple enough.',
  });
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
    str6: 'Here are fifteen quotation marks: """"""""""""""".',
  });
});

it('should support quotation marks right after and before the opening and closing delimiters in multi-line basic strings', () => {
  const input = `# "This," she said, "is just a pointless statement."
str7 = """"This," she said, "is just a pointless statement.""""`;

  const result = load(input);
  expect(result).toEqual({
    str7: '"This," she said, "is just a pointless statement."',
  });
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
    regex: '<\\i\\c*\\s*>',
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
    lines:
      'The first newline is\ntrimmed in raw strings.\n   All other whitespace\n   is preserved.\n',
  });
});

it('should support quotation marks in multi-line literal strings', () => {
  const input = `quot15 = '''Here are fifteen quotation marks: """""""""""""""'''`;
  const result = load(input);

  expect(result).toEqual({
    quot15: 'Here are fifteen quotation marks: """""""""""""""',
  });
});

it('should throw error when there are three adjacent apostrophes in multi-line literal strings', () => {
  const input = `apos15 = '''Here are fifteen apostrophes: ''''''''''''''''''  # INVALID`;
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support three adjacent apostrophes in basic strings', () => {
  const input = `apos15 = "Here are fifteen apostrophes: '''''''''''''''"`;
  const result = load(input);

  expect(result).toEqual({
    apos15: "Here are fifteen apostrophes: '''''''''''''''",
  });
});

it('should support apostrophes inside multi-line literal strings', () => {
  const input = `# 'That,' she said, 'is still pointless.'
str = ''''That,' she said, 'is still pointless.''''`;
  const result = load(input);

  expect(result).toEqual({ str: "'That,' she said, 'is still pointless.'" });
});

it('should throw error when there is unsupported control character in multi-line literal strings', () => {
  const input = `str = '''
\b
'''`;

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support empty strings', () => {
  const input = `empty1 = ""
empty2 = ''
empty3 = """"""
empty4 = ''''''`;

  const result = load(input);

  expect(result).toEqual({ empty1: '', empty2: '', empty3: '', empty4: '' });
});

it('should support escaped slash in multiline basic string', () => {
  const input = `escape-bs-1 = """a \\\\
b"""`;
  const result = load(input);

  expect(result).toEqual({ 'escape-bs-1': 'a \\\nb' });
});

it('should throw error when meeting non-scalar \\u character in string', () => {
  const input =
    'invalid-codepoint = "This string contains a non scalar unicode codepoint \\uD801"';

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error when meeting non-scalar \\U character in string', () => {
  const input = 'a = "\\UFFFFFFFF"';

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should support simple emoji strings', () => {
  const input = 'asdf = "🔖"';
  const result = load(input);
  expect(result).toEqual({ asdf: '🔖' });
});

it('should support comprehensive Unicode and emoji strings', () => {
  const input = `# Mixed ASCII, Unicode and Emojis with Escape Sequences
mixed = "Hello 世界 🌍! \\u00A9 2024"

# Emojis with text modifiers and ZWJ sequences
skin_tone = "👋🏽 Hi there 👨🏾‍💻"
family = "👨‍👩‍👧‍👦 is my 👨‍👦 family"

# Mixing escape sequences with emojis
escaped_mix = "\\u0048\\u0069 🙋‍♂️ \\U0001F4BB"

# Unicode characters mixed with emojis
multilang = "Café ☕️ & Ramen 🍜 = 💖"

# Special characters and emojis
special = "🎵 La-la-la ♪ (⌐■_■) →★←"

# Stress test string
stress = "🏳️‍🌈 Hello\\t世界\\n☮️\\u0026\\u2764 Peace & Love ✌🏽 🌏"`;

  const result = load(input);

  expect(result).toEqual({
    mixed: 'Hello 世界 🌍! © 2024',
    skin_tone: '👋🏽 Hi there 👨🏾‍💻',
    family: '👨‍👩‍👧‍👦 is my 👨‍👦 family',
    escaped_mix: 'Hi 🙋‍♂️ 💻',
    multilang: 'Café ☕️ & Ramen 🍜 = 💖',
    special: '🎵 La-la-la ♪ (⌐■_■) →★←',
    stress: '🏳️‍🌈 Hello\t世界\n☮️&❤ Peace & Love ✌🏽 🌏',
  });
});

// TOML 1.1: `\xHH` (toml-lang/toml CHANGELOG 1.1.0 #796) and `\e` (#790) escapes
// in basic strings; ABNF `escape-seq-char =/ %x78 2HEXDIG` / `=/ %x65`.

it('should support \\xHH escape sequences in basic strings', () => {
  const input = `a = "\\x61"
min = "\\x00"
max = "\\xFF"
lower = "\\xe9"
word = "\\x74\\x6F\\x6D\\x6C"`;
  const result = load(input);

  expect(result).toEqual({
    a: 'a',
    min: '\u0000',
    max: 'ÿ', // \xHH is a Unicode code point (U+00HH), not a raw byte
    lower: 'é',
    word: 'toml',
  });
});

it('should support \\xHH escape sequences in multi-line basic strings', () => {
  const input = `str = """caf\\xE9
line two \\x21"""`;
  const result = load(input);

  expect(result).toEqual({ str: 'café\nline two !' });
});

it('should support the \\e escape sequence in basic strings', () => {
  const input = `esc = "\\e There is no escape! \\e"
csi = "\\e["`;
  const result = load(input);

  expect(result).toEqual({
    esc: '\u001b There is no escape! \u001b',
    csi: '\u001b[',
  });
});

it('should support the \\e escape sequence in multi-line basic strings', () => {
  const input = `esc = """\\e[1m
bold"""`;
  const result = load(input);

  expect(result).toEqual({ esc: '\u001b[1m\nbold' });
});

it('should throw error for \\x escapes with invalid hex digits', () => {
  const input = 'naughty = "\\xAg"';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error for \\x escapes with fewer than two hex digits', () => {
  // TOML 1.1.0 ABNF requires exactly two hex digits: `%x78 2HEXDIG`.
  const input = 'short = "\\x1"';
  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should not interpret \\x or \\e inside literal strings', () => {
  const input = `raw = '\\x61 \\e'`;
  const result = load(input);

  expect(result).toEqual({ raw: '\\x61 \\e' });
});

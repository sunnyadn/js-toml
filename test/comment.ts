import { load, SyntaxParseError } from '../src/index.js';

it('should ignore full-line comment', () => {
  const input = '# This is a full-line comment';
  const result = load(input);

  expect(result).toEqual({});
});

it('should ignore comment at the end of a line', () => {
  const input = 'key = "value" # This is a comment';
  const result = load(input);

  expect(result).toEqual({ key: 'value' });
});

it('should not ignore comment in a string', () => {
  const input = 'key = "# This is not a comment"';
  const result = load(input);

  expect(result).toEqual({ key: '# This is not a comment' });
});

it('should not extend comment to the next line', () => {
  const input = `# This is a full-line comment
key = "value"  # This is a comment at the end of a line
another = "# This is not a comment"`;
  const result = load(input);

  expect(result).toEqual({ key: 'value', another: '# This is not a comment' });
});

it('should throw error if control character is in a comment', () => {
  const input = 'key = "value" # INVALID \x07';

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should throw error if delete character is in a comment', () => {
  const input = 'comment-del = "0x7f" # ';

  expect(() => load(input)).toThrow(SyntaxParseError);
});

it('should ignore tricky comment', () => {
  const input = `[section]#attached comment
#[notsection]
one = "11"#cmt
two = "22#"
three = '#'

four = """# no comment
# nor this
#also not comment"""#is_comment

five = 5.5#66
six = 6#7
8 = "eight"
#nine = 99
ten = 10e2#1
eleven = 1.11e1#23

["hash#tag"]
"#!" = "hash bang"
arr3 = [ "#", '#', """###""" ]
arr4 = [ 1,# 9, 9,
2#,9
,#9
3#]
,4]
arr5 = [[[[#["#"],
["#"]]]]#]
]
tbl1 = { "#" = '}#'}#}}


`;
  const result = load(input);

  expect(result).toEqual({
    section: {
      one: '11',
      two: '22#',
      three: '#',
      four: '# no comment\n# nor this\n#also not comment',
      five: 5.5,
      six: 6,
      '8': 'eight',
      ten: 1000,
      eleven: 11.1,
    },
    'hash#tag': {
      '#!': 'hash bang',
      arr3: ['#', '#', '###'],
      arr4: [1, 2, 3, 4],
      arr5: [[[[['#']]]]],
      tbl1: { '#': '}#' },
    },
  });
});

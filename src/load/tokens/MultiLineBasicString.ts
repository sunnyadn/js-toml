import { createToken } from 'chevrotain';
import {
  escape,
  escaped,
  newline,
  nonAscii,
  quotationMark,
  whiteSpaceChar,
} from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import { getMultiLineContent, unescapeString } from './utils';
import { TomlString } from './TomlString';
import XRegExp = require('xregexp');

const multiLineBasicStringDelimiter = XRegExp.build('{{quotationMark}}{3}', {
  quotationMark,
});

const multiLineBasicUnescaped = XRegExp.build(
  '{{whiteSpaceChar}}|!|[\x23-\\x5B]|[\\x5D-\x7E]|{{nonAscii}}',
  {
    whiteSpaceChar,
    nonAscii,
  }
);

const multiLineBasicChar = XRegExp.build(
  '{{multiLineBasicUnescaped}}|{{escaped}}',
  { multiLineBasicUnescaped, escaped }
);

const whiteSpace = XRegExp.build('{{whiteSpaceChar}}*', { whiteSpaceChar });

const multiLineBasicEscapedNewline = XRegExp.build(
  '{{escape}}{{whiteSpace}}{{newline}}({{whiteSpaceChar}}|{{newline}})*',
  {
    escape,
    whiteSpace,
    newline,
    whiteSpaceChar,
  }
);

const multiLineBasicContent = XRegExp.build(
  '{{multiLineBasicChar}}|{{newline}}|{{multiLineBasicEscapedNewline}}',
  {
    multiLineBasicChar,
    newline,
    multiLineBasicEscapedNewline,
  }
);

const multiLineBasicQuotes = XRegExp.build('{{quotationMark}}{1,2}', {
  quotationMark,
});

const multiLineBasicBody = XRegExp.build(
  '{{multiLineBasicContent}}*({{multiLineBasicQuotes}}{{multiLineBasicContent}}+)*{{multiLineBasicQuotes}}?',
  {
    multiLineBasicContent,
    multiLineBasicQuotes,
  }
);

export const MultiLineBasicString = createToken({
  name: 'MultiLineBasicString',
  pattern: XRegExp.build(
    '{{multiLineBasicStringDelimiter}}{{newline}}?{{multiLineBasicBody}}{{multiLineBasicStringDelimiter}}',
    {
      multiLineBasicStringDelimiter,
      newline,
      multiLineBasicBody,
    }
  ),
  label: '"""MultiLineBasicString"""',
  categories: [TomlString],
  line_breaks: true,
});

const skipWhitespaceIfFindBackslash = (string) =>
  string.replace(/\\[ \t]*(\r\n|\n)+[ \t]*/g, '');

registerTokenInterpreter(MultiLineBasicString, (raw) => {
  const content = getMultiLineContent(raw);
  const result = skipWhitespaceIfFindBackslash(content);
  return unescapeString(result);
});

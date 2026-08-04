import { createToken } from 'chevrotain';
import {
  basicUnescaped,
  escape,
  escaped,
  newline,
  quotationMark,
  whiteSpaceChar,
} from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { getMultiLineContent, unescapeString } from './utils.js';
import { TomlString } from './TomlString.js';
import XRegExp from 'xregexp';

const multiLineBasicStringDelimiter = XRegExp.build('{{quotationMark}}{3}', {
  quotationMark,
});

const multiLineBasicChar = XRegExp.build('{{basicUnescaped}}|{{escaped}}', {
  basicUnescaped,
  escaped,
});

const whiteSpace = XRegExp.build('{{whiteSpaceChar}}*', { whiteSpaceChar });

// Stops at the newline on purpose. A trailing `(whiteSpaceChar|newline)*` is
// ambiguous with the enclosing `multiLineBasicContent*` loop over the same
// characters and backtracks exponentially. `unescapeString` does the trimming.
const multiLineBasicEscapedNewline = XRegExp.build(
  '{{escape}}{{whiteSpace}}{{newline}}',
  {
    escape,
    whiteSpace,
    newline,
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

registerTokenInterpreter(MultiLineBasicString, (raw) => {
  const content = getMultiLineContent(raw);
  return unescapeString(content);
});

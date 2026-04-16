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

registerTokenInterpreter(MultiLineBasicString, (raw) => {
  const content = getMultiLineContent(raw);
  return unescapeString(content);
});

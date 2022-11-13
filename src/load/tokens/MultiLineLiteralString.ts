import { createToken } from 'chevrotain';
import { apostrophe, newline, nonAscii } from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import { getMultiLineContent } from './utils';
import { TomlString } from './TomlString';
import XRegExp = require('xregexp');

const multiLineLiteralStringDelimiter = XRegExp.build('{{apostrophe}}{3}', {
  apostrophe,
});

const multiLineLiteralChar = XRegExp.build(
  '\t|[\x20-\x26]|[\\x28-\x7E]|{{nonAscii}}',
  { nonAscii }
);

const multiLineLiteralContent = XRegExp.build(
  '{{multiLineLiteralChar}}|{{newline}}',
  { multiLineLiteralChar, newline }
);

const multiLineLiteralQuotes = XRegExp.build('{{apostrophe}}{1,2}', {
  apostrophe,
});

const multiLineLiteralBody = XRegExp.build(
  '{{multiLineLiteralContent}}*({{multiLineLiteralQuotes}}{{multiLineLiteralContent}}+)*{{multiLineLiteralQuotes}}?',
  {
    multiLineLiteralContent,
    multiLineLiteralQuotes,
  }
);

export const MultiLineLiteralString = createToken({
  name: 'MultiLineLiteralString',
  pattern: XRegExp.build(
    '{{multiLineLiteralStringDelimiter}}{{newline}}?{{multiLineLiteralBody}}{{multiLineLiteralStringDelimiter}}',
    {
      multiLineLiteralStringDelimiter,
      newline,
      multiLineLiteralBody,
    }
  ),
  label: "'''MultiLineLiteralString'''",
  categories: [TomlString],
  line_breaks: true,
});

registerTokenInterpreter(MultiLineLiteralString, getMultiLineContent);

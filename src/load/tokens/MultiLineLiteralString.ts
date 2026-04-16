import { createToken } from 'chevrotain';
import { apostrophe, literalChar, newline } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { getMultiLineContent } from './utils.js';
import { TomlString } from './TomlString.js';
import XRegExp from 'xregexp';

const multiLineLiteralStringDelimiter = XRegExp.build('{{apostrophe}}{3}', {
  apostrophe,
});

const multiLineLiteralContent = XRegExp.build('{{literalChar}}|{{newline}}', {
  literalChar,
  newline,
});

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

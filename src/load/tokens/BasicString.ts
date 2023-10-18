import { createToken } from 'chevrotain';
import {
  escaped,
  nonAscii,
  quotationMark,
  whiteSpaceChar,
} from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { unescapeString } from './utils.js';
import { QuotedKey } from './QuotedKey.js';
import { TomlString } from './TomlString.js';
import XRegExp from 'xregexp';

const basicUnescaped = XRegExp.build(
  '{{whiteSpaceChar}}|!|[\x23-\\x5B]|[\\x5D-\x7E]|{{nonAscii}}',
  {
    whiteSpaceChar,
    nonAscii,
  }
);

const basicChar = XRegExp.build('{{basicUnescaped}}|{{escaped}}', {
  basicUnescaped,
  escaped,
});

export const BasicString = createToken({
  name: 'BasicString',
  pattern: XRegExp.build('{{quotationMark}}{{basicChar}}*{{quotationMark}}', {
    quotationMark,
    basicChar,
  }),
  label: '"BasicString"',
  categories: [QuotedKey, TomlString],
});

registerTokenInterpreter(BasicString, (raw) => {
  const value = raw.slice(1, -1);
  return unescapeString(value);
});

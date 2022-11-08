import { createToken } from 'chevrotain';
import { escaped, nonAscii, quotationMark, whiteSpaceChar } from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import { unescapeString } from './utils';
import XRegExp = require('xregexp');

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
});

registerTokenInterpreter(BasicString, (raw) => {
  const value = raw.slice(1, -1);
  return unescapeString(value);
});

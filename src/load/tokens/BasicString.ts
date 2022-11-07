import { createToken } from 'chevrotain';
import { escaped, nonAscii, quotationMark, whiteSpaceChar } from './patterns';
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

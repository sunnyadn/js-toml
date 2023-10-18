import { createToken, Lexer } from 'chevrotain';
import { whiteSpaceChar } from './patterns.js';
import XRegExp from 'xregexp';

const whiteSpace = XRegExp.build('{{whiteSpaceChar}}+', { whiteSpaceChar });

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: whiteSpace,
  group: Lexer.SKIPPED,
});

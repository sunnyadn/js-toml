import { createToken, Lexer } from 'chevrotain';
import { newline } from './patterns.js';

export const ArrayNewline = createToken({
  name: 'IgnoredNewline',
  pattern: newline,
  group: Lexer.SKIPPED,
});

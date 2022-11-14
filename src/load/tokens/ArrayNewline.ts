import { createToken, Lexer } from 'chevrotain';
import { newline } from './patterns';

export const ArrayNewline = createToken({
  name: 'IgnoredNewline',
  pattern: newline,
  group: Lexer.SKIPPED,
});

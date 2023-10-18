import { createToken } from 'chevrotain';
import { newline } from './patterns.js';

export const ExpressionNewLine = createToken({
  name: 'ExpressionNewLine',
  pattern: newline,
});

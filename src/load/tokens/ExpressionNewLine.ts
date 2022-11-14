import { createToken } from 'chevrotain';
import { newline } from './patterns';

export const ExpressionNewLine = createToken({
  name: 'ExpressionNewLine',
  pattern: newline,
});

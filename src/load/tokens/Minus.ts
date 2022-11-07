import { createToken } from 'chevrotain';
import { generateValuePattern } from './generate';

export const Minus = createToken({
  name: 'Minus',
  pattern: generateValuePattern(/-/),
  label: '-',
  start_chars_hint: ['-'],
  line_breaks: false,
});

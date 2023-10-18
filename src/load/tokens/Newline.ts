import { createToken } from 'chevrotain';
import { newline } from './patterns.js';

export const Newline = createToken({
  name: 'Newline',
  pattern: newline,
  pop_mode: true,
});

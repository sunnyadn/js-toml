import { createToken } from 'chevrotain';
import { generateValuePattern } from './utils';
import { registerTokenInterpreter } from './tokenInterpreters';

export const Minus = createToken({
  name: 'Minus',
  pattern: generateValuePattern(/-/),
  label: '-',
  start_chars_hint: ['-'],
  line_breaks: false,
});

registerTokenInterpreter(Minus, () => true);

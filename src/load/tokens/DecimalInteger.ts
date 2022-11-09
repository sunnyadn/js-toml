import { createToken } from 'chevrotain';
import { generateValuePattern } from './utils';
import { registerTokenInterpreter } from './tokenInterpreters';
import { decimalInteger } from './patterns';

export const DecimalInteger = createToken({
  name: 'DecimalInteger',
  pattern: generateValuePattern(decimalInteger),
  start_chars_hint: [
    '-',
    '+',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ],
  line_breaks: false,
});

registerTokenInterpreter(DecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const int = parseInt(intString);
  if (Number.isSafeInteger(int)) {
    return int || 0;
  }
  return BigInt(intString);
});

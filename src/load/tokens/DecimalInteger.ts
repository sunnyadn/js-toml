import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { decimalInteger } from './patterns.js';
import { Integer } from './Integer.js';

export const DecimalInteger = createToken({
  name: 'DecimalInteger',
  pattern: decimalInteger,
  categories: [Integer],
});

registerTokenInterpreter(DecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const int = parseInt(intString);
  if (Number.isSafeInteger(int)) {
    return int || 0;
  }
  return BigInt(intString);
});

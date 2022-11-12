import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters';
import { decimalInteger } from './patterns';
import { Integer } from './Integer';

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

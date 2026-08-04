import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { decimalInteger } from './patterns.js';
import { Integer } from './Integer.js';
import { checkIntegerLiteralLength } from './utils.js';

export const DecimalInteger = createToken({
  name: 'DecimalInteger',
  pattern: decimalInteger,
  categories: [Integer],
});

registerTokenInterpreter(DecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');

  // Count past an optional sign without slicing: this runs on every integer.
  const first = intString.charCodeAt(0);
  const signed = first === 43 /* + */ || first === 45; /* - */
  checkIntegerLiteralLength('Decimal', intString.length - (signed ? 1 : 0));

  const int = parseInt(intString);
  if (Number.isSafeInteger(int)) {
    return int || 0;
  }
  return BigInt(intString);
});

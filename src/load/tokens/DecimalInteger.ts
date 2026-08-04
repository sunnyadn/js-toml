import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { decimalInteger } from './patterns.js';
import { Integer } from './Integer.js';
import { SyntaxParseError } from '../exception.js';

export const DecimalInteger = createToken({
  name: 'DecimalInteger',
  pattern: decimalInteger,
  categories: [Integer],
});

// Mirrors `MAX_RADIX_LITERAL_LENGTH`, which left decimals out. `BigInt()` on
// decimals is ~O(n^1.28), not quadratic, so this is consistency hardening.
// 1000 is far above TOML's 64-bit integer range, which needs 20 digits.
const MAX_DECIMAL_LITERAL_LENGTH = 1000;

registerTokenInterpreter(DecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const digits = intString.replace(/^[+-]/, '');

  if (digits.length > MAX_DECIMAL_LITERAL_LENGTH) {
    throw new SyntaxParseError(
      `Decimal integer literal exceeds ${MAX_DECIMAL_LITERAL_LENGTH} digits (length ${digits.length})`
    );
  }

  const int = parseInt(intString);
  if (Number.isSafeInteger(int)) {
    return int || 0;
  }
  return BigInt(intString);
});

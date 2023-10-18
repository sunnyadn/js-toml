import { createToken } from 'chevrotain';
import { hexDigit, underscore } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { Integer } from './Integer.js';
import XRegExp from 'xregexp';

const hexPrefix = /0x/;
const octPrefix = /0o/;
const binPrefix = /0b/;

const digit0_7 = /[0-7]/;
const digit0_1 = /[01]/;

const hexInteger = XRegExp.build(
  '{{hexPrefix}}{{hexDigit}}({{hexDigit}}|{{underscore}}{{hexDigit}})*',
  {
    hexPrefix,
    hexDigit,
    underscore,
  }
);
const octalInteger = XRegExp.build(
  '{{octPrefix}}{{digit0_7}}({{digit0_7}}|{{underscore}}{{digit0_7}})*',
  {
    octPrefix,
    digit0_7,
    underscore,
  }
);
const binaryInteger = XRegExp.build(
  '{{binPrefix}}{{digit0_1}}({{digit0_1}}|{{underscore}}{{digit0_1}})*',
  {
    binPrefix,
    digit0_1,
    underscore,
  }
);

const nonDecimalInteger = XRegExp.build(
  '{{hexInteger}}|{{octalInteger}}|{{binaryInteger}}',
  {
    hexInteger,
    octalInteger,
    binaryInteger,
  }
);

export const NonDecimalInteger = createToken({
  name: 'NonDecimalInteger',
  pattern: nonDecimalInteger,
  categories: [Integer],
});

const parseBigInt = (string: string, radix: number): bigint => {
  let result = BigInt(0);
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    const digit = parseInt(char, radix);
    result = result * BigInt(radix) + BigInt(digit);
  }

  return result;
};

const getRadix = (raw: string): number => {
  if (raw.startsWith('0x')) {
    return 16;
  } else if (raw.startsWith('0o')) {
    return 8;
  } else if (raw.startsWith('0b')) {
    return 2;
  }
};

registerTokenInterpreter(NonDecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const digits = intString.slice(2);
  const radix = getRadix(raw);

  const int = parseInt(digits, radix);

  if (Number.isSafeInteger(int)) {
    return int;
  }

  return parseBigInt(digits, radix);
});

import { createToken } from 'chevrotain';
import { generateValuePattern } from './utils';
import { hexDigit, underscore } from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import XRegExp = require('xregexp');

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

const unsignedNonDecimalInteger = XRegExp.build(
  '{{hexInteger}}|{{octalInteger}}|{{binaryInteger}}',
  {
    hexInteger,
    octalInteger,
    binaryInteger,
  }
);

export const UnsignedNonDecimalInteger = createToken({
  name: 'UnsignedNonDecimalInteger',
  pattern: generateValuePattern(unsignedNonDecimalInteger),
  start_chars_hint: ['0'],
  line_breaks: false,
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

registerTokenInterpreter(UnsignedNonDecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const prefix = intString.substring(0, 2);
  const digits = intString.substring(2);

  let radix = 0;
  if (prefix === '0x') {
    radix = 16;
  } else if (prefix === '0o') {
    radix = 8;
  } else if (prefix === '0b') {
    radix = 2;
  }

  const int = parseInt(digits, radix);

  if (Number.isSafeInteger(int)) {
    return int;
  }

  return parseBigInt(digits, radix);
});

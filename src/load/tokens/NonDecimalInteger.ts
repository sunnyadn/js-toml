import { createToken } from 'chevrotain';
import { generateValuePattern } from './utils';
import { hexDigit, minus, underscore } from './patterns';
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

const nonDecimalInteger = XRegExp.build(
  '{{minus}}?{{unsignedNonDecimalInteger}}',
  { minus, unsignedNonDecimalInteger }
);

export const NonDecimalInteger = createToken({
  name: 'NonDecimalInteger',
  pattern: generateValuePattern(nonDecimalInteger),
  start_chars_hint: ['0', '-'],
  line_breaks: false,
});

const parseBigInt = (string: string, radix: number): bigint => {
  const negative = string[0] === '-';
  const digits = negative ? string.slice(1) : string;
  let result = BigInt(0);
  for (let i = 0; i < digits.length; i++) {
    const char = digits[i];
    const digit = parseInt(char, radix);
    result = result * BigInt(radix) + BigInt(digit);
  }

  return negative ? -result : result;
};

const getPrefixAndDigits = (raw: string): [string, string] => {
  let prefix, digits;

  const negative = raw[0] === '-';
  if (negative) {
    prefix = raw.slice(1, 3);
    digits = '-' + raw.slice(3);
  } else {
    prefix = raw.slice(0, 2);
    digits = raw.slice(2);
  }

  return [prefix, digits];
};

const getRadix = (prefix: string): number => {
  let radix = 0;
  if (prefix === '0x') {
    radix = 16;
  } else if (prefix === '0o') {
    radix = 8;
  } else if (prefix === '0b') {
    radix = 2;
  }

  return radix;
};

registerTokenInterpreter(NonDecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const [prefix, digits] = getPrefixAndDigits(intString);
  const radix = getRadix(prefix);

  const int = parseInt(digits, radix);

  if (Number.isSafeInteger(int)) {
    return int || 0;
  }

  return parseBigInt(digits, radix);
});

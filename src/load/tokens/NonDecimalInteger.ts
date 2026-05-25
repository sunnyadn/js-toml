import { createToken } from 'chevrotain';
import { hexDigit, underscore } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { Integer } from './Integer.js';
import { SyntaxParseError } from '../exception.js';
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

// Cap the digit length of `0x` / `0o` / `0b` integer literals.
//
// The previous hand-written `parseBigInt` loop performed
// `result = result * BigInt(radix) + BigInt(digit)` once per input digit, so
// the per-iteration cost grew linearly with the number of digits already
// consumed and the whole loop was `O(n^2)`. Switching to the V8 native
// `BigInt(prefixedString)` constructor brings the per-call cost down to
// `O(n)`, but a multi-megabyte literal can still tie up the event loop on a
// single document, so we also cap the literal length up front. 1000 matches
// the `jackson-core` `StreamReadConstraints.maxNumberLength` default.
const MAX_RADIX_LITERAL_LENGTH = 1000;

const getRadix = (raw: string): number => {
  switch (raw.slice(0, 2) as '0x' | '0o' | '0b') {
    case '0x':
      return 16;
    case '0o':
      return 8;
    case '0b':
      return 2;
  }
};

registerTokenInterpreter(NonDecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  const digits = intString.slice(2);
  const radix = getRadix(raw);

  if (digits.length > MAX_RADIX_LITERAL_LENGTH) {
    throw new SyntaxParseError(
      `Radix-prefixed integer literal exceeds ${MAX_RADIX_LITERAL_LENGTH} digits (length ${digits.length})`
    );
  }

  const int = parseInt(digits, radix);

  if (Number.isSafeInteger(int)) {
    return int;
  }

  // `BigInt` natively accepts the `0x` / `0o` / `0b` prefix and parses in O(n).
  return BigInt(intString);
});

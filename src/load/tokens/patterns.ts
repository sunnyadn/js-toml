import XRegExp from 'xregexp';

export const whiteSpaceChar = /[ \t]/;
// Handle full Unicode range including surrogate pairs for characters beyond BMP
export const nonAscii =
  /[\x80-\uD7FF]|[\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/;

export const newline = /\r\n|\n/;

export const quotationMark = /"/;

export const escape = /\\/;

export const digit = /[0-9]/;

export const hexDigit = XRegExp.build('{{digit}}|[A-Fa-f]', { digit });

const escapeSeqChar = XRegExp.build(
  '["\\\\bfnrt]|u{{hexDigit}}{4}|U{{hexDigit}}{8}',
  { hexDigit }
);

export const escaped = XRegExp.build('{{escape}}{{escapeSeqChar}}', {
  escape,
  escapeSeqChar,
});

export const apostrophe = /'/;

export const underscore = /_/;

export const minus = /-/;

export const plus = /\+/;

const digit1_9 = /[1-9]/;

export const unsignedDecimalInteger = XRegExp.build(
  '{{digit1_9}}({{digit}}|{{underscore}}{{digit}})+|{{digit}}',
  {
    digit1_9,
    digit,
    underscore,
  }
);

export const decimalInteger = XRegExp.build(
  '({{minus}}|{{plus}})?{{unsignedDecimalInteger}}',
  { minus, plus, unsignedDecimalInteger }
);

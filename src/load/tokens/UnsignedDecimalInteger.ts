import { createToken } from 'chevrotain';
import { generateValuePattern } from './generate';
import { digit, underscore } from './patterns';
import XRegExp = require('xregexp');

const digit1_9 = /[1-9]/;

const unsignedDecimalInteger = XRegExp.build(
  '{{digit1_9}}({{digit}}|{{underscore}}{{digit}})+|{{digit}}',
  {
    digit1_9,
    digit,
    underscore,
  }
);

export const UnsignedDecimalInteger = createToken({
  name: 'UnsignedDecimalInteger',
  pattern: generateValuePattern(unsignedDecimalInteger),
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  line_breaks: false,
});

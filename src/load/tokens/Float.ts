import { decimalInteger, digit, minus, plus, underscore } from './patterns';
import { createToken } from 'chevrotain';
import { generateValuePattern } from './utils';
import { registerTokenInterpreter } from './tokenInterpreters';
import XRegExp = require('xregexp');

const floatIntPart = decimalInteger;

const zeroPrefixableInt = XRegExp.build(
  '{{digit}}({{digit}}|{{underscore}}{{digit}})*',
  { digit, underscore }
);

const floatExpPart = XRegExp.build(
  '({{minus}}|{{plus}})?{{zeroPrefixableInt}}',
  { minus, plus, zeroPrefixableInt }
);

const exp = XRegExp.build('[Ee]{{floatExpPart}}', { floatExpPart });

const decimalPoint = /\./;

const frac = XRegExp.build('{{decimalPoint}}{{zeroPrefixableInt}}', {
  decimalPoint,
  zeroPrefixableInt,
});

const float = XRegExp.build('{{floatIntPart}}({{exp}}|{{frac}}{{exp}}?)', {
  floatIntPart,
  exp,
  frac,
}); // OR SpecialFloat

export const Float = createToken({
  name: 'Float',
  pattern: generateValuePattern(float),
  start_chars_hint: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '-',
    '+',
  ],
  line_breaks: false,
});

registerTokenInterpreter(Float, (raw: string) => {
  const floatString = raw.replace(/_/g, '');
  return parseFloat(floatString);
});

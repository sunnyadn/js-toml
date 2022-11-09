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

const specialFloat = XRegExp.build('({{minus}}|{{plus}})?(inf|nan)', {
  minus,
  plus,
});

const float = XRegExp.build(
  '{{floatIntPart}}({{exp}}|{{frac}}{{exp}}?)|{{specialFloat}}',
  {
    floatIntPart,
    exp,
    frac,
    specialFloat,
  }
);

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
    'i',
    'n',
  ],
  line_breaks: false,
});

const attemptSpecialFloat = (value: string) => {
  if (value === 'inf' || value === '+inf') {
    return Infinity;
  }
  if (value === '-inf') {
    return -Infinity;
  }
  if (value === 'nan' || value === '+nan' || value === '-nan') {
    return NaN;
  }
  return null;
};

registerTokenInterpreter(Float, (raw: string) => {
  const value = attemptSpecialFloat(raw);
  if (value !== null) {
    return value;
  }

  const floatString = raw.replace(/_/g, '');
  return parseFloat(floatString);
});

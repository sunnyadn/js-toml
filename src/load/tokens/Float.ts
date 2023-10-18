import { decimalInteger, digit, minus, plus, underscore } from './patterns.js';
import { createToken } from 'chevrotain';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import XRegExp from 'xregexp';

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

const inf = /inf/;
const nan = /nan/;

const specialFloat = XRegExp.build('({{minus}}|{{plus}})?({{inf}}|{{nan}})', {
  minus,
  plus,
  inf,
  nan,
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
  pattern: float,
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

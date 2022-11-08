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

registerTokenInterpreter(UnsignedNonDecimalInteger, (raw: string) => {
  const intString = raw.replace(/_/g, '');
  if (intString.startsWith('0x')) {
    return parseInt(intString.substring(2), 16);
  } else if (intString.startsWith('0o')) {
    return parseInt(intString.substring(2), 8);
  } else if (intString.startsWith('0b')) {
    return parseInt(intString.substring(2), 2);
  }
});

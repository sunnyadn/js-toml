import { createToken } from 'chevrotain';
import { minus, unsignedDecimalInteger } from './patterns';
import { DecimalInteger } from './DecimalInteger';
import { UnquotedKey } from './UnquotedKey';
import {
  registerTokenInterpreter,
  tokenInterpreters,
} from './tokenInterpreters';
import { SimpleKey } from './SimpleKey';
import XRegExp = require('xregexp');

const decIntWithOptionalMinus = XRegExp.build(
  '{{minus}}?{{unsignedDecimalInteger}}',
  { minus, unsignedDecimalInteger }
);

export const DecIntWithOptionalMinus = createToken({
  name: 'DecIntWithOptionalMinus',
  pattern: decIntWithOptionalMinus,
  categories: [DecimalInteger, UnquotedKey],
  longer_alt: UnquotedKey,
});

registerTokenInterpreter(DecIntWithOptionalMinus, (raw, token, category) => {
  if (category === SimpleKey.name) {
    return tokenInterpreters[UnquotedKey.name](raw, token, category);
  }

  return tokenInterpreters[DecimalInteger.name](raw, token, category);
});

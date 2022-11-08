import { createToken } from 'chevrotain';
import { digit } from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import XRegExp = require('xregexp');

const alpha = /[a-zA-Z]/;

const unquotedKey = XRegExp.build('({{alpha}}|{{digit}}|-|_)+', {
  alpha,
  digit,
});

export const UnquotedKey = createToken({
  name: 'UnquotedKey',
  pattern: unquotedKey,
});

registerTokenInterpreter(UnquotedKey, (raw: string) => raw);

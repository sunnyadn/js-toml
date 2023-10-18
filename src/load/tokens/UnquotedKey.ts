import { createToken } from 'chevrotain';
import { digit } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { SimpleKey } from './SimpleKey.js';
import XRegExp from 'xregexp';

const alpha = /[a-zA-Z]/;

const unquotedKey = XRegExp.build('({{alpha}}|{{digit}}|-|_)+', {
  alpha,
  digit,
});

export const UnquotedKey = createToken({
  name: 'UnquotedKey',
  pattern: unquotedKey,
  categories: [SimpleKey],
});

registerTokenInterpreter(UnquotedKey, (raw: string) => raw);

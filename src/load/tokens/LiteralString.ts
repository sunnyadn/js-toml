import { createToken } from 'chevrotain';
import { apostrophe, nonAscii } from './patterns';
import { registerTokenInterpreter } from './tokenInterpreters';
import XRegExp = require('xregexp');

const literalChar = XRegExp.build('\t|[\x20-\x26]|[\\x28-\x7E]|{{nonAscii}}', {
  nonAscii,
});

export const LiteralString = createToken({
  name: 'LiteralString',
  pattern: XRegExp.build('{{apostrophe}}{{literalChar}}*{{apostrophe}}', {
    apostrophe,
    literalChar,
  }),
  label: "'LiteralString'",
});

registerTokenInterpreter(LiteralString, (raw) => raw.slice(1, -1));

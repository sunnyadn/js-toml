import { createToken } from 'chevrotain';
import { apostrophe, literalChar } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { QuotedKey } from './QuotedKey.js';
import { TomlString } from './TomlString.js';
import XRegExp from 'xregexp';

export const LiteralString = createToken({
  name: 'LiteralString',
  pattern: XRegExp.build('{{apostrophe}}{{literalChar}}*{{apostrophe}}', {
    apostrophe,
    literalChar,
  }),
  label: "'LiteralString'",
  categories: [QuotedKey, TomlString],
});

registerTokenInterpreter(LiteralString, (raw) => raw.slice(1, -1));

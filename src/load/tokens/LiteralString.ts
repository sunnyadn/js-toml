import { createToken } from 'chevrotain';
import { apostrophe, nonAscii } from './patterns.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';
import { QuotedKey } from './QuotedKey.js';
import { TomlString } from './TomlString.js';
import XRegExp from 'xregexp';

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
  categories: [QuotedKey, TomlString],
});

registerTokenInterpreter(LiteralString, (raw) => raw.slice(1, -1));

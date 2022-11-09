import { createToken } from 'chevrotain';
import { UnquotedKey } from './UnquotedKey';
import { registerTokenInterpreter } from './tokenInterpreters';
import XRegExp = require('xregexp');

const truePattern = /true/;
const falsePattern = /false/;

const boolean = XRegExp.build('{{truePattern}}|{{falsePattern}}', {
  truePattern,
  falsePattern,
});

export const Boolean = createToken({
  name: 'Boolean',
  pattern: boolean,
  longer_alt: UnquotedKey,
});

registerTokenInterpreter(Boolean, (raw) => raw === 'true');

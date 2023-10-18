import { createToken } from 'chevrotain';
import { Boolean } from './Boolean.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';

const falsePattern = /false/;

export const False = createToken({
  name: 'False',
  pattern: falsePattern,
  label: 'false',
  categories: [Boolean],
});

registerTokenInterpreter(False, () => false);

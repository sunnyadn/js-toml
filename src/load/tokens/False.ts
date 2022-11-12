import { createToken } from 'chevrotain';
import { Boolean } from './Boolean';
import { registerTokenInterpreter } from './tokenInterpreters';

const falsePattern = /false/;

export const False = createToken({
  name: 'False',
  pattern: falsePattern,
  label: 'false',
  categories: [Boolean],
});

registerTokenInterpreter(False, () => false);

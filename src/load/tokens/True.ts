import { createToken } from 'chevrotain';
import { Boolean } from './Boolean.js';
import { registerTokenInterpreter } from './tokenInterpreters.js';

const truePattern = /true/;

export const True = createToken({
  name: 'True',
  pattern: truePattern,
  label: 'true',
  categories: [Boolean],
});

registerTokenInterpreter(True, () => true);

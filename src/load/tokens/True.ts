import { createToken } from 'chevrotain';
import { Boolean } from './Boolean';
import { registerTokenInterpreter } from './tokenInterpreters';

const truePattern = /true/;

export const True = createToken({
  name: 'True',
  pattern: truePattern,
  label: 'true',
  categories: [Boolean],
});

registerTokenInterpreter(True, () => true);

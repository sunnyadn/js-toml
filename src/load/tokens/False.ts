import { createToken } from 'chevrotain';
import { UnquotedKey } from './UnquotedKey';
import { Boolean } from './Boolean';
import { registerTokenInterpreter } from './tokenInterpreters';
import { SimpleKey } from './SimpleKey';

const falsePattern = /false/;

export const False = createToken({
  name: 'False',
  pattern: falsePattern,
  label: 'false',
  categories: [Boolean, UnquotedKey],
});

registerTokenInterpreter(False, (raw, token, category) => {
  if (category === SimpleKey.name) {
    return raw;
  }

  return false;
});

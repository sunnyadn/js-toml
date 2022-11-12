import { createToken } from 'chevrotain';
import { UnquotedKey } from './UnquotedKey';
import { Boolean } from './Boolean';
import { registerTokenInterpreter } from './tokenInterpreters';
import { SimpleKey } from './SimpleKey';

const truePattern = /true/;

export const True = createToken({
  name: 'True',
  pattern: truePattern,
  label: 'true',
  categories: [Boolean, UnquotedKey],
  longer_alt: UnquotedKey,
});

registerTokenInterpreter(True, (raw, token, category) => {
  if (category === SimpleKey.name) {
    return raw;
  }

  return true;
});

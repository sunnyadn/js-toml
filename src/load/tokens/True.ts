import { createToken } from 'chevrotain';
import { UnquotedKey } from './UnquotedKey';
import { registerTokenInterpreter } from './tokenInterpreters';

export const True = createToken({
  name: 'True',
  pattern: /true/,
  label: 'true',
  longer_alt: UnquotedKey,
});

registerTokenInterpreter(True, () => true);

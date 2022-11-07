import { createToken } from 'chevrotain';
import { UnquotedKey } from './UnquotedKey';

export const True = createToken({
  name: 'True',
  pattern: /true/,
  label: 'true',
  longer_alt: UnquotedKey,
});

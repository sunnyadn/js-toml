import { createToken } from 'chevrotain';

export const KeyValueSeparator = createToken({
  name: 'KeyValueSeparator',
  pattern: /=/,
  label: '=',
});

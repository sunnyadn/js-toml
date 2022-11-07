import { createToken } from 'chevrotain';

export const DotSeparator = createToken({
  name: 'DotSeparator',
  pattern: /\./,
  label: '.',
});

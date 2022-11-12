import { createToken } from 'chevrotain';

export const StdTableClose = createToken({
  name: 'StdTableClose',
  pattern: /]/,
  label: ']',
});

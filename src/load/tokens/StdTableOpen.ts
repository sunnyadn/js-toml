import { createToken } from 'chevrotain';

export const StdTableOpen = createToken({
  name: 'StdTableOpen',
  pattern: /\[/,
  label: '[',
});

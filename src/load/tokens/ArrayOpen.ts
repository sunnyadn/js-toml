import { createToken } from 'chevrotain';

const arrayOpen = /\[/;

export const ArrayOpen = createToken({
  name: 'ArrayOpen',
  pattern: arrayOpen,
  label: '[',
});

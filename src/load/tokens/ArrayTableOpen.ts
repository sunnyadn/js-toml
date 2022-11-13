import { createToken } from 'chevrotain';

export const ArrayTableOpen = createToken({
  name: 'ArrayTableOpen',
  pattern: /\[\[/,
  label: '[[',
});

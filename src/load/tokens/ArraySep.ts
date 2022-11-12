import { createToken } from 'chevrotain';

const comma = /,/;

export const ArraySep = createToken({
  name: 'Comma',
  pattern: comma,
  label: ',',
});

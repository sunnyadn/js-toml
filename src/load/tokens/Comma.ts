import { createToken } from 'chevrotain';

const comma = /,/;

export const Comma = createToken({
  name: 'Comma',
  pattern: comma,
  label: ',',
});

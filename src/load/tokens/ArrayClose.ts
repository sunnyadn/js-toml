import { createToken } from 'chevrotain';

const arrayClose = /]/;

export const ArrayClose = createToken({
  name: 'ArrayClose',
  pattern: arrayClose,
  label: ']',
});

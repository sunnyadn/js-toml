import { createToken } from 'chevrotain';

const arraySeparator = /,/;

export const ArraySeparator = createToken({
  name: 'ArraySeparator',
  pattern: arraySeparator,
  label: ',',
});

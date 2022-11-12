import { createToken } from 'chevrotain';

const inlineTableSep = /,/;

export const InlineTableSep = createToken({
  name: 'InlineTableSep',
  pattern: inlineTableSep,
  label: ',',
  pop_mode: true,
});

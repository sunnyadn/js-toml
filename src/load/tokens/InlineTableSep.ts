import { createToken } from 'chevrotain';
import { Mode } from './modes.js';

const inlineTableSep = /,/;

export const InlineTableSep = createToken({
  name: 'InlineTableSep',
  pattern: inlineTableSep,
  label: ',',
  pop_mode: true,
  push_mode: Mode.InlineTable,
});

import { createToken } from 'chevrotain';
import { Mode } from './modes.js';

const inlineTableOpen = /{/;

export const InlineTableOpen = createToken({
  name: 'InlineTableOpen',
  pattern: inlineTableOpen,
  label: '{',
  push_mode: Mode.InlineTable,
});

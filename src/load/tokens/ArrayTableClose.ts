import { createToken } from 'chevrotain';
import { Mode } from './modes.js';

export const ArrayTableClose = createToken({
  name: 'ArrayTableClose',
  pattern: /]]/,
  label: ']]',
  push_mode: Mode.Value,
});

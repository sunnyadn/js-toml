import { createToken } from 'chevrotain';
import { Mode } from './modes';

export const ArrayTableClose = createToken({
  name: 'ArrayTableClose',
  pattern: /]]/,
  label: ']]',
  push_mode: Mode.Value,
});

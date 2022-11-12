import { createToken } from 'chevrotain';
import { Mode } from './modes';

export const StdTableClose = createToken({
  name: 'StdTableClose',
  pattern: /]/,
  label: ']',
  push_mode: Mode.Value,
});

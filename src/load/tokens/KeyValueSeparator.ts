import { createToken } from 'chevrotain';
import { Mode } from './modes.js';

export const KeyValueSeparator = createToken({
  name: 'KeyValueSeparator',
  pattern: /=/,
  label: '=',
  push_mode: Mode.Value,
});

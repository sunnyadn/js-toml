import { createToken } from 'chevrotain';
import { Mode } from './modes.js';
import { KeyValueSeparator } from './KeyValueSeparator.js';

export const InlineTableKeyValSep = createToken({
  name: 'InlineTableKeyValSep',
  pattern: /=/,
  label: '=',
  push_mode: Mode.Value,
  pop_mode: true,
  categories: [KeyValueSeparator],
});

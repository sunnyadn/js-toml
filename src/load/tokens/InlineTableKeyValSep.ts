import { createToken } from 'chevrotain';
import { Mode } from './modes';
import { KeyValueSeparator } from './KeyValueSeparator';

export const InlineTableKeyValSep = createToken({
  name: 'InlineTableKeyValSep',
  pattern: /=/,
  label: '=',
  push_mode: Mode.Value,
  pop_mode: true,
  categories: [KeyValueSeparator],
});

import { createToken } from 'chevrotain';
import { Mode } from './modes.js';
import { KeyValueSeparator } from './KeyValueSeparator.js';

// InlineTableNewline's adjacency checks reference this token: a newline may
// not directly follow (lookbehind) or precede (lookahead) the `=`.
export const InlineTableKeyValSep = createToken({
  name: 'InlineTableKeyValSep',
  pattern: /=/,
  label: '=',
  push_mode: Mode.InlineTableValue,
  pop_mode: true,
  categories: [KeyValueSeparator],
});

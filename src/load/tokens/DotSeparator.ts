import { createToken } from 'chevrotain';

// InlineTableNewline's adjacency checks reference this token: a newline may
// not directly follow (lookbehind) or precede (lookahead) a dot separator.
export const DotSeparator = createToken({
  name: 'DotSeparator',
  pattern: /\./,
  label: '.',
});

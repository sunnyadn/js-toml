import { createToken } from 'chevrotain';

const inlineTableClose = /}/;

export const InlineTableClose = createToken({
  name: 'InlineTableClose',
  pattern: inlineTableClose,
  label: '}',
});

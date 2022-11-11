import { createToken } from 'chevrotain';

const inlineTableOpen = /{/;

export const InlineTableOpen = createToken({
  name: 'InlineTableOpen',
  pattern: inlineTableOpen,
  label: '{',
});

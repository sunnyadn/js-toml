import { createToken } from 'chevrotain';
import { Mode } from './modes';

const arrayOpen = /\[/;

export const ArrayOpen = createToken({
  name: 'ArrayOpen',
  pattern: arrayOpen,
  label: '[',
  push_mode: Mode.Array,
});

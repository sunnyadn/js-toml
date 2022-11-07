import { createToken } from 'chevrotain';
import { newline } from './patterns';

export const Newline = createToken({ name: 'Newline', pattern: newline });

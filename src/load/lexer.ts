import { Lexer } from 'chevrotain';
import { envs } from '../common/environment';
import {
  BasicString,
  Comment,
  DotSeparator,
  KeyValueSeparator,
  LiteralString,
  Minus,
  MultiLineBasicString,
  MultiLineLiteralString,
  Newline,
  Plus,
  True,
  UnquotedKey,
  UnsignedDecimalInteger,
  UnsignedNonDecimalInteger,
  WhiteSpace,
} from './tokens';

export const allTokens = [
  WhiteSpace,
  Newline,
  MultiLineBasicString,
  MultiLineLiteralString,
  BasicString,
  LiteralString,
  True,
  Minus,
  Plus,
  UnsignedNonDecimalInteger,
  UnsignedDecimalInteger,
  UnquotedKey,
  KeyValueSeparator,
  DotSeparator,
  Comment,
];

export const lexer = new Lexer(allTokens, {
  ensureOptimizations: true,
  skipValidations: !envs.isDebug,
});

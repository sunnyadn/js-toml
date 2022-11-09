import { WhiteSpace } from './WhiteSpace';
import { Newline } from './Newline';
import { MultiLineBasicString } from './MultiLineBasicString';
import { MultiLineLiteralString } from './MultiLineLiteralString';
import { BasicString } from './BasicString';
import { LiteralString } from './LiteralString';
import { Boolean } from './Boolean';
import { NonDecimalInteger } from './NonDecimalInteger';
import { DecimalInteger } from './DecimalInteger';
import { UnquotedKey } from './UnquotedKey';
import { KeyValueSeparator } from './KeyValueSeparator';
import { DotSeparator } from './DotSeparator';
import { Comment } from './Comment';
import { Float } from './Float';
import { DateTime } from './DateTime';

export const allTokens = [
  WhiteSpace,
  Newline,
  MultiLineBasicString,
  MultiLineLiteralString,
  BasicString,
  LiteralString,
  Boolean,
  Float,
  DateTime,
  NonDecimalInteger,
  DecimalInteger,
  UnquotedKey,
  KeyValueSeparator,
  DotSeparator,
  Comment,
];

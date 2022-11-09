import { WhiteSpace } from './WhiteSpace';
import { Newline } from './Newline';
import { MultiLineBasicString } from './MultiLineBasicString';
import { MultiLineLiteralString } from './MultiLineLiteralString';
import { BasicString } from './BasicString';
import { LiteralString } from './LiteralString';
import { True } from './True';
import { NonDecimalInteger } from './NonDecimalInteger';
import { DecimalInteger } from './DecimalInteger';
import { UnquotedKey } from './UnquotedKey';
import { KeyValueSeparator } from './KeyValueSeparator';
import { DotSeparator } from './DotSeparator';
import { Comment } from './Comment';

export const allTokens = [
  WhiteSpace,
  Newline,
  MultiLineBasicString,
  MultiLineLiteralString,
  BasicString,
  LiteralString,
  True,
  NonDecimalInteger,
  DecimalInteger,
  UnquotedKey,
  KeyValueSeparator,
  DotSeparator,
  Comment,
];

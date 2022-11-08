import { WhiteSpace } from './WhiteSpace';
import { Newline } from './Newline';
import { MultiLineBasicString } from './MultiLineBasicString';
import { MultiLineLiteralString } from './MultiLineLiteralString';
import { BasicString } from './BasicString';
import { LiteralString } from './LiteralString';
import { True } from './True';
import { Minus } from './Minus';
import { Plus } from './Plus';
import { UnsignedNonDecimalInteger } from './UnsignedNonDecimalInteger';
import { UnsignedDecimalInteger } from './UnsignedDecimalInteger';
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
  Minus,
  Plus,
  UnsignedNonDecimalInteger,
  UnsignedDecimalInteger,
  UnquotedKey,
  KeyValueSeparator,
  DotSeparator,
  Comment,
];

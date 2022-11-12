import { WhiteSpace } from './WhiteSpace';
import { Newline } from './Newline';
import { MultiLineBasicString } from './MultiLineBasicString';
import { MultiLineLiteralString } from './MultiLineLiteralString';
import { BasicString } from './BasicString';
import { LiteralString } from './LiteralString';
import { NonDecimalInteger } from './NonDecimalInteger';
import { DecimalInteger } from './DecimalInteger';
import { UnquotedKey } from './UnquotedKey';
import { KeyValueSeparator } from './KeyValueSeparator';
import { DotSeparator } from './DotSeparator';
import { Comment } from './Comment';
import { Float } from './Float';
import { DateTime } from './DateTime';
import { ArrayOpen } from './ArrayOpen';
import { ArraySep } from './ArraySep';
import { InlineTableOpen } from './InlineTableOpen';
import { InlineTableClose } from './InlineTableClose';
import { True } from './True';
import { False } from './False';
import { Mode } from './modes';
import { ArrayClose } from './ArrayClose';
import { IgnoredNewline } from './IgnoredNewline';
import { InlineTableSep } from './InlineTableSep';
import { SimpleKey } from './SimpleKey';

const keyTokens = [
  WhiteSpace,
  BasicString,
  LiteralString,
  UnquotedKey,
  KeyValueSeparator,
  DotSeparator,
  SimpleKey,
];

const valueTokens = [
  WhiteSpace,
  MultiLineBasicString,
  MultiLineLiteralString,
  BasicString,
  LiteralString,
  True,
  False,
  DateTime,
  Float,
  NonDecimalInteger,
  DecimalInteger,
  ArrayOpen,
  InlineTableOpen,
  Comment,
];

export const allTokens = {
  modes: {
    [Mode.Key]: [Comment, IgnoredNewline, ...keyTokens],
    [Mode.Value]: [...valueTokens, Newline, InlineTableSep, InlineTableClose],
    [Mode.Array]: [...valueTokens, IgnoredNewline, ArraySep, ArrayClose],
    [Mode.InlineTable]: [...keyTokens, Newline],
  },

  defaultMode: Mode.Key,
};

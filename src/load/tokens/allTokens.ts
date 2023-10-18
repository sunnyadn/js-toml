import { WhiteSpace } from './WhiteSpace.js';
import { Newline } from './Newline.js';
import { MultiLineBasicString } from './MultiLineBasicString.js';
import { MultiLineLiteralString } from './MultiLineLiteralString.js';
import { BasicString } from './BasicString.js';
import { LiteralString } from './LiteralString.js';
import { NonDecimalInteger } from './NonDecimalInteger.js';
import { DecimalInteger } from './DecimalInteger.js';
import { UnquotedKey } from './UnquotedKey.js';
import { KeyValueSeparator } from './KeyValueSeparator.js';
import { DotSeparator } from './DotSeparator.js';
import { Comment } from './Comment.js';
import { Float } from './Float.js';
import { DateTime } from './DateTime.js';
import { ArrayOpen } from './ArrayOpen.js';
import { ArraySep } from './ArraySep.js';
import { InlineTableOpen } from './InlineTableOpen.js';
import { InlineTableClose } from './InlineTableClose.js';
import { True } from './True.js';
import { False } from './False.js';
import { Mode } from './modes.js';
import { ArrayClose } from './ArrayClose.js';
import { ArrayNewline } from './ArrayNewline.js';
import { InlineTableSep } from './InlineTableSep.js';
import { SimpleKey } from './SimpleKey.js';
import { InlineTableKeyValSep } from './InlineTableKeyValSep.js';
import { StdTableClose } from './StdTableClose.js';
import { StdTableOpen } from './StdTableOpen.js';
import { ArrayTableOpen } from './ArrayTableOpen.js';
import { ArrayTableClose } from './ArrayTableClose.js';
import { ExpressionNewLine } from './ExpressionNewLine.js';

const keyTokens = [
  WhiteSpace,
  BasicString,
  LiteralString,
  UnquotedKey,
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
    [Mode.Key]: [
      Comment,
      ExpressionNewLine,
      KeyValueSeparator,
      ArrayTableOpen,
      ArrayTableClose,
      StdTableOpen,
      StdTableClose,
      ...keyTokens,
    ],
    [Mode.Value]: [...valueTokens, Newline, InlineTableSep, InlineTableClose],
    [Mode.Array]: [...valueTokens, ArrayNewline, ArraySep, ArrayClose],
    [Mode.InlineTable]: [...keyTokens, InlineTableKeyValSep, InlineTableClose],
  },

  defaultMode: Mode.Key,
};

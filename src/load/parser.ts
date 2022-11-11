import { CstParser } from 'chevrotain';
import {
  allTokens,
  BasicString,
  Boolean,
  DecimalInteger,
  DotSeparator,
  KeyValueSeparator,
  LiteralString,
  MultiLineBasicString,
  MultiLineLiteralString,
  Newline,
  NonDecimalInteger,
  UnquotedKey,
} from './tokens';
import { Float } from './tokens/Float';
import { DateTime } from './tokens/DateTime';
import { ArrayOpen } from './tokens/ArrayOpen';
import { ArrayClose } from './tokens/ArrayClose';
import { Comma } from './tokens/Comma';
import { InlineTableOpen } from './tokens/InlineTableOpen';
import { InlineTableClose } from './tokens/InlineTableClose';

class Parser extends CstParser {
  private quotedKey = this.RULE('quotedKey', () => {
    this.OR([
      { ALT: () => this.CONSUME(BasicString) },
      { ALT: () => this.CONSUME(LiteralString) },
    ]);
  });
  private simpleKey = this.RULE('simpleKey', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.quotedKey) },
      { ALT: () => this.CONSUME(UnquotedKey) },
    ]);
  });
  private dottedKey = this.RULE('dottedKey', () => {
    this.SUBRULE(this.simpleKey);
    this.AT_LEAST_ONE(() => {
      this.CONSUME(DotSeparator);
      this.SUBRULE1(this.simpleKey);
    });
  });
  private key = this.RULE('key', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.dottedKey) },
      { ALT: () => this.SUBRULE(this.simpleKey) },
    ]);
  });
  private string = this.RULE('string', () => {
    this.OR([
      { ALT: () => this.CONSUME(MultiLineBasicString) },
      { ALT: () => this.CONSUME(BasicString) },
      { ALT: () => this.CONSUME(MultiLineLiteralString) },
      { ALT: () => this.CONSUME(LiteralString) },
    ]);
  });
  private integer = this.RULE('integer', () => {
    this.OR([
      { ALT: () => this.CONSUME(DecimalInteger) },
      { ALT: () => this.CONSUME(NonDecimalInteger) },
    ]);
  });
  private inlineTable = this.RULE('inlineTable', () => {
    this.CONSUME(InlineTableOpen);
    this.OPTION(() => this.SUBRULE(this.inlineTableKeyValues));
    this.CONSUME(InlineTableClose);
  });
  private keyValue = this.RULE('keyValue', () => {
    this.SUBRULE(this.key);
    this.CONSUME(KeyValueSeparator);
    this.SUBRULE(this.value);
  });
  private inlineTableKeyValues = this.RULE('inlineTableKeyValues', () => {
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => this.SUBRULE(this.keyValue),
    });
  });
  private arrayValues = this.RULE('arrayValues', () => {
    this.SUBRULE(this.value);
    this.MANY(() => this.CONSUME(Newline));
    let havingMore = true;
    this.MANY1({
      GATE: () => havingMore,
      DEF: () => {
        this.CONSUME(Comma);
        this.MANY2(() => this.CONSUME1(Newline));
        const found = this.OPTION(() => this.SUBRULE1(this.value));
        if (!found) {
          havingMore = false;
        } else {
          this.MANY3(() => this.CONSUME2(Newline));
        }
      },
    });
  });
  private array = this.RULE('array', () => {
    this.CONSUME(ArrayOpen);
    this.MANY(() => this.CONSUME(Newline));
    this.OPTION(() => this.SUBRULE(this.arrayValues));
    this.CONSUME(ArrayClose);
  });
  private value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.string) },
      { ALT: () => this.CONSUME(Boolean) },
      { ALT: () => this.SUBRULE(this.array) },
      { ALT: () => this.SUBRULE(this.inlineTable) },
      { ALT: () => this.CONSUME(DateTime) },
      { ALT: () => this.CONSUME(Float) },
      { ALT: () => this.SUBRULE(this.integer) },
    ]);
  });
  private expression = this.RULE('expression', () => {
    this.SUBRULE(this.keyValue);
    // OR TABLE
  });
  toml = this.RULE('toml', () => {
    this.OPTION(() => this.CONSUME(Newline));
    this.OPTION1(() => this.SUBRULE(this.expression));
    this.MANY(() => {
      this.AT_LEAST_ONE(() => this.CONSUME1(Newline));
      this.SUBRULE1(this.expression);
    });
    this.MANY1(() => this.CONSUME2(Newline));
  });

  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }
}

export const parser = new Parser();

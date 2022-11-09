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
  private value = this.RULE('value', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.string) },
      { ALT: () => this.CONSUME(Boolean) },
      // OR ARRAY
      // OR INLINE TABLE
      // OR DATE TIME
      { ALT: () => this.CONSUME(Float) },
      { ALT: () => this.SUBRULE(this.integer) },
    ]);
  });
  private keyValue = this.RULE('keyValue', () => {
    this.SUBRULE(this.key);
    this.CONSUME(KeyValueSeparator);
    this.SUBRULE(this.value);
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

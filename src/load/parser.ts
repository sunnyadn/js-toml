import { CstParser } from 'chevrotain';
import {
  allTokens,
  Boolean,
  DotSeparator,
  KeyValueSeparator,
  Newline,
} from './tokens';
import { Float } from './tokens/Float';
import { DateTime } from './tokens/DateTime';
import { ArrayOpen } from './tokens/ArrayOpen';
import { ArrayClose } from './tokens/ArrayClose';
import { ArraySep } from './tokens/ArraySep';
import { InlineTableOpen } from './tokens/InlineTableOpen';
import { InlineTableClose } from './tokens/InlineTableClose';
import { SimpleKey } from './tokens/SimpleKey';
import { TomlString } from './tokens/TomlString';
import { Integer } from './tokens/Integer';
import { InlineTableSep } from './tokens/InlineTableSep';

class Parser extends CstParser {
  private dottedKey = this.RULE('dottedKey', () => {
    this.CONSUME(SimpleKey);
    this.AT_LEAST_ONE(() => {
      this.CONSUME(DotSeparator);
      this.CONSUME1(SimpleKey);
    });
  });
  private key = this.RULE('key', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.dottedKey) },
      { ALT: () => this.CONSUME(SimpleKey) },
    ]);
  });
  private keyValue = this.RULE('keyValue', () => {
    this.SUBRULE(this.key);
    this.CONSUME(KeyValueSeparator);
    this.SUBRULE(this.value);
  });
  private inlineTableKeyValues = this.RULE('inlineTableKeyValues', () => {
    this.MANY_SEP({
      SEP: InlineTableSep,
      DEF: () => this.SUBRULE(this.keyValue),
    });
  });
  private inlineTable = this.RULE('inlineTable', () => {
    this.CONSUME(InlineTableOpen);
    this.OPTION(() => this.SUBRULE(this.inlineTableKeyValues));
    this.CONSUME(InlineTableClose);
  });
  private arrayValues = this.RULE('arrayValues', () => {
    this.SUBRULE(this.value);
    this.MANY(() => this.CONSUME(Newline));
    let havingMore = true;
    this.MANY1({
      GATE: () => havingMore,
      DEF: () => {
        this.CONSUME(ArraySep);
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
      { ALT: () => this.CONSUME(TomlString) },
      { ALT: () => this.CONSUME(Boolean) },
      { ALT: () => this.SUBRULE(this.array) },
      { ALT: () => this.SUBRULE(this.inlineTable) },
      { ALT: () => this.CONSUME(DateTime) },
      { ALT: () => this.CONSUME(Float) },
      { ALT: () => this.CONSUME(Integer) },
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

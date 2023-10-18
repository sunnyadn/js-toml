import { CstParser } from 'chevrotain';
import {
  allTokens,
  ArrayClose,
  ArrayOpen,
  ArraySep,
  ArrayTableClose,
  ArrayTableOpen,
  Boolean,
  DateTime,
  DotSeparator,
  ExpressionNewLine,
  Float,
  InlineTableClose,
  InlineTableOpen,
  InlineTableSep,
  Integer,
  KeyValueSeparator,
  Newline,
  SimpleKey,
  StdTableClose,
  StdTableOpen,
  TomlString,
} from './tokens/index.js';

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
    let havingMore = true;
    this.MANY({
      GATE: () => havingMore,
      DEF: () => {
        this.CONSUME(ArraySep);
        const found = this.OPTION(() => this.SUBRULE1(this.value));
        if (!found) {
          havingMore = false;
        }
      },
    });
  });
  private array = this.RULE('array', () => {
    this.CONSUME(ArrayOpen);
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
  private stdTable = this.RULE('stdTable', () => {
    this.CONSUME(StdTableOpen);
    this.SUBRULE(this.key);
    this.CONSUME(StdTableClose);
  });
  private arrayTable = this.RULE('arrayTable', () => {
    this.CONSUME(ArrayTableOpen);
    this.SUBRULE(this.key);
    this.CONSUME(ArrayTableClose);
  });
  private table = this.RULE('table', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.stdTable) },
      { ALT: () => this.SUBRULE(this.arrayTable) },
    ]);
  });
  private expression = this.RULE('expression', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.keyValue) },
      { ALT: () => this.SUBRULE(this.table) },
    ]);
  });
  toml = this.RULE('toml', () => {
    this.MANY(() => this.CONSUME(ExpressionNewLine));
    this.MANY1(() => {
      this.SUBRULE1(this.expression);
      this.OPTION2(() => {
        this.CONSUME1(Newline);
        this.MANY3(() => this.CONSUME2(ExpressionNewLine));
      });
    });
  });

  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }
}

export const parser = new Parser();

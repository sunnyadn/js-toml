import {CstParser} from "chevrotain";
import {
  allTokens,
  BasicString,
  DotSeparator,
  KeyValueSeparator,
  LiteralString,
  Newline,
  True,
  UnquotedKey, UnsignedDecimalInteger
} from "./lexer";

export class Parser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  toml = this.RULE("toml", () => {
    this.OPTION(() => this.CONSUME(Newline));
    this.OPTION1(() => this.SUBRULE(this.expression));
    this.MANY(() => {
      this.AT_LEAST_ONE(() => this.CONSUME1(Newline));
      this.SUBRULE1(this.expression);
    });
  });

  private expression = this.RULE("expression", () => {
    this.SUBRULE(this.keyValue);
    // OR TABLE
  });

  private keyValue = this.RULE("keyValue", () => {
    this.SUBRULE(this.key);
    this.CONSUME(KeyValueSeparator);
    this.SUBRULE(this.value);
  });

  private key = this.RULE("key", () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.dottedKey)},
      {ALT: () => this.SUBRULE(this.simpleKey)},
    ]);
  });

  private simpleKey = this.RULE("simpleKey", () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.quotedKey)},
      {ALT: () => this.CONSUME(UnquotedKey)},
      {ALT: () => this.CONSUME(UnsignedDecimalInteger)},
    ]);
  });

  private dottedKey = this.RULE("dottedKey", () => {
    this.SUBRULE(this.simpleKey);
    this.AT_LEAST_ONE(() => {
      this.CONSUME(DotSeparator);
      this.SUBRULE1(this.simpleKey);
    });
  });

  private quotedKey = this.RULE("quotedKey", () => {
    this.OR([
      {ALT: () => this.CONSUME(BasicString)},
      {ALT: () => this.CONSUME(LiteralString)}
    ]);
  });

  private value = this.RULE("value", () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.string)},
      {ALT: () => this.SUBRULE(this.boolean)},
      // OR ARRAY
      // OR INLINE TABLE
      // OR DATE TIME
      // OR FLOAT
      {ALT: () => this.SUBRULE(this.integer)},
    ]);
  });

  private string = this.RULE("string", () => {
    this.OR([
      // OR MULTILINE BASIC STRING
      {ALT: () => this.CONSUME(BasicString)},
      // OR MULTILINE LITERAL STRING
      {ALT: () => this.CONSUME(LiteralString)}
    ]);
  });

  private boolean = this.RULE("boolean", () => {
    this.CONSUME(True);
    // OR FALSE
  });

  private integer = this.RULE("integer", () => {
    this.SUBRULE(this.decimalInteger);
    // OR HEX INTEGER
    // OR OCT INTEGER
    // OR BIN INTEGER
  });

  private decimalInteger = this.RULE("decimalInteger", () => {
    // OR +/-
    this.CONSUME(UnsignedDecimalInteger);
  });
}
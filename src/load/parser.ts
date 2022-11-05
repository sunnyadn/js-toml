import {CstParser} from "chevrotain";
import {allTokens, BasicString, KeyValueSeparator, Newline, UnquotedKey} from "./lexer";

export class Parser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  toml = this.RULE("toml", () => {
    this.OPTION(() => this.CONSUME(Newline));
    this.OPTION1(() => this.SUBRULE(this.expression));
    this.MANY(() => {
      this.CONSUME1(Newline);
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
    this.SUBRULE(this.simpleKey);
    // OR DOTTED KEY
  });

  private simpleKey = this.RULE("simpleKey", () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.quotedKey)},
      {ALT: () => this.CONSUME(UnquotedKey)},
    ]);
  });

  private quotedKey = this.RULE("quotedKey", () => {
    this.CONSUME(BasicString);
    // OR LITERAL STRING
  });

  private value = this.RULE("value", () => {
    this.SUBRULE(this.string);
    // OR BOOLEAN
    // OR ARRAY
    // OR INLINE TABLE
    // OR DATE TIME
    // OR FLOAT
    // OR INTEGER
  });

  private string = this.RULE("string", () => {
    // OR MULTILINE BASIC STRING
    this.CONSUME(BasicString);
    // OR MULTILINE LITERAL STRING
    // OR LITERAL STRING
  });
}
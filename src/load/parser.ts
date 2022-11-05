import {CstParser} from "chevrotain";
import {allTokens, BasicString, KeyValueSeparator, UnquotedKey} from "./lexer";

export class Parser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  toml = this.RULE("toml", () => {
    this.MANY(() => this.SUBRULE(this.expression));
  });

  private expression = this.RULE("expression", () => {
    this.SUBRULE(this.keyValue);
  });

  private keyValue = this.RULE("keyValue", () => {
    this.SUBRULE(this.key);
    this.CONSUME(KeyValueSeparator);
    this.SUBRULE(this.value);
  });

  private key = this.RULE("key", () => {
    this.SUBRULE(this.simpleKey);
  });

  private simpleKey = this.RULE("simpleKey", () => {
    this.CONSUME(UnquotedKey);
  });

  private value = this.RULE("value", () => {
    this.SUBRULE(this.string);
  });

  private string = this.RULE("string", () => {
    this.SUBRULE(this.basicString);
  });

  private basicString = this.RULE("basicString", () => {
    this.CONSUME(BasicString);
  });
}
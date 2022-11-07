import {CstParser} from "chevrotain";
import {
  allTokens,
  BasicString,
  DotSeparator,
  KeyValueSeparator,
  LiteralString, Minus, MultiLineBasicString, MultiLineLiteralString,
  Newline, UnsignedNonDecimalInteger, Plus,
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
    this.MANY1(() => this.CONSUME2(Newline));
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
      {ALT: () => this.CONSUME(UnsignedNonDecimalInteger)}
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
      {ALT: () => this.CONSUME(MultiLineBasicString)},
      {ALT: () => this.CONSUME(BasicString)},
      {ALT: () => this.CONSUME(MultiLineLiteralString)},
      {ALT: () => this.CONSUME(LiteralString)}
    ]);
  });

  private boolean = this.RULE("boolean", () => {
    this.CONSUME(True);
    // OR FALSE
  });

  private integer = this.RULE("integer", () => {
    this.OR([
      {ALT: () => this.SUBRULE(this.decimalInteger)},
      {ALT: () => this.SUBRULE(this.nonDecimalInteger)}
    ]);

  });

  private decimalInteger = this.RULE("decimalInteger", () => {
    this.OPTION(() => this.OR([
      {ALT: () => this.CONSUME(Minus)},
      {ALT: () => this.CONSUME(Plus)},
    ]));
    this.CONSUME(UnsignedDecimalInteger);
  });

  private nonDecimalInteger = this.RULE("nonDecimalInteger", () => {
    this.OPTION(() => this.CONSUME(Minus));
    this.CONSUME(UnsignedNonDecimalInteger);
  });
}
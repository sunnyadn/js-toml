import {Parser} from "./parser";

const parser = new Parser();

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export class Interpreter extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  toml(ctx) {
    if (!ctx.expression) {
      return {};
    }

    const expressions = ctx.expression.map((expression) => this.visit(expression));
    return expressions.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  expression(ctx) {
    return this.visit(ctx.keyValue);
  }

  keyValue(ctx) {
    const key = this.visit(ctx.key);
    const value = this.visit(ctx.value);
    return [key, value];
  }

  key(ctx) {
    return this.visit(ctx.simpleKey);
  }

  simpleKey(ctx) {
    if (ctx.quotedKey) {
      return this.visit(ctx.quotedKey);
    } else if (ctx.UnquotedKey) {
      return ctx.UnquotedKey[0].image;
    }
  }

  quotedKey(ctx) {
    return this.readSingleLineString(ctx);
  }

  value(ctx) {
    return this.visit(ctx.string);
  }

  string(ctx) {
    return this.readSingleLineString(ctx);
  }

  private readSingleLineString(ctx) {
    const tokens = ctx.BasicString || ctx.LiteralString;
    const string = tokens[0].image;
    return string.substring(1, string.length - 1);
  }
}

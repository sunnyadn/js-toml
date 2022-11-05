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
    if (ctx.BasicString) {
      return this.readBasicString(ctx);
    } else if (ctx.LiteralString) {
      return this.readLiteralString(ctx);
    }
  }

  value(ctx) {
    return this.visit(ctx.string);
  }

  string(ctx) {
    return this.readBasicString(ctx);
  }

  private readBasicString(ctx) {
    const result = ctx.BasicString[0].image;
    return result.substring(1, result.length - 1);
  }

  private readLiteralString(ctx) {
    const result = ctx.LiteralString[0].image;
    return result.substring(1, result.length - 1);
  }
}

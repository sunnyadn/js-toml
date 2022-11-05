import {Parser} from "./parser";

const parser = new Parser();

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export class Interpreter extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  private result: object;

  toml(ctx) {
    this.result = {};
    ctx.expression?.forEach((expression) => this.visit(expression));
    return this.result;
  }

  expression(ctx) {
    this.visit(ctx.keyValue);
  }

  private assignValue(key, value, object = this.result) {
    if (typeof key === 'string') {
      object[key] = value;
    } else {
      const [first, ...rest] = key;
      if (rest.length > 0) {
        object[first] = object[first] || {};
        this.assignValue(rest, value, object[first]);
      } else {
        object[first] = value;
      }
    }
  }

  keyValue(ctx) {
    const key = this.visit(ctx.key);
    const value = this.visit(ctx.value);
    this.assignValue(key, value);
  }

  key(ctx) {
    if (ctx.dottedKey) {
      return this.visit(ctx.dottedKey);
    } else {
      return this.visit(ctx.simpleKey);
    }
  }

  simpleKey(ctx) {
    if (ctx.quotedKey) {
      return this.visit(ctx.quotedKey);
    } else if (ctx.UnquotedKey) {
      return ctx.UnquotedKey[0].image;
    }
  }

  dottedKey(ctx) {
    return ctx.simpleKey.map((simpleKey) => this.visit(simpleKey));
  }

  quotedKey(ctx) {
    return this.readSingleLineString(ctx);
  }

  value(ctx) {
    if (ctx.string) {
      return this.visit(ctx.string);
    } else if (ctx.boolean) {
      return this.visit(ctx.boolean);
    }
  }

  string(ctx) {
    return this.readSingleLineString(ctx);
  }

  boolean(ctx) {
    return !!ctx.True;
  }

  private readSingleLineString(ctx) {
    const tokens = ctx.BasicString || ctx.LiteralString;
    const string = tokens[0].image;
    return string.substring(1, string.length - 1);
  }
}

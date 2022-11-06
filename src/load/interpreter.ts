import {Parser} from "./parser";
import {InterpreterError} from "./exception";

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

  keyValue(ctx) {
    const keys = this.visit(ctx.key);
    const value = this.visit(ctx.value);
    this.assignValue(keys, value);
  }

  key(ctx) {
    if (ctx.dottedKey) {
      return this.visit(ctx.dottedKey);
    } else {
      return this.visit(ctx.simpleKey);
    }
  }

  simpleKey(ctx) {
    let key;
    if (ctx.quotedKey) {
      key = this.visit(ctx.quotedKey);
    } else if (ctx.UnquotedKey) {
      key = ctx.UnquotedKey[0].image;
    }

    return [key];
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

  private assignPrimitiveValue(key, value, object) {
    const realKey = typeof key === 'string' ? key : key[0];
    if (object[realKey]) {
      throw new InterpreterError(`Duplicate key detect: '${realKey}'`);
    }
    object[key] = value;
  }

  private assignValue(keys, value, object = this.result) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      object[first] = object[first] || {};
      this.assignValue(rest, value, object[first]);
    } else {
      this.assignPrimitiveValue(first, value, object);
    }
  }

  private readSingleLineString(ctx) {
    const tokens = ctx.BasicString || ctx.LiteralString;
    const string = tokens[0].image;
    return string.substring(1, string.length - 1);
  }
}

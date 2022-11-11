import { parser } from './parser';
import { InterpreterError } from './exception';
import { TokenType } from 'chevrotain';
import { tokenInterpreters } from './tokens/tokenInterpreters';
import {
  BasicString,
  Boolean,
  DecimalInteger,
  LiteralString,
  MultiLineBasicString,
  MultiLineLiteralString,
  NonDecimalInteger,
  UnquotedKey,
} from './tokens';
import { Float } from './tokens/Float';
import { DateTime } from './tokens/DateTime';

class DuplicateKeyError extends Error {}

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export class Interpreter extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  toml(ctx) {
    const result = {};
    ctx.expression?.forEach((expression) => this.visit(expression, result));
    return result;
  }

  expression(ctx, root) {
    this.visit(ctx.keyValue, root);
  }

  keyValue(ctx, object) {
    const keys = this.visit(ctx.key);
    const value = this.visit(ctx.value);
    const rawKey = keys.join('.');
    try {
      this.assignValue(keys, value, object);
    } catch (e) {
      if (e instanceof DuplicateKeyError) {
        throw new InterpreterError(`Cannot assign value to key '${rawKey}'`);
      }
      throw e;
    }
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
    } else {
      key = this.interpret(ctx, UnquotedKey);
    }

    return [key];
  }

  dottedKey(ctx) {
    return ctx.simpleKey.map((simpleKey) => this.visit(simpleKey));
  }

  quotedKey(ctx) {
    return this.interpret(ctx, BasicString, LiteralString);
  }

  inlineTableKeyValues(ctx, object) {
    ctx.keyValue.forEach((keyValue) => this.visit(keyValue, object));
  }

  inlineTable(ctx) {
    const result = {};
    if (ctx.inlineTableKeyValues) {
      this.visit(ctx.inlineTableKeyValues, result);
    }

    return result;
  }

  value(ctx) {
    if (ctx.string) {
      return this.visit(ctx.string);
    } else if (ctx.array) {
      return this.visit(ctx.array);
    } else if (ctx.inlineTable) {
      return this.visit(ctx.inlineTable);
    } else if (ctx.integer) {
      return this.visit(ctx.integer);
    }

    return this.interpret(ctx, Float, Boolean, DateTime);
  }

  string(ctx) {
    return this.interpret(
      ctx,
      MultiLineBasicString,
      MultiLineLiteralString,
      BasicString,
      LiteralString
    );
  }

  arrayValues(ctx) {
    return ctx.value.map((value) => this.visit(value));
  }

  array(ctx) {
    return this.visit(ctx.arrayValues);
  }

  integer(ctx) {
    return this.interpret(ctx, DecimalInteger, NonDecimalInteger);
  }

  private interpret(ctx, ...candidates: TokenType[]) {
    for (const token of candidates) {
      if (ctx[token.name]) {
        return tokenInterpreters[token.name](ctx[token.name][0].image);
      }
    }
    return null;
  }

  private assignPrimitiveValue(key, value, object) {
    const realKey = typeof key === 'string' ? key : key[0];
    if (object[realKey]) {
      throw new DuplicateKeyError();
    }
    object[key] = value;
  }

  private tryCreatingObject(key, object) {
    object[key] = object[key] || {};
    if (typeof object[key] !== 'object') {
      throw new DuplicateKeyError();
    }
  }

  private assignValue(keys, value, object) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      this.tryCreatingObject(first, object);
      this.assignValue(rest, value, object[first]);
    } else {
      this.assignPrimitiveValue(first, value, object);
    }
  }
}

export const interpreter = new Interpreter();

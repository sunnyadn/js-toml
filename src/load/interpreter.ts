import { parser } from './parser';
import { InterpreterError } from './exception';
import { TokenType } from 'chevrotain';
import { tokenInterpreters } from './tokens/tokenInterpreters';
import {
  BasicString,
  LiteralString,
  Minus,
  MultiLineBasicString,
  MultiLineLiteralString,
  True,
  UnquotedKey,
  UnsignedDecimalInteger,
  UnsignedNonDecimalInteger,
} from './tokens';

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export class Interpreter extends BaseCstVisitor {
  private result: object;

  constructor() {
    super();
    this.validateVisitor();
  }

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
    const rawKey = keys.join('.');
    this.assignValue(rawKey, keys, value);
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
    } else if (ctx.unquotedKey) {
      key = this.visit(ctx.unquotedKey);
    }

    return [key];
  }

  dottedKey(ctx) {
    return ctx.simpleKey.map((simpleKey) => this.visit(simpleKey));
  }

  quotedKey(ctx) {
    return this.interpret(ctx, BasicString, LiteralString);
  }

  unquotedKey(ctx) {
    return this.interpret(ctx, UnquotedKey);
  }

  value(ctx) {
    if (ctx.string) {
      return this.visit(ctx.string);
    } else if (ctx.boolean) {
      return this.visit(ctx.boolean);
    } else if (ctx.integer) {
      return this.visit(ctx.integer);
    }
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

  boolean(ctx) {
    return this.interpret(ctx, True);
  }

  integer(ctx) {
    if (ctx.decimalInteger) {
      return this.visit(ctx.decimalInteger);
    } else if (ctx.nonDecimalInteger) {
      return this.visit(ctx.nonDecimalInteger);
    }
  }

  decimalInteger(ctx) {
    const negative = this.interpret(ctx, Minus);
    const unsigned = this.interpret(ctx, UnsignedDecimalInteger);
    return this.readInteger(unsigned, negative);
  }

  nonDecimalInteger(ctx) {
    const negative = this.interpret(ctx, Minus);
    const unsigned = this.interpret(ctx, UnsignedNonDecimalInteger);
    return this.readInteger(unsigned, negative);
  }

  private interpret(ctx, ...candidates: TokenType[]) {
    for (const token of candidates) {
      if (ctx[token.name]) {
        return tokenInterpreters[token.name](ctx[token.name][0].image);
      }
    }
    return null;
  }

  private assignPrimitiveValue(key, value, object, rawKey) {
    const realKey = typeof key === 'string' ? key : key[0];
    if (object[realKey]) {
      throw new InterpreterError(`Duplicate key detect: '${rawKey}'`);
    }
    object[key] = value;
  }

  private tryCreatingObject(key, object, rawKey) {
    object[key] = object[key] || {};
    if (typeof object[key] !== 'object') {
      throw new InterpreterError(`Cannot assign value to key '${rawKey}'`);
    }
  }

  private assignValue(rawKey, keys, value, object = this.result) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      this.tryCreatingObject(first, object, rawKey);
      this.assignValue(rawKey, rest, value, object[first]);
    } else {
      this.assignPrimitiveValue(first, value, object, rawKey);
    }
  }

  private readInteger(unsigned: number, negative: boolean) {
    if (unsigned === 0) {
      return 0;
    }

    return negative ? -unsigned : +unsigned;
  }
}

export const interpreter = new Interpreter();

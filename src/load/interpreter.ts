import { parser } from './parser';
import { InterpreterError } from './exception';
import { TokenType } from 'chevrotain';
import { tokenInterpreters } from './tokens/tokenInterpreters';
import { Boolean } from './tokens';
import { Float } from './tokens/Float';
import { DateTime } from './tokens/DateTime';
import { SimpleKey } from './tokens/SimpleKey';
import { TomlString } from './tokens/TomlString';
import { Integer } from './tokens/Integer';

class DuplicateKeyError extends Error {}

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

const tableDeclared = Symbol('tableDeclared');

export class Interpreter extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  toml(ctx) {
    const root = {};
    let current = root;
    ctx.expression?.forEach(
      (expression) => (current = this.visit(expression, { current, root }))
    );
    this.cleanInternalProperties(root);
    return root;
  }

  expression(ctx, { current, root }) {
    if (ctx.keyValue) {
      this.visit(ctx.keyValue, current);
      return current;
    } else if (ctx.table) {
      return this.visit(ctx.table, root);
    }
  }

  keyValue(ctx, object) {
    const keys = this.visit(ctx.key);
    const value = this.visit(ctx.value);

    try {
      this.assignValue(keys, value, object);
    } catch (e) {
      if (e instanceof DuplicateKeyError) {
        const rawKey = keys.join('.');
        throw new InterpreterError(`Cannot assign value to key '${rawKey}'`);
      }
      throw e;
    }
  }

  key(ctx) {
    if (ctx.dottedKey) {
      return this.visit(ctx.dottedKey);
    } else {
      return [this.interpret(ctx, SimpleKey)];
    }
  }

  dottedKey(ctx) {
    return this.interpret(ctx, SimpleKey);
  }

  inlineTableKeyValues(ctx, object) {
    if (ctx.keyValue) {
      ctx.keyValue.forEach((keyValue) => this.visit(keyValue, object));
    }
  }

  inlineTable(ctx) {
    const result = {};
    if (ctx.inlineTableKeyValues) {
      this.visit(ctx.inlineTableKeyValues, result);
    }

    return result;
  }

  value(ctx) {
    if (ctx.array) {
      return this.visit(ctx.array);
    } else if (ctx.inlineTable) {
      return this.visit(ctx.inlineTable);
    }

    return this.interpret(ctx, TomlString, Float, Boolean, DateTime, Integer);
  }

  arrayValues(ctx) {
    return ctx.value.map((value) => this.visit(value));
  }

  array(ctx) {
    if (ctx.arrayValues) {
      return this.visit(ctx.arrayValues);
    }

    return [];
  }

  table(ctx, root) {
    if (ctx.stdTable) {
      return this.visit(ctx.stdTable, root);
    }
  }

  stdTable(ctx, root) {
    const keys = this.visit(ctx.key);

    try {
      return this.createTable(keys, root);
    } catch (e) {
      if (e instanceof DuplicateKeyError) {
        const rawKey = keys.join('.');
        throw new InterpreterError(`Cannot create table '${rawKey}'`);
      }
      throw e;
    }
  }

  private cleanInternalProperties(object) {
    for (const symbol of Object.getOwnPropertySymbols(object)) {
      if (symbol === tableDeclared) {
        delete object[symbol];
      }
    }
    for (const key in object) {
      if (typeof object[key] === 'object') {
        this.cleanInternalProperties(object[key]);
      }
    }
  }

  private interpret(ctx, ...candidates: TokenType[]) {
    for (const type of candidates) {
      if (ctx[type.name]) {
        const result = ctx[type.name].map((token) =>
          tokenInterpreters[type.name](token.image, token, type.name)
        );

        return result.length === 1 ? result[0] : result;
      }
    }
    return null;
  }

  private assignPrimitiveValue(key, value, object) {
    if (object[key]) {
      throw new DuplicateKeyError();
    }
    if (typeof value === 'object') {
      value[tableDeclared] = true;
    }

    object[key] = value;
    return object;
  }

  private tryCreatingObject(key, object, declareTable, ignoreDeclared) {
    if (object[key]) {
      if (
        typeof object[key] !== 'object' ||
        (!ignoreDeclared && object[key][tableDeclared])
      ) {
        throw new DuplicateKeyError();
      }
    } else {
      object[key] = {};
      if (declareTable) {
        object[key][tableDeclared] = true;
      }
    }

    return object[key];
  }

  private assignValue(keys, value, object) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      this.tryCreatingObject(first, object, true, true);
      return this.assignValue(rest, value, object[first]);
    }

    return this.assignPrimitiveValue(first, value, object);
  }

  private createTable(keys, object) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      this.tryCreatingObject(first, object, false, true);
      return this.createTable(rest, object[first]);
    }
    return this.tryCreatingObject(first, object, true, false);
  }
}

export const interpreter = new Interpreter();

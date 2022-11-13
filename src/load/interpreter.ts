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

const isPlainObject = (obj): boolean => obj && obj.constructor === Object;

const tryCreateKey = (operation, message) => {
  try {
    return operation();
  } catch (error) {
    if (error instanceof DuplicateKeyError) {
      throw new InterpreterError(message);
    }
  }
};

class DuplicateKeyError extends Error {}

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

const tableDeclared = Symbol('tableDeclared');
const notEditable = Symbol('notEditable');

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

    tryCreateKey(
      () => this.assignValue(keys, value, object),
      `Cannot assign value to '${keys.join('.')}'`
    );
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
    const result = { [notEditable]: true };
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

  arrayValues(ctx, array) {
    ctx.value.forEach((value) => array.push(this.visit(value)));
    return array;
  }

  array(ctx) {
    const result = [];
    result[notEditable] = true;
    if (ctx.arrayValues) {
      return this.visit(ctx.arrayValues, result);
    }

    return result;
  }

  table(ctx, root) {
    if (ctx.stdTable) {
      return this.visit(ctx.stdTable, root);
    } else if (ctx.arrayTable) {
      return this.visit(ctx.arrayTable, root);
    }
  }

  stdTable(ctx, root) {
    const keys = this.visit(ctx.key);

    return tryCreateKey(
      () => this.createTable(keys, root),
      `Cannot create table '${keys.join('.')}'`
    );
  }

  arrayTable(ctx, root) {
    const keys = this.visit(ctx.key);
    return tryCreateKey(() => {
      const array = this.getOrCreateArray(keys, root);
      if (array[notEditable]) {
        throw new DuplicateKeyError();
      }

      const object = {};
      array.push(object);
      return object;
    }, `Cannot create array table '${keys.join('.')}'`);
  }

  private cleanInternalProperties(object) {
    for (const symbol of Object.getOwnPropertySymbols(object)) {
      delete object[symbol];
    }
    for (const key in object) {
      if (typeof object[key] === 'object') {
        this.cleanInternalProperties(object[key]);
      }

      if (Array.isArray(object[key])) {
        object[key].forEach((item) => this.cleanInternalProperties(item));
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
    if (isPlainObject(value)) {
      value[tableDeclared] = true;
    }

    object[key] = value;
    return object;
  }

  private tryCreatingObject(key, object, declareTable, ignoreDeclared) {
    if (object[key]) {
      if (
        !isPlainObject(object[key]) ||
        (!ignoreDeclared && object[key][tableDeclared]) ||
        object[key][notEditable]
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
      if (Array.isArray(object[first])) {
        const toAdd = object[first][object[first].length - 1];
        return this.createTable(rest, toAdd);
      }
      this.tryCreatingObject(first, object, false, true);
      return this.createTable(rest, object[first]);
    }
    return this.tryCreatingObject(first, object, true, false);
  }

  private getOrCreateArray(keys, object) {
    const [first, ...rest] = keys;
    if (rest.length > 0) {
      if (Array.isArray(object[first])) {
        const toAdd = object[first][object[first].length - 1];
        return this.getOrCreateArray(rest, toAdd);
      }
      this.tryCreatingObject(first, object, false, true);
      return this.getOrCreateArray(rest, object[first]);
    }

    if (object[first] && !Array.isArray(object[first])) {
      throw new DuplicateKeyError();
    }

    object[first] = object[first] || [];
    return object[first];
  }
}

export const interpreter = new Interpreter();

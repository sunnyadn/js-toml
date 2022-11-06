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
    } else if (ctx.UnquotedKey) {
      key = ctx.UnquotedKey[0].image;
    } else if (ctx.UnsignedDecimalInteger) {
      key = ctx.UnsignedDecimalInteger[0].image;
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
    } else if (ctx.integer) {
      return this.visit(ctx.integer);
    }
  }

  string(ctx) {
    if (ctx.MultiLineBasicString) {
      return this.readMultiLineBasicString(ctx);
    }
    return this.readSingleLineString(ctx);
  }

  boolean(ctx) {
    return !!ctx.True;
  }

  integer(ctx) {
    return this.visit(ctx.decimalInteger);
  }

  decimalInteger(ctx) {
    return parseInt(ctx.UnsignedDecimalInteger[0].image);
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

  private removeFirstLeadingNewline(string) {
    return string.replace(/^(\r\n|\n)/, '');
  }

  private readMultiLineBasicString(ctx) {
    const string = (ctx.MultiLineBasicString)[0].image;
    const raw = string.substring(3, string.length - 3);
    let result = this.removeFirstLeadingNewline(raw);
    result = this.skipWhitespaceIfFindBackslash(result);
    return this.unescapeString(result);
  }

  private skipWhitespaceIfFindBackslash(string) {
    return string.replace(/\\[ \t]*(\r\n|\n)+[ \t]*/g, '');
  }

  private readSingleLineString(ctx) {
    if (ctx.BasicString) {
      return this.readBasicString(ctx);
    } else if (ctx.LiteralString) {
      return this.readLiteralString(ctx);
    }
  }

  private unescapeString(string) {
    let result = '';
    for (let i = 0; i < string.length; i++) {
      const char = string[i];
      if (char === '\\') {
        i++;
        switch (string[i]) {
          case 'b':
            result += '\b';
            break;
          case 't':
            result += '\t';
            break;
          case 'n':
            result += '\n';
            break;
          case 'f':
            result += '\f';
            break;
          case 'r':
            result += '\r';
            break;
          case '"':
            result += '"';
            break;
          case '/':
            result += '/';
            break;
          case '\\':
            result += '\\';
            break;
          case 'u':
            result += String.fromCharCode(parseInt(string.substring(i + 1, i + 5), 16));
            i += 4;
            break;
          case 'U':
            result += String.fromCharCode(parseInt(string.substring(i + 1, i + 9), 16));
            i += 8;
            break;
          default:
            throw new InterpreterError(`Invalid escape sequence: \\${string[i]}`);
        }
      } else {
        result += char;
      }
    }

    return result;
  }

  private readBasicString(ctx) {
    const string = (ctx.BasicString)[0].image;
    const raw = string.substring(1, string.length - 1);
    return this.unescapeString(raw);
  }

  private readLiteralString(ctx) {
    const string = (ctx.LiteralString)[0].image;
    return string.substring(1, string.length - 1);
  }
}

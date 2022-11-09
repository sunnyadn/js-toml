import {
  CustomPatternMatcherReturn,
  ICustomPattern,
  IToken,
  tokenMatcher,
} from 'chevrotain';
import { Newline } from './Newline';
import { KeyValueSeparator } from './KeyValueSeparator';
import { InterpreterError } from '../exception';
import XRegExp = require('xregexp');

const isAfterEqual = (matchedTokens: IToken[]): boolean => {
  for (let i = matchedTokens.length - 1; i >= 0; i--) {
    const token = matchedTokens[i];
    if (tokenMatcher(token, Newline)) {
      return false;
    } else if (tokenMatcher(token, KeyValueSeparator)) {
      return true;
    }
  }

  return false;
};

export const generateValuePattern = (regex: RegExp): ICustomPattern => {
  return {
    exec: (
      text: string,
      offset: number,
      matchedTokens: IToken[]
    ): CustomPatternMatcherReturn => {
      if (!isAfterEqual(matchedTokens)) {
        return null;
      }
      const match = XRegExp.exec(text, regex, offset, true);
      return match ? [match[0]] : null;
    },
  };
};

export const unescapeString = (string) => {
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
        case '\\':
          result += '\\';
          break;
        case 'u':
          result += String.fromCharCode(
            parseInt(string.substring(i + 1, i + 5), 16)
          );
          i += 4;
          break;
        case 'U':
          result += String.fromCodePoint(
            parseInt(string.substring(i + 1, i + 9), 16)
          );
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
};

export const getMultiLineContent = (string) => {
  const content = string.substring(3, string.length - 3);
  return content.replace(/^(\r\n|\n)/, '');
};

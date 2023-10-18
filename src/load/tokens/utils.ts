import XRegExp from 'xregexp';
import { newline, whiteSpaceChar } from './patterns.js';
import { SyntaxParseError } from '../exception.js';

const escapingWhitespaces = XRegExp.build(
  '^{{whiteSpaceChar}}*{{newline}}(?:{{whiteSpaceChar}}|{{newline}})*',
  {
    whiteSpaceChar,
    newline,
  }
);

const getWhitespaceAndNewline = (str: string) => {
  const match = XRegExp.exec(str, escapingWhitespaces);
  return match ? match[0].length : 0;
};

export const unescapeString = (string) => {
  let result = '';
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    if (char === '\\') {
      i++;

      const whitespaceAndNewline = getWhitespaceAndNewline(string.slice(i));
      if (whitespaceAndNewline > 0) {
        i += whitespaceAndNewline - 1;
        continue;
      }

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
        case 'u': {
          const hex = string.slice(i + 1, i + 5);
          const codePoint = parseInt(hex, 16);
          if (codePoint > 0xd7ff && codePoint < 0xe000) {
            throw new SyntaxParseError(`Invalid Unicode code point: \\u${hex}`);
          }
          result += String.fromCodePoint(codePoint);
          i += 4;
          break;
        }
        case 'U': {
          const hex = string.slice(i + 1, i + 9);
          const codePoint = parseInt(hex, 16);
          if (codePoint > 0x10ffff) {
            throw new SyntaxParseError(`Invalid Unicode code point: \\U${hex}`);
          }
          result += String.fromCodePoint(codePoint);
          i += 8;
          break;
        }
        case string.match(/^[0-7]{1,3}$/):
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

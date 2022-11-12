import { InterpreterError } from '../exception';

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

import {
  CustomPatternMatcherReturn,
  ICustomPattern,
  IToken,
  tokenMatcher,
} from 'chevrotain';
import { Newline } from './Newline';
import { KeyValueSeparator } from './KeyValueSeparator';
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
      const match = XRegExp.match(text.substring(offset), regex);
      return match ? [match as string] : null;
    },
  };
};

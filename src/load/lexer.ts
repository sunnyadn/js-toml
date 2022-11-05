import {createToken, Lexer} from "chevrotain";
import XRegExp = require("xregexp");

const whiteSpaceChar = /[ \t]/;

export const WhiteSpace = createToken({
  name: "whiteSpace",
  pattern: XRegExp.build('{{whitespace}}+', {whitespace: whiteSpaceChar}),
  group: Lexer.SKIPPED
});

export const Comment = createToken({
  name: "CommentStartSymbol",
  pattern: /#([\x80-\uD7FF]|\x09|[\x20-\x7F])*/u,
  group: 'comment',
});

export const Newline = createToken({name: "Newline", pattern: /\r\n|\n/});

export const BasicString = createToken({name: "BasicString", pattern: /"([\x23-\x5B]|[\x5D-\x7E])*"/});

export const UnquotedKey = createToken({name: "UnquotedKey", pattern: /[a-zA-Z0-9_-]+/});

export const KeyValueSeparator = createToken({name: "KeyValueSeparator", pattern: /=/});

export const allTokens = [WhiteSpace, Newline, BasicString, UnquotedKey, KeyValueSeparator, Comment];

export const lexer = new Lexer(allTokens);

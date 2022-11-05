import {createToken, Lexer} from "chevrotain";
import XRegExp = require("xregexp");

const whiteSpaceChar = /[ \t]/;

const commentStartChar = /#/;
// const nonAscii = /[\x80-\uD7FF]|[\uE000-\u{10FFFF}]/u;
const nonAscii = /[\x80-\uD7FF]|[\uE000-\uFFFF]/;
const nonEol = XRegExp.build("\x09|[\x20-\x7F]|{{nonAscii}}", {nonAscii});

const quotationMark = /"/;

const basicUnescaped = XRegExp.build("{{whiteSpaceChar}}|\x21|[\x23-\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});

export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: XRegExp.build('{{whiteSpaceChar}}+', {whiteSpaceChar}),
  group: Lexer.SKIPPED
});

export const Comment = createToken({
  name: "Comment",
  pattern: XRegExp.build('{{commentStartChar}}{{nonEol}}*', {commentStartChar, nonEol}),
  group: 'comment',
});

export const Newline = createToken({name: "Newline", pattern: /\r\n|\n/});

export const BasicString = createToken({
  name: "BasicString",
  pattern: XRegExp.build('{{quotationMark}}{{basicUnescaped}}*{{quotationMark}}', {quotationMark, basicUnescaped})
});

export const UnquotedKey = createToken({name: "UnquotedKey", pattern: /[a-zA-Z0-9_-]+/});

export const KeyValueSeparator = createToken({name: "KeyValueSeparator", pattern: /=/});

export const allTokens = [WhiteSpace, Newline, BasicString, UnquotedKey, KeyValueSeparator, Comment];

export const lexer = new Lexer(allTokens);

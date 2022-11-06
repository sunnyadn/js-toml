import {createToken, Lexer} from "chevrotain";
import XRegExp = require("xregexp");

const digit = /[0-9]/;
const alpha = /[a-zA-Z]/;

const digit1_9 = /[1-9]/;

const whiteSpaceChar = /[ \t]/;

const commentStartChar = /#/;
// const nonAscii = /[\x80-\uD7FF]|[\uE000-\u{10FFFF}]/u;
const nonAscii = /[\x80-\uD7FF]|[\uE000-\uFFFF]/;
const nonEol = XRegExp.build("\x09|[\x20-\x7F]|{{nonAscii}}", {nonAscii});

const quotationMark = /"/;

const unsignedDecimalInteger = XRegExp.build("{{digit1_9}}{{digit}}+|{{digit}}", {digit, digit1_9}); // OR digit1-9 1*(underscore digit)

const basicUnescaped = XRegExp.build("{{whiteSpaceChar}}|\x21|[\x23-\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});

const basicChar = basicUnescaped; // OR escaped

const apostrophe = /'/;

const literalChar = XRegExp.build("\x09|[\x20-\x26]|[\x28-\x7E]|{{nonAscii}}", {nonAscii});

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
  pattern: XRegExp.build('{{quotationMark}}{{basicChar}}*{{quotationMark}}', {quotationMark, basicChar}),
  label: '"BasicString"'
});

export const LiteralString = createToken({
  name: "LiteralString",
  pattern: XRegExp.build('{{apostrophe}}{{literalChar}}*{{apostrophe}}', {apostrophe, literalChar}),
  label: "'LiteralString'"
});

export const UnquotedKey = createToken({
  name: "UnquotedKey",
  pattern: XRegExp.build('({{alpha}}|{{digit}}|-|_)+', {alpha, digit})
});

export const KeyValueSeparator = createToken({name: "KeyValueSeparator", pattern: /=/, label: "="});

export const DotSeparator = createToken({name: "DotSeparator", pattern: /\./, label: "."});

export const True = createToken({name: "True", pattern: /true/, label: "true", longer_alt: UnquotedKey});

export const UnsignedDecimalInteger = createToken({name: "UnsignedDecimalInteger", pattern: unsignedDecimalInteger});

export const allTokens = [WhiteSpace, Newline, BasicString, LiteralString, True, UnsignedDecimalInteger, UnquotedKey, KeyValueSeparator, DotSeparator, Comment];

export const lexer = new Lexer(allTokens);

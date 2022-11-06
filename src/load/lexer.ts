import {createToken, Lexer} from "chevrotain";
import XRegExp = require("xregexp");

const digit = /[0-9]/;
const alpha = /[a-zA-Z]/;
const hexDigit = XRegExp.build("{{digit}}|[A-F]", {digit});

const digit1_9 = /[1-9]/;

const whiteSpaceChar = /[ \t]/;
const whiteSpace = XRegExp.build("{{whiteSpaceChar}}*", {whiteSpaceChar});
const newline = /\r\n|\n/;

const commentStartChar = /#/;
// const nonAscii = /[\x80-\uD7FF]|[\uE000-\u{10FFFF}]/u;
const nonAscii = /[\x80-\uD7FF]|[\uE000-\uFFFF]/;
const nonEol = XRegExp.build("\x09|[\x20-\x7F]|{{nonAscii}}", {nonAscii});

const quotationMark = /"/;

const unsignedDecimalInteger = XRegExp.build("{{digit1_9}}{{digit}}+|{{digit}}", {digit, digit1_9}); // OR digit1-9 1*(underscore digit)

const basicUnescaped = XRegExp.build("{{whiteSpaceChar}}|!|[\x23-\\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});

const escape = /\\/;
const escapeSeqChar = XRegExp.build('["\\bfnrt]|u{{hexDigit}}{4}|U{{hexDigit}}{8}', {hexDigit});
const escaped = XRegExp.build("{{escape}}{{escapeSeqChar}}", {escape, escapeSeqChar});

const basicChar = XRegExp.build("{{basicUnescaped}}|{{escaped}}", {basicUnescaped, escaped});

const apostrophe = /'/;

const literalChar = XRegExp.build("\x09|[\x20-\x26]|[\x28-\x7E]|{{nonAscii}}", {nonAscii});

const multiLineBasicStringDelimiter = XRegExp.build('{{quotationMark}}{3}', {quotationMark});
const multiLineBasicUnescaped = XRegExp.build("{{whiteSpaceChar}}|!|[\x23-\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});
const multiLineBasicChar = XRegExp.build("{{multiLineBasicUnescaped}}|{{escaped}}", {multiLineBasicUnescaped, escaped});
const multiLineQuotes = XRegExp.build("{{quotationMark}}{1,2}", {quotationMark});
const multiLineBasicEscapedNewline = XRegExp.build("{{escape}}{{whiteSpace}}{{newline}}({{whiteSpaceChar}}|{{newline}})*", {
  escape,
  whiteSpace,
  newline,
  whiteSpaceChar
});
const multiLineBasicContent = XRegExp.build("{{multiLineBasicChar}}|{{newline}}|{{multiLineBasicEscapedNewline}}", {
  multiLineBasicChar,
  newline,
  multiLineBasicEscapedNewline
});
const multiLineBasicBody = XRegExp.build("{{multiLineBasicContent}}*({{multiLineQuotes}}{{multiLineBasicContent}}+)*{{multiLineQuotes}}?", {
  multiLineBasicContent,
  multiLineQuotes
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

export const Newline = createToken({name: "Newline", pattern: newline});

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

export const MultiLineBasicString = createToken({
  name: "MultiLineBasicString",
  pattern: XRegExp.build('{{multiLineBasicStringDelimiter}}{{newline}}?{{multiLineBasicBody}}{{multiLineBasicStringDelimiter}}', {
    multiLineBasicStringDelimiter,
    newline,
    multiLineBasicBody
  }),
  label: '"""MultiLineBasicString"""'
});

export const UnquotedKey = createToken({
  name: "UnquotedKey",
  pattern: XRegExp.build('({{alpha}}|{{digit}}|-|_)+', {alpha, digit})
});

export const KeyValueSeparator = createToken({name: "KeyValueSeparator", pattern: /=/, label: "="});

export const DotSeparator = createToken({name: "DotSeparator", pattern: /\./, label: "."});

export const True = createToken({name: "True", pattern: /true/, label: "true", longer_alt: UnquotedKey});

export const UnsignedDecimalInteger = createToken({name: "UnsignedDecimalInteger", pattern: unsignedDecimalInteger});

export const allTokens = [WhiteSpace, Newline, MultiLineBasicString, BasicString, LiteralString, True, UnsignedDecimalInteger, UnquotedKey, KeyValueSeparator, DotSeparator, Comment];

export const lexer = new Lexer(allTokens);

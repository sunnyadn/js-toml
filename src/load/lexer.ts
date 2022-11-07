import {
  createToken,
  CustomPatternMatcherReturn, ICustomPattern,
  IToken,
  Lexer,
  tokenMatcher
} from "chevrotain";
import XRegExp = require("xregexp");
import {envs} from "../common/environment";

const digit = /[0-9]/;
const alpha = /[a-zA-Z]/;
const hexDigit = XRegExp.build("{{digit}}|[A-Fa-f]", {digit});

const underscore = /_/;
const digit1_9 = /[1-9]/;
const digit0_7 = /[0-7]/;
const digit0_1 = /[01]/;

const hexPrefix = /0x/;
const octPrefix = /0o/;
const binPrefix = /0b/;

const minus = /-/;

const hexInteger = XRegExp.build("{{hexPrefix}}{{hexDigit}}({{hexDigit}}|{{underscore}}{{hexDigit}})*", {
  hexPrefix,
  hexDigit,
  underscore
});
const octalInteger = XRegExp.build("{{octPrefix}}{{digit0_7}}({{digit0_7}}|{{underscore}}{{digit0_7}})*", {
  octPrefix,
  digit0_7,
  underscore
});
const binaryInteger = XRegExp.build("{{binPrefix}}{{digit0_1}}({{digit0_1}}|{{underscore}}{{digit0_1}})*", {
  binPrefix,
  digit0_1,
  underscore
});

const unsignedDecimalInteger = XRegExp.build("{{digit1_9}}({{digit}}|{{underscore}}{{digit}})+|{{digit}}", {
  digit1_9,
  digit,
  underscore
});
const unsignedNonDecimalInteger = XRegExp.build("{{hexInteger}}|{{octalInteger}}|{{binaryInteger}}", {
  hexInteger,
  octalInteger,
  binaryInteger
});

const whiteSpaceChar = /[ \t]/;
const whiteSpace = XRegExp.build("{{whiteSpaceChar}}*", {whiteSpaceChar});
const newline = /\r\n|\n/;

const commentStartChar = /#/;
// const nonAscii = /[\x80-\uD7FF]|[\uE000-\u{10FFFF}]/u;
const nonAscii = /[\x80-\uD7FF]|[\uE000-\uFFFF]/;
const nonEol = XRegExp.build("\t|[\x20-\x7F]|{{nonAscii}}", {nonAscii});

const quotationMark = /"/;

const basicUnescaped = XRegExp.build("{{whiteSpaceChar}}|!|[\x23-\\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});

const escape = /\\/;
const escapeSeqChar = XRegExp.build('["\\\\bfnrt]|u{{hexDigit}}{4}|U{{hexDigit}}{8}', {hexDigit});
const escaped = XRegExp.build("{{escape}}{{escapeSeqChar}}", {escape, escapeSeqChar});

const basicChar = XRegExp.build("{{basicUnescaped}}|{{escaped}}", {basicUnescaped, escaped});

const apostrophe = /'/;

const literalChar = XRegExp.build("\t|[\x20-\x26]|[\\x28-\x7E]|{{nonAscii}}", {nonAscii});

const multiLineBasicStringDelimiter = XRegExp.build('{{quotationMark}}{3}', {quotationMark});
const multiLineBasicUnescaped = XRegExp.build("{{whiteSpaceChar}}|!|[\x23-\\x5B]|[\\x5D-\x7E]|{{nonAscii}}", {
  whiteSpaceChar,
  nonAscii
});
const multiLineBasicChar = XRegExp.build("{{multiLineBasicUnescaped}}|{{escaped}}", {multiLineBasicUnescaped, escaped});
const multiLineBasicQuotes = XRegExp.build("{{quotationMark}}{1,2}", {quotationMark});
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
const multiLineBasicBody = XRegExp.build("{{multiLineBasicContent}}*({{multiLineBasicQuotes}}{{multiLineBasicContent}}+)*{{multiLineBasicQuotes}}?", {
  multiLineBasicContent,
  multiLineBasicQuotes
});

const multiLineLiteralStringDelimiter = XRegExp.build("{{apostrophe}}{3}", {apostrophe});
const multiLineLiteralChar = XRegExp.build("\t|[\x20-\x26]|[\\x28-\x7E]|{{nonAscii}}", {nonAscii});
const multiLineLiteralQuotes = XRegExp.build("{{apostrophe}}{1,2}", {apostrophe});
const multiLineLiteralContent = XRegExp.build("{{multiLineLiteralChar}}|{{newline}}", {multiLineLiteralChar, newline});
const multiLineLiteralBody = XRegExp.build("{{multiLineLiteralContent}}*({{multiLineLiteralQuotes}}{{multiLineLiteralContent}}+)*{{multiLineLiteralQuotes}}?", {
  multiLineLiteralContent,
  multiLineLiteralQuotes
});

const unquotedKey = XRegExp.build('({{alpha}}|{{digit}}|-|_)+', {alpha, digit});

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
}

const generateValuePattern = (regex: RegExp): ICustomPattern => {
  return {
    exec: (text: string, offset: number, matchedTokens: IToken[]): CustomPatternMatcherReturn => {
      if (!isAfterEqual(matchedTokens)) {
        return null;
      }
      const match = XRegExp.match(text.substring(offset), regex);
      return match ? [match as string] : null;
    }
  }
}

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

export const MultiLineLiteralString = createToken({
  name: "MultiLineLiteralString",
  pattern: XRegExp.build('{{multiLineLiteralStringDelimiter}}{{newline}}?{{multiLineLiteralBody}}{{multiLineLiteralStringDelimiter}}', {
    multiLineLiteralStringDelimiter,
    newline,
    multiLineLiteralBody
  }),
  label: "'''MultiLineLiteralString'''"
});

export const UnquotedKey = createToken({name: "UnquotedKey", pattern: unquotedKey});

export const KeyValueSeparator = createToken({name: "KeyValueSeparator", pattern: /=/, label: "="});

export const DotSeparator = createToken({name: "DotSeparator", pattern: /\./, label: "."});

export const True = createToken({name: "True", pattern: /true/, label: "true", longer_alt: UnquotedKey});

export const Minus = createToken({
  name: "Minus",
  pattern: generateValuePattern(minus),
  label: "-",
  start_chars_hint: ["-"],
  line_breaks: false
});
export const Plus = createToken({name: "Plus", pattern: /\+/, label: "+"});

export const UnsignedDecimalInteger = createToken({
  name: "UnsignedDecimalInteger",
  pattern: generateValuePattern(unsignedDecimalInteger),
  start_chars_hint: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  line_breaks: false
});

export const UnsignedNonDecimalInteger = createToken({
  name: "UnsignedNonDecimalInteger",
  pattern: generateValuePattern(unsignedNonDecimalInteger),
  start_chars_hint: ["0"],
  line_breaks: false
});

export const allTokens = [WhiteSpace, Newline, MultiLineBasicString, MultiLineLiteralString, BasicString, LiteralString, True, Minus, Plus, UnsignedNonDecimalInteger, UnsignedDecimalInteger, UnquotedKey, KeyValueSeparator, DotSeparator, Comment];

export const lexer = new Lexer(allTokens, {ensureOptimizations: true, skipValidations: !envs.isDebug});

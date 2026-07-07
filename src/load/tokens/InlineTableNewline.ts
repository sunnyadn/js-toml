import { createToken, CustomPatternMatcherFunc, Lexer } from 'chevrotain';
import { DotSeparator } from './DotSeparator.js';
import { InlineTableKeyValSep } from './InlineTableKeyValSep.js';
import { newline as newlinePattern } from './patterns.js';

// TOML 1.1 allows newlines inside inline tables, but only around whole
// key/value pairs and separators (ABNF `ws-comment-newline`), never inside a
// keyval itself (`keyval-sep = ws %x3D ws`, `dot-sep = ws %x2E ws`). Legal
// newlines are skipped; illegal ones fail to match and surface as lexer
// errors, keeping the parser rules free of per-token newline handling.
// Derived from the shared `newline` pattern so the bare-CR-is-not-a-newline
// policy stays single-sourced in patterns.ts.
const newline = new RegExp(newlinePattern.source, 'y');

// After a legal inline-table newline the next significant character can only
// start a key (`"`, `'`, A-Za-z0-9_-), a comment (#), `,` or `}` — never `=`
// or `.`. Seeing one means the newline split a keyval, which the ABNF forbids.
// Horizontal whitespace only: every newline in a run is matched (and checked)
// independently, so the last one still catches `=`/`.` — and scanning across
// newlines here would make runs of N newlines cost O(N^2).
const keyValInterior = /[ \t]*[=.]/y;

const matchInlineTableNewline: CustomPatternMatcherFunc = (
  text,
  startOffset,
  tokens
) => {
  newline.lastIndex = startOffset;
  const match = newline.exec(text);
  if (!match) {
    return null;
  }

  // Relies on chevrotain's contract that SKIPPED/grouped tokens never enter
  // matchedTokens: the last entry is always the previous significant token.
  const previous = tokens[tokens.length - 1]?.tokenType;
  if (previous === DotSeparator || previous === InlineTableKeyValSep) {
    return null;
  }

  keyValInterior.lastIndex = startOffset + match[0].length;
  if (keyValInterior.exec(text)) {
    return null;
  }

  return match;
};

export const InlineTableNewline = createToken({
  name: 'InlineTableNewline',
  pattern: matchInlineTableNewline,
  start_chars_hint: ['\r', '\n'],
  line_breaks: true,
  group: Lexer.SKIPPED,
});

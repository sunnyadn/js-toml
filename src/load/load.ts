import { lexer } from './lexer.js';
import {
  DepthLimitError,
  LexerError,
  ParserError,
  SyntaxParseError,
} from './exception.js';
import { parser } from './parser.js';
import { interpreter } from './interpreter.js';
import {
  ArrayClose,
  ArrayOpen,
  InlineTableClose,
  InlineTableOpen,
} from './tokens/index.js';

// Real-world TOML nesting is single-digit deep. The default sits safely below the
// native V8 stack-overflow threshold so the limit fires deterministically before the
// recursive parser/interpreter can overflow, while staying far above any legitimate
// document. Callers needing deeper input can raise it via `maxDepth`.
export const DEFAULT_MAX_DEPTH = 100;

export interface LoadOptions {
  maxDepth?: number;
}

// Bound array / inline-table nesting by scanning the token stream before the recursive
// parser runs, so nesting can never drive the parser past the native call stack.
const checkNestingDepth = (
  tokens: ReturnType<typeof lexer.tokenize>['tokens'],
  maxDepth: number
): void => {
  let depth = 0;
  for (const token of tokens) {
    const type = token.tokenType;
    if (type === ArrayOpen || type === InlineTableOpen) {
      depth += 1;
      if (depth > maxDepth) {
        throw new DepthLimitError(maxDepth);
      }
    } else if (type === ArrayClose || type === InlineTableClose) {
      depth -= 1;
    }
  }
};

export const load = (
  toml: string,
  options?: LoadOptions
): Record<string, unknown> => {
  const maxDepth =
    options?.maxDepth && options.maxDepth > 0
      ? options.maxDepth
      : DEFAULT_MAX_DEPTH;

  const lexingResult = lexer.tokenize(toml);

  if (lexingResult.errors.length > 0) {
    throw new LexerError(lexingResult.errors);
  }

  checkNestingDepth(lexingResult.tokens, maxDepth);

  try {
    parser.input = lexingResult.tokens;
    const cst = parser.toml();

    if (parser.errors.length > 0) {
      throw new ParserError(parser.errors);
    }

    interpreter.maxDepth = maxDepth;
    return interpreter.visit(cst);
  } catch (error) {
    // Backstop: convert any residual native stack exhaustion (e.g. on a constrained
    // stack, or when maxDepth is raised beyond the environment's native capacity) into
    // the documented SyntaxParseError contract. Library errors already extend
    // SyntaxParseError and pass through unchanged.
    if (error instanceof RangeError) {
      throw new SyntaxParseError(
        'Maximum nesting depth exceeded (stack overflow)'
      );
    }
    throw error;
  }
};

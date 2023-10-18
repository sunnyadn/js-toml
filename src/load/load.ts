import { lexer } from './lexer.js';
import { LexerError, ParserError } from './exception.js';
import { parser } from './parser.js';
import { interpreter } from './interpreter.js';

export const load = (toml: string): object => {
  const lexingResult = lexer.tokenize(toml);

  if (lexingResult.errors.length > 0) {
    throw new LexerError(lexingResult.errors);
  }

  parser.input = lexingResult.tokens;
  const cst = parser.toml();

  if (parser.errors.length > 0) {
    throw new ParserError(parser.errors);
  }

  return interpreter.visit(cst);
};

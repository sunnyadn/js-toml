import { lexer } from './lexer';
import { LexerError, ParserError } from './exception';
import { parser } from './parser';
import { interpreter } from './interpreter';

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

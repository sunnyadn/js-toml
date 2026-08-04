import { ILexingError, IRecognitionException } from 'chevrotain';
import { SyntaxParseError } from '../common/exception.js';

// Lives in common/ so shared types can reject input without depending on the
// loader. Re-exported here because this is where callers expect to find it.
export { SyntaxParseError };

export class LexerError extends SyntaxParseError {
  errors: ILexingError[];

  constructor(errors: ILexingError[]) {
    super('Syntax error\n' + errors.map((error) => error.message).join('\n'));
    this.errors = errors;
  }
}

export class ParserError extends SyntaxParseError {
  errors: IRecognitionException[];

  constructor(errors: IRecognitionException[]) {
    super('Syntax error\n' + errors.map((error) => error.message).join('\n'));
    this.errors = errors;
  }
}

export class InterpreterError extends SyntaxParseError {
  constructor(message: string) {
    super(message);
  }
}

export class DepthLimitError extends SyntaxParseError {
  constructor(maxDepth: number) {
    super(`Maximum nesting depth of ${maxDepth} exceeded`);
  }
}

import { ILexingError, IRecognitionException } from 'chevrotain';

export class SyntaxParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SyntaxParseError';
  }
}

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

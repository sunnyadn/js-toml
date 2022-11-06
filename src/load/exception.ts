import {IRecognitionException} from "chevrotain";

export class SyntaxParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "SyntaxParseError";
  }
}

export class ParserError extends SyntaxParseError {
  constructor(errors: IRecognitionException[]) {
    super("Syntax error\n" + errors.map((error) => error.message).join(", "));
    this.errors = errors;
  }

  errors: IRecognitionException[];
}

export class InterpreterError extends SyntaxParseError {
  constructor(message: string) {
    super(message);
  }
}

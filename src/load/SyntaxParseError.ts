import {IRecognitionException} from "chevrotain";

export class SyntaxParseError extends Error {
  constructor(errors: IRecognitionException[]) {
    super("Syntax error\n" + errors.map((error) => error.message).join(", "));
    this.name = 'SyntaxParseError';
    this.errors = errors;
  }

  errors: IRecognitionException[];
}

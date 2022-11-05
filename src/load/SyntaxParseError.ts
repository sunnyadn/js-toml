import {IRecognitionException} from "chevrotain";

export class SyntaxParseError extends Error {
  constructor(errors: IRecognitionException[]) {
    super("Syntax error");
    this.name = 'SyntaxParseError';
    this.errors = errors;
  }

  errors: IRecognitionException[];
}

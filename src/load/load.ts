import {Parser} from "./parser";
import {lexer} from "./lexer";
import {Interpreter} from "./interpreter";
import {ParserError} from "./exception";

const parser = new Parser();
const interpreter = new Interpreter();

export const load = (toml: string) => {
  const lexingResult = lexer.tokenize(toml);
  parser.input = lexingResult.tokens;
  const cst = parser.toml();

  if (parser.errors.length > 0) {
    throw new ParserError(parser.errors);
  }

  return interpreter.visit(cst);
};

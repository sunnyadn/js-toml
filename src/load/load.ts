import {Parser} from "./parser";
import {lexer} from "./lexer";
import {Interpreter} from "./interpreter";

const parser = new Parser();
const interpreter = new Interpreter();

export const load = (toml: string) => {
  const lexingResult = lexer.tokenize(toml);
  parser.input = lexingResult.tokens;
  const cst = parser.toml();

  return interpreter.visit(cst);
};

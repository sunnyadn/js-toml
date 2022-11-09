import { TokenType } from 'chevrotain';

type InterpreterFunc = (raw: string) => string | boolean | number | bigint;
export const tokenInterpreters = new Map<string, InterpreterFunc>();

export const registerTokenInterpreter = (
  token: TokenType,
  interpreter: InterpreterFunc
) => {
  tokenInterpreters[token.name] = interpreter;
};
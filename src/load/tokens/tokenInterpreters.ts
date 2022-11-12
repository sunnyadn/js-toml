import { IToken, TokenType } from 'chevrotain';

export type InterpreterFunc = (
  raw: string,
  token: IToken,
  category: string
) => string | boolean | number | bigint | Date;
export const tokenInterpreters = new Map<string, InterpreterFunc>();

export const defaultFallbackInterpreter: InterpreterFunc = (
  raw,
  token,
  category
) => {
  const interpreter: InterpreterFunc = tokenInterpreters[token.tokenType.name];
  if (interpreter) {
    return interpreter(raw, token, category);
  }

  return null;
};

export const registerTokenInterpreter = (
  token: TokenType,
  interpreter: InterpreterFunc
) => {
  tokenInterpreters[token.name] = interpreter;
};

import { createToken, IToken, Lexer, TokenType } from 'chevrotain';

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
  const interpreter = tokenInterpreters.get(token.tokenType.name);
  if (interpreter) {
    return interpreter(raw, token, category);
  }
};

export const registerTokenInterpreter = (
  token: TokenType,
  interpreter: InterpreterFunc
) => {
  tokenInterpreters.set(token.name, interpreter);
};

export const createCategoryToken = (name: string, categories?: TokenType[]) => {
  const token = createToken({
    name,
    pattern: Lexer.NA,
    ...(categories && { categories }),
  });
  registerTokenInterpreter(token, defaultFallbackInterpreter);
  return token;
};

import { TokenType } from 'chevrotain';
import { InterpreterFunc } from '../types';

export const tokenInterpreters = new Map<string, InterpreterFunc>();

export const registerTokenInterpreter = (
  token: TokenType,
  interpreter: InterpreterFunc
) => {
  tokenInterpreters[token.name] = interpreter;
};

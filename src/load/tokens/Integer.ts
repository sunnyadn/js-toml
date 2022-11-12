import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters';

export const Integer = createToken({ name: 'Integer', pattern: Lexer.NA });

registerTokenInterpreter(Integer, defaultFallbackInterpreter);

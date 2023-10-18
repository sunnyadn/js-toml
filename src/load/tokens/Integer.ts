import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters.js';

export const Integer = createToken({ name: 'Integer', pattern: Lexer.NA });

registerTokenInterpreter(Integer, defaultFallbackInterpreter);

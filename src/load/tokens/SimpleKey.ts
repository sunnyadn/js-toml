import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters';

export const SimpleKey = createToken({ name: 'SimpleKey', pattern: Lexer.NA });

registerTokenInterpreter(SimpleKey, defaultFallbackInterpreter);

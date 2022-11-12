import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters';

export const Boolean = createToken({
  name: 'Boolean',
  pattern: Lexer.NA,
});

registerTokenInterpreter(Boolean, defaultFallbackInterpreter);

import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters';

export const TomlString = createToken({ name: 'String', pattern: Lexer.NA });

registerTokenInterpreter(TomlString, defaultFallbackInterpreter);

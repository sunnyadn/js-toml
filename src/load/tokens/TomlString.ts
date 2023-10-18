import { createToken, Lexer } from 'chevrotain';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters.js';

export const TomlString = createToken({ name: 'String', pattern: Lexer.NA });

registerTokenInterpreter(TomlString, defaultFallbackInterpreter);

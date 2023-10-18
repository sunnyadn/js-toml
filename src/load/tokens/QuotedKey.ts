import { createToken, Lexer } from 'chevrotain';
import { SimpleKey } from './SimpleKey.js';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters.js';

export const QuotedKey = createToken({
  name: 'QuotedKey',
  pattern: Lexer.NA,
  categories: [SimpleKey],
});

registerTokenInterpreter(QuotedKey, defaultFallbackInterpreter);

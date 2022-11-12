import { createToken, Lexer } from 'chevrotain';
import { SimpleKey } from './SimpleKey';
import {
  defaultFallbackInterpreter,
  registerTokenInterpreter,
} from './tokenInterpreters';

export const QuotedKey = createToken({
  name: 'QuotedKey',
  pattern: Lexer.NA,
  categories: [SimpleKey],
});

registerTokenInterpreter(QuotedKey, defaultFallbackInterpreter);

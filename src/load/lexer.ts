import { Lexer } from 'chevrotain';
import { envs } from '../common/environment.js';
import { allTokens } from './tokens/index.js';

export const lexer = new Lexer(allTokens, {
  ensureOptimizations: true,
  skipValidations: !envs.isDebug,
});

import { Lexer } from 'chevrotain';
import { envs } from '../common/environment';
import { allTokens } from './tokens';

export const lexer = new Lexer(allTokens, {
  ensureOptimizations: true,
  skipValidations: !envs.isDebug,
});

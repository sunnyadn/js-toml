import { SimpleKey } from './SimpleKey.js';
import { createCategoryToken } from './tokenInterpreters.js';

export const QuotedKey = createCategoryToken('QuotedKey', [SimpleKey]);

import { DumpOptions } from './options.js';
import { generateBase } from './generator.js';
import { isPlainObject } from '../common/utils.js';
import { sanitize, SanitizedValue } from './sanitize.js';

export function dump(
  obj: Record<string, unknown>,
  options: DumpOptions = {}
): string {
  if (!isPlainObject(obj)) {
    throw new Error('dump requires a plain object (TOML table) as input');
  }
  const sanitized = sanitize(obj, options) as {
    [key: string]: SanitizedValue;
  };
  return generateBase(sanitized, options);
}

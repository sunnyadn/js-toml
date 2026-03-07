import { DumpOptions } from './options.js';
import { generateBase } from './generator.js';
import { isPlainObject } from '../common/utils.js';
import { sanitize } from './sanitize.js';

/**
 * Dump a JavaScript object into a TOML string.
 * @param obj The object to dump
 * @param options Dump options
 * @returns TOML string
 */
export function dump(obj: object, options: DumpOptions = {}): string {
  if (!isPlainObject(obj)) {
    throw new Error('dump requires a plain object (TOML table) as input');
  }
  const sanitizedObj = sanitize(obj, options);
  // If the entire object was sanitized away (e.g. empty and everything was invalid), fallback
  if (sanitizedObj === undefined) return '';
  if (!isPlainObject(sanitizedObj)) {
    throw new Error('dump requires a plain object (TOML table) as input');
  }
  return generateBase(sanitizedObj, options);
}

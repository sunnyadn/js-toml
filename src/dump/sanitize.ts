import { DumpOptions } from './options.js';
import { isPlainObject } from '../common/utils.js';

/**
 * Deep clones and sanitizes the input object before TOML generation.
 * - Removes keys with `undefined` values if `ignoreUndefined: true`.
 * - Resolves sparse arrays accurately into dense arrays of valid items.
 * - Throws errors for unsupported types natively before the stringification process.
 */
export function sanitize(value: unknown, options: DumpOptions): unknown {
  if (value === undefined || value === null) {
    if (options.ignoreUndefined) return undefined;
    throw new Error(`Cannot dump unsupported value type: ${value}`);
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    value instanceof Date
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    const result = [];
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (item === undefined || item === null) {
        if (options.ignoreUndefined) continue;
        throw new Error(`Cannot dump unsupported value type: ${item}`);
      }
      const sanitizedItem = sanitize(item, options);
      if (sanitizedItem !== undefined) {
        result.push(sanitizedItem);
      }
    }
    return result;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === null) {
        if (options.ignoreUndefined) continue;
        throw new Error(`Cannot dump unsupported value type: ${v}`);
      }
      const sanitizedV = sanitize(v, options);
      if (sanitizedV !== undefined) {
        result[k] = sanitizedV;
      }
    }
    return result;
  }

  if (options.ignoreUndefined) {
    return undefined;
  }

  throw new Error(`Cannot dump unsupported type: ${typeof value}`);
}

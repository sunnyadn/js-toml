import { DumpOptions } from './options.js';
import { isPlainObject } from '../common/utils.js';

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
    const result: unknown[] = [];
    for (const item of value) {
      const sanitized = sanitize(item, options);
      if (sanitized !== undefined) result.push(sanitized);
    }
    return result;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const sanitized = sanitize(v, options);
      if (sanitized !== undefined) result[k] = sanitized;
    }
    return result;
  }

  if (options.ignoreUndefined) return undefined;
  throw new Error(`Cannot dump unsupported type: ${typeof value}`);
}

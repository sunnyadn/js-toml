/**
 * Checks if a value is a plain object (either regular object or prototype-free object).
 * This handles both standard objects and objects created with Object.create(null).
 */
export const isPlainObject = (obj: unknown): obj is Record<string, unknown> =>
  obj != null &&
  typeof obj === 'object' &&
  !Array.isArray(obj) &&
  (obj.constructor === Object || obj.constructor === undefined);

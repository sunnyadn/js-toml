/**
 * Checks if a value is a plain object (either regular object or prototype-free object).
 * This handles both standard objects and objects created with Object.create(null).
 *
 * The check reads the prototype rather than `obj.constructor`, because a table
 * may have its own `constructor` key, which is a valid TOML key.
 */
export const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
};

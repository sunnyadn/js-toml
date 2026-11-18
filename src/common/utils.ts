/**
 * Checks if a value is a plain object (either regular object or prototype-free object).
 * This handles both standard objects and objects created with Object.create(null).
 *
 * The check reads the `constructor` the object inherits, not `obj.constructor`,
 * because a table may have its own `constructor` key, which is a valid TOML key.
 */
export const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const proto: unknown = Object.getPrototypeOf(obj);
  if (proto === null) {
    return true;
  }
  const inherited = (proto as { constructor?: unknown }).constructor;
  return inherited === Object || inherited === undefined;
};

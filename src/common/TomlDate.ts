/** Which of TOML's three date/time types produced a `TomlDate`. */
export type TomlDateKind =
  'offset-date-time' | 'local-date-time' | 'local-date';

/**
 * A `Date` that remembers which TOML type produced it. All three map onto one
 * instant in JavaScript, so without this `dump(load(x))` re-emits a local
 * date-time as `...Z`, asserting an offset the author never wrote.
 */
export class TomlDate extends Date {
  readonly #kind: TomlDateKind;

  constructor(value: string, kind: TomlDateKind = 'offset-date-time') {
    super(value);
    this.#kind = kind;
  }

  /**
   * An accessor rather than an own property, so `Object.keys`, spread and
   * deep-equality treat an instance exactly like the `Date` it extends. Note
   * `constructor === Date` is false; use `instanceof`.
   */
  get kind(): TomlDateKind {
    return this.#kind;
  }
}

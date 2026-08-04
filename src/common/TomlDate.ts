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

  // Unlike `TomlTime` this does not validate `value`: `Date` is mutable, so a
  // constructor check could be undone by a setter, and `dump()` has to guard
  // plain user `Date`s regardless. The check lives in `dumpDate` instead.
  constructor(value: string, kind: TomlDateKind = 'offset-date-time') {
    super(value);
    this.#kind = kind;
  }

  /**
   * Which TOML form this was written in, and only that: not the offset it
   * carried, nor precision below a millisecond. An accessor rather than an own
   * property, so deep-equality treats an instance exactly like a `Date`.
   */
  get kind(): TomlDateKind {
    return this.#kind;
  }
}

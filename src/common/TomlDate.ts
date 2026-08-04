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
   * property, so structural deep-equality (`toEqual`) treats an instance like
   * a `Date`. Prototype-checking equality (`toStrictEqual`) still separates
   * them, which no accessor choice can change.
   */
  get kind(): TomlDateKind {
    return this.#kind;
  }

  /**
   * The form the document wrote, so a local date-time does not claim a `Z` it
   * never carried. `toJSON` delegates here, which is what keeps
   * `JSON.stringify` and every external consumer honest, not only `dump()`.
   */
  toISOString(): string {
    const iso = super.toISOString();
    // Cut at the delimiter, not at a fixed 10: outside years 0000-9999
    // `toISOString` emits the expanded form and a fixed offset would slice
    // `+010000-01-01T...` down to `+010000-01`, which is not a date at all.
    if (this.#kind === 'local-date') return iso.slice(0, iso.indexOf('T'));
    return this.#kind === 'local-date-time' ? iso.slice(0, -1) : iso;
  }
}

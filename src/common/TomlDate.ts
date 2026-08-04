/**
 * A `Date` that remembers which of TOML's date/time types produced it.
 *
 * The three types are distinct in TOML but all map onto one instant in
 * JavaScript, so a plain `Date` cannot say whether the document carried an
 * offset. Without that, `dump(load(x))` re-emits every local date-time as
 * `...Z`, asserting a UTC instant the author never wrote.
 *
 * The flags are accessors rather than own properties, so `Object.keys`, object
 * spread and deep-equality treat an instance exactly like the `Date` it
 * extends. Two consequences are worth knowing: `constructor === Date` is false
 * (use `instanceof`), and `structuredClone` returns a plain `Date`, keeping the
 * instant but dropping the type.
 */
export class TomlDate extends Date {
  readonly #isLocal: boolean;
  readonly #isDateOnly: boolean;

  constructor(
    value: string | number | Date,
    { isLocal = false, isDateOnly = false } = {}
  ) {
    super(value as string);
    this.#isLocal = isLocal;
    this.#isDateOnly = isDateOnly;
  }

  /** True when the document carried no offset: a local date-time or date. */
  get isLocal(): boolean {
    return this.#isLocal;
  }

  /** True for a local date, which has no time of day at all. */
  get isDateOnly(): boolean {
    return this.#isDateOnly;
  }
}

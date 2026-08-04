/**
 * A TOML local time: a wall clock with no date and no offset.
 *
 * It extends `String` rather than `Date` because a time of day is not an
 * instant. The ecosystem's `Date`-based encodings put the time on a sentinel
 * date, and the sentinel leaks: asking one for `getHours()` returns the hour
 * shifted by the host's UTC offset, and sub-millisecond precision is lost. That
 * is the defect this library just removed from its date handling.
 *
 * Extending `String` keeps every use of the old plain-string value working:
 * interpolation, `split`, `startsWith`, `length`, `JSON.stringify` and `==` all
 * behave as before, and the full source precision survives. What changes is
 * `typeof` (now `'object'`) and `===` against a string literal. Both fail
 * loudly, and neither can yield a wrong time.
 */
export class TomlTime extends String {
  readonly #hour: number;
  readonly #minute: number;
  readonly #second: number;
  readonly #fraction: string;

  constructor(raw: string) {
    super(raw);
    const [clock, fraction = ''] = raw.split('.');
    const [hour, minute, second] = clock.split(':');
    this.#hour = Number(hour);
    this.#minute = Number(minute);
    this.#second = Number(second);
    this.#fraction = fraction && `.${fraction}`;
  }

  get hour(): number {
    return this.#hour;
  }

  get minute(): number {
    return this.#minute;
  }

  get second(): number {
    return this.#second;
  }

  /** Fractional seconds including the dot, or `''`. A string, so the source precision is never rounded. */
  get fraction(): string {
    return this.#fraction;
  }
}

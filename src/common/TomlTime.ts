import { SyntaxParseError } from './exception.js';

// partial-time = time-hour ":" time-minute [ ":" time-second [ time-secfrac ] ]
// Anchored twin of the lexer's `partialTime` in load/tokens/DateTime.ts. The
// two encode the same ABNF rule and must stay in sync.
const PARTIAL_TIME = /^(\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?$/;

/**
 * A TOML local time: a wall clock, not an instant. It extends `Date` so that
 * generic value walkers, which reach for `instanceof Date` and have no branch
 * for anything else, see it. Read it with `toISOString()` or the `getUTC*`
 * accessors; the underlying instant is anchored on an arbitrary day.
 */
export class TomlTime extends Date {
  readonly #time: string;

  /** Throws `SyntaxParseError` unless `raw` is a TOML local time. */
  constructor(raw: string) {
    const time = PARTIAL_TIME.exec(raw);
    const hour = Number(time?.[1]);
    const minute = Number(time?.[2]);
    const second = Number(time?.[3] ?? 0);
    if (!time || hour > 23 || minute > 59 || second > 59) {
      throw new SyntaxParseError(`Invalid local time: ${raw}`);
    }

    // Seconds are optional in TOML 1.1 but not in the stored form, which is
    // what `toISOString` returns and what `dump()` writes back.
    const normalized = `${time[1]}:${time[2]}:${time[3] ?? '00'}${time[4] ?? ''}`;
    // Milliseconds arithmetically rather than through `Date`'s string parser,
    // which would make the anchor depend on that parser agreeing with the
    // regex above. `.5` means 500ms, hence the pad.
    const fraction = time[4];
    const millis = fraction ? Number(fraction.slice(1, 4).padEnd(3, '0')) : 0;
    super(hour * 3600000 + minute * 60000 + second * 1000 + millis);
    this.#time = normalized;
  }

  get hour(): number {
    return Number(this.#time.slice(0, 2));
  }

  get minute(): number {
    return Number(this.#time.slice(3, 5));
  }

  get second(): number {
    return Number(this.#time.slice(6, 8));
  }

  /** Fractional seconds including the dot, or `''`. Never rounded. */
  get fraction(): string {
    return this.#time.slice(8);
  }
  /**
   * The time of day, not an instant: `07:32:00.123456789`. Overriding this
   * also fixes `toJSON`, which delegates here, so `JSON.stringify` and any
   * consumer reading a `Date` sees the time the document actually wrote.
   */
  toISOString(): string {
    return this.#time;
  }

  /**
   * `Date`'s version would render the anchor day in the host timezone, so
   * `13:37` prints as `06:37` in Edmonton, and there is no day here to
   * render. `TomlDate` abstains: `toString` is host-local by contract.
   */
  toString(): string {
    return this.toISOString();
  }
}

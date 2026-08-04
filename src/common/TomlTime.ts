import { SyntaxParseError } from './exception.js';

// partial-time = time-hour ":" time-minute [ ":" time-second [ time-secfrac ] ]
// Anchored twin of the lexer's `partialTime` in load/tokens/DateTime.ts. The
// two encode the same ABNF rule and must stay in sync.
const PARTIAL_TIME = /^(\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?$/;

/**
 * A TOML local time: a wall clock, not an instant. It extends `String` rather
 * than `Date` so the full source precision survives and no sentinel date
 * shifts the hour. `typeof` and `===` change, and both fail loudly.
 */
export class TomlTime extends String {
  /** Throws `SyntaxParseError` unless `raw` is a TOML local time. */
  constructor(raw: string) {
    const time = PARTIAL_TIME.exec(raw);
    if (
      !time ||
      Number(time[1]) > 23 ||
      Number(time[2]) > 59 ||
      Number(time[3] ?? 0) > 59
    ) {
      throw new SyntaxParseError(`Invalid local time: ${raw}`);
    }

    // Seconds are optional in TOML 1.1 but not in the stored form: `dump()`
    // writes this back verbatim and the accessors read fixed offsets.
    super(`${time[1]}:${time[2]}:${time[3] ?? '00'}${time[4] ?? ''}`);
  }

  get hour(): number {
    return Number(this.slice(0, 2));
  }

  get minute(): number {
    return Number(this.slice(3, 5));
  }

  get second(): number {
    return Number(this.slice(6, 8));
  }

  /** Fractional seconds including the dot, or `''`. Never rounded. */
  get fraction(): string {
    return this.slice(8);
  }
}

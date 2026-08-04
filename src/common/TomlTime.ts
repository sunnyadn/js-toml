/**
 * A TOML local time: a wall clock, not an instant. It extends `String` rather
 * than `Date` so the full source precision survives and no sentinel date
 * shifts the hour. `typeof` and `===` change, and both fail loudly.
 */
export class TomlTime extends String {
  // The loader only ever builds these from a normalized `HH:MM:SS[.frac]`, so
  // the offsets are fixed and the fields need not be stored.
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

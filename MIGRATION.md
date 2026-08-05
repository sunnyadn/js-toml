# Migrating from js-toml 1.x to 2.x

Only date and time values changed. Everything else parses and serializes to
the same bytes, checked across the official 681-case test suite.

**If your config has no dates or times, there is nothing to do.**

## What to search for

Everything in this table changes quietly. Nothing throws.

| Search for | What changed | Fix |
| --- | --- | --- |
| `.getHours(` `.getMinutes(` `.getSeconds(` `.getDate(` `.getMonth(` `.getFullYear(` `.getDay(` `toLocale` | A date-time with no offset now reads as UTC, so these shift by the host's offset. In Edmonton `getHours()` on `1979-05-27T07:32:00` went from `7` to `1`. | Use the `getUTC` form, which now returns what the document wrote. |
| `.getTime(` `.valueOf(`, and any `<` `>` `-` or sort on a loaded value | The instant itself moved, so comparisons flip. | No mechanical fix. Decide per site whether you wanted the instant, now host-independent, or the wall clock. |
| `typeof` against `'string'`, `=== '`, `isString(` | A local time is a `TomlTime`, which extends `Date`, not a string. All three go false; `==` still holds. | `String(t)`, `t.toISOString()`, or the added `hour` / `minute` / `second` / `fraction`. Every date/time type is reachable by `instanceof Date`. |
| snapshots of `dump()` or `JSON.stringify` | Output changed, see below. | Regenerate. A service writing config back to disk emits different bytes with no error. |
| `structuredClone`, `new Date(d.toISOString())` | Both drop the TOML type and put the invented offset back. | `new Date(d.getTime())` to clone. |

The only loud break is on a local time: `t.split(':')` now throws and
`t.length` is `undefined`. `String(t)` and template interpolation are
unchanged.

## Output changed

```
1.x    ldt = 1979-05-27T13:32:00.000Z     offset invented, and host-dependent
       ld  = 1979-05-27T00:00:00.000Z     a date became an instant
       lt  = "07:32:00"                   a time became a quoted string

2.x    ldt = 1979-05-27T07:32:00.000
       ld  = 1979-05-27
       lt  = 07:32:00
```

`JSON.stringify` matches, since `toJSON` delegates to `toISOString`. A plain
`Date` you build yourself is still written as an offset date-time.

## If you installed 2.0.0

2.0.0 was `latest` for about two hours on 2026-08-04 and is deprecated. Rows 1
to 3 above already applied there, so only the output row is new to you: 2.0.0
still emitted `...T07:32:00.000Z` from `toISOString` and `JSON.stringify`,
though its `dump()` was already correct.

Its `TomlTime` extended `String`, so `t.split()`, `t.length` and `instanceof
String` worked. All three break here.

Why the reasoning behind each change, and why 2.0.1 rather than 3.0.0:
[CHANGELOG](CHANGELOG.md#201---2026-08-04).

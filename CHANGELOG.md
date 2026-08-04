# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING**: local date-times (an RFC 3339 date-time with no offset, such as `1979-05-27T07:32:00`) now read their wall clock as UTC instead of as the host machine's local time. Previously the same document parsed to different instants on servers in different timezones, and the reading was ambiguous even on a single machine: a wall clock inside a daylight-saving gap does not exist, and one inside a fall-back hour occurs twice. The new value matches what `smol-toml` and `@iarna/toml` return, to the millisecond. **Migration**: read local date-times with the `getUTC*` accessors (`start.getUTCHours()`) rather than the local ones (`start.getHours()`). Hosts running in UTC, which includes most servers and CI, see no change. Offset date-times, local dates, and local times are unaffected.
- Date/time semantics are documented in the README for the first time, including which JavaScript type each of the four TOML date/time types loads as.

### Fixed

- Time-of-day validation used local `Date` accessors, so it could depend on the host timezone and on daylight-saving transitions. It now uses UTC accessors.

### Added

- CI runs the suite under three timezones rather than only the runner's UTC. The timezone dependence above survived four years because a UTC-only suite cannot observe it.

### Deferred

- Local date-times still load as a plain `Date`, so `dump()` re-emits them as offset date-times (`...Z`). Round-tripping the *type* would need a flagged `Date` subclass along the lines of `smol-toml`'s `TomlDate`. That changes `dump()` output and is intentionally left for a separate decision within this major.

## [1.2.2] - 2026-08-04

### Security

- Fix exponential backtracking in the multi-line basic string grammar ([GHSA-j4cp-cc36-jxwg](https://github.com/sunnyadn/js-toml/security/advisories/GHSA-j4cp-cc36-jxwg), CWE-1333). The escaped-newline rule ended in `(whiteSpaceChar | newline)*`, which is ambiguous with the enclosing content loop over the same characters, so an unterminated multi-line basic string made the lexer enumerate every composition of the whitespace run. Cost doubled roughly every three bytes of input: a 97-byte document blocked the event loop for about nine seconds, and ~160 bytes for over a year. Unlike a size-proportional CPU bug, request-size limits give no protection. The trailing group is redundant, since `unescapeString` performs line-ending-backslash trimming at interpretation time, and removing it leaves the accepted language unchanged. All versions up to and including 1.2.1 are affected. Found while triaging an unrelated report.
- Cap decimal integer literals at 1000 digits, matching the existing radix-prefixed cap (CWE-400). `NonDecimalInteger` enforced `MAX_RADIX_LITERAL_LENGTH` while `DecimalInteger` passed the whole literal to `BigInt()` unbounded. No advisory was published for this one: `BigInt()` on a decimal string measures at roughly O(n^1.28) on every supported Node (18 through 24 each parse a million digits in ~41 ms), and a megabyte of digits costs less to parse than a megabyte of ordinary key/value pairs, so there is no amplification to exploit. It is fixed as a consistency guard. Reported by [@arpitjain099](https://github.com/arpitjain099).

### Changed

- Decimal integer literals longer than 1000 digits now raise `SyntaxParseError` instead of loading as a `bigint`. TOML's 64-bit integer range needs at most 20 digits, so this affects only documents that deliberately carry oversized integers.

## [1.2.1] - 2026-07-08

### Fixed

- Dates with years below 100 (e.g. `0001-01-01T00:00:00Z`) were rejected or mis-parsed via JavaScript's legacy `Date` year mapping; they now parse correctly.
- Out-of-range UTC offsets (`+25:00`, `+12:60`) were accepted; they are now rejected per RFC 3339.
- Duplicate super-table headers (`[a.b]` then `[a]` twice) were accepted; redefinition is now an error per the spec.

### Changed

- The vendored [toml-test](https://github.com/toml-lang/toml-test) suite is upgraded to the official v2.2.0 TOML-1.1.0-gated set (332 → 681 cases, zero exclusions).

## [1.2.0] - 2026-07-08

### Added

- [TOML v1.1.0](https://toml.io/en/v1.1.0) support, enabled by default ([spec changelog](https://github.com/toml-lang/toml/blob/1.1.0/CHANGELOG.md)):
  - Inline tables may span multiple lines, contain comments, and end with a trailing comma (toml-lang/toml#904). Newlines are still rejected inside a key/value pair itself (around `=` or a dotted-key `.`), exactly as the spec ABNF requires.
  - `\xHH` escapes in basic and multi-line basic strings, decoding to the Unicode code point U+00HH (toml-lang/toml#796).
  - `\e` escape (U+001B) in basic and multi-line basic strings (toml-lang/toml#790).
  - Seconds are optional in times and date-times (toml-lang/toml#894); omitted seconds are normalized to `:00` (`13:37` loads as `"13:37:00"`). Fractional seconds still require whole seconds per the spec ABNF.

### Changed

- Documents that were syntax errors under TOML 1.0.0 but are valid TOML 1.1.0 (see above) now parse successfully instead of throwing `SyntaxParseError`. Every valid TOML 1.0.0 document parses exactly as before.
- `dump()` intentionally keeps emitting TOML v1.0.0-compatible output (single-line inline tables, no trailing commas, `\uXXXX` escapes, full-precision datetimes) so generated documents remain readable by 1.0-only parsers.

## [1.1.3] - 2026-06-30

### Security

- Fix uncontrolled recursion that let deeply nested input (arrays / inline tables) or a long dotted key drive `load()` past the V8 call stack and throw an uncaught `RangeError`, violating the documented `SyntaxParseError` contract and enabling a denial-of-service in services that parse untrusted TOML ([GHSA-3g82-77xr-68x5](https://github.com/sunnyadn/js-toml/security/advisories/GHSA-3g82-77xr-68x5), CWE-674). Neither the recursive-descent parser nor the tree-walking interpreter bounded nesting depth. `load()` now enforces a configurable maximum depth (`load(toml, { maxDepth })`, default `100`), rejecting over-deep input as `SyntaxParseError`, with a top-level backstop that converts any residual native stack overflow into `SyntaxParseError` as well. Reported by [@kaimandalic](https://github.com/kaimandalic).

### Added

- `LoadOptions` with a `maxDepth` option for `load()`, and an exported `DEFAULT_MAX_DEPTH` constant.

## [1.1.2] - 2026-05-28

### Security

- Fix silent acceptance of duplicate keys whose prior value is a falsy primitive (`false`, `0`, `0.0`, `-0.0`, `nan`, `""`) ([GHSA-m34p-749j-x6m6](https://github.com/sunnyadn/js-toml/security/advisories/GHSA-m34p-749j-x6m6), CWE-697). The interpreter used a truthy existence check (`if (object[key])`) instead of `key in object`, so a later table, dotted-key sub-table, or array-of-tables sharing the same name silently overwrote the falsy value instead of raising a duplicate-key error. Reported by [@CosmicCrusader23](https://github.com/CosmicCrusader23).

### Fixed

- Reject array-of-tables headers (`[[a.b]]`) that descend into a statically-defined array. `getOrCreateArray` lacked the immutability guard that `createTable` had, so such input either threw an uncaught `TypeError` or silently mutated the static array instead of raising `SyntaxParseError`.

## [1.1.1] - 2026-05-25

### Security

- Fix CPU exhaustion via O(n²) BigInt construction on radix-prefixed integer literals ([GHSA-wp3c-266w-4qfq](https://github.com/sunnyadn/js-toml/security/advisories/GHSA-wp3c-266w-4qfq), CWE-400, CWE-407). The `0x` / `0o` / `0b` integer parser previously used a hand-written `BigInt` accumulator loop that ran in O(n²) in the literal length, allowing a single ~500 kB literal to block the event loop for tens of seconds. Switched to the native `BigInt(prefixedString)` constructor (O(n)) and capped radix-prefixed literals at 1000 digits. Reported by [@tonghuaroot](https://github.com/tonghuaroot).

## [1.1.0] - 2026-04-15

### Added

- TOML serialization via `dump()` function with support for all TOML v1.0.0 value types
- `DumpOptions` for controlling newline style, undefined handling, and key quoting

### Changed

- Upgraded Chevrotain to v12
- Migrated ESLint to flat configuration

## [1.0.3] - 2026-02-24

### Fixed

- Replaced `@digitak/esrun` with `tsx` to resolve esbuild vulnerability
- Upgraded dependencies to resolve security vulnerabilities

### Changed

- Extracted `isPlainObject` utility and replaced redundant implementations

## [1.0.2] - 2025-08-03

### Fixed

- Addressed prototype pollution vulnerability (CWE-1321)
- Fixed import paths to use explicit `.js` extensions

### Changed

- Upgraded `tsup` to v8.5.0

## [1.0.1] - 2024-11-24

### Fixed

- Added support for emoji and full Unicode range in strings ([#2](https://github.com/sunnyadn/js-toml/issues/2))

## [1.0.0] - 2023-10-26

### Added

- Initial stable release
- Full TOML v1.0.0 spec compliance
- Support for Node.js, browsers, and Bun
- ESM and CJS output formats

[Unreleased]: https://github.com/sunnyadn/js-toml/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/sunnyadn/js-toml/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/sunnyadn/js-toml/compare/v1.1.3...v1.2.0
[1.1.3]: https://github.com/sunnyadn/js-toml/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/sunnyadn/js-toml/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/sunnyadn/js-toml/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/sunnyadn/js-toml/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/sunnyadn/js-toml/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/sunnyadn/js-toml/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/sunnyadn/js-toml/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/sunnyadn/js-toml/releases/tag/v1.0.0

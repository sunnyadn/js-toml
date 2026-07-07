# testcase/

Vendored from the official [toml-test](https://github.com/toml-lang/toml-test)
suite; `test/tomlTest.ts` runs every `valid/**/*.toml` (against its `.json`
expectation) and `invalid/**/*.toml`.

## Provenance

- Upstream: <https://github.com/toml-lang/toml-test>
- Tag: `v2.2.0` (released 2026-04-30)
- Vendored: 2026-07-08
- Selection: exactly the files listed in upstream `tests/files-toml-1.1.0`
  (the TOML v1.1.0 gating list; it names both the `.toml` cases and the
  `.json` expectations) — 214 valid tests + 467 invalid tests.

This wholesale re-vendor supersedes the previous 2022-11-17 snapshot,
including the 8 hand-ported TOML 1.1 cases it carried
(`valid/datetime/no-secs`, `valid/inline-table/linebreak-1..4`,
`valid/inline-table/trailing-comma`, `valid/string/basic-byte-escapes`,
`valid/string/escape-esc`); their upstream equivalents are now used instead.

## Local exclusions

None — every file from the gating list is vendored.

Note on `invalid/encoding/*`: these cases contain invalid raw bytes (bad
UTF-8, UTF-16). `load()` takes an already-decoded JavaScript string, so
byte-level encoding validation is the host's responsibility. The harness
models the full byte→string→object pipeline by decoding each invalid case
with a strict `TextDecoder('utf-8', { fatal: true })`; a decode failure
counts as the required rejection. (The old snapshot silently dropped two of
these files instead.)

## Re-vendoring

1. Download the latest toml-test release tarball.
2. Delete `testcase/valid/` and `testcase/invalid/`, then copy every path
   listed in `tests/files-toml-1.1.0` (or the gating list for whichever TOML
   version js-toml targets) preserving directory structure.
3. Update the Provenance section above and run `pnpm test`.

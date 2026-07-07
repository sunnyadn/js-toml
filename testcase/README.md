# testcase/

Vendored from the official [toml-test](https://github.com/toml-lang/toml-test)
suite; `test/tomlTest.ts` runs every `valid/**/*.toml` (against its `.json`
expectation) and `invalid/**/*.toml`.

Note for the next re-vendor: the 8 files below are hand-ported TOML 1.1 cases
(moved from `invalid/` or added for the 1.1 feature work) and predate a
toml-test v2.2.0 sync. When re-vendoring, take the upstream versions and drop
this note.

- `valid/datetime/no-secs.toml`
- `valid/inline-table/linebreak-1.toml` … `linebreak-4.toml`
- `valid/inline-table/trailing-comma.toml`
- `valid/string/basic-byte-escapes.toml`
- `valid/string/escape-esc.toml`

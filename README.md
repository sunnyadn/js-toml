# js-toml

[![codecov](https://codecov.io/github/sunnyadn/js-toml/branch/main/graph/badge.svg?token=8LNJGG767J)](https://codecov.io/github/sunnyadn/js-toml)
[![github actions](https://github.com/sunnyadn/js-toml/workflows/CI/badge.svg)](https://github.com/sunnyadn/js-toml/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/js-toml.svg)](https://badge.fury.io/js/js-toml)
![NPM Downloads](https://img.shields.io/npm/d18m/js-toml)

A TOML parser for JavaScript and TypeScript. Fully tested and 100% compatible with the TOML v1.1.0 spec
(every valid TOML v1.0.0 document parses identically; `dump()` keeps emitting TOML v1.0.0-compatible output
for maximum downstream compatibility).
Passes all 681 cases of the official [toml-test](https://github.com/toml-lang/toml-test) suite.
Support Node.js, browsers and Bun⚡️!

---

## Trusted By

`js-toml` is used by leading companies and major open-source projects, including:

* **MongoDB** (in the `snooty` documentation compiler)
* **LINE** (in `abc-user-feedback`)
* **cargo-lambda** (in `cargo-lambda-cdk`, the CDK construct for deploying Rust on AWS Lambda)
* **Mise** (a next-gen `asdf`)
* **Open edX** (in over 28 packages)
* ... and [many more](https://github.com/sunnyadn/js-toml/network/dependents).

---

## Installation

```bash
npm install js-toml
```

or with yarn

```bash
yarn add js-toml
```

or with pnpm

```bash
pnpm add js-toml
```

even support bun!

```bash
bun add js-toml
```

## Usage

### Parsing TOML

```typescript
import {load} from 'js-toml';

const toml = `
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00 # First class dates
`;

const data = load(toml);
console.log(data);
```

### Serializing to TOML

```typescript
import {dump} from 'js-toml';

const toml = dump({
  title: 'TOML Example',
  owner: {
    name: 'Tom Preston-Werner',
    dob: new Date('1979-05-27T07:32:00-08:00'),
  },
});

console.log(toml);
```

## API

### load(toml: string, options?: LoadOptions): object

Parses a TOML string and returns a JavaScript object.

#### LoadOptions

| Option     | Type     | Default | Description                                                                                                                                                                                                 |
| ---------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxDepth` | `number` | `100`   | Maximum nesting depth for arrays / inline tables and dotted-key / table-header segments. Input exceeding this is rejected with a `SyntaxParseError` instead of overflowing the call stack with a `RangeError`. |

Any invalid input, including input that exceeds `maxDepth`, is reported by
throwing `SyntaxParseError`.

#### Dates and times

| TOML type        | Example                | You get                            |
| ---------------- | ---------------------- | ---------------------------------- |
| Offset date-time | `1979-05-27T07:32:00Z` | `TomlDate` at that instant         |
| Local date-time  | `1979-05-27T07:32:00`  | `TomlDate`, wall clock read as UTC |
| Local date       | `1979-05-27`           | `TomlDate` at midnight UTC         |
| Local time       | `07:32:00`             | `TomlTime`, a `Date` with no day   |

A local date-time carries no offset, so read it with `getUTCHours()` and
friends; `getHours()` would shift with the host timezone.

All four are `Date` subclasses, so `instanceof Date` reaches every one and
`toISOString()` returns the form the document wrote rather than an instant with
a `Z` it never carried. `JSON.stringify` follows, since `toJSON` delegates
there. `TomlDate` adds `kind`, one of `'offset-date-time'`, `'local-date-time'`
or `'local-date'`; `TomlTime` adds `hour`, `minute`, `second` and `fraction`,
and keeps the source precision that a millisecond-based encoding rounds away.

Upgrading from 1.x: see the [2.0.1 notes](CHANGELOG.md#201---2026-08-04).

### dump(object: object, options?: DumpOptions): string

Serializes a JavaScript object into a TOML string. The input must be a plain
object (i.e. a TOML table).

Supported value types: string, number, `bigint`, boolean, `Date`, array,
plain object, and array-of-tables. Strings are always emitted as single-line
basic strings; multiline string output is not currently supported.

#### DumpOptions

| Option            | Type               | Default | Description                                                                                  |
| ----------------- | ------------------ | ------- | -------------------------------------------------------------------------------------------- |
| `newline`         | `'\n'` \| `'\r\n'` | `'\n'`  | Newline sequence used between lines.                                                         |
| `ignoreUndefined` | `boolean`          | `false` | If `true`, properties with unsupported values (`undefined`, `Symbol`, `Function`) are silently dropped instead of throwing. |
| `forceQuotes`     | `boolean`          | `false` | If `true`, string keys are always quoted, even when they only contain bare-key characters.   |

## License

MIT

## References

[TOML v1.1.0 Official Specs](https://toml.io/en/v1.1.0)

[TOML GitHub Project](https://github.com/toml-lang/toml)

[TOML Test](https://github.com/toml-lang/toml-test)

[iarna-toml](https://github.com/iarna/iarna-toml)

# js-toml

[![codecov](https://codecov.io/github/sunnyadn/js-toml/branch/main/graph/badge.svg?token=8LNJGG767J)](https://codecov.io/github/sunnyadn/js-toml)
[![github actions](https://github.com/sunnyadn/js-toml/workflows/CI/badge.svg)](https://github.com/sunnyadn/js-toml/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/js-toml.svg)](https://badge.fury.io/js/js-toml)

A TOML parser for JavaScript and TypeScript. Fully tested and 100% compatible with the TOML v1.0.0 spec.
Support Node.js, browsers and Bun⚡️!

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

## API

### load(toml: string): object

Parses a TOML string and returns a JavaScript object.

### dump(object: object): string

Under development.

## License

MIT

## References

[TOML v1.0.0 Official Specs](https://toml.io/en/v1.0.0)

[TOML GitHub Project](https://github.com/toml-lang/toml)

[TOML Test](https://github.com/toml-lang/toml-test)

[iarna-toml](https://github.com/iarna/iarna-toml)

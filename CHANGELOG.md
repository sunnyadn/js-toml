# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/sunnyadn/js-toml/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/sunnyadn/js-toml/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/sunnyadn/js-toml/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/sunnyadn/js-toml/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/sunnyadn/js-toml/releases/tag/v1.0.0

# Contributing to js-toml

Thanks for your interest in contributing! Here's how to get started.

## Setup

```bash
pnpm install
```

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests: `pnpm test`
4. Run the linter: `pnpm run lint`
5. Open a pull request against `main`

## Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm run test:cov
```

The project includes the official [TOML test suite](https://github.com/toml-lang/toml-test) in `testcase/`. If you're fixing a parsing bug, consider adding a test case there.

## Code Style

- Code is formatted with Prettier and linted with ESLint
- Run `pnpm run lint:fix` to auto-fix issues before committing

## Reporting Bugs

Please [open an issue](https://github.com/sunnyadn/js-toml/issues/new?template=bug_report.md) with:

- A minimal TOML input that reproduces the problem
- Expected vs actual output
- Your Node.js version

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

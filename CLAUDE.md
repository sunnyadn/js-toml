# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

js-toml is a TOML v1.0.0 parser for JavaScript/TypeScript using the Chevrotain parsing library. It follows a lexer → parser → interpreter architecture to transform TOML text into JavaScript objects.

## Common Commands

```bash
# Build the library (outputs ESM and CJS formats)
pnpm run build

# Run tests with Vitest
pnpm test

# Run tests with coverage
pnpm run test:cov

# Lint code with ESLint
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Run benchmarks
pnpm run benchmark

# Generate syntax diagram
pnpm run diagram
```

## Architecture

The parser follows a three-stage pipeline:

1. **Lexer** (`src/load/lexer.ts`): Tokenizes TOML text using Chevrotain's Lexer with tokens defined in `src/load/tokens/`
2. **Parser** (`src/load/parser.ts`): Builds a Concrete Syntax Tree (CST) using Chevrotain's CstParser
3. **Interpreter** (`src/load/interpreter.ts`): Converts the CST to JavaScript objects

### Key Components

- `src/index.ts`: Main entry point, exports `load` function and `SyntaxParseError`
- `src/load/load.ts`: Orchestrates the lexer → parser → interpreter pipeline
- `src/load/tokens/`: Token definitions for all TOML language constructs
- `src/load/exception.ts`: Custom error classes for lexing and parsing failures

### Token System

The token system is comprehensive, covering all TOML v1.0.0 features including:
- Basic and multiline strings (literal and quoted)
- Integer, float, boolean, and datetime types
- Arrays and inline tables
- Standard tables and array-of-tables
- Comments and whitespace handling

## Testing

Tests are organized by TOML language feature in the `test/` directory. The project includes extensive test cases from the official TOML test suite in `testcase/valid/` and `testcase/invalid/`.

## Build Configuration

- **tsup**: Builds both ESM and CJS formats with tree-shaking and minification
- **TypeScript**: Uses Node.js next module resolution
- **Vitest**: Test runner with global test functions enabled
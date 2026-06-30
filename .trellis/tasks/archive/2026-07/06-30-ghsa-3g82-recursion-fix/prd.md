# Fix GHSA-3g82 uncontrolled recursion + advisory closed-loop

## Goal

Eliminate the uncontrolled-recursion failure mode in `load()` where deeply nested
input (arrays / inline tables) or a long dotted key drives recursion past the V8
call stack and throws an uncaught `RangeError`, violating the `SyntaxParseError`
error contract. Then drive the GitHub Security Advisory **GHSA-3g82-77xr-68x5**
through its full lifecycle: fix → release → advisory edit/reply/publish.

## Background

- Advisory GHSA-3g82-77xr-68x5 (reporter: @kaimandalic), severity Medium (CVSS 5.3,
  `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L`), affected `<= 1.1.2`.
- Reproduced locally against built `dist` (v1.1.2): nested arrays, nested inline
  tables, and deep dotted keys all throw `RangeError: Maximum call stack size
  exceeded` instead of `SyntaxParseError`.
- **Empirically measured native overflow thresholds on this machine (Node 22):**
  inline table ~234, array ~312, dotted key ~4687. These are environment-dependent
  (smaller on constrained stacks), which is exactly why a deterministic, in-library
  bound is required rather than relying on V8's accidental limit.
- Root cause: no explicit depth bound anywhere in the parse pipeline.
  Parser (Chevrotain recursive descent) recurses through `value` per nesting level;
  interpreter (`assignValue`/`createTable`/`getOrCreateArray`/`cleanInternalProperties`)
  recurses per dotted-key segment / object depth.

## Requirements

### R1 — Deterministic depth bound (code fix)
- R1.1 Enforce an explicit maximum nesting/key depth across the whole pipeline.
- R1.2 On exceeding the bound, throw an error that is `instanceof SyntaxParseError`
  (consistent with the library's documented error contract), **not** `RangeError`.
- R1.3 The bound must be configurable with a safe default:
  `load(toml, { maxDepth })`. Default sits safely below the native overflow
  threshold for the common case.
- R1.4 A top-level backstop in `load()` converts any residual native `RangeError`
  (e.g. on small-stack environments, or when a user raises `maxDepth` beyond the
  environment's native capacity) into a `SyntaxParseError`, so the contract holds
  unconditionally.
- R1.5 No behavioral change for valid documents within the bound. Existing tests and
  the official TOML test suite (`testcase/valid`, `testcase/invalid`) keep passing.

### R2 — Release
- R2.1 Bump `1.1.2` → `1.1.3` (patch), following the existing `chore: release`
  commit pattern.
- R2.2 Publish `js-toml@1.1.3` to npm.

### R3 — Advisory lifecycle (GHSA-3g82-77xr-68x5)
- R3.1 Set patched version `1.1.3` and confirm vulnerable range `<= 1.1.2`.
- R3.2 Add weakness classification **CWE-674 (Uncontrolled Recursion)**.
- R3.3 Request a **CVE** ID via GitHub.
- R3.4 Reply to / credit the reporter (@kaimandalic).
- R3.5 Publish the advisory.

## Constraints

- Public API change is limited to an additive optional `options` argument on `load`;
  must remain backward compatible (single-arg `load(toml)` keeps working).
- `maxDepth` default must be deterministic and safe on a normal stack; do not rely
  solely on the backstop for the common case.
- Outward, irreversible actions (npm publish, advisory publish, CVE request) are
  executed by the agent via `gh`/`npm` but each is confirmed with the user
  immediately before execution.

## Acceptance Criteria

- [x] AC1: `load('x = ' + '['.repeat(N) + ']'.repeat(N))` with N over the limit throws
      `SyntaxParseError` (asserted `instanceof`), never `RangeError`.
- [x] AC2: Deeply nested inline tables over the limit throw `SyntaxParseError`.
- [x] AC3: Dotted key over the limit throws `SyntaxParseError`.
- [x] AC4: A valid document at/under the default limit parses to the correct object.
- [x] AC5: `load(toml, { maxDepth: higher })` accepts depth a default call would reject;
      `load(toml, { maxDepth: lower })` rejects depth a default call would accept.
- [x] AC6: For every over-limit PoC input, no `RangeError` ever escapes `load()`.
- [x] AC7: Full existing test suite + official TOML conformance cases pass; lint clean.
- [x] AC8: `js-toml@1.1.3` published to npm with the fix.
- [x] AC9: Advisory has patched version 1.1.3, CWE-674, CVE requested, reporter
      replied, and is published (2026-06-30; reporter was already credited/confirmed.
      CVE id assigned asynchronously by GitHub post-publish).

# Design — GHSA-3g82 deterministic depth bound

## Strategy

Two recursion sources, bounded by one unified `maxDepth`, plus a top-level backstop.
Chosen approach is the "deterministic limit" (A-route): it is the root-cause fix
(the root cause is *no explicit bound*), needs no Chevrotain rewrite, and has zero
regression risk for valid input.

### Layer 1 — Parser nesting (arrays / inline tables): pre-parse token scan
Instead of instrumenting Chevrotain's generated recursive rules (fragile, fights the
library's error-recovery), scan the **token stream** produced by the lexer *before*
invoking `parser.toml()`. Maintain a running `depth`:
- `+1` on `ArrayOpen` or `InlineTableOpen`
- `-1` on `ArrayClose` or `InlineTableClose`
- track `maxDepth` seen
Table-header tokens (`StdTableOpen`/`ArrayTableOpen`) are distinct tokens and do NOT
nest values, so they are intentionally ignored. If `max > limit`, throw before the
recursive parser ever runs — so the parser physically cannot overflow on nesting.
This is O(n) over tokens, negligible cost.

Rationale: token bracket-nesting depth equals parser recursion depth (each
`ArrayOpen`/`InlineTableOpen` is one `value → array/inlineTable → … → value` recursion
level). Pre-scanning decouples the bound from Chevrotain internals.

### Layer 2 — Interpreter key depth (dotted keys / table headers): length guard
`keys` arrays come from dotted keys (`a.b.c…`) and table headers. The interpreter
recurses once per segment in `assignValue`/`createTable`/`getOrCreateArray`. Guard at
the point each `keys` array is produced: if `keys.length > limit`, throw. This avoids
the per-segment recursion entirely for over-long keys. Object-tree depth fed to the
recursive `cleanInternalProperties` is then bounded by (nesting limit + key limit),
which combined with Layer 3 is safe.

### Layer 3 — Top-level backstop in `load()`
Wrap the parse+interpret body; convert a native `RangeError` into `SyntaxParseError`.
The library's own `SyntaxParseError` subclasses are not `RangeError`, so real
malformed-input errors pass through unchanged; only genuine stack exhaustion (e.g. on
a constrained stack, or when the user sets `maxDepth` above the environment's native
capacity) is converted. Guarantees the error contract holds unconditionally.

## Default `maxDepth`

Measured native overflow on this machine: inline table ~234, array ~312, dotted key
~4687 — and lower on constrained stacks. Default is set to **100**: comfortably below
the worst observed normal-stack threshold (~234) so the deterministic limit reliably
fires first for the common case, and far above any real-world TOML nesting (real
configs are single-digit depth; cf. serde_json's default recursion limit of 128).
Users who genuinely need deeper documents raise it via `{ maxDepth }`; if they raise
it past native capacity, Layer 3 still guarantees a `SyntaxParseError`.

## API / contract

```ts
export interface LoadOptions { maxDepth?: number }
export const load = (toml: string, options?: LoadOptions): Record<string, unknown>
```
- Backward compatible: `load(toml)` unchanged; default `maxDepth = DEFAULT_MAX_DEPTH (100)`.
- Invalid `maxDepth` (non-positive / non-integer) → ignore or coerce to default
  (decide in impl; prefer throwing a `TypeError` only if clearly misused — keep minimal,
  default-coerce is acceptable and lower-risk).

## New error

Add `DepthLimitError extends SyntaxParseError` in `src/load/exception.ts` with a clear
message (e.g. `Maximum nesting depth of N exceeded`). Not exported from the public
barrel (consistent with `LexerError`/`ParserError`/`InterpreterError`, which are
internal); `instanceof SyntaxParseError` is the public guarantee.

## Touched files

- `src/load/exception.ts` — add `DepthLimitError`.
- `src/load/load.ts` — accept `options`, run Layer-1 token scan, pass limit to
  interpreter, wrap body with Layer-3 backstop.
- `src/load/interpreter.ts` — accept/hold `maxDepth`; add Layer-2 key-length guard in
  `keyValue` / `stdTable` / `arrayTable` (where `keys` is produced).
- `src/load/index.ts` / `src/index.ts` — export `LoadOptions` type if useful (optional).
- `test/` — new spec file `test/depth-limit.spec.ts` (or co-located per repo convention)
  covering AC1–AC6.
- `README` / docs — document `maxDepth` option.

## Interpreter wiring

`load.ts` currently calls `interpreter.visit(cst)` on a singleton. Set the limit on the
singleton immediately before visiting (`interpreter.maxDepth = limit`), mirroring the
existing singleton-with-mutable-state pattern (`parser.input = …`). The key-length
guard reads `this.maxDepth`. Reset/initialize to default in the constructor.

## Risks & mitigations

- **Token names**: verify exact exported names `ArrayOpen/ArrayClose/InlineTableOpen/
  InlineTableClose` in `src/load/tokens/` before coding the scan.
- **Combined depth** (header depth + inline nesting) feeding `cleanInternalProperties`:
  bounded ≤ ~2×limit (200), far under native ~234? — NOTE: 2×100=200 is *below* the
  ~234 inline-table threshold but margins are tight on small stacks; Layer-3 backstop
  covers any residual. Optionally iterativize `cleanInternalProperties` later if we want
  to drop the backstop reliance (out of scope for this fix; backstop is sufficient).
- **maxLookahead/perf**: token pre-scan adds one linear pass; negligible vs lex+parse.

## Out of scope (documented alternative)

Full iterative rewrite of parser (drop Chevrotain value recursion) + interpreter is the
theoretical maximum but is over-engineering here: it does not remove the need for a
limit (it only swaps the bounded resource from stack to heap) and risks real parsing
regressions. Recorded for posterity; not pursued.

# Implementation plan — GHSA-3g82

## Phase A — Code fix (branch `fix/ghsa-3g82-depth-limit`)

1. **Recon tokens** — confirm exact names of `ArrayOpen/ArrayClose/InlineTableOpen/
   InlineTableClose` in `src/load/tokens/`. Validation: grep exported token names.
2. **exception.ts** — add `DepthLimitError extends SyntaxParseError` with message
   `Maximum nesting depth of <N> exceeded`.
3. **interpreter.ts** — add `maxDepth` field (default const); add key-length guard in
   `keyValue`, `stdTable`, `arrayTable` after `keys` is produced → throw `DepthLimitError`
   when `keys.length > this.maxDepth`.
4. **load.ts** — signature `load(toml, options?)`; compute `limit = options?.maxDepth ??
   DEFAULT_MAX_DEPTH`; after lexing, run Layer-1 token nesting scan → throw
   `DepthLimitError` when exceeded; set `interpreter.maxDepth = limit`; wrap
   parse+interpret in try/catch converting `RangeError` → `SyntaxParseError` (Layer 3).
5. **exports** — export `DEFAULT_MAX_DEPTH` and `LoadOptions` type if clean; keep public
   surface minimal.
6. **Build sanity** — `pnpm run build`.

   Review gate ⛯ — re-read diff for contract (`instanceof SyntaxParseError`),
   backward-compat (`load(toml)` still works), no valid-input behavior change.

## Phase B — Tests & quality

7. **test/depth-limit.spec.ts** — cover AC1–AC6:
   - over-limit nested array / inline table / dotted key → `expect(...).toThrow` and
     `instanceof SyntaxParseError`; assert NOT `RangeError`.
   - valid deep doc at default limit parses correctly.
   - custom `maxDepth` higher accepts; lower rejects.
   - assert no `RangeError` escapes for the three PoC inputs.
8. **Run** `pnpm test` (full suite incl. `testcase/valid` + `testcase/invalid`),
   `pnpm run lint`. Validation: all green.
9. **Re-run original PoC** against fresh `dist`: all three now `[SyntaxParseError]`.

   Review gate ⛯ — AC1–AC7 satisfied.

## Phase C — Release (R2)  [outward action — confirm before publish]

10. Bump `package.json` 1.1.2 → 1.1.3. Update README with `maxDepth` docs.
11. Commit: `fix: bound recursion depth and surface as SyntaxParseError (GHSA-3g82-77xr-68x5)`
    then `chore: release v1.1.3` (mirror existing release-commit pattern).
12. Open PR to `main`; merge after green CI.
13. **Confirm with user → `npm publish`** `js-toml@1.1.3`. Verify `npm view js-toml version`.

## Phase D — Advisory lifecycle (R3) [outward actions — confirm each]

14. Inspect current advisory state and available `gh api` operations.
15. PATCH advisory: vulnerable range `<= 1.1.2`, **patched_versions `1.1.3`**, add
    **CWE-674**, ensure reporter credit (@kaimandalic) is set.
16. **Confirm → request CVE** via the advisory's CVE endpoint.
17. **Reply to reporter** — post the prepared thank-you / fix-summary (via API if the
    advisory comment endpoint exists; otherwise hand the drafted text to the user to
    paste, and note the limitation).
18. **Confirm → publish advisory**.
19. Verify: advisory shows published, patched 1.1.3, CWE-674, CVE requested/assigned.

## Rollback points

- Phase A/B: revert branch; no outward effect.
- Phase C: if publish fails or regression found post-publish, `npm deprecate` the bad
  version and ship 1.1.4; do not unpublish.
- Phase D: advisory edits are reversible pre-publish; CVE request and publish are not —
  hence the explicit per-step user confirmation.

## Validation command summary

```bash
pnpm run build && pnpm test && pnpm run lint
node poc-tmp.mjs   # all three → SyntaxParseError, no RangeError
```

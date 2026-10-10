# Guardian batch tooling: initial review

## Verdict

The scope and per-operation coverage are aligned: all six candidate JSON files are present, the scope has 17 operations with the expected domain counts (`auth` 2, `discovery` 4, `events` 2, `attendance` 3, `diary` 3, `food` 3), and each has exactly one response candidate and one capability row with an in-scope operation/source key. The current candidate batch is **not checker-clean**; the real-file checker fails on request merging, and additional incompatible candidate metadata appears once that first failure is bypassed.

## Findings

### P1 — Request candidates append fields that already exist instead of enriching them

`node scripts/check-guardian-batch.mjs` exits 1 with:

```text
Error: attendance.requestCandidates[1] merged query.query: duplicate field date
```

`checkRequestCandidate` unconditionally pushes query fields (and appends body fields) at `scripts/check-guardian-batch.mjs:63-75`. The existing `GetStatusLogs` (`25650`) request in `evidence/research/children-diary-files.json:953-990` already has query `date`; `attendance.json` proposes that same field again at `:131-145`. `GetAbsenceModalData` (`25652`) similarly already has query `form` (`children-diary-files.json:993-1031`), and proposes it again (`attendance.json:147-161`). Once the date collision is resolved, the form collision will also fail validation.

These are request enrichments, not new query names. Merge/upsert each candidate into its existing field while preserving its established placement and recording the additional field proof; do not append a duplicate or silently discard the candidate. `GetChildCalendar`'s `start_date`/`end_date` and `GetGuardianFeed`'s `date` have no same-name query entry in their current research records and are new additions.

The modal candidate also currently declares outer `form` as `type: "object"` (`attendance.json:151-153`). `object` is not a research request field type (`AGENTS.md:50`; `scripts/generate.mjs:5-8`), independently confirmed by `validateRecord` when the candidate is tested without the existing duplicate. Keep the existing outer query value `unknown` and, if retaining the observed local construction, represent `user_id` as nested construction evidence under that unknown value. The trace proves `params.form` receives `{user_id: currentUser.id}` but does **not** prove Axios's serialized query-key syntax; do not add a JSON-string or bracket/deep-object encoding marker without evidence.

### P1 — Guardian-feed response candidate has invalid unknown/field nesting

After removing request candidates in a read-only in-memory diagnostic, validation reaches `diary.responseCandidates[0]` and rejects it with `non-object response kinds cannot have fields`. `GetGuardianFeed` is currently `kind: "unknown"` but has root `fields` (`diary.json:5-42`). It also gives the `data` field `type: "unknown"` while nesting child fields beneath it (`:21-41`). The existing response validator correctly restricts root fields to object responses and nested `fields` to object fields (`scripts/generate.mjs:136-160, 167-181`).

Fix the candidate rather than relaxing these schema guards: either retain an opaque `unknown` disposition with no fabricated fields, or represent the directly observed nesting using object field types supported by the trace (`body.data.data` and `body.data.next_date`) and keep all unobserved properties open/unknown. The other 16 response candidates pass `validateResponseAnalysis`; do not weaken the non-object response rule to accommodate this one.

### P2 — Trace checker makes an optional contract line mandatory

`AGENTS.md:63` defines response trace items as `{functionId, line?, evidence}`. `validateResponseAnalysis` also explicitly accepts an absent line (`scripts/generate.mjs:173`), but `checkTrace` requires a positive line and exact keys including `line` (`scripts/check-guardian-batch.mjs:11-19`); the unit test codifies that stricter behavior (`tests/guardian-batch.test.mjs:101-103`). All current candidate traces include lines, so this is not the cause of today's failure, but the checker rejects a trace that the repository contract permits. Align the shared check with the optional-line contract and update the test to reject malformed supplied lines, not an omitted optional line.

## Validation and coverage notes

- `node --test tests/guardian-batch.test.mjs`: **6 passed, 0 failed**. These tests construct synthetic candidates and do not validate the six real candidate documents; the final identity test only checks the scope entry. Add a real-file regression path (or equivalent committed fixture) so candidate/schema and merge failures cannot pass solely on synthetic tests.
- `node scripts/check-guardian-batch.mjs`: **fails** at the existing `GetStatusLogs.date` collision described above.
- A read-only count/key audit found 17/17 unique response keys and 17/17 unique capability keys, all exactly within their declared domains. With request candidates omitted and the malformed feed nesting corrected **in memory only**, the checker validates all 17 response/capability rows. This indicates no additional structural capability-row or candidate metadata errors in the other files; it does not certify the truth of their claims.
- Capability claim validation checks structure (`claim`, nonempty `evidence`, and Boolean `established`) only. It does not determine whether an assertion marked `true` or `false` is factually supported. Permission semantics and all evidence attribution still require the assigned human review; a checker pass is not semantic approval.

## Safety audit

No privacy or execution side effect was found in this tooling path. The file checker reads the six JSON inputs and existing `evidence/research/*.json` using `readFile`/`readdir`, then invokes validators. Importing `generate.mjs` does not run `generate()`; generation is behind its direct-execution guard (`scripts/generate.mjs:539`). The checker makes no HTTP/authenticated requests and does not write repository files. Only the read-only checker, diagnostics, and unit tests were run; no generator/build was run.

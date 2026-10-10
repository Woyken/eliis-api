# Post-integration live audit review 3 — complete

**Disposition: not clean — two actionable findings.** The source/model, operation-scope, and private-value checks below are otherwise satisfactory. This review does not certify publication readiness. It found a sample-only OpenAPI publication leak that the current checker misses, plus stale current-facing review status.

## Scope, integrity, and safety

Reviewed the frozen live-audit inputs, all 17 operation dispositions and source identities, the 15 observation labels, static `GetEvents`/`GetRecentEvents` response evidence, the detached sample-model sources and artifacts, the existing OpenAPI output, validators/tests, publication workflow, and current-facing audit documentation. All **80/80** SHA-256 entries in [`live-input-snapshot.json`](live-input-snapshot.json) matched the declared manifest `a0b996dd9b4ea13f47371c41fe9e6363ce6930e0e9c87417cab54e56e0ad99a1`. The external original `eliis.hasm` hash remained `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.

No HTTP request, login, app action, private-capture read, build, TypeSpec/OpenAPI compile, generation, or Git write was performed. Read-only Node validation/checks and focused tests ran; the guardian renderer was compared in memory. No changes were made to frozen or pre-existing files; this report is the only file added by this review.

## Scope, source, and response-model audit

- The guardian scope, path dispositions, and operation catalog reconcile to **17 operations** and source IDs/methods/paths. The dispositions remain **14 sampled, 3 skipped, and 15 observation labels** (including two `GetStatusLogs` contexts). The exact 15-label/source-ID sample authorization set matches the reviewed set; the three skipped operations remain excluded. The two auth POSTs are the only scoped POST observations; the other 13 sampled operations are GETs.
- The root correction for `GetEvents` is supported by the original Hermes flow: service `#25403` returns Axios `response.data` through `#25404`; continuation `#25375` assigns that whole body to the locally constructed `action.data.items`; reducer `#25344` iterates that local slot. Thus the HTTP body root is an array, not an object with `items`. The canonical open item model retains **17 direct properties / 23 total property nodes**; properties remain optional and source-unproved leaf types remain unknown.
- `GetRecentEvents` remains a canonical open object with optional, unknown-typed root `events` and `count`. The only static evidence is the service/body projection and the bytecode reads in `#25372`; no runtime sample prose or item paths occur in its canonical response record. The observed array, integer, and item paths remain context-only in the 14 sample models / 15 labels.
- Sample shapes are type-only: open/optional object properties, no scalar values, no response `required` lists, and no universal status/media/nullability/default/enum claims. Null-only or conflicting observations stay unconstrained; empty arrays do not establish item schemas; the empty day-menu sample remains `{}` only in the sample view. Samples are distinct from canonical operation responses and no operation response references them.
- The three skips remain appropriate: `GetGuardianDiary` has no proven parent consumer and guardian access is unproved; `GetDiaryData` is employee/course-scoped and a reachable caller flushes autosaves; `DownloadFoodmenuFile` had no structured file item and remains an opaque binary disposition. No denial probe, staff-roster substitution, feature write, seen/read request, or secondary diary request is present.

## Privacy and tooling review

Manually reviewed the published shape ledger, candidate summaries, dispositions, sample JSON/TypeSpec artifacts, and current documentation. The exported sample data contains structural paths/types, counts, redacted query templates, sample transport metadata, and generic Boolean equality outcomes only. Sensitive property *names* (identity/contact/date/address and event/diary/menu paths) appear as schema labels, but no corresponding private scalar values, actual names, IDs, dates, birth/address values, permission values, descriptions, diary content, or menu text were found. The account/profile equality results do not establish guardian-to-child ownership, enrollment semantics, or policy; the feed groups' ownership remains unproved. `d_0`–`d_6` are the only numbered-looking property keys and are fixed day labels, not identifier-keyed records. The validator remains a structural guard rather than a general PII detector, so the documented manual review boundary still applies.

The authorization factory and live-model tests reject known skipped operations, wrong sources, label substitution, missing labels, and nonempty input without explicit authorization. Legacy empty input remains accepted without authorizing samples. The type-only validator and artifact comparison do not read capture files or execute callbacks with external effects.

## Read-only checks

- `node scripts/check-live-observations.mjs` passed: **15** type-only observations.
- `node --test tests/live-observations.test.mjs tests/live-response-models.test.mjs` passed **8/8** focused tests.
- `node scripts/check.mjs` passed against existing artifacts: **296** OpenAPI operations, **298** research observations, **92** partial static response models, **189** unknown and **15** binary dispositions, and **14** separate sample views. The 298 response observations are fully dispositioned. This check's sample-component assertion is insufficient; see finding `LIVE-FINAL-3-OPENAPI-SAMPLE-01`.
- The pure guardian renderer's in-memory capability and blocker outputs matched the existing documents.

## Findings

### [P1] Sample-only TypeSpec models are emitted as OpenAPI components

`main.tsp:6` imports `models/live-observations.tsp` into the service compilation. The existing OpenAPI output contains **44** `components.schemas` names of the form `LiveObservations.Observed_*`, each marked with `x-authenticated-sample-view`; none is referenced by an API operation, but all are still part of the OpenAPI component document. The Pages workflow builds OpenAPI and copies that JSON/YAML to the published site (`.github/workflows/pages.yml:27-39`).

The checker at `scripts/check.mjs:26-28` rejects only component names that start with `Observed_`, so it misses the namespace-qualified names. Consequently, `node scripts/check.mjs` currently passes despite the sample components. This contradicts the required boundary that sample models remain standalone and absent from generated OpenAPI; lack of operation references alone does not make them separate from the published API document. No raw sample values were found in these components, but they expose the sample-only field/type views in the publication artifact.

**Minimal action:** keep `models/live-observations.tsp` out of the normative `main.tsp` compilation (while retaining the standalone sample artifact), and make the checker reject namespace-qualified sample component names or `x-authenticated-sample-view` components. Add a regression test using a qualified name such as `LiveObservations.Observed_Fixture`.

### [P2] Current-facing audit document still reports Round 1 status as current

`docs/LIVE-MODEL-AUDIT.md:44` says Round 1 findings “remain unresolved” and that there is “no clean-round certificate.” The reviewed [`live-final-2-complete.md`](live-final-2-complete.md) records Round 2 as clean and resolves those findings. The historical statement that Round 1 failed is accurate, but the unqualified current-status clauses are stale and contradict the completed review.

**Minimal action:** update the current-facing status wording to distinguish the historical Round 1 failure from the clean Round 2 result and pending Round 3 review. Do not alter the frozen inputs during this review.

## Review gate

Round 3 is **not clean**. The previous clean Round 2 cannot be treated as consecutive with a later clean review after this non-clean round. Round 4 is the last permitted review/fix round; do not extend the four-round cap. No model or documentation files were edited under this review's ownership.

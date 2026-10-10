# Live model audit — tooling and privacy review, final round 1

**Disposition: not clean — three actionable findings.** This report covers only the live-observation tooling, its published sample artifacts, and current-facing privacy/provenance text. It is not a whole-audit certification. No private capture/source snippet was opened, no HTTP or app action was made, and no generation, build, CI, or full-suite run was performed.

The frozen [`live-input-snapshot.json`](live-input-snapshot.json) declares digest `18a3cd2f40dd1f108e42b6cf66cbd1d2692619a4371e11902629dc25a5c5f249`. All **79/79 per-file SHA-256 entries** matched both before and after this review. The pre-existing worktree changes were left untouched; this report is the only file added by this review.

## Findings

### [P1] Known skipped operations are still accepted as live sample labels

[`scripts/generate.mjs:287-295`](../../scripts/generate.mjs) accepts an observation whenever its resolved operation ID appears in the full catalog. That catalog also contains operations marked `skipped` in [`evidence/live-audit/path-dispositions.json`](../live-audit/path-dispositions.json), so catalog membership is not an approved-sample scope check.

**Reproduction:** a synthetic, in-memory observation labelled `GetGuardianDiary`, with a valid type-only empty-object shape and a catalog containing that operation, is accepted by `makeLiveResponseModels` and produces an `Observed_GetGuardianDiary` view. I ran this probe without reading private data or writing files; it returned `acceptedSkippedLabel: true`. The same gap applies to the other skipped labels. The checked-in 15 observations do not contain a skipped operation, so this is a scope-guard defect, not a current private-data leak.

The current test only rejects an unmapped label ([`tests/live-response-models.test.mjs:94`](../../tests/live-response-models.test.mjs)); it does not reject a known-but-skipped catalog operation or assert the exact approved 15-label set. Bind accepted labels to the reviewed sampled dispositions (or an equivalent reviewed allowlist), and cover each skipped label in regression tests while retaining the approved 15 labels.

### [P1] Runtime sample evidence has entered canonical response/OpenAPI metadata

The `GetRecentEvents` record in [`evidence/responses/communications.json:1438-1506`](../responses/communications.json) now describes the authenticated sample’s root types and observed item count in static response-evidence/field-evidence/limitation text. The generated static [`models/responses.tsp:750-754`](../../models/responses.tsp) repeats that sample-derived text in `x-static-response-evidence` and `x-static-field-evidence` extensions. Those extensions are part of the canonical OpenAPI output path, even though the `events` and `count` schema types remain `unknown` and the detached sample model is not response-bound.

This does not publish private scalar values or narrow the schema, but it crosses the stated boundary that canonical OpenAPI is unchanged by sample views apart from the source-verified `GetEvents` root-array correction. Keep the sample observation exclusively in the detached live-audit evidence/artifacts; keep canonical static response evidence bytecode-derived. The current checker verifies sample-view binding/component exclusions, but does not prevent sample-derived prose from entering canonical response extensions.

### [P2] Current-facing documentation still denies the later authorized audit

Several user-facing files retain statements that are no longer true after the bounded authenticated audit documented in [`docs/LIVE-MODEL-AUDIT.md`](../../docs/LIVE-MODEL-AUDIT.md) and [`EVIDENCE.md:68-74`](../../EVIDENCE.md):

- [`README.md:47`](../../README.md) says only the unauthenticated language-list request was checked live and says no login/private-record access occurred.
- [`AUTH.md:3`](../../AUTH.md) says no authenticated login was performed.
- [`docs/GUARDIAN-CAPABILITIES.md:3`](../../docs/GUARDIAN-CAPABILITIES.md) and its source [`scripts/render-guardian-capabilities.mjs:226,307`](../../scripts/render-guardian-capabilities.mjs) say no live login/private-record access occurred.
- [`docs/GUARDIAN-HA-BLOCKERS.md:11,49`](../../docs/GUARDIAN-HA-BLOCKERS.md) says there was no live login and that no live status-log response was used.

These are stale provenance/scope claims, not a disclosure of sample values. Update current-facing text to distinguish the earlier static/public work from the later, authorized read-only audit; retain the limits on server authorization, completeness, and side effects. Ensure regeneration does not reintroduce the stale statements.

## Checks and privacy disposition

- `node scripts/check-live-observations.mjs` passed and validated **15** type-only observations. Focused tests `tests/live-observations.test.mjs` and `tests/live-response-models.test.mjs` passed **6/6**. There are **34 test declarations** in the repository; the full suite was not run.
- Read-only inspection of the existing generated catalogs reports **298 research observations / 296 canonical operations**, **92 partial models / 189 unknown / 15 binary**. The live export has **15 unique labels**, represented by **14 sample-only models** and 15 model-label entries.
- The sample exporter contains only reviewed field names, shape/type descriptors, counts, generic Boolean comparison outcomes, and per-observation HTTP `200` / `application/json` metadata. The status/media metadata is explicitly contextual and does not enter the generated sample schemas. No actual sampled IDs, names, birth/date/address values, menu/event/diary contents, credentials, or cookies were found in the manually reviewed live-audit documents and generated sample artifacts. `Login2FA.status` is represented only by its observed type; no sampled application status value is published. Schema field names such as `idcode` and `fname` are names, not captured values.
- The validator checks the explicit redacted export; it does not read or scan a private-capture directory and is not a general PII detector. Numeric/UUID property names and extra/value-bearing shape keys are rejected. The current published shapes use static property paths, not dynamic ID-keyed maps; that remains a manual publication review boundary.
- `scripts/check.mjs` contains guards against `Observed_*` OpenAPI components, operation sample-response bindings, and unexpected API servers. No TypeSpec/OpenAPI compilation was run in this round, so emitted OpenAPI was not independently rechecked here.

No additional cosmetic findings. This is tooling/privacy only; the overall live-audit review loop remains subject to its existing four-round limit and two-consecutive-clean target.

# Live response-model tooling — initial code and privacy review

**Phase:** Pre-integration review of the sample-only live response-model tooling and artifacts. This is not a post-integration/final audit round or a whole-audit certification. I made no implementation or generated-file changes.

## Findings

### [P1] Catalog membership admits explicitly skipped live operations

[`scripts/generate.mjs:289-293`](../../scripts/generate.mjs) accepts any observation whose label resolves to an operation in the full research catalog. That is broader than this audit's approved sample set: [`GetGuardianDiary`](../live-audit/path-dispositions.json) is explicitly marked `skipped`, but a synthetic type-only observation named `GetGuardianDiary` is accepted by `makeLiveResponseModels` and generates an `Observed_GetGuardianDiary` model. The current checked-in sample export does not contain it, so this is a scope-guard defect, not an observed data leak.

The test for `UnmappedSample` only exercises a label absent from the entire operation catalog, so it does not cover a known-but-skipped operation. The 15-entry test currently asserts the count, not the exact approved observation-label set; replacing one expected label with a known skipped operation can pass the count. Tie generation/checking to the explicit sampled disposition and source identity (or an exact approved label set), and test that `GetGuardianDiary`, `GetDiaryData`, and `DownloadFoodmenuFile` are rejected while the approved 15 labels remain accepted.

### Privacy residual: structural key validation is not a PII detector

[`scripts/check-live-observations.mjs:42-47`](../../scripts/check-live-observations.mjs) rejects numeric and UUID property names, then applies a credential-pattern check, but accepts any other key matching the identifier regex. A synthetic object property named `Sponge` passes validation; a dynamic map whose keys happen to look like identifiers could therefore publish personal text as a supposed schema field. This is a demonstrated validator limitation, not an observed leak in the current artifact. The validator's own comment correctly describes it as structural validation rather than general PII detection. Keep dynamic/map-like keys out of published observations unless their schema-field status is independently reviewed; do not claim a generic PII detector.

## Checks that passed

- The checked-in observation export has `rawResponsesIncluded: false`; shape nodes contain only observed type descriptors and property names. I found no actual private scalar values, concrete dates, person names, IDs, credentials, cookies, or response bodies in the export or generated sample artifacts reviewed. Schema field names are present by design.
- `scripts/generate.mjs:249-283` maps null observations to `unknown`, maps conflicting observed types to `unknown`, merges object fields by name, and merges all array item shapes. Emitted object schemas are open and have no `required` list; empty arrays yield unconstrained/unknown item schemas. `GetDayMenu` is an open object with no asserted properties, not a complete empty-menu model. The real 2FA observation is represented as `status: string` and `locked_at: unknown`; no status value/code is stored.
- The generated artifacts exactly match an in-memory regeneration: **15 observation records, 14 sample-only operation models**. `scripts/observed-response-models.json` keeps root `x-normative: false`, observation labels, and context-only provenance; the TypeSpec remains in `Eliis.LiveObservations` without operation response bindings.
- Full read-only test run: `node --test tests/*.test.mjs` — **34 passed, 0 failed**. `node scripts/check-live-observations.mjs` validated 15 observations. TypeSpec compilation to `/tmp/opencode/eliis-live-final-review` succeeded. Its OpenAPI output has no `Observed_*` components and no sample-response bindings across the 14 sampled operations; `GetEvents` remains an array at the canonical HTTP body root as separately intended.

## Review disposition

**Not clean:** the skipped-operation acceptance needs a scope guard before integration. The prior 14-versus-15 fixture-count issue is resolved in the current snapshot and the full test suite passes. The current artifacts show no private scalar leak; retain the dynamic-key limitation as an explicit review boundary. No production generation or post-integration/final review loop was run.

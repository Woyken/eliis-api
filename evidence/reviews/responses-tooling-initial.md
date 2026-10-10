# Initial response-pipeline review

## Findings

### High — Three current response-analysis records fail the strict input schema

The read-only response-catalog audit found 298 response rows for 298 unique expected `(operationId, sourceFunctionId)` keys (296 canonical operations; no missing, extra, or duplicate keys), but only 295 rows pass `validateResponseAnalysis`.

- `evidence/responses/admin-shop.json:3` (`GetWorkSchedule/26549`) uses `items: {"type":"object", ...}` for both `employees` and nested `work_schedules`; the pipeline's item schema requires `kind`, as used by its fixtures. Validation stops at `GetWorkSchedule.employees[]` with `invalid response item shape/evidence`.
- `evidence/responses/admin-shop.json:12` (`Categories/26705`) likewise uses `items.type: "object"` instead of `items.kind` and fails at `Categories[]`.
- `evidence/responses/children-diary-files.json:378-416` (`GetChildProfile/25634`) declares `kind: "unknown"` while supplying an `active_courses` field. `scripts/generate.mjs:175-176` correctly rejects fields on non-object root kinds. Resolve the analysis to a supported partial object view or an unknown view with no fields; the generator must not silently discard the field.

This is an integration blocker for strict production generation, not a reason to relax validation. I did not run production generation. The direct read-only `makeResponseCatalog` call fails on the first malformed item above.

### Medium — OpenAPI checker accepts wrong response schema kinds and invented array constraints

`checkResponseProperties` in `scripts/check.mjs:68-83` verifies object properties/open-ness/optionality and scalar field types, but never asserts that root or nested object schemas have `type: object`. Its array checks (`scripts/check.mjs:52-62`, `78-81`, and root-array handling at `120-123`) assert `type: array` and validate items, but do not reject unproved constraints such as `minItems`.

I verified this against a compiled synthetic TypeSpec fixture: the unmodified document passed, and the checker still accepted mutations setting the root response object's type to `string`, adding `minItems: 1` to a nested array field, and adding `minItems: 1` to a root response array. These mutations contradict the declared response shape / no-invented-constraints contract. Add object-kind assertions and reject unproven standard object/array schema constraints; add mutation tests for root and nested cases.

## Checks that passed

- `npm test`: all 16 tests passed. Its response fixture compiled, including a root array response with object items.
- The response key audit confirms all 298 observations map uniquely to expected research rows and the catalog has 296 canonical operations.
- Alias shape/evidence conflicts remain unresolved rather than merged (`scripts/generate.mjs:208-229`); binary analyses with body fields are rejected (`:182`); modeled response wrappers use a default response and wildcard media (`:327-329`).
- Root-array aliases do not receive the same schema-local evidence decorators as root object models, but the full analysis—including item evidence—is retained in operation-level `x-static-response-evidence`, which `checkOpenApi` compares against the response catalog. This is not an evidence-loss finding.

## Scope

Read `AGENTS.md`, the response generator/checker/normalizer, TypeSpec entry point and response models, and response plus existing tests. Ran the normal test suite and read-only catalog/validation checks; synthetic compilation and checker mutations used a temporary fixture. No production artifacts were generated, and no files outside this review report were changed by this review.

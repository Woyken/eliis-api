# Tooling/spec-generation review — round 1

**Scope:** initial review of `scripts/*.mjs`, `tests/*.test.mjs`, generated TypeSpec, package/workflow configuration, and research-to-output consistency. No files other than this report were edited. No HTTP requests to Eliis were made.

**Gate:** not clean; this is explicitly an initial review, not the final two-clean gate. `npm test` passes (7/7), but `npm run check` stops in generation before compiling the production project. Extra coverage/model enrichments are not integrated yet.

## Findings

### [P1] Build is blocked by empty `source.functionName` values

- `evidence/research/coverage-extra.json:350-360` (`GetIdeaThumbnail`) and `:384-394` (`GetIdeaImage`) set `source.functionName` to `""`.
- `scripts/generate.mjs:52` requires a nonempty function name, so `npm run check` → `npm run build` → `npm run generate` fails with `coverage-extra.json: missing source evidence` before TypeSpec compilation or OpenAPI checks.
- **Reproduction:** `npm run check` (observed exit code 1). The other 292 research records have integer function IDs, but these two records violate the name requirement.
- **Minimal fix:** record a meaningful bytecode function name for function `#38716`, or use a consistent nonempty anonymous-function label supported by the research contract; then rerun the production build and review the newly generated diff.

### [P1] Unresolved `params` objects become a fabricated query parameter named `unknown`

- `scripts/generate.mjs:103-108` merges every `record.query` entry as a named field; `:165-168` renders even a `type: "unknown"` field as `@query <name>: string`.
- Existing generated examples include `routes/generated.tsp:189` (`DisapproveMap`) and the same `@query \`unknown\`` pattern at lines 925, 1001, 1017, 1218, 1233, 1262, 1305, 1348, 1363, 1379, 1395, 1411, and 1427. Their evidence says the entire `config.params` object is forwarded unchanged and its shape is unresolved; the literal name `unknown` is not observed.
- `scripts/check.mjs:44` derives the expected OpenAPI parameter list from that same placeholder, so the check currently endorses rather than catches the invented named parameter. `x-unresolved-query` at `generate.mjs:160-161` already provides the right place to retain the unresolved-shape evidence.
- **Minimal fix:** remove the placeholder query entries from research records and keep `query: []` plus `queryPassthrough: true`; render no named parameter for unresolved passthrough data, and have the OpenAPI checker assert that no synthetic `unknown` parameter appears.

### [P1] Generated OpenAPI encodes required server constraints despite evidence marking them unknown

- `scripts/generate.mjs:142-143` emits non-optional model properties whenever a field was present in the traced client construction. `:168` does the same for non-conditional query fields, and `:172` emits non-optional request bodies unless an alias omitted one. In TypeSpec these declarations generate OpenAPI `required` constraints (for object properties, query parameters, and request bodies).
- The neighboring extensions explicitly say “server requiredness unknown” / “serverValidation: unknown” (`generate.mjs:142,145,167,157,162`), but the emitted schema still has normative required flags. A locally populated object or a property copied into Axios params is evidence of client construction, not proof that the server requires it.
- `tests/generator.test.mjs:89-125` checks named properties and media types but never asserts that generated request schemas/parameters avoid unsupported `required: true` constraints; `scripts/check.mjs:20-30,43-49,53-61` likewise does not validate this.
- **Minimal fix:** preserve traced presence in the evidence extensions, but avoid emitting required constraints for server-facing request properties, query params, and bodies unless independent evidence establishes server requiredness. Add checker assertions over the corresponding OpenAPI `required`/`required` flags.

### [P2] Recorded constant query values are dropped from OpenAPI

- `evidence/research/coverage-extra.json:245-263` records the literal query values `guardianFields=false`, `landscape=false`, and `showApprovalsTable=true`; `:303-309` records `landscape=false`.
- The generator accepts and retains each field's `value` (`generate.mjs:34,78-79,108`), but query rendering at `:165-168` emits only the parameter name/type/evidence. There is no client-value extension, so the generated OpenAPI represents these fixed client URLs as arbitrary boolean query values.
- This is currently masked by the build blocker above; the existing TypeSpec snapshot predates `coverage-extra.json` and does not contain these download operations.
- **Minimal fix:** carry a clearly client-scoped constant-value extension into the OpenAPI parameter (do not use server defaults/enums), and add a production-record fixture asserting the literal survives generation.

### [P2] GitHub Pages YAML artifact bypasses multipart normalization

- `scripts/normalize-openapi.mjs:25-30` only reads and rewrites `tsp-output/@typespec/openapi3/openapi.json`.
- `.github/workflows/pages.yml:28-32` then runs a fresh raw `npx tsp compile .` with YAML output, after `npm run check` has normalized only JSON; lines 38-39 publish both files. Raw compile therefore bypasses `normalizeOpenApi`'s multipart media-type fix. The fixture asserts normalized multipart should be `{ "multipart/form-data": { "schema": {} } }` at `tests/generator.test.mjs:116-117`, while `normalize-openapi.mjs:6-10` documents that raw TypeSpec output is not the normalized artifact.
- **Minimal fix:** normalize the YAML artifact too, or generate YAML from the already-normalized JSON without rerunning the raw emitter; validate the published YAML's multipart request bodies in CI.

## Checks and consistency notes

- `npm test`: passed, 7 tests; the integration case exercises synthetic fixtures (10 records / 8 operations), not the full research set.
- `npm run check`: failed during generation as described above; the production TypeSpec compile, OpenAPI validation, and `npm run build` completion were not reached.
- Research files currently contain 294 records. The checked-in `scripts/operation-catalog.json` is from an earlier 283-record / 281-operation snapshot, and generated TypeSpec likewise does not yet include `coverage-extra.json`. This follows from the blocked generator and must be regenerated/reviewed after the source-name issue is fixed; it is not evidence that the new coverage is integrated.
- `evidence/inventory.json` has 283 unique candidates. The research set references all of them and has 8 additional function IDs (some produce multiple route variants); generated coverage currently reports 283 covered and zero additional IDs because it too is stale. Recheck the regenerated coverage artifact and source-to-operation mapping after successful generation.
- No conclusion is made here that the additional download/image operations are semantically wrong; their output cannot yet be checked against a successful production compile. Auth, unresolved response/default-response, and opaque multipart behavior were reviewed at the tooling/evidence level; the main uncovered problems are the findings above.

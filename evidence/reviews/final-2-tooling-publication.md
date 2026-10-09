# Final review run 2 — tooling and publication

**Result: NOT CLEAN — 1 concrete publication blocker.** The initial global
zero-finding conclusion is retracted by the targeted run-2 verification below.

Reviewed on 2026-10-09 against snapshot
`330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`.
This is an independent second-pass review; the five run-1 reports were not used
as verification inputs and were not changed. Only this report was written.

## Targeted run-2 finding — build token lacks Pages read permission

**Location:** `.github/workflows/pages.yml:8–9,16–18,38,43–48`.
The build job inherits only the explicit workflow-level `contents: read`, yet
executes `actions/configure-pages@v5`. The deploy job's `pages: write` permission
applies only to that separate job; it cannot authorize the build job.

Official evidence checked during this bounded follow-up:

1. [`configure-pages@v5/action.yml`](https://github.com/actions/configure-pages/blob/v5/action.yml)
   defaults its `token` input to `${{ github.token }}` and `enablement` to
   `false`. This workflow supplies no alternate token.
2. [`configure-pages@v5/src/api-client.js`](https://github.com/actions/configure-pages/blob/v5/src/api-client.js)
   constructs authenticated Octokit with that token and calls
   `octokit.rest.repos.getPages({owner, repo})`. `findOrCreatePagesSite` rethrows
   lookup failure when enablement is false. An already-enabled site does not
   bypass this API lookup.
3. GitHub's [GitHub App permission table, repository Pages permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps#repository-permissions-for-pages)
   explicitly lists `GET /repos/{owner}/{repo}/pages` as requiring Pages **read**
   for installation access tokens (`IAT`). The [fine-grained PAT table](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens#repository-permissions-for-pages)
   independently lists that same Pages/read requirement.
4. GitHub's [workflow permissions documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
   states that once any permission is explicitly specified, unspecified
   permissions are set to `none`, and job-level grants apply within that job.
   Thus the build token has Pages `none`, not Pages `read`.

**Impact:** the required configure-pages lookup is unauthorized for the build
job's token, blocking artifact upload and the dependent deployment. The parent
reported an already-enabled workflow-backed site (owner OAuth lookup HTTP 200)
and anonymous lookup HTTP 404. Those observations are parent-provided context,
not requests repeated here; a public repository/site does not provide evidence
of a permission-free configuration lookup. No actual restricted-token workflow
execution was performed in this review; the finding follows from the official
action call and documented token/API permissions.

**Minimal fix, for the parent to apply:** add only these permissions to
`jobs.build`:

```yaml
permissions:
  contents: read
  pages: read
```

No build-job `pages: write`, `id-token: write`, alternate credential, or site
enablement is needed for this already-configured site's read-only lookup.
The workflow was not edited: reviewer ownership remains limited to this report.
This is a targeted verification within run 2, not another full review round.
The API projection findings and measured counts below are unchanged.

## Independent projection and measured counts

Read `AGENTS.md` and all five research JSON files. Used separate, read-only Node
assertions, not `scripts/check.mjs` or the project tests, to reconstruct global
path slots, verb/path grouping, alias ordering, operation-ID disambiguation,
parameter observations, query merging, and body compatibility. The reconstructed
catalog exactly matched every record and field in
`scripts/operation-catalog.json`; its full verb/path set matched actual OpenAPI.

Then independently checked every operation and recursively checked every emitted
field-model tree against that reconciled projection in actual OpenAPI JSON,
parsed YAML, `routes/generated.tsp`, and `models/generated.tsp`. Assertions
compared exact property names, scalar/item/reference shapes, original field
observations, construction evidence, client-presence labels, and observed values.
The emitter's single-reference `allOf` representation was treated as a reference,
not as an additional invented object. No generator, compiler, installation, or
build was run; the existing normalized artifacts were inspected.

| Measured item | Count |
| --- | ---: |
| Research JSON files | 5 |
| Research operation records | 298 |
| Canonical OpenAPI operations | 296 |
| Named query parameters | 84 |
| Request bodies | 109 |
| Unknown forwarded bodies | 63 |
| Object request bodies | 34 |
| Multipart request bodies | 12 |
| Top-level named body schemas | 46 |
| Nested body schemas | 9 |
| Object-query schemas | 1 |
| Total emitted field models | 56 |
| Named body-model fields, recursively | 209 |
| Named object-query model fields | 3 |
| Total named model fields | 212 |
| Preserved caller variants | 38 |
| Covered baseline inventory functions | 283 |
| Unique research source functions | 291 |
| Missing / excluded baseline functions | 0 / 0 |

The eight additional source functions are `34111`, `35188`, `37318`, `37887`,
`40704`, `41207`, `44191`, and `44291`. Baseline coverage was independently
computed from source function IDs, not inferred from operation counts.

## Generator, models, and serialization

- Reviewed `scripts/generate.mjs`, `scripts/normalize-openapi.mjs`,
  `scripts/check.mjs`, fixtures, and tests. Global route canonicalization runs
  before verb-specific grouping. Four file-route families have 11 operations
  using neutral `pathValueN` slots; original filename versus record-ID paths,
  parameter observations, and slot order remain intact in evidence.
- The two alias groups preserve all 298 source records, including two distinct
  functions sharing `GetUserTargetGroups`. Incompatible query/body constructions
  are not fused into a fabricated schema. Stable lexical/source/path ordering
  was inspected and independently reproduced. A supplementary read-only
  `makeCatalog` call on reversed production records matched the catalog exactly
  without mutating research records; `generate` was not called.
- Every representative root, nested object, and nested array-item field-source
  tree matches its original research observations recursively. All 56 models
  are open; fields and query/body inputs do not assert server requiredness.
  Client constants remain evidence extensions, not enums or defaults. A separate
  normative-tree scan found no invented enum, default, constant, nullable type,
  closed object, or required model-property list. Path requiredness is only the
  required OpenAPI transport slot. Original app-field opcode interpretation is
  the parallel domain reviewers' scope, not a claim inferred from compilation.
- Literal repeated multipart names, including `categories[]`, `age_groups[]`,
  and `files[]`, remain exact literal fields with unconstrained items. Dynamic
  names remain caller-variant metadata, not named wire properties. Native file
  descriptors are not expanded into an invented multipart field tree. All 38
  variants match exactly in research, catalog, TypeSpec extensions, and OpenAPI.
- All 12 multipart operations retain `multipart/form-data`; no part `encoding`
  or guessed part media types are emitted. All 63 unknown forwarded request
  bodies use `*/*` with `{}` schemas. All 34 traced top-level object bodies retain
  JSON serialization. All 296 responses have only `default`, media `*/*`, and an
  unconstrained `{}` schema, with unresolved status/media/body evidence; no
  success/error wrapper or observed-sample response contract is invented.
- Independently read original `eliis.hasm` for logout #16323, initialization
  #16344, and the effective Axios serializer chain #5683 → #5681 → #5669,
  #5674/#5677, #5666/#5667. Logout passes the platform object without
  `JSON.stringify`; the default `dots=false` recursive serializer produces
  bracketed keys. Its one logical query parameter is correctly represented as
  `deepObject` with `explode: true`. `GetUserData` instead stringifies its
  platform construction at +0x57 and remains one string query parameter;
  nested construction metadata does not become extra query parameters.

## Authentication, provenance, and publication

- Actual OpenAPI has only `https://api.eliis.eu` as its API server, not the Pages
  origin. Original #6017 and #5603 confirm the production URL and native-version
  `App-version` setup. Cookie/NoAuth annotations match every research record;
  `x-auth-evidence.serverRequirement` remains `unknown`. The sole security scheme
  is the `eliis_csrf` cookie API key; no Bearer scheme is invented.
- Rehashed the original local APK, HBC, and XAPK: all three SHA-256 values match
  inventory/provenance and the published source descriptions. The recorded
  language-list observation is explicitly one unauthenticated public sample,
  not a universal status/schema/enum/default. No Eliis API request was made.
- Reviewed `README.md`, `AUTH.md`, `EVIDENCE.md`, `main.tsp`, and the viewer.
  Their client-observation, unknown-shape, auth, source, live-check, and
  publication claims agree with the reviewed artifacts and local findings.
- Reviewed all 49 currently staged files, including their staged contents.
  No APK/XAPK/HBC, full raw Java/disassembly, `node_modules`, generated compiler
  output, private keys, credentials, or runtime generated-fixture directories
  are staged. Secret-signature and cookie/password inspection found no actual
  secret; the cookie example is redacted and password occurrences are evidence
  descriptions. Authored synthetic test fixtures are not runtime/private data.
- The Pages artifact steps build and verify normalized artifacts, then copy JSON and
  YAML from that same normalized output into the static publication directory.
  Parsed YAML equals JSON exactly. Raw compiler artifacts are not published in
  place of normalization. Neither workflow contacts the Eliis API. Successful
  publication is nevertheless blocked by the build-token permission finding
  above; artifact correctness alone does not establish workflow executability.
- The viewer loads the same-origin specification, disables submission methods
  and Try It Out, disables authorization persistence and remote validation,
  and has CSP `connect-src 'self'` and `form-action 'none'`.
- The lockfile retains the patched `undici` version `7.29.1` through the explicit
  override. A read-only `npm audit --json` returned **0 vulnerabilities**.
  Parent-owned test/check reruns remain separate from this review.

## Immutability and inspected artifacts

All 36 snapshot input-file hashes matched before inspection and again after the
read-only checks. All 36 corresponding staged blobs also matched those hashes.
No source/research/generated input was rewritten, and no run-1 report changed.

Inspected normalized artifact SHA-256 values:

- JSON: `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`
- YAML: `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0`

**Concrete findings requiring changes: 1 — build-job Pages read permission.**
The prior global clean/zero-finding claim is withdrawn. No API/source/model
finding was added, and no source input was changed.

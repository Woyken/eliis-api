# Final review RUN3 — complete bounded review

**Result: CLEAN — 0 new findings; both RUN2 findings resolved.**

Reviewed 2026-10-09 against frozen input digest
`b4c599463abc3355ba8051a5c12b038bbd84fdfbeea2ba398f68325f0bf5efdd`.
This is **one complete RUN3**, covering all domains, tooling, projection and
publication through hash-backed reuse of unchanged original-source certifications
plus fresh verification of the changes and the entire current output projection.
It is not another APK discovery cycle, a claim of independently rereading every
unchanged opcode in this run, or a complete server-contract certification.

Only this report was authored. No production generation/build/install, frozen-input
edit, Git mutation, Eliis network request, authentication, private-record access,
or API write was performed. Read-only Git inspection used the known old index as
a comparison input, not as the current publication revision.

## Integrity and justified reuse of original-source review

Read `AGENTS.md`, the current snapshot, the retained
`round-1-2-input-snapshot.json`, and the five complete RUN2 scope reports.
Independently hashed every current snapshot file: **36/36 match**. Recomputed
the aggregate using SHA-256 of the sorted JSON file/hash mapping: it matches the
current digest. Comparing the two snapshot mappings gives **32 unchanged files
and exactly four changed files**, listed below.

For each changed file, fetched its old index blob and verified that blob's hash
against the retained RUN1/RUN2 snapshot before comparing content. The current
workflow is exactly the old workflow plus the three-line build-job permissions
block. Each other changed file is exactly the old file with
`state.diary.diary.entries` replaced by `state.diary.entries`; no other byte changed.
Thus reuse is based on file/content identity, not the earlier clean verdict alone.

| Changed input | Current SHA-256 | Exact effect |
| --- | --- | --- |
| `.github/workflows/pages.yml` | `d07560a172566407b3a97f2c85c657894d035d74309430017998093c35e56e1a` | Build grants contents/read and Pages/read |
| `evidence/research/children-diary-files.json` | `b1417a4c0f2711faaebac0054531aeb5973772c840c823506f522274a1517d00` | One variant evidence sentence corrected |
| `routes/generated.tsp` | `dd3284d6b3318b81aab78c1464457032bd302b381ed12c4659e5de51dece3768` | Same evidence correction in two extensions |
| `scripts/operation-catalog.json` | `2b3d9eabc126e73bb235cfeb4ae78c83b3650832cbdfb1bae0c97140fa18df39` | Same variant evidence correction |

The other 32 input hashes remain exactly those in the retained old snapshot:
all four other research JSON files, all research notes, inventory/provenance/public
sample/enrichment JSON, `models/generated.tsp`, `main.tsp`, tooling/tests/lockfile,
CI, viewer and project documentation. In particular, `models/generated.tsp`
remains `90c00b29b7b85062de15f4970843cf0707cbe271028406d208965512b1b403a0`.
The two supplementary enrichment Markdown files, outside the 36-file snapshot,
also match their old index blobs byte-for-byte:

- `evidence/multipart-field-enrichment.md`: `f662dabab6e98a1a319d52ea61e84951d31220b154faf356c2ed35dfe8441471`.
- `evidence/request-model-enrichment.md`: `8abd4a08ce806ea09533ac6f3515a16046bcf5a0bf631e120cba70efa3c323e5`.

Freshly hashed the original source authorities; all match the recorded RUN2 hashes:

| Local original authority | SHA-256 |
| --- | --- |
| `eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| `decompiled/sources/com/rnfs/RNFSManager.java` | `89181c13740431ca796f364b1a5379deeaf592a6c79ffb726ce37d8b7463036b` |
| `decompiled/sources/com/rnfs/Downloader.java` | `2eb4e79b523e7a0411b38c272f456bd8d29784fcdff14a4a3d4a0885a17e70bf` |

These authorities are under `/data/data/com.termux/files/home/eliis-analysis/`.
Additionally checked **all 298** research source ID/name/header-line triples
against the original HASM headers, not a string index.

| Full domain scope carried forward by identical contracts/source hashes | Records | Detailed original-source certification |
| --- | ---: | --- |
| Authentication/common | 41 | [RUN2 auth/common and communications](final-2-auth-communications.md) |
| Communications | 68 | [RUN2 auth/common and communications](final-2-auth-communications.md) |
| Children, diary and files | 95 | [RUN2 children](final-2-children.md), with C2-01 independently resolved below |
| Administration and shop | 79 | [RUN2 admin/shop](final-2-admin-shop.md) |
| Additional downloads/coverage | 15 | [RUN2 coverage](final-2-coverage.md) |
| Tooling/publication | All records/operations | [RUN2 tooling/publication](final-2-tooling-publication.md), with Pages finding independently resolved below |

The retained RUN1 reports provide the earlier complete review history. The
unchanged RUN2 register/constructor/field certifications remain applicable because
the original authorities and all contracts are identical; the only changed
source assertion was separately retraced. No unknown forwarded payload, unseen
caller, renderer method, response shape or server behavior was filled by inference.

## Resolution of the two exact RUN2 findings

### C2-01 — bulk-status entries chain

Independently reopened original **#25851**, header line **1010561**, offset
`0x005faba5`, and read its construction and nested callbacks:

- `+0x6d`: `Call1 r3, r4, r3` obtains fresh state from getState.
- `+0x71`: reads `diary` into r3, yielding `state.diary`.
- `+0x76`: reads `entries` from r3 into r5, yielding **`state.diary.entries`**.
- `+0x7b–+0x85`: filters that array with #25852, whose `+0x03` reads `required_day`.
- `+0x8a–+0x94`: maps it with #25853, reading `child` then `id` at `+0x03/+0x08`.
- `+0xb2` assigns mapped array as `children`; `+0xbd` assigns captured `status`;
  `+0xc1` supplies the fresh body to the service call.

The preceding `+0x5a–+0x68` diary-ID chain really does read `state.diary.diary.id`;
it is separate and does not add a second `diary` to the entries chain.
Original **#25957**, header **1013342**, loads p1/p2 into the kindergarten/diary
URL, p3 at `+0x35`, and passes it as Axios PUT data at `+0x38`; #25958 returns data.
The module/service linkage is the unchanged original-source certification.

The current variant sentence is correct and propagated into catalog, TypeSpec,
and both current OpenAPI formats. No stale entries sentence remains there.
`children: unknown[]`, `status: unknown`, body openness/completeness, route,
requiredness and response remain unchanged. **C2-01 resolved, evidence-only.**

### Pages build-job token permission

Independently inspected official action sources and GitHub permission documentation:

1. [configure-pages v5 action.yml](https://github.com/actions/configure-pages/blob/v5/action.yml)
   defaults token to `github.token` and enablement to false. This workflow supplies
   neither an alternate token nor enablement.
2. [configure-pages v5 api-client.js](https://github.com/actions/configure-pages/blob/v5/src/api-client.js)
   authenticates Octokit with that token and calls `repos.getPages`; a failed
   lookup is rethrown when enablement is false. An existing site still needs lookup.
3. [Official GitHub App Pages permission table](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps#repository-permissions-for-pages)
   lists `GET /repos/{owner}/{repo}/pages` as **Pages/read**, including IAT tokens.
4. [Workflow permissions rules](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
   apply job grants within that job, and set unspecified permissions to none.
5. [deploy-pages v4 documentation](https://github.com/actions/deploy-pages/blob/v4/README.md)
   requires deployment-job Pages/write and id-token/write, and documents the
   dependent build/artifact and github-pages environment arrangement.

Current `.github/workflows/pages.yml:18–20` gives the **build** token exactly
`contents: read` and `pages: read`. Deployment remains a separate dependent job
with exactly `pages: write` and `id-token: write`. The build receives no Pages
write or OIDC grant; deployment permissions are not mistakenly relied upon for
the build lookup. The documented authorization blocker is fixed at least scope.
This assumes the site's previously configured Actions source as reported by the
parent; no authenticated GitHub API call or hosted deployment was executed here.
**RUN2 Pages finding resolved.**

## Independent current global projection audit

Used separate inline read-only assertions, without importing generator/check
logic, to compare all research records with method/template groups, catalog and
actual OpenAPI. YAML parses deeply equal to JSON. The current catalog is deeply
equal to the verified old catalog after only the exact sentence replacement;
independently removing `evidence` keys also yields complete deep equality. Thus
**all 296 contracts, types, fields, values and other metadata are unchanged**.

Fresh checks covered every operation, source record/alias, ordered path slot and
observation, named query and its observations, request/response placement and
media, auth evidence/security, variants, nested schema field trees, field-source
observations, scalar/array types, client constants and client-presence metadata.
Existing TypeSpec contains 296 operations/56 models; exact old/new TypeSpec
comparison limits its change to the two evidence copies, preserving the earlier
full TypeSpec property/signature certification rather than inferring it from counts.

| Independently measured surface | Count |
| --- | ---: |
| Research records / canonical operations | **298 / 296** |
| Named queries / client-request variants | **84 / 38** |
| Request bodies | **109** |
| Unknown forwarded / object / multipart bodies | **63 / 34 / 12** |
| Emitted field models | **56** |
| Named properties, including nested bodies and object query | **212** |
| Body properties / object-query properties | **209 / 3** |
| Covered baseline functions / missing / excluded | **283 / 0 / 0** |
| Distinct representative source functions / additional IDs | **291 / 8** |

The extra representatives are **34111, 35188, 37318, 37887, 40704, 41207, 44191,
44291**. Two and only two alias groups explain 298→296: folder GET sources
#26143/#26270, and available target-groups GET sources #16369/#26155. Every full
raw record survives; same alias name on distinct sources does not erase a source.
Four filename/ID route families retain neutral path slots, original per-verb
parameter names/evidence and argument order without claiming filename equals ID.

All models remain open with no required-property lists; all query/body inputs
leave server requiredness unknown. Unknown bodies remain unconstrained wildcard
requests, traced objects JSON, multipart multipart/form-data without guessed
part encoding/MIME. Dynamic multipart names stay variant metadata, not invented
named properties; literal repeated part spellings remain exact. No synthetic
header, unknown query placeholder, native descriptor field expansion, server
enum/default/const/nullability/closed-object or inferred validation appeared.
All 296 responses remain only default + wildcard + unknown schema, without
universal success/error or pagination models.

The sole API server remains `https://api.eliis.eu`; the sole security scheme is
cookie API key `eliis_csrf`, not Bearer. Logout's logical platform query remains
deepObject/explode; GetUserData's JSON-stringified platform remains one string
query. Original serializer/root/auth proof is carried forward by identical hashes,
not recomputed from labels or transport strings.

## Tooling, publication, privacy and executed checks

- **`npm test`: 12/12 passed**, including deterministic generation, validation,
  route/source retention, query/multipart regressions and synthetic fixture
  compiler/normalizer integration. The permitted tests generate/compile only
  isolated temporary synthetic fixtures, removed by their cleanup; production
  inputs/artifacts were not rebuilt or rewritten.
- **`node scripts/check.mjs`: passed**, validating 296 operations in both formats
  and 283 covered baseline functions, zero missing/excluded. Deliberately did
  not invoke `npm run check`, which would rebuild frozen production inputs.
- **`npm audit --json`: 0 vulnerabilities**, independently rerun against the
  current unchanged lockfile. Registry audit traffic is not Eliis API traffic.
- Parent-reported current full generation/build/check and production compiler
  success are coordinating evidence, not a claim that this reviewer reran them.
  Tooling/test source and lockfile hashes remain those already fully reviewed.
- Scanned the actual **61-file worktree publication-candidate set**, using
  tracked plus nonignored untracked paths and **current worktree contents**, not
  the known outdated staged contents. No APK/XAPK/HBC/HASM, full raw disassembly,
  decompiled source, dependency/compiler/dist tree, generated fixture, private
  key, credential-token signature or unredacted session-cookie signature found.
  Cookie examples remain redacted; password field names/evidence are not secrets.
  This report adds one authored Markdown file to that candidate set.
- Reopened CI, Pages workflow, viewer, main TypeSpec, auth and evidence notes;
  unchanged documentation/public-sample claims retain the previous publication
  certification. No workflow contacts Eliis. Artifact steps verify normalized
  JSON/YAML and copy exactly those artifacts plus viewer and `.nojekyll`, not
  original research sources. Viewer submissions/Try It Out/auth persistence and
  remote validation are disabled, with self-only connections and no form actions.
- The old staged revision and historical review/status text are known parent-owned
  finalization inputs, not silently certified as the new snapshot or a current
  two-clean-run gate result. No index/status-history mutation was made here.

Current normalized artifacts inspected, not regenerated:

| Artifact | SHA-256 |
| --- | --- |
| `tsp-output/@typespec/openapi3/openapi.json` | `891d36ecdf39e0e7187b08b48166dec69562523cdfa2c0ded4303851496a17f0` |
| `tsp-output/@typespec/openapi3/openapi.yaml` | `5e5128f569ce05b08de7f97f857935d66c41a97c47995a7991470f2892e74a7d` |

## Bounded disposition

**0 new concrete findings. All domains and tooling/publication covered. Both exact
RUN2 corrections are verified; no API schema change occurred.** End-of-review
checks confirm the same 36 input hashes and artifact hashes. RUN2's findings reset
the clean streak; this is the **first complete clean run after those fixes**, not
two clean runs and not permission to exceed the user's MAX4 budget. The parent
owns any remaining gate accounting/final staging. No further discovery, fixes,
cosmetic work or review cycle was initiated.

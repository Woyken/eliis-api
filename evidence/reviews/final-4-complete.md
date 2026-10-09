# Final review RUN4 — complete bounded review

**Result: CLEAN — 0 new concrete findings. Both previously identified corrections remain resolved.**

Reviewed 2026-10-09 against frozen input snapshot
`b4c599463abc3355ba8051a5c12b038bbd84fdfbeea2ba398f68325f0bf5efdd`.
This is the bounded fourth and final review run. It reuses original-source
certifications only where both their source authorities and the reviewed
contracts are hash-preserved, and independently checks the current 298-record
catalog-to-OpenAPI projection. It is not a claim of a complete server contract.

Only this report was authored. No production generation, build, dependency
installation, test-fixture execution, Git mutation, frozen-input edit, Eliis
request, login, private-record access, or API write was performed. The only
executed project check was the read-only `node scripts/check.mjs`.

## Snapshot and source integrity

Read `AGENTS.md`, the current 36-file snapshot, the retained old snapshot, and
the RUN1–RUN3 reports. Independently hashed the current contents of all **36/36**
snapshot files; every hash equals the current manifest. The frozen manifest SHA
before and after this review remains
`b4c599463abc3355ba8051a5c12b038bbd84fdfbeea2ba398f68325f0bf5efdd`.

Comparing current and old per-file maps yields **32 unchanged files and exactly
four changed files**. For each changed file, the old index blob was hashed and
matched to its old-snapshot entry before content comparison. The exact deltas:

| Changed input | Current SHA-256 | Verified change only |
| --- | --- | --- |
| `.github/workflows/pages.yml` | `d07560a172566407b3a97f2c85c657894d035d74309430017998093c35e56e1a` | Build-job `contents: read` and `pages: read` permission block added. Removing that block reproduces the old blob byte-for-byte. |
| `evidence/research/children-diary-files.json` | `b1417a4c0f2711faaebac0054531aeb5973772c840c823506f522274a1517d00` | The bulk-status variant evidence sentence changes only `state.diary.diary.entries` to `state.diary.entries`. |
| `routes/generated.tsp` | `dd3284d6b3318b81aab78c1464457032bd302b381ed12c4659e5de51dece3768` | Same exact evidence-string replacement. |
| `scripts/operation-catalog.json` | `2b3d9eabc126e73bb235cfeb4ae78c83b3650832cbdfb1bae0c97140fa18df39` | Same exact evidence-string replacement. |

The changed research JSON and catalog are deeply equal to their prior versions
when evidence prose is excluded; the source records, route, methods, parameter
names/types, query/body/response/auth contracts, fields, and client values are
unchanged. The other 32 manifest files—including all other research, models,
generator/checker/tests, lockfile, viewer and documentation—remain byte-identical.

The original authorities remain byte-identical to the accepted prior reviews:

| Local source authority | SHA-256 |
| --- | --- |
| `eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| `decompiled/sources/com/rnfs/RNFSManager.java` | `89181c13740431ca796f364b1a5379deeaf592a6c79ffb726ce37d8b7463036b` |
| `decompiled/sources/com/rnfs/Downloader.java` | `2eb4e79b523e7a0411b38c272f456bd8d29784fcdff14a4a3d4a0885a17e70bf` |

All **298/298** research source `(functionId, functionName, header line)` triples
were additionally checked against actual original HASM function headers in this
run: zero mismatches. The records contain 291 distinct source IDs. This source
identity, plus the complete unchanged non-evidence projection, is the basis for
carrying forward the prior raw-source traces rather than treating earlier
verdicts as proof by themselves.

| Retained full domain certification | Records | Prior complete review |
| --- | ---: | --- |
| Authentication/common | 41 | [RUN2 auth/common and communications](final-2-auth-communications.md) |
| Communications | 68 | [RUN2 auth/common and communications](final-2-auth-communications.md) |
| Children, diary and files | 95 | [RUN2 children](final-2-children.md), with the exact correction re-read below |
| Administration and shop | 79 | [RUN2 admin/shop](final-2-admin-shop.md) |
| Additional downloads and coverage | 15 | [RUN2 coverage](final-2-coverage.md) |

## Bulk-status source correction

Re-read original `eliis.hasm` function **#25851**, header line **1010561**, at
offset `0x005faba5`, including its nested callbacks:

- `+0x6d` calls the captured `getState`, producing fresh state in `r3`.
- `+0x71` reads `diary` from that state; `+0x76` reads `entries` from `r3`.
  The array is therefore `state.diary.entries`.
- `+0x7b–+0x85` filters it using #25852, which reads `required_day` at `+0x03`.
- `+0x8a–+0x94` maps it using #25853, which reads `entry.child.id` at
  `+0x03/+0x08`.
- `+0xb2` places the mapped value under `children`; `+0xbd` places captured
  `status` in the body; `+0xc1` passes that body to the service call.

The earlier `+0x5a–+0x68` access chain is distinct: it reads
`state.diary.diary.id`. It does not add a second `diary` to the entries chain.
Original service #25957 (header line **1013342**) loads p1 and p2 into the
kindergarten/diary URL, passes p3 as Axios PUT data at `+0x38`, and #25958 returns
`response.data`. The correction is therefore evidence-only. No element type,
`child_ids` property, server-requiredness or response shape is inferred.

The corrected evidence is present in research, catalog and TypeSpec output; no
old `state.diary.diary.entries` assertion remains in the affected records.

## Independent current projection and publication checks

Rebuilt the research-record comparison read-only: flattened the current catalog's
embedded source records and compared their exact JSON multiset to all five current
research JSON arrays. **298/298 records match**, retaining aliases and source
observations. Independently enumerated current OpenAPI method/path/operationId
triples and compared them to all catalog operations. Parsed JSON and YAML are
deeply equal. The existing read-only checker then validated both representations
and their recursive schemas:

```text
node scripts/check.mjs
Validated 296 OpenAPI operations; 283 covered and 0 explicitly excluded inventory functions.
```

| Independently measured current projection | Count/result |
| --- | ---: |
| Research source records / canonical operations | **298 / 296** |
| Named query parameters / caller variants | **84 / 38** |
| Request bodies: unknown forwarded / object / multipart | **63 / 34 / 12** (109 total) |
| Component field models / named OpenAPI properties | **56 / 212** |
| Baseline source functions covered / missing / excluded | **283 / 0 / 0** |
| Distinct research source IDs | **291** |

All 296 responses remain `default`, `*/*`, unconstrained/unknown; request bodies
retain their documented unknown, JSON-object, or multipart serialization without
fabricated media/part encodings. Models remain open and no unproven server
requiredness, enum, default, nullability or response contract is added. The
current projection preserves the existing two source-alias groups and neutral
path slots; no source records are discarded by canonical operation grouping.

Rechecked the two subtle platform queries in the actual catalog and emitted JSON:
`Logout` remains one logical `platform` query with `deepObject` and `explode: true`
for the traced bracket-key serialization. `GetUserData` remains one scalar string
query with `JSON.stringify` encoding; its pre-serialization construction fields
do not become additional query parameters. Their operation evidence and schemas
are unchanged from the hash-preserved raw-source certification.

Inspected, but did not regenerate, normalized artifacts and generated model source:

| Artifact | SHA-256 |
| --- | --- |
| `tsp-output/@typespec/openapi3/openapi.json` | `891d36ecdf39e0e7187b08b48166dec69562523cdfa2c0ded4303851496a17f0` |
| `tsp-output/@typespec/openapi3/openapi.yaml` | `5e5128f569ce05b08de7f97f857935d66c41a97c47995a7991470f2892e74a7d` |
| `models/generated.tsp` | `90c00b29b7b85062de15f4970843cf0707cbe271028406d208965512b1b403a0` |

## Pages build permission resolution

Independently checked the actual official `actions/configure-pages@v5` sources
and current workflow rather than relying on the earlier issue description:

1. [`action.yml`](https://github.com/actions/configure-pages/blob/v5/action.yml)
   defaults `token` to `${{ github.token }}` and `enablement` to `false`; the
   workflow supplies neither an alternate token nor an enablement override.
2. [`src/index.js`](https://github.com/actions/configure-pages/blob/v5/src/index.js)
   calls `findOrCreatePagesSite`; [`src/api-client.js`](https://github.com/actions/configure-pages/blob/v5/src/api-client.js)
   implements `getPagesSite` using `octokit.rest.repos.getPages`. With
   enablement false, a failed GET is rethrown, even for an existing site.
3. GitHub's [Pages repository permission table](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps#repository-permissions-for-pages)
   lists `GET /repos/{owner}/{repo}/pages` as requiring **Pages/read** for
   installation access tokens.
4. The current [Pages workflow](../../.github/workflows/pages.yml) grants the
   build job `contents: read` and `pages: read`, so the lookup token has the
   necessary least-scope permissions in the job that actually performs it.
   Deployment is a separate dependent job with `pages: write` and
   `id-token: write`; those grants are not incorrectly relied upon by build.

The prior Pages finding is resolved. This review did not run a hosted workflow or
make an authenticated GitHub API request. The unchanged workflow uses Node 24 and
`npm ci`, verifies normalized JSON/YAML, and assembles publication from the
normalized artifacts plus the viewer; no Eliis endpoint is contacted.

## Privacy, checks, and bounded disposition

Freshly scanned the **62** current tracked plus nonignored, untracked publication
candidate paths before adding this report (**63 including this report**). Found no
APK/XAPK/HBC/HASM or compiled binary, `.env`, private-key material, or
token-shaped credential. Normalized OAS artifacts were separately hash-inspected
above. Prior unchanged viewer and
documentation review remains applicable: submissions/Try It Out, auth
persistence and remote validation are disabled, with self-only connections and
no form actions.

No generation, TypeSpec build, `npm ci`, `npm test`, package audit, workflow run,
or Eliis network call was performed. The checker did not write outputs. Closing
hash checks confirm **36/36 snapshot files still match**; JSON, YAML and model
hashes remain exactly as listed above. The only file authored in this final run
is `evidence/reviews/final-4-complete.md`.

**Final bounded result: zero new findings; both exact prior findings verified
resolved; no contract change. This completes the fourth and final review round.**

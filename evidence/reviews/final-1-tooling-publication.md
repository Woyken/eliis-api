# Final review run 1 — tooling and publication projection

**Outcome: clean — first of the two required consecutive full clean runs.** No current tooling, research-to-output projection, OpenAPI normalization, CI, or publication-boundary findings were identified in this assigned scope. A second complete clean run against the same frozen inputs is still required before publication.

**Reviewed input snapshot:** `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed` (2026-10-09). The read-only snapshot helper reported zero changed inputs before and after review. Only this report is authored by this reviewer. No generation/build/npm-ci/test command, HTTP request, login, private-record access, or write request was performed.

## Independent projection audit

I read the research JSON independently of `scripts/check.mjs`, compared the evidence records to the catalog and compiled JSON/YAML, and recursively checked each emitted parameter and named schema field against the frozen catalog/source observations. The checker/test suite was not treated as the evidence for this review.

| Area | Reviewed result |
|---|---|
| Research and operations | 5 JSON research files; **298 records → 296 operations**; all 298 source records retained in catalog and operation evidence. The two merged aliases are retained; independent route-template canonicalization yields the same 296 method/path keys and aliases as OpenAPI. |
| OpenAPI files and schemas | 253 paths, 56 schema components, **296/296 operations** in each format; YAML parses to the same document as JSON. No equivalent global path templates, unexpected route/path parameters, or fabricated empty-name placeholders. |
| Parameters and fields | All **84 named query parameters** checked; **212 recursive named-field occurrences** checked for exact names, source evidence, supported types, and client-observed values. No unsupported `required`, enum, default, nullability, closed-object, or extra-property constraint was found. |
| Bodies and media | **109 operations** have bodies. At source-record level: 189 absent, 63 forwarded-unknown, 34 object, and 12 multipart bodies. Unknown forwarded bodies remain unconstrained with `*/*`; traced object bodies retain JSON; known multipart bodies retain `multipart/form-data`, literal bracket-suffixed part names, and open remainders without fabricated descriptors or part encodings. Dynamic multipart patterns remain in client-variant metadata, not fixed schema fields. |
| Serialization and aliases | Logout's explicit Axios bracket serialization is projected as `deepObject`; the JSON-stringified platform in GetUserData (`/api/common/init`) remains a string query value rather than `deepObject`. All 38 client request variants are retained. Alias conflicts are left unresolved rather than combined into invented request models. |
| Responses and authentication | All **296** operations retain only a `default` response with wildcard media and an unconstrained body. Cookie classification is emitted as `eliis_csrf` cookie auth (295 operations); the one `none` classification remains unauthenticated. No Bearer scheme is emitted; auth evidence labels the cookie as observed client behavior and leaves server requirement unknown. |
| Coverage | All **283/283** inventory candidates are covered, with zero missing; 8 additional source function IDs are represented separately from inventory coverage. |

The independent projection check reported **zero mismatches**. Specifically, it found no missing/extra operation or alias; no extra or missing query/body field; no value/type drift; and no guessed request or response status/media/schema constraint. Honest unknown request/response shapes were not treated as omissions.

## Tooling, workflows, and publication

- `package.json` provides the declared generate, build, check, and test scripts. The checker validates the production server `https://api.eliis.eu`, JSON/YAML parity, exact operation and field projections, open unknown schemas, response defaults, auth shape, and complete inventory coverage.
- `scripts/normalize-openapi.mjs` normalizes both media formats from the same emitted JSON document. It preserves unknown forwarded request media as `*/*`, multipart as `multipart/form-data`, and only applies `deepObject` to explicitly marked Axios bracket encoding. The Pages workflow no longer bypasses normalization with a second raw YAML compile.
- CI and Pages use Node 24 and `npm ci`, then run check and tests and build. Pages additionally checks the normalized artifacts before copying exactly `docs/index.html`, normalized OpenAPI JSON/YAML, and `.nojekyll` into the artifact. Parent-run validation for this frozen snapshot is recorded as: **12 tests passed, full check passed, and `npm audit` reported zero vulnerabilities**; those commands were not rerun here per the frozen-review instruction.
- The static viewer disables submissions (`supportedSubmitMethods: []`, `tryItOutEnabled: false`), disables the external validator, and limits browser connections to self. The Pages artifact does not include source APK/Hermes inputs, credentials, or private records; repository ignore rules also exclude those inputs. Documentation calls the API unofficial/incomplete, identifies the actual API host, and distinguishes the single recorded public language-list observation from untested login/write routes.
- Prior round-one findings are retained as review history, not treated as current blockers. Their previously noted tooling/publication projection issues (anonymous source names, synthetic `unknown` query names, unmodeled constants/requiredness, stale coverage, and raw YAML publication) are absent from this frozen output. This review checks the current projection and publication path; bytecode accuracy remains the scope of the source/domain review reports and is not re-certified here.

## Gate status

**Assigned run-1 scope: clean.** No concrete findings. The parent coordinator certifies a complete run only after all domain scopes finish; publication remains gated on two consecutive complete clean reviews at the same specification/evidence input snapshot. Known limits remain intentional: this is a client-observed Eliis 2.69 description, not a complete server contract, and unknown server semantics/shapes remain unknown.

Coordinator clarification: corrected the operation name in the serialization summary (GetUserData/init, not Logout) and clarified that the clean count is global, not certified by this one scope. No reviewed specification/evidence input or generated contract changed.

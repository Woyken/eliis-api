# Final response review run 1 — tooling and downloads

**Result: clean in the assigned tooling/downloads scope; 0 concrete findings.** The prior integration findings in response validation and OpenAPI checking are corrected. This is one scope report, not a certification that every parallel domain review is clean or that the two-run global gate is complete.

## Frozen-input and execution boundary

Reviewed snapshot `6a6679d9949e549f74cdf3f160240e5a5f58681809cbeba03627c94ee12ad2ab` from `evidence/reviews/response-input-snapshot.json`. All **43/43** listed input-file SHA-256 values matched at the initial check and again after review. Only this report is authored here. I ran the read-only `node scripts/check.mjs` and called the exported response validators/catalog builder directly against inputs (without invoking `generate()`); I did not run generation, build, `npm test`/CI, `npm ci`, or Git write commands, and made no HTTP request, login, write request, or private-record access. Parent-provided validation says the 16-test suite (including synthetic TypeSpec compilation) passed; it was not rerun for this review.

## Response pipeline and generated projection

I inspected `scripts/generate.mjs`, `scripts/normalize-openapi.mjs`, `scripts/check.mjs`, `main.tsp`, `models/responses.tsp`, and `tests/response-models.test.mjs`. A separate read-only projection audit compared all five research JSON files, all five response-analysis JSON files, the response coverage catalog, and the actual normalized OpenAPI JSON/YAML:

| Measure | Result |
|---|---:|
| Research observations / unique response-analysis keys | **298 / 298** |
| Canonical operations / response dispositions | **296 / 296** |
| Partial models / unknown / opaque binary | **87 / 194 / 15** |
| Missing response observations | **0** |
| OpenAPI JSON/YAML parity | **Exact** |
| Operation-level response evidence vs coverage metadata | **Exact for all 296** |
| Recursive emitted response schemas vs analysis | **Matched for all modeled operations** |

`node scripts/check.mjs` independently passed: it validated all 296 operations and reports 87 partial response models plus 209 unknown/opaque dispositions (194 unknown and 15 binary). The independent audit also confirmed one default response with wildcard media for every operation; no extra status or guessed media type; and exact modeled property paths/types/evidence. Object schemas stay open with no required fields, unknown values/items remain unconstrained, and no enum/default/nullability or unproved object/array constraints appeared.

The projection does not silently lose nested proof: operation-level `x-static-response-evidence` retains the full analysis observations for every disposition and is checked against the coverage catalog. Object-root models additionally carry schema-level provenance; property-level evidence is retained on named fields. Root-array evidence stays operation-scoped; item-shape evidence is retained there, while named item-property evidence is also emitted on the generated fields. Alias evidence/shape conflicts resolve to `unknown` rather than a union or invented shared model. Response model names are separated from request model names; `models/generated.tsp` is unchanged from `HEAD` (`667ea62`). `main.tsp` imports the response models separately, leaving the prior request evidence/models intact.

The checker fixes identified in the initial tooling review are present: it rejects wrong root/nested object kinds and unproved object/array constraints, including root and nested array constraints. The synthetic mutation tests cover these regressions along with wrong root-array and array-item kinds. Normalization preserves the single default response and `*/*`; the emitted JSON and YAML were parsed and compared exactly. The missing-response-directory compatibility path is not masking the production result: the current response directory is present, generated coverage is strict, and the full 298/296 counts above pass.

The 194 `unknown` dispositions are honest unresolved views, not claims that the API has no fields; incomplete consumer coverage remains a stated limitation. No universal response wrapper, request-derived response fields, success/error contract, or server-complete DTO is introduced.

## Download response/source audit

All **15/15** download analyses in `evidence/responses/coverage-extra.json` match their research `operationId`/`sourceFunctionId`, use `kind: "binary"`, have no body fields, and remain incomplete. I checked all **19 unique Hermes trace coordinates** against the original `eliis.hasm`; each is within its cited function. The nine trace references identifying the actual RNFS call are continuation `Call2` instructions, not parent-function lines. This corrects the earlier attribution issue:

- The URL/options builders are traced separately from continuations that set the saved-cookie header and invoke `downloadFile` (for example #34111 → #34112, #37887 → #37888, #37318 → #37319, and #40704 → #40705).
- `DownloadPlanPdf` traces both primary #41207/#41208 and alias #41299/#41300 paths. `DownloadPlanFile` traces URL construction in #44303, shared options in #34111, and the actual call in #34112.
- `GetIdeaImage` covers only the conditional native fallback when `selectedMedia.url` is falsy: #35188 constructs fallback options and #35189 invokes RNFS. The remote-URL branch is explicitly outside this concrete operation.

The cited RNFS native code supports this boundary: `RNFSManager.java:779–792,842–844` maps `fromUrl` to the downloader source and starts the job; `Downloader.java:131–203` reads the HTTP input stream and writes its bytes to the destination file. `RNFSManager.java:801–805` resolves its promise with native `jobId`, `statusCode`, and `bytesWritten`; these are not HTTP-body fields and are correctly omitted. The analyses and generated contract do not guess response status, actual MIME type, or headers. PDF/XLS route labels, fallback image naming, and local `.pdf`/`.xlsx` filename suffixes are explicitly not treated as proof of server media type. The generated response remains default/wildcard and opaque.

## Gate status

**Assigned run-1 scope: clean; concrete findings: 0.** Static limitations remain intentional: these are partial client-observed response views, and download bytes are opaque. No changes to the specification, evidence, code, or generated artifacts are requested by this review.

Source attribution outside the download operations remains with the five assigned domain reviews; this report independently assesses their shared response pipeline and the download-source boundary.

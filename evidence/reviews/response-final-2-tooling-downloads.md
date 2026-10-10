# Final response review run 2 — tooling and downloads

**Assigned-scope result: clean; 0 concrete findings.** This report covers the
shared response pipeline and native-download boundary only. It does not certify
the other run-2 scopes or the full round; those reports must be received before
the coordinator declares any global result.

## Frozen inputs and review boundary

- Reviewed against `evidence/reviews/response-input-snapshot.json`, whose frozen
  input-set digest is
  `775c44ed5193f525bc997195950e44f26fb81abfcb063a3abbd9a6b43ae87c35`.
  All **43/43** listed file SHA-256 values matched before inspection and again
  after review. There were no missing or mismatched inputs. Review reports,
  including this output, are not among the 43 frozen inputs.
- The compiled artifacts were read directly from the absolute paths
  `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.json`
  and
  `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.yaml`.
  Their SHA-256 values are JSON
  `3cd3c67bcbd3d6e051ec1e13a45151a437a214ff93bfd6dba2a9596827d32526` and YAML
  `cc55d10f22b87b3f54e780c4d6d1863bf5d5ee6a5d133756d51c39e4d1657fb7`.
- I ran only the read-only `node scripts/check.mjs` plus an independent
  read-only Node audit that parsed both artifacts, compared JSON with parsed
  YAML, reconstructed research/response-analysis key associations, and
  recursively checked the emitted schemas against the frozen analysis and
  coverage data. I did not run tests, a build, generation, Git commands, npm
  audit, or HTTP requests; I did not access private records or edit any input.
  Parent-provided pre-freeze checks report successful TypeSpec compilation,
  normalized JSON/YAML checks, 16 passing tests, and zero audit vulnerabilities;
  those checks were not rerun here.

## Coverage and compiled response projection

| Measure | Independently verified |
|---|---:|
| Research observations / unique research keys | **298 / 298** |
| Response analyses / unique analysis keys | **298 / 298** |
| Canonical operations / dispositions | **296 / 296** |
| Partial static-derived models | **87** |
| Explicit unknown dispositions | **194** |
| Opaque binary download dispositions | **15** |
| Missing observations | **0** |
| Recursively emitted named response-field nodes | **347** |
| Alias shape/evidence conflicts retained as unknown | **2** |

The two conflicting aliases are `GetDocumentsFolderData` and
`GetUserTargetGroups`. Both retain their per-observation evidence and emit no
merged body model. The counts and scope language in `RESPONSE-MODELS.md` are
consistent with the current coverage: unknown/unresolved views are not proven
empty server responses, and the 87 modeled views are partial rather than a
server-complete response contract.

The independent audit found exact parsed parity between the normalized JSON and
YAML and verified all **296** operation projections. For each operation, the
compiled artifact preserves the matching response disposition and
`x-static-response-evidence`; named field paths, types, and each property's
`x-static-field-evidence` match recursively through nested objects, arrays, and
array items. Root response-array and object/item shapes are retained. The
two alias conflicts above remain unconstrained instead of being combined into
fabricated unions.

Every operation has only a `default` response, documentation media `*/*`, and
unresolved response status/media metadata. No numeric HTTP response status or
guessed actual HTTP media type is asserted. Modeled objects remain open
and all properties optional. Unknown properties/items remain unconstrained;
the recursive audit found no unproved object/array constraints such as
`minItems`, `maxItems`, `minProperties`, closed objects, enums, defaults, or
nullability.

Request provenance remains separate and intact: every compiled operation's
`x-evidence` and alias list match the frozen catalog records, including their
legacy `response: {kind: "unknown", ...}` evidence. The passing
`node scripts/check.mjs` additionally validated the 296-operation request
projection, including path/query parameters, body shapes, serialization and
auth annotations; it reports 283 covered inventory functions and zero missing
or explicitly excluded functions. `main.tsp` imports `models/generated.tsp`
and `models/responses.tsp` separately, and the OpenAPI projection carries the
static-derived response provenance under distinct `x-static-*` extensions.

The checker changes associated with this response expansion are present:
`scripts/check.mjs` requires evidence-backed object kinds and rejects unproved
schema constraints recursively. I inspected the synthetic mutations in
`tests/response-models.test.mjs:133-179`, covering incorrect root/nested object
and array-item kinds, root/nested array limits, and object constraints. Tests
were not rerun in this review; the 16-test result above is parent-provided.

## Download response/source audit

All **15/15** binary response records match their research `operationId` and
`sourceFunctionId`; each is `kind: "binary"`, has an empty `fields` array,
remains incomplete, and states its limitations. I checked all **33 trace
steps** against the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`:
their **19 unique function/line coordinates** are inside the cited function
blocks. Each of the **nine distinct RNFS call sites** is the continuation's
`Call2` instruction following the `downloadFile` load:

- #34112 at 1335297; #37888 at 1515794; #37319 at 1489830;
- #41208 at 1674327 and alias continuation #41300 at 1677659;
- #44192 at 1803207; #44292 at 1807700; #35189 at 1404496; and
  #40705 at 1648260.

`DownloadPlanFile` also traces #44303's URL construction (1808290-1808299) and
the shared options builder #34111 before #34112 invokes RNFS. `GetIdeaImage`
covers only the falsy-`selectedMedia.url` native fallback through #35188/#35189;
the remote-URL branch is explicitly outside that download operation.

The original decompiled RNFS implementation confirms the boundary:
`RNFSManager.java:779-792` maps `fromUrl`, `toFile`, and headers into
`DownloadParams`; `Downloader.java:64-74,131-203` opens the HTTP input stream
and copies bytes to the destination file. `RNFSManager.java:801-805` resolves
the RNFS promise with native `jobId`, `statusCode`, and `bytesWritten`. Those
values are native download-completion metadata, not HTTP-body fields, and are
correctly absent from all 15 analyses. No HTTP response status, actual MIME
type, response headers, JSON wrapper, or native metadata fields are inferred.
Route labels and local filename suffixes are not treated as MIME evidence.

## Run-2 status

**Tooling/downloads scope: 0 concrete findings.** The previous round's
continuation attribution corrections are present and verified against the
original source. This scope report does **not** certify round 2 as clean: the
parallel source-review scopes remain necessary, and the coordinator must wait
for them before recording a global outcome. Known partial-client-view and
unknown-server-contract limitations remain intentional. No specification,
evidence, test, or generated artifact changes are requested by this review.

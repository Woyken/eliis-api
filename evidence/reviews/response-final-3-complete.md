# Final response review — round 3, complete scope

**Result: CLEAN — 0 findings.** The round-2 source/trace findings are resolved.
This is one clean review after round 2, not two consecutive clean reviews; the
bounded process still needs one more clean review to satisfy the two-clean goal.

## Frozen inputs and review boundary

- Reviewed against `evidence/reviews/response-input-snapshot.json`, which
  declares input-set digest
  `b37c7606e0df696c6c2559f00ef357644c940af24251cf4011ce80a2d2c1b5b6`.
  All **43/43** listed file SHA-256 values matched before inspection and again
  after review; none were missing or mismatched.
- The original full disassembly
  `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` had SHA-256
  `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`, matching
  the source authority used by the preceding reviews.
- Compared the current manifest to
  `evidence/reviews/response-round-2-input-snapshot.json`: **37/43** inputs are
  byte-identical. The six changed paths are the three corrected response
  analyses (`admin-shop.json`, `auth-common.json`, `communications.json`), their
  `models/responses.tsp` and `routes/generated.tsp` projections, and
  `scripts/response-coverage.json`. The request research files, children/files
  analyses, and download analyses remain hash-identical to round 2. This allows
  the prior domain source certifications to carry forward for unchanged content;
  the six changed inputs and the entire current projection were checked here.
- Current compiled artifacts were read directly, not rebuilt:
  `tsp-output/@typespec/openapi3/openapi.json` SHA-256
  `fed11dafc72bc643ad54ca7982b0c3342f6d29605c32f88a4cd71935314a4cc3`, and
  `openapi.yaml` SHA-256
  `f84708600fe6b96bf25649d8d93d5d1d39b90ca3a510c28962d9bec436ae2748`.
- Ran only the permitted read-only `node scripts/check.mjs` and independent
  read-only integrity/source/projection assertions. The checker passed: **296**
  OpenAPI operations, **283** covered inventory functions, **0** explicitly
  excluded functions, **87** partial response models, and **209** unknown or
  opaque dispositions. I did not run tests, build, generation, Git commands,
  HTTP/API requests, login/write operations, or private-record access. Only this
  review report was authored.

## Complete coverage and projection audit

I matched every research observation to its static response analysis by
`operationId` and source function ID, checked service source lines against the
original disassembly function headers, and checked every trace coordinate
against its original function block. I also parsed both OpenAPI artifacts,
verified JSON/YAML structural parity, and recursively compared each modeled
response tree, property type and field-evidence extension with the response
coverage analysis.

| Measure | Independently verified |
|---|---:|
| Research observations / unique research keys | **298 / 298** |
| Response analyses / unique analysis keys | **298 / 298** |
| Canonical operations / dispositions | **296 / 296** |
| Partial static-derived response models | **87** |
| Explicit unknown dispositions | **194** |
| Opaque binary-download dispositions | **15** |
| Missing observations | **0** |
| Source function/header-line matches | **298 / 298** |
| Trace entries / invalid coordinates / missing functions | **1,392 / 0 / 0** |
| Recursively emitted named response-field nodes | **348** |
| OpenAPI operations / JSON-YAML parity | **296 / 296; equal** |

There are **350** named field nodes across the per-observation analyses; the
two additional nodes are the `subfolders` and `files` observations for
`GetFolderData #26143`. They are intentionally not emitted because that route
aliases `GetDocumentsFolderData #26270`, whose response body is unresolved.
The canonical operation remains unconstrained and retains both observations;
no fields are unioned or transferred. The other conflicting alias,
`GetUserTargetGroups`, likewise remains unknown. Thus the 87 emitted models are
partial client-observed views, not a complete server contract.

For all 296 operations, the emitted static-response evidence matches the
coverage entry, including the retained source observations for aliases. The
recursive schema comparison found exact emitted field paths, types, and
`x-static-field-evidence` values. Modeled objects are open and have no required
properties; unproved leaf values and unknown items remain unconstrained. Arrays
have no invented size constraints. No enum, default, nullability, closed-object
constraint, numeric status, or actual media type was added. Responses retain
only `default` plus documentation media `*/*`; response status/media remain
unknown. Unknown/conflicting and binary operations have unconstrained response
schemas.

The existing round-2 scope reports provide detailed original-source review for
unchanged model fields: `response-final-2-children-shop.md`,
`response-final-2-auth-communications.md`, and
`response-final-2-tooling-downloads.md`. I did not treat those reports alone as
proof of the round-2 fixes; I independently reopened the exact source paths
below.

## Round-2 findings independently resolved

### `UpdateMessage` — local assignment is not an HTTP response property

Service `#25227` chains `#25228`, which returns Axios `response.data`. Caller
`#25165` dispatches that fulfillment value unchanged. Reducer `#25141` assigns
the entire `action.data` value to a local message's `recipient_read` state slot
at original source lines 988065–988066; it does not read
`action.data.recipient_read`. The current analysis is explicitly `unknown` with
no fields. The independently sourced model therefore excludes the false
`recipient_read` field and the captured-state `unread_messages_count` value.

### `GetQuestionnaires` — body-root reads are present and conservative

Service `#26488` → `#26489` returns the Axios-unwrapped body; caller `#26466`
passes it to callback `#26467`, which dispatches the unchanged body. Reducer
`#26460` directly reads `action.data.current_page` and `action.data.data` in
its questionnaire-category branches (original lines 1027863–1027876,
1027899–1027912, and 1027935–1027948). The current analysis models exactly
those body-root properties as `unknown` under an open object. In particular,
the later concatenation does not prove that `data` is an array. The emitted
schema reflects both fields and no stale empty-unknown disposition.

### `GetUserKindergartenMenu` — `left` keeps its HTTP-body nesting

The original callback `#16355` first reads Axios `data` at source line 649664,
then reads `left` at **649665**. The current field citation uses 649665. The
property remains `left` on the HTTP response body (rather than being flattened),
and its compiled partial view agrees with the analysis.

### `Categories` — slug read is attributed to the callback

The original `#39931` creates and invokes callback `#39932`; the property read
of category-item `slug` is in `#39932`, not the closure creator. The current
trace includes both functions and the `[].slug` evidence names `#39932`. The
field remains `unknown`; no type or field-path change is warranted.

### `UserCart` and `UserOrders` — direct consumers are in the traces

- The cart trace now contains `#40168` for the provider-row `id` read,
  `#40173` for `delivery_fee` / `delivery_vatrate`, `#40174` for `sum`, and
  `#40175` for `delivery_fee` / `free_delivery_from`. Original bytecode confirms
  each property read in the cited helper/callback, beyond the row-forwarding
  point in `#40167`.
- The orders trace includes `#40214`, whose pagination helper directly reads
  response-derived `user_orders.last_page`. It is not attributed only to the
  screen entrypoint `#40204`.

The affected fields remain conservatively typed and optional; these fixes add
trace provenance, not server guarantees.

## Boundary checks: invoices, folder alias, and downloads

- `GetGuardianInvoices #25671` is correctly modeled with root `invoices`,
  `settings`, and `services` properties, all `unknown`. Callback `#25591` reads
  those from the response body. Reducer `#25684` also reads
  `invoices.current_page` and `invoices.data`; those nested reads remain
  evidence-only while the container and collection shape remain unresolved.
  The local settings access is not misattributed to the body, and no
  `last_page`, pagination wrapper, item schema, or other local metadata is
  invented or emitted.
- The same-path folder observations remain separate: `GetFolderData #26143`
  has source-backed `subfolders` / `files` reads and further nested reducer
  reads; `GetDocumentsFolderData #26270` has no traced body-property read in its
  caller path. The canonical response stays unknown rather than inheriting the
  former service's fields.
- All **15/15** unchanged native-download analyses remain `binary`, with empty
  field arrays and explicit limitations. The compiled responses remain
  unconstrained; RNFS job IDs, transfer status, and bytes-written metadata are
  not modeled as HTTP-body fields. The unchanged download scope retains the
  detailed round-2 source audit in `response-final-2-tooling-downloads.md`.

## Disposition

**Round 3 is clean: 0 concrete findings.** Coverage, field evidence, source
traces, aliases, and compiled response projection are consistent. The
partial/unknown limitations are intentional and remain documented; this review
does not certify a complete Eliis server response contract. This is the first
clean review after round 2 and must not be counted as two consecutive clean
reviews.

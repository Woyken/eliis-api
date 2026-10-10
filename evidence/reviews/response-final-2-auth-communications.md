# Final response review run 2 — Auth/common and Communications

## Outcome

**Not clean: three source-model/evidence findings.** The five round-one finding groups are now corrected: both URL labels, the Contacts continuation, the Poll caller/reducer chain, and the previously missing success-callback/reducer hops. The currently recorded inventory remains 41 Auth/common + 68 Communications records, 37 object dispositions + 72 unknown dispositions, and 47 + 51 recursive field nodes. Its generated projection is mechanically consistent, but the source check found one unsupported response field, two omitted response-body reads, and one off-by-one property-read citation. No fix was made; only this assigned report is written.

This is the assigned Auth/common and Communications review only. It is not a certification of all Eliis responses or a complete server contract.

## Frozen inputs, source, and compiled artifacts

- `evidence/reviews/response-input-snapshot.json` embeds input-set digest **`775c44ed5193f525bc997195950e44f26fb81abfcb063a3abbd9a6b43ae87c35`**. All **43/43** listed file hashes matched before and after review; no listed input was missing or changed. The frozen request-research inputs `evidence/research/auth-common.json` and `evidence/research/communications.json` also match their snapshot hashes, so request metadata was unchanged.
- Original source `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` had SHA-256 **`fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`** at both checks.
- The two response-analysis arrays match their request research records: **109/109 operation IDs and source function IDs**, and all **109/109 service source lines** match the original Hermes function headers. All **524/524 trace entries** point to an existing original function block and an in-block source line. The typed inventory was checked recursively against its field citations and original source; the specific exception(s) are detailed below.
- Read-only `node scripts/check.mjs` passed. The compiled artifacts at `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.json` and `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.yaml` were present and validated as structurally equal. SHA-256: JSON **`3cd3c67bcbd3d6e051ec1e13a45151a437a214ff93bfd6dba2a9596827d32526`**; YAML **`cc55d10f22b87b3f54e780c4d6d1863bf5d5ee6a5d133756d51c39e4d1657fb7`**.
- The checker validated **296** OpenAPI operations overall. All **109 assigned operations** have only a `default` response and `*/*` media type; status and response media remain unknown. Current partial object projections have open objects and optional properties, with no response `required`, enum, default, nullability, or array-size constraints. The 72 assigned unknown bodies stay unconstrained `{}`; that means “not modeled,” not an empty server response.
- Global coverage remains **298/298 observations across 296 canonical operations**: 87 partial models, 194 unknown responses, and 15 binary/opaque downloads. In this assigned scope, the 72 unknown records are not evidence that there are no consumers; several explicitly leave caller or consumer coverage unresolved. This review validates recorded traces and identified source paths, not exhaustive reachability of every potential application call site.
- No response analysis, request evidence, generated artifact, source file, or other file was edited. No build, generation, test suite, Git write, login, HTTP request, or private-record access occurred; the read-only checker above was the only validation command.

## Assigned analysis counts

“Recursive nodes” includes nested object/array containers and their child fields. Unknown field value types remain unconstrained.

| Scope | Records | Object | Unknown | Root fields | Recursive nodes | Recursive node types |
|---|---:|---:|---:|---:|---:|---|
| Auth/common | 41 | 13 | 28 | 30 | 47 | 36 `unknown`, 8 `array`, 3 `object` |
| Communications | 68 | 24 | 44 | 49 | 51 | 49 `unknown`, 2 `array` |
| **Total** | **109** | **37** | **72** | **79** | **98** | **85 `unknown`, 10 `array`, 3 `object`** |

All 109 analyses are `complete:false`. The field counts and current projections remain at the requested 47 + 51 nodes; findings R2-F1 and R2-F2 show why that unchanged inventory is not semantically clean.

## Round-one corrections rechecked

- **Disable 2FA path label:** `evidence/responses/auth-common.json:531` now uses `{provider}`. Original #16379 at 650036 loads argument 1 into the URL at 650047–650049 and argument 2 into body property `password` at 650051–650053.
- **Public agreement path/query:** `evidence/responses/auth-common.json:695` now uses `{agreementId}` and identifies `language` as query data. Original #28229 at 1112422 concatenates argument 1 into `/api/agreements/` at 1112433–1112435 and writes argument 2 to `config.params.language` at 1112437–1112441.
- **Kindergarten contacts:** `evidence/responses/communications.json:1588–1631` now traces callback #26023. Original #26022 attaches that closure at 1015132; #26023 begins at 1015139, reads body-root `kindergarten` and `courses` at 1015149 and 1015156, then uses `courses.length`, index zero, and its `id` at 1015159–1015169. The field values remain unknown; the array annotation is only the client’s use expectation.
- **Poll by ID:** `evidence/responses/communications.json:2367–2397` now traces generator caller #26438 to reducer #26430. #26438 invokes the `getPoll` service and dispatches the resolved body unchanged as `SET_POLL.data`; #26430 stores that whole action value as local `poll` without reading body properties. The empty-field `unknown` disposition is correct for this chain.
- **Previously omitted callback/reducer hops:** every expected ID below is now in the corresponding response trace at the stated source line. The original bytecode confirms the listed identity/dispatch behavior. `#26460` is a reducer, not a success callback; its path is now represented along with callback #26467 for `GetQuestionnaires`.

| Operation | Callback / reducer function(s) now traced |
|---|---|
| DeleteMessage | #25171 @ 989106 |
| GetMessageTargetGroups | #25180 @ 989281 |
| SendMessage | #25174 @ 989156 |
| GetMessageDraftById | #25186 @ 989423 |
| DeleteDraft | #25192 @ 989535 |
| UploadDraftAttachment | #25201 @ 989742 |
| DeleteDraftAttachment | #25204 @ 989805 |
| UpdateSentMessage | #25208 @ 989882 |
| DeleteSentMessage | #25211 @ 989935 |
| RecallSentMessage | #25214 @ 989989 |
| GetUserApplications | #25268 @ 991382; reducer #25260 @ 990995 |
| StoreApplication | #25286 @ 991737 (identity return; no dispatch or #25260 reducer hop) |
| GetApplication | #25274 @ 991498; reducer #25260 @ 990995 |
| RejectApplication | #25277 @ 991560; reducer #25260 @ 990995 |
| ConfirmApplication | #25280 @ 991624; reducer #25260 @ 990995 |
| AddOrRemoveApplicationChild | #25283 @ 991686; reducer #25260 @ 990995 |
| GetAnnouncementTargetGroups | #25320 @ 992681 |
| SendAnnouncement | #25323 @ 992739 |
| UpdateEvent | #25381 @ 994860 |
| DeleteEvent | #25387 @ 994986 |
| GetIdea | #26347 @ 1024241 |
| SaveIdeaComment | #26356 @ 1024435 |
| GetQuestionnaires | callback #26467 @ 1028162; reducer #26460 @ 1027661 |

`GetKindergartenApplications` already traces reducer #25260. Together with the five added body-dispatch paths above, the reducer is now present for each of those six application flows. `StoreApplication` is the exception because #25286 returns its argument unchanged and does not dispatch it.

## Findings

### R2-F1 — `UpdateMessage.recipient_read` is a reducer destination, not an evidenced response field

`evidence/responses/communications.json:179–220` models `UpdateMessage` as an object with root property `recipient_read`. Original service #25227 at 990354 calls Axios; fulfillment #25228 at 990379 returns `response.data`. Caller #25165 at 988980 dispatches its fulfillment argument unchanged as `UPDATE_MESSAGE_SEEN.data` (988984–989001). Reducer #25141 at 988065–988066 reads that action value and assigns the whole value to a local message’s `recipient_read` state slot.

The bytecode does **not** read `response.data.recipient_read`, nor establish that the returned body is an object. The field name was taken from the destination property in local state. Keep the body explicitly unknown rather than modeling `recipient_read`; the separately captured `unread_messages_count` is correctly excluded as non-response state.

### R2-F2 — `GetQuestionnaires` reducer reads two body-root fields, but the analysis keeps an empty unknown disposition

`evidence/responses/communications.json:2485–2520` traces service #26488 → #26489 (`response.data`) → caller #26466 → callback #26467, which dispatches the whole body as one of the questionnaire-category actions according to captured local `view` (original lines 1028166–1028203). Reducer #26460 handles those actions and directly reads `action.data.current_page` and `action.data.data` in the category branches: original lines 1027863–1027865, 1027873–1027876, 1027899–1027901, 1027909–1027912, 1027935–1027937, and 1027945–1027948.

Those are body-root reads after the service’s Axios unwrap, not locally constructed request/action fields. The record currently documents this reducer use in its trace and limitation but leaves `kind:"unknown"` and `fields:[]`. The supported partial view is root `current_page: unknown` and `data: unknown`; concatenation/wrapping does **not** establish that `data` is an array. Preserve open/optional/`complete:false` semantics. This finding conflicts with keeping the Communications inventory at 51 recursive nodes: if corrected together with R2-F1, the count would be 52 (remove one unsupported field; add two supported fields). No change was made under this review’s ownership constraint.

### R2-F3 — Kindergarten-menu `left` field evidence points at the preceding `data` read

`evidence/responses/auth-common.json:330` says #16355 line 649664 reads `left`. In the original function, line 649664 reads Axios `data`; the `left` property access is line **649665**. The field path/root placement itself is supported, but its direct source citation is off by one. Correct only the cited line if this evidence is later updated; no schema change is implied.

## Scope disposition

The round-one path and callback fixes are source-backed, and all 524 recorded trace coordinates are valid. The compiled projection faithfully reflects the current analysis, including the R2-F1 false attribution and R2-F2 omission; passing compilation/checks does not resolve those source-model findings. The full server response contract remains incomplete, and unresolved/unknown operations must not be described as empty responses or as proof that no consumer exists.

**Disposition: 3 findings; no non-report file changes.**

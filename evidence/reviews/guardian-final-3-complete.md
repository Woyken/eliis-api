# Guardian post-integration review 3 — complete batch

## Verdict

**Clean for the assigned 17-operation post-integration scope; no findings.** This is the first clean batch-wide review after the round-2 corrections, not the second consecutive clean review. One more consecutive clean review would meet the target; round 4 remains the maximum. This report does not certify a complete server contract, guardian authorization, or a working Home Assistant integration.

## Freeze, sources, and method

- Verified all **60/60** files listed in `evidence/reviews/guardian-input-snapshot.json` before review and again after writing this report. The manifest declares frozen snapshot `cfa1ca933d6f73c539f6f02efe866a657c1afffde4a3064ad696c3acfbbbe457`; no listed input was changed during this review.
- Compared with the retained round-2 snapshot (`1bf2c09bbe6046824df43c1106f1282519a71df1553d2764373f487c8961a4ec`), the current freeze changes nine listed files: `docs/GUARDIAN-CAPABILITIES.md`, `evidence/guardian-batch/diary.json`, `evidence/guardian-batch/diary.md`, `evidence/research/children-diary-files.json`, `evidence/responses/children-diary-files.json`, `models/responses.tsp`, `routes/generated.tsp`, `scripts/operation-catalog.json`, and `scripts/response-coverage.json`. I re-traced the changed feed-date branch and calendar-root attribution in `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; its SHA-256 remains `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.
- Unchanged auth/discovery, events, attendance, and food source-candidate files match the prior frozen inputs, so the prior round-2 source audits for their raw field paths remain applicable. I cross-checked all 17 current candidate-to-integrated response projections and all four current request enrichments against the present evidence and generated output.
- Read-only review only. I did not run tests, the repository check scripts, a compiler/build, generation, any Git mutation, or any HTTP/API action. The parent-reported 28 passing tests and check are not represented here as rerun. I created only this report.

## Round-2 corrections independently verified

### `GetGuardianFeed` date branch

The current `evidence/guardian-batch/diary.json`, request record, capability row, and rendered capability text agree with original `#25515` at disassembly lines 1000445–1000458:

- A falsy `diaryNextDate` takes the formatter path. For a truthy cursor, the strict comparison branches directly to the date assignment when captured `page !== 1`, copying the cursor without formatting. A truthy cursor on page 1 takes the formatter path.
- On the formatter path the imported default formatter is invoked without a user-supplied date argument, then `.format('YYYY-MM-DD')` is called. The Hermes call-site's undefined receiver is not an undefined argument. The formatter's current-date/result behavior is not inferred.
- Both branches assign `params.date`; `#25632` forwards the object as Axios `config.params`. `page` remains separate client action state, not a query field; no `page`/`perPage` server contract is claimed. The research query type stays `unknown`, arbitrary query passthrough stays open, and accepted syntax, serialization, timezone, range, and server meaning remain unresolved.

### `GetChildCalendar` stale summary

The integrated response evidence and emitted `models/responses.tsp` extension no longer carry the stale “no other named response properties”/opaque summary. Original `#26402` reads root `access` and dispatches the unchanged body (1025977–1025985); reducer `#26394` reads the other eight direct roots (`days`, `child_data`, `lock_date`, `comment_date`, `holidays`, `default_status`, `workday_weekend`, `workday_holiday`; 1025725–1025749). Thus the current partial view has **nine** body-root properties. `days` is a client-used collection, but its raw item shape stays unknown; composed calendar-cell properties are not projected into it. Missing days/logs/arrivals remain unknown, never absence.

## Current 17-operation response ledger

Counts are named property paths in the partial client-observed analysis, excluding array-item pseudo-paths. They are not server field counts or completeness claims. The 17 candidate shapes match the integrated response analyses by operation/source identity and field/type path (**17/17**).

| Operation / source | Current disposition | Named paths | Boundary checked |
| --- | --- | ---: | --- |
| `Login` / `#16308` | Object | 3 | Fulfillment fields are only `type`, `identifier`, `locked_out`; rejection-only `message` is not a body-model field. |
| `Login2FA` / `#16309` | Object | 2 | Fulfillment fields are only `status`, `locked_at`; rejection-only `message` is not a body-model field. |
| `GetUserData` / `#16344` | Object | 14 | Partial init roots/nested reads only; separate guardian and child collections do not prove a guardian-child join or route-ID handoff. |
| `GetUserPermissions` / `#16348` | Object | 8 | Permission selector reads remain unknown-valued client gates, not server authorization. |
| `GetChildProfile` / `#25634` | Object | 3 | `active_courses`, `name`, `profile_picture`; local wrappers are excluded and selector/context branches do not establish authority. |
| `GetChildCourses` / `#25624` | Array | 2 | Partial item `id`/`name`; no enrollment, stable-ID, or profile-course join is inferred. |
| `GetEvents` / `#25403` | Object | 24 | Partial `items`/item view; timezone rewrites and client ACL branches do not prove server storage, visibility, or permission. |
| `GetRecentEvents` / `#25401` | Object | 2 | Root `events` and `count` only; neither nested shape nor count meaning is inferred. |
| `GetChildCalendar` / `#25644` | Object | 9 | Nine roots above; raw `days[]` items remain unknown. |
| `GetStatusLogs` / `#25650` | Array | 12 | Root array with partial log paths; status meanings, actor ID, and absence semantics remain unknown. |
| `GetAbsenceModalData` / `#25652` | Object | 1 | Root `min_date` only; its type/format and any write permission remain unknown. |
| `GetGuardianFeed` / `#25632` | Object | 22 | Body-root siblings `data` and `next_date`; local `displayType`/page wrappers are excluded; `texts` stays unknown because the consumer admits arrays. |
| `GetGuardianDiary` / `#25630` | Unknown | 0 | Opaque body; no active caller/body consumer or guardian permission path is established. |
| `GetDiaryData` / `#25935` | Object | 17 | Employee-facing consumer paths only; not a substitute for guardian access. |
| `GetDayMenu` / `#26007` | Unknown | 0 | Body stays opaque: no consumer of `state.foodmenu.day_menu` was found. |
| `GetWeekMenu` / `#26009` | Object | 13 | Partial root `id`/`info`/`uploaded_files`/`days` and item reads only; menu structures and publication semantics remain unknown. |
| `DownloadFoodmenuFile` / `#37318` | Binary | 0 | Opaque bytes only; RNFS metadata is not an HTTP body model. |
| **Total** | **12 object / 2 array / 2 unknown / 1 binary** | **132** | **All 17 existing operation identities retained; no operation added or removed.** |

Current auth models contain no fulfillment `message`; rejection handlers `#13517` and `#27145` remain separate non-normative `clientResponseObservations`. Current discovery evidence retains the source-correct mapping `#44121` = whole `state.myChild.child`, `#44122` = its `kindergarten_id`, `#44123` = its `deleted_at`; `#44124` passes the #44122 value and literal `false` into the `SET_CHILD` path, while the distinct `#44679` true-context path reaches `SET_MY_CHILD`. Neither state branch proves guardian authorization or the missing init-child-ID handoff.

## Request enrichments

Exactly the four intended request-candidate records are present and integrated without duplicate query names:

| Operation | Integrated request observation | Server boundary retained |
| --- | --- | --- |
| `GetGuardianFeed` | `date: unknown`; corrected cursor/formatter branch above; `queryPassthrough: true`. | No page field, formatter result, URL encoding, accepted date syntax, or date-range semantics inferred. |
| `GetChildCalendar` | `start_date` and `end_date` are caller-formatted month endpoints (`Y-MM-DD`) and passed through Axios params. | Client formatting does not prove server acceptance, inclusivity, timezone, or a server range contract. |
| `GetStatusLogs` | Existing `date` remains `unknown` in research despite the caller's `YYYY-MM-DD` formatting. | One selected-day client value only; no server validation/range/timezone rule. |
| `GetAbsenceModalData` | `form: unknown` with nested `user_id: unknown`. | Nested Axios query serialization is unresolved; no bracket/dotted wire key is asserted. |

The direct food-menu URLs append one date after literal `?date=` and do not provide a per-call Axios `params` object. `GetDayMenu` remains unused/opaque; `GetWeekMenu` receives one date value, not a proved week-range query. Weekly empty-state copy/falsy root `id` is not a server publication status. The download filename is local destination/display data, and MIME/status/headers remain unknown.

## Generated artifacts, capability table, and blockers

I inspected the existing absolute-project artifacts without regenerating them:

- `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.json` — SHA-256 `8fdfad5f6bfa97b52394a8753a4eccbca7055662613aca519faef8cbbd8a29cd`.
- `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.yaml` — SHA-256 `f824be46d8fdce4ff037043cfc58b0cbb4c06bcf0a25628ed3640e84a64c12b4`.
- Parsed YAML equals JSON exactly. All 17 compiled operations match the frozen research method/path and named parameters; all 17 static-response operation extensions and field evidence extensions match current response coverage/evidence. Compiled response field paths match the current analyses (**132 total**). Every modeled field remains optional/open; response status `default` and content `*/*` are placeholders, with status and media type explicitly unresolved—not observed server guarantees. Unknown query values compile to optional `string` transport parameters, while their research evidence remains unknown; there is no date format or `deepObject`/bracket/dotted encoding assertion for the nested `form` value.
- Global coverage remains **298 research observations / 296 canonical operations**, with **92 partial models / 189 unknown / 15 binary** dispositions. These counts are coverage bookkeeping, not a claim that partial models are complete server schemas.
- Read `scripts/check-guardian-batch.mjs`, `scripts/render-guardian-capabilities.mjs`, and `scripts/check.mjs`. The checker structurally requires one response candidate and capability row per each of 17 scope identities and validates the six disposition groups/traces/blockers; the present four request records were independently enumerated and compared above. Structural validation is not evidence validation. The renderer has eight capability-table columns and five feature-blocker sections; the current docs contain exactly **17 operation rows** and the five expected sections. Empty capability groups render as no claim recorded, not as proof of server absence.
- The docs retain the required boundaries: permissions and selectors are client-side; no staff-roster substitution or guardian-child authorization claim; no absence inference from missing evidence; group feedback is not assumed visible for other children; secondary `/diary` remains blocked/unproven; employee diary state stays separate; food fallback and native download metadata remain non-normative. No HA integration code or authenticated setup was added.

## Findings and close

**Findings: none for the assigned full batch.** The current freeze contains the two round-2 corrections, and their response/query evidence, TypeSpec projections, capability row, and compiled OpenAPI projections agree with the original client traces. All observations remain partial client behavior: requiredness, enums, defaults, nullability, accepted server validation, status codes, media types, completeness, and guardian/server authorization remain unproved.

After writing this report, all **60/60** frozen input hashes still match the manifest declaring `cfa1ca933d6f73c539f6f02efe866a657c1afffde4a3064ad696c3acfbbbe457`; the original disassembly and compiled JSON/YAML artifact hashes listed above were unchanged. This is one clean round only; any continuation must remain within the existing four-round cap.

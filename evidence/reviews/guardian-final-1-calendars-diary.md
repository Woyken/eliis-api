# Guardian post-integration review 1 — events, attendance, diary

**Result: 4 findings; not clean.** This is run 1 of at most four post-integration review/fix rounds. It does not certify the other guardian-batch domains or complete server contracts.

## Frozen inputs and scope

- The supplied snapshot identifier is the 60-file snapshot recorded in `evidence/reviews/guardian-input-snapshot.json` (aggregate `a133d438fd618372804307c13ef67c35d46bc929ea3262afd1ca9107dbf05897`). All 60 listed file hashes matched before review and again after writing this report. The snapshot manifest itself and pre-existing worktree changes were left untouched.
- Reviewed the eight assigned operations in the candidate records, integrated research/response records, `models/responses.tsp`, `docs/GUARDIAN-CAPABILITIES.md`, `docs/GUARDIAN-HA-BLOCKERS.md`, and their original-service/callback/reducer/consumer paths in `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`.
- Scope identities: `GetEvents` (#25403), `GetRecentEvents` (#25401), `GetChildCalendar` (#25644), `GetStatusLogs` (#25650), `GetAbsenceModalData` (#25652), `GetGuardianFeed` (#25632), `GetGuardianDiary` (#25630), and `GetDiaryData` (#25935). All eight still have their original research identities; no endpoint duplication or operation addition was found.
- No build, generation, tests, live/private HTTP, private-record access, or mutation was performed. Only this report was created.

## Verified scope ledger

| Operation | Verified partial body view / boundary | Request and capability boundary |
| --- | --- | --- |
| `GetEvents` | HTTP body root `items` is consumed as an array. Original item field names are preserved, with unknown value types; `#25423` shallow-copies and can rewrite `start_date`, `start_time`, and `end_time` using locally supplied user-timezone context. Display times and rewritten Redux values are not claims about server UTC storage. Selected-event detail/export consumers directly read recurrence and ACL paths, including `acl_groups.view[]` `name`/`id`/`type`; meanings and authorization remain unknown. | Calendar callers pass `dateFrom`/`dateTo` through Axios `params`, formatted from month start/end with `Y-MM-DD`; other query keys remain open. Range inclusivity, guardian/staff visibility, child/course applicability, cancellation/location, and server permissions are unresolved. Null `start_time`/`end_time` export branches do not establish a `full_day` field. No generic pagination/completeness claim. |
| `GetRecentEvents` | HTTP body-root `events` and `count` are read and dispatched separately; both remain `unknown`. `count` is not inferred from an array length and `events` is not forced to an array. | The service has no query/body. No generic pagination, completeness, visibility, or read/seen guarantee is inferred. |
| `GetChildCalendar` | Nine direct HTTP-body roots are represented; `days` is a client-used array with unknown raw item shape. `CalendarDay`’s composed `date`, `attendance`, `entry`, and `diary_status` reads are not attributed to raw `days[]`. | Caller adds `start_date`/`end_date` month strings (`Y-MM-DD`) to query params. Inclusivity/timezone, raw row semantics, and write permission remain unresolved. No missing log/arrival is treated as absence. |
| `GetStatusLogs` | The raw body is consumed as a root array. Direct item reads include `diary_status.name/color/icon`, `identifiable.name`, `created_at`, `type`, `status`, `comment`, `start_time`, and `end_time`; values remain unknown. `created_at` is displayed after UTC parsing and conversion to `user.timezone`, not evidence of server storage timezone. `start_time`/`end_time` are displayed as attendance hours, not log-event timestamps. | One selected `date` query value is client-formatted `YYYY-MM-DD`; range/boundary semantics are unknown. No actor ID, status meaning, or missing-record absence inference. |
| `GetAbsenceModalData` | Only raw top-level `min_date` is read; it is stored for the date-picker `minimumDate`. Its type/format and server meaning are unknown. | `params.form` wraps a locally built `{user_id: currentUser.id}`; nested wire encoding is unresolved and not fabricated. The existing `GetAbsenceModalData` identity is retained (no duplicate operation). No write/access permission follows from this read. |
| `GetGuardianFeed` | Callback `#25516` puts the unchanged HTTP body on Redux `action.data`; reducer `#26862` reads body-root `data` and sibling `next_date`. The body is **not** wrapped under another `data`. Groups/diaries have partial client reads; all unproved values/shapes stay unknown/open. | The caller constructs `params.date`; truthy next-date is formatted only when page is not 1, while page 1 copies the value and a falsy value may be assigned as `undefined`. Page is Redux/action state, not a query field. The client MyChild route/state branch does not prove guardian authorization or other-child feedback visibility. |
| `GetGuardianDiary` | Opaque `unknown`: registration and `response.data` projection only; no active caller/body consumer was established. | No query is built by this service; permission, caller, visibility, pagination, and side effects remain unproven. Keep blocked/unrecommended as guardian access. |
| `GetDiaryData` | Partial HTTP-body-root reads include 17 field paths, with `statuses` consumed as a collection and item `used_in_course`/`type` reads. Local fallback arrays/likes are not response fields. | `course` and `date` query values are built by the service. Strongest consumer path reads employee state and is not guardian authorization. Caller `#43846` may flush auto-saves before the GET; that separate preceding activity is not a GET side effect. |

The integrated response candidates account for **87 recursive field nodes** across these eight operations (24, 2, 9, 12, 1, 22, 0, and 17 respectively). All modeled properties remain partial/optional/open; no server-requiredness, enum, default, status/media, nullability, or complete-response assertion was found in the correctly stated evidence.

## Findings

### 1. [High] `GetEvents` retains a stale opaque-response disposition

`evidence/responses/communications.json` for `GetEvents` says both that no body property is attributed and that no HTTP-body field is attributed beyond the service handoff. The integrated `@extension("x-static-response-evidence", ...)` for `GetEvents` carries those statements into `models/responses.tsp`. They contradict the same record’s `body.items` model and the original trace: `#25375` dispatches the body, `#25344` iterates `body.items`, and the returned items reach `#42311` and the selected-event detail/export consumers through `#25423`’s shallow copy.

**Required correction:** remove/rewrite only the stale no-fields/downstream-unresolved summary text. Keep untraced body/item branches and all server semantics explicitly unknown; the partial `items` model itself is supported.

### 2. [High] `GetGuardianFeed` evidence still says no body property is read

The integrated `GetGuardianFeed` response record in `evidence/responses/children-diary-files.json` says “No body property read is established,” and a retained limitation says the consumer path has no field/item shape. The emitted response-evidence extension repeats the stale evidence sentence. Those statements conflict with its own `data`/`next_date`/nested item model and its trace: `#25516` forwards the raw body, and `#26862` reads body-root `data` and sibling `next_date` (not `body.data.data` or `body.data.next_date`).

**Required correction:** remove/rewrite both stale opaque/no-field statements while retaining the correct root nesting, partial/open shape, and unresolved permission/visibility limitations. The reducer attribution is `#26862` (not `#26868`).

### 3. [High] `GetStatusLogs` retains stale “no array/row shape” limitations

The integrated `GetStatusLogs` response record in `evidence/responses/children-diary-files.json` still says the raw-passthrough path establishes neither row fields nor an array shape, and says not to infer an array. The modeled disposition is a root array with direct item reads, and original code confirms it: `#43072` maps the stored raw body and passes each raw item to `#43079`, which reads the listed fields.

**Required correction:** remove/rewrite the two stale limitations. Keep item completeness, IDs, actor identity, types, status meanings, timezone storage, and additional timestamps unresolved as they are in the valid limitations.

### 4. [Medium] Guardian-feed `texts` is too narrowly represented as an object

`GetGuardianFeed` models `data[].diaries[].texts` as `object`/`Record<unknown>` in the candidate, integrated response evidence, and TypeSpec. Original function `#34949` checks only `typeof texts === "object"` and then calls `Object.keys(texts)` (original disassembly lines 1392814–1392827). That admits arrays as well; there is no `Array.isArray` or other discriminator establishing a record-only shape. The evidence correctly avoids fixed dictionary keys/value types, but it does not preserve this array ambiguity.

**Required correction:** use an unknown/ambiguous shape or otherwise document the object-or-array client-observed boundary. Do not invent dictionary members or close the model.

## Table and blocker disposition

- The capability table covers the assigned endpoints and distinguishes body paths from action/Redux/local state, including recent `count`, diary-feed root siblings, raw attendance rows, and the opaque `/diary` operation.
- The table and HA blocker document appropriately keep server permission claims unresolved: event client UI gates are not authorization; missing attendance evidence is not absence; GuardianFeed does not establish own-child/other-child visibility; `GetGuardianDiary` remains blocked; and employee `GetDiaryData` is not a guardian substitute.
- Query/date, pagination, and read-side-effect categories are represented without asserting server range boundaries, universal pagination behavior, or global absence of read/seen effects. The separate `flushDiaryAutoSaves` path is distinguished from GET behavior.
- Beyond the four findings above, no request path/query mismatch, duplicated operation, raw-body nesting error in the models/table, or unsupported permission recommendation was found for this scope.

## Closing assessment

The endpoint identities, primary partial field paths, request additions, and capability blockers are substantially aligned with original client evidence. Three integrated response records still contain contradictory pre-enrichment opaque statements, and `texts` overstates a record-only shape. Resolve these four bounded findings before treating this scope’s post-integration review as clean.

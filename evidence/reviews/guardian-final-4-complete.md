# Guardian post-integration review 4 — complete batch

## Verdict

**Clean for the full assigned 17-operation post-integration scope; no findings.** This is the second consecutive clean batch-wide review after round 3. The two-consecutive-clean target is met; this is round 4 of the four-round maximum, so this review closes the bounded loop. It does not certify a complete Eliis server contract, any server-side guardian authorization, or a working Home Assistant integration. The HA setup and child-scoped features remain blocked on the unresolved access path and other per-feature evidence below.

## Freeze, source, and method

- Before review, verified every path and SHA-256 in `evidence/reviews/guardian-input-snapshot.json`: **60/60 files matched**; no missing or mismatched entries. The manifest declares frozen batch digest `cfa1ca933d6f73c539f6f02efe866a657c1afffde4a3064ad696c3acfbbbe457`.
- The original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` still hashes to `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`, matching round 3. For bytecode evidence unchanged since the preceding freeze, I reused the prior same-hash source checks; I independently checked the current feed-date branch, calendar roots, discovery selector/context distinction, all current candidate-to-integrated projections, and each of the 17 capability rows.
- Independently compared current candidate response kind and named field/type projections with the corresponding integrated response-coverage analysis: **17/17 match**, with **132 named property paths**. Checked the four request-candidate records against the integrated research query names and found no duplicate query names. These checks compare the current data; they do not treat structural agreement as proof of evidentiary truth.
- Ran the permitted read-only checks: `node scripts/check-guardian-batch.mjs` validated 17 response candidates and 17 capability rows; `node scripts/check.mjs` validated the existing compiled artifacts and global coverage. A pure in-memory renderer comparison matched both current guardian documents byte-for-byte; it found 17 capability rows and eight table columns. The compiled artifacts were inspected in both formats without regeneration.
- No tests, build, TypeSpec compile, generation, API/HTTP request, login, private-record access, or write was performed. The parent-reported 28 passing tests were not rerun. No Git mutation was performed. The only file authored for this review is this report.

## Current 17-operation response ledger

Counts below are named paths in the current partial client-observed models, excluding array-item pseudo-path markers. They are not server field counts or completeness claims. Candidate, integrated response-coverage, TypeSpec, and compiled OpenAPI projections agree for the scoped operations.

| Operation / source | Current disposition | Named paths | Boundary checked |
| --- | --- | ---: | --- |
| `Login` / `#16308` | Object | 3 | Fulfillment view is `type`, `identifier`, `locked_out`; the rejection-only `message` read is separate client-observation metadata. |
| `Login2FA` / `#16309` | Object | 2 | Fulfillment view is `status`, `locked_at`; neither the body comparison with `valid` nor the default-client HTTP 401 branch defines a server status/enum/expiry rule. |
| `GetUserData` / `#16344` | Object | 14 | Partial init-root and consumer paths only. Separate `guardians` and `children` collections do not establish a guardian-child join or child-route ID handoff. |
| `GetUserPermissions` / `#16348` | Object | 8 | Permission selector reads are unknown-valued client truthiness gates, not server authorization or Boolean wire types. |
| `GetChildProfile` / `#25634` | Object | 3 | `active_courses`, `name`, and `profile_picture`; local wrappers and the false-context selector/call do not establish authority. |
| `GetChildCourses` / `#25624` | Array | 2 | Partial item `id`/`name`; no enrollment, stable-ID, or profile-course join is inferred. |
| `GetEvents` / `#25403` | Object | 24 | Partial `items`/item view; local timezone conversion and client ACL/recurrence branches do not prove server storage, visibility, or permission. |
| `GetRecentEvents` / `#25401` | Object | 2 | Only body-root `events` and `count`; nested shape, count meaning, completeness, and pagination remain unknown. |
| `GetChildCalendar` / `#25644` | Object | 9 | Nine direct body roots; `days` is an observed collection with unknown raw item shape. No stale opaque/no-other-fields summary remains. |
| `GetStatusLogs` / `#25650` | Array | 12 | Root array with partial log paths; status meanings, actor ID, last-update fields, and absence semantics remain unknown. |
| `GetAbsenceModalData` / `#25652` | Object | 1 | Root `min_date` only; its value type/format and any write permission remain unknown. |
| `GetGuardianFeed` / `#25632` | Object | 22 | Body-root siblings `data` and `next_date`; client page/display wrappers are excluded; `texts` remains unknown because the client condition admits arrays. |
| `GetGuardianDiary` / `#25630` | Unknown | 0 | Opaque body; no active caller, body consumer, or guardian permission path is established. |
| `GetDiaryData` / `#25935` | Object | 17 | Employee-facing consumer paths only; this is not a substitute for guardian access. |
| `GetDayMenu` / `#26007` | Unknown | 0 | Opaque body: the `state.foodmenu.day_menu` value has no traced UI field consumer. |
| `GetWeekMenu` / `#26009` | Object | 13 | Partial root/file/day reads only; meal content and publication semantics remain unknown. |
| `DownloadFoodmenuFile` / `#37318` | Binary | 0 | Opaque downloaded bytes only; RNFS metadata is not an HTTP body model. |
| **Total** | **12 object / 2 array / 2 unknown / 1 binary** | **132** | **All 17 scoped identities retained; none added or removed.** |

The 132 named paths comprise **110 unknown-valued, 16 array-valued, and 6 object-valued paths**. Every emitted response property remains optional and every response model remains open/incomplete. No required fields, enums, defaults, nullability, or complete response schemas are asserted.

## Independently rechecked semantic boundaries

### Feed query branch and diary access

The current `evidence/guardian-batch/diary.json`, `evidence/research/children-diary-files.json`, rendered capability row, and compiled request agree with original `#25515` at disassembly lines 1000445–1000458:

- A falsy `diaryNextDate` takes the formatter path. For a truthy cursor, the strict comparison skips formatting when captured `page !== 1`, copying that cursor. A truthy cursor on page 1 takes the formatter path.
- The imported default formatter is invoked without an explicit date argument, then `.format('YYYY-MM-DD')` is called. The `Call1` undefined register is its receiver, not an explicit undefined argument. The formatter's returned value is not inferred.
- Both paths assign `params.date`; `#25632` forwards the params object as Axios `config.params`. `page` remains separate client action state, not an HTTP `page` or `perPage` field. The research date type stays `unknown`, query passthrough stays open, and serialization/server interpretation remain unresolved.
- The response model retains HTTP-body root `data` and sibling `next_date`; local `displayType`, date/evaluation rows, and action page wrappers are excluded. `texts` is not narrowed to a dictionary because `typeof === 'object'`/`Object.keys` also admits arrays. The client `employeeView=false` MyChild branch proves client call/state flow only, not own-child server authorization or other-child/feedback visibility. `GetGuardianDiary` remains opaque and blocked; `GetDiaryData` remains employee-facing and is not a guardian substitute.

### Calendar, status, discovery, and events

- `GetChildCalendar` retains the nine traced body roots: `access`, `days`, `child_data`, `lock_date`, `comment_date`, `holidays`, `default_status`, `workday_weekend`, and `workday_holiday`. The integrated evidence and TypeSpec summary now state those roots rather than the corrected stale opaque/no-other-properties description. The raw `days[]` item schema remains unknown; no composed calendar-cell properties are attributed to the HTTP body.
- `GetChildCalendar` month endpoints remain `start_date`/`end_date` with caller formatting `Y-MM-DD`; `GetStatusLogs` retains one `date` query (unknown in research despite the caller's `YYYY-MM-DD` formatting); `GetAbsenceModalData` retains outer `form: unknown` with nested `user_id: unknown`. The nested Axios query serialization is unresolved. No date boundary, timezone, status transition, or permission semantics are inferred.
- Attendance/log labels and values remain variable/unknown. Missing days, arrivals, or transition logs are **unknown**, never proof of absence. The calendar `access` root and client edit gates do not prove `access.restrict` or server write authorization. Actual calendar writes are separate POST submit paths and were not performed.
- Discovery selectors were checked against the original source: `#44121` returns whole `state.myChild.child`; `#44122` returns its `kindergarten_id`; `#44123` returns `deleted_at`. The false-context `#44124` call uses `#44122`'s value, route `childId`, and literal `false`, selecting `SET_CHILD`. Separate true-context `#44679` supplies `true` and reaches `SET_MY_CHILD`; the name/profile-picture reads are supported on that response branch, but it does not establish guardian authorization. The init-derived dashboard selection callback still has no proven handoff to `MyChildStack.route.params.childId`; no staff-roster substitution or enrollment inference is made.
- `GetEvents` keeps client-read `title`, `description`, `creator.name`, recurrence, and ACL paths partial, with unproved values/semantics. The request's `dateFrom`/`dateTo` are month-derived client values. Local conversion using `user.timezone` is not a server-UTC/storage rule, date-range inclusivity, event visibility contract, or recurrence/ACL authorization. `GetRecentEvents` remains only `events`/`count` at the body root.

### Authentication, menus, and read side effects

- `Login` and `Login2FA` fulfillment models contain no `message`. `#13517` and `#27145` error-message reads remain separate rejection-only `clientResponseObservations`, not success fields or an invented error wrapper. The Login challenge `provider.identifier` copied to 2FA `login_identifier` is distinct from cookie handling. Login's isolated auth-client rejection path is pass-through; the 401 cleanup is a default-client behavior and is not attributed to password Login or treated as an expired-session/server contract.
- `GetWeekMenu` retains only the directly consumed root and file/day paths; day meal values and file metadata remain unknown. The separately named `GetDayMenu` does not inherit weekly day-item fields. The weekly empty-state text/falsy local `id` is not a server publication status. `DownloadFoodmenuFile` models bytes as opaque; `jobId`, `statusCode`, `bytesWritten`, headers, and other native RNFS metadata are not body fields. Food URLs concatenate one `date` value and do not pass a per-call Axios params object.
- Across the inspected flows, read-side-effect statements are bounded to the traced client path: local state updates and identified follow-up reads are documented; the `GetDiaryData` autosave flush precedes the GET and is separate. Finding no traced write in a bounded GET success chain does not guarantee the server has no read side effect. No live account or private API behavior was tested.

## Request/query, renderer, checker, and compiled OpenAPI audit

Exactly four request-candidate enrichments are integrated without duplicate query names:

| Operation | Current request evidence | Server boundary retained |
| --- | --- | --- |
| `GetGuardianFeed` | `date: unknown`; branch described above; open query passthrough. | No page/perPage contract, formatter result, wire encoding, accepted syntax, timezone, or interval semantics inferred. |
| `GetChildCalendar` | `start_date` and `end_date` from locally formatted month endpoints. | Formatting does not establish server acceptance, inclusivity, timezone, or range meaning. |
| `GetStatusLogs` | Existing `date: unknown`; caller supplies a selected-day value. | No server date-range, inclusivity, or timezone rule inferred. |
| `GetAbsenceModalData` | `form: unknown` with nested `user_id: unknown`. | No bracket/dotted wire key or deep-object serialization asserted. |

Other scoped query construction remains as recorded: `GetEvents` uses caller `dateFrom`/`dateTo` and forwards an open params object; `GetDiaryData` constructs `course`/`date`; `GetUserData` sends a JSON-string `platform` query value; food-menu services append a single literal `?date=` value without per-call `params`. These do not prove server validation or date semantics.

- The current renderer output is byte-for-byte equal to `docs/GUARDIAN-CAPABILITIES.md` and `docs/GUARDIAN-HA-BLOCKERS.md`. The table has exactly **17 rows and eight columns**; five feature-blocker sections are present. Empty capability groups remain “no claim recorded,” not server-negative guarantees. The docs keep HA setup blocked on the missing guardian-child/route-ID relationship and server authorization; they preserve the absence, feedback-visibility, employee-diary, and opaque-download boundaries.
- `node scripts/check-guardian-batch.mjs` passed: **17 response candidates / 17 capability rows** with unique in-scope identities and structurally valid claim groups/traces. This is a structural check, not a bytecode evidence check.
- `node scripts/check.mjs` passed against existing OpenAPI JSON and YAML: **296 canonical operations**, matching parsed JSON/YAML; the 17 scoped operation methods/paths/parameters match their research entries. Static response extensions and field evidence are present. The generated default response status and `*/*` media are unresolved placeholders, not observed server status/media promises. Nested `form` has no asserted deep-object or bracket/dotted encoding; unresolved query values do not acquire server types from their OpenAPI transport representation.
- Global response coverage remains **298 research observations / 296 canonical operations**, with **92 partial models / 189 unknown / 15 binary** dispositions and no missing response-analysis dispositions. Counts describe analysis coverage, not complete accepted server schemas.

Existing compiled artifact and source hashes at review close:

- `tsp-output/@typespec/openapi3/openapi.json`: `8fdfad5f6bfa97b52394a8753a4eccbca7055662613aca519faef8cbbd8a29cd`
- `tsp-output/@typespec/openapi3/openapi.yaml`: `f824be46d8fdce4ff037043cfc58b0cbb4c06bcf0a25628ed3640e84a64c12b4`
- `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`: `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`

## Findings and close

**Findings: none for the bounded 17-operation review.** The current feed-date branch, calendar nine-root correction, all response projections, four query enrichments, per-operation capability claims, renderer output, checker results, and both existing compiled OpenAPI formats agree within the client-evidence boundary. Requiredness, enums, defaults, nullability, accepted server validation, status codes, media types, body completeness, guardian/server authorization, and any Home Assistant runtime behavior remain unproved. The missing guardian-to-child route/access relationship and per-feature blockers remain unresolved; this clean review must not be read as resolving them.

After writing this report, all **60/60** frozen input files still match `evidence/reviews/guardian-input-snapshot.json` and its declared digest `cfa1ca933d6f73c539f6f02efe866a657c1afffde4a3064ad696c3acfbbbe457`. The original disassembly and existing compiled OpenAPI hashes above are unchanged. **Round 4 is the hard stop; no further review/fix loop is recommended for this batch.**

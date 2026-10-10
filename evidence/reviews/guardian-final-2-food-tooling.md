# Post-integration guardian review — food/tooling (round 2)

## Verdict

**Clean for the assigned food, all-17 coverage/tooling/documentation, auth-message-boundary, and normative-unknown-policy scope. No factual correction or blocker found.** The food response paths remain partial client observations, the capability table and blockers keep UI behavior separate from server guarantees, and the auth rejection message is not included in either fulfillment-body model.

This report does not certify the independent calendar/diary or auth/discovery semantic reviews beyond the cross-checks below, and it does not establish a complete server contract or authorize a Home Assistant integration.

## Frozen input and review boundary

- Reviewed the round-2 manifest `evidence/reviews/guardian-input-snapshot.json`, SHA-256 `1bf2c09bbe6046824df43c1106f1282519a71df1553d2764373f487c8961a4ec`. All **60/60** listed per-file hashes matched before review and were rechecked after this report was written.
- The round-1 manifest digest (`a133d438fd618372804307c13ef67c35d46bc929ea3262afd1ca9107dbf05897`) is a different, earlier snapshot. The round-2 freeze already includes the auth error-observation separation, the diary `texts` unknown boundary, and their integrated model/document updates. The food candidate is unchanged between those manifests. This review did not edit any of the 60 frozen inputs.
- The worktree was already modified before this review. The only file created by this review is this report. No API request, login, private-record access, build, generation, or test run was performed.
- Original-client source verification used `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; no runtime response or server behavior was inferred.

## Food operations

| Operation / source | Verified client observation | Boundary retained |
| --- | --- | --- |
| `GetDayMenu` / `#26007` | Builds the day URL by concatenating `/api/kindergartens/`, the kindergarten argument, `/foodmenu/day?date=`, and the date argument; calls shared Axios `get` with only that URL (`eliis.hasm` 1014569–1014590). `#26008` returns Axios `response.data` unchanged (1014595–1014601); thunk/reducer `#25992/#25993/#25989` store it as `state.foodmenu.day_menu`. | No consumer of `state.foodmenu.day_menu` was found: the literal `day_menu` occurs at state initialization and reducer assignment only (1014041, 1014123). The similarly named `DayMenu` component `#37310` receives mapped weekly-response `days` items through `#35903`; its reads do not describe this endpoint. This response remains `unknown` with no fields. |
| `GetWeekMenu` / `#26009` | Builds `/foodmenu/week?date={argument}` the same way and calls `get` with only the URL (1014606–1014627); `#26010` returns `response.data` unchanged (1014632–1014638). The body is forwarded through action/reducer/selector `#25995/#25996/#25989/#35898` to guardian `FoodMenuScreen` `#35897`. It reads root `id`, `info`, `uploaded_files`, and `days`; `#35903` passes each original day item to `#37310`, and `#35905` passes each original file item to `#37314`. | Partial body paths only: root `id`/`info`; `uploaded_files[]` `id`/`filename`/`name`; and `days[]` `id`/`date`/`breakfast`/`lunch`/`supper`/`dinner`. All these values remain `unknown`; only the client-used array/object containers are represented. No meal/dish/group/variant/course/substitution or staff meal-report shape is inferred. |
| `DownloadFoodmenuFile` / `#37318` | Reads the selected file item's `id` into `/foodmenu/{id}/download`; separately sanitizes `filename` for local `toFile` construction (1489745–1489795). `#37319` sets the saved cookie and invokes `RNFS.downloadFile` (1489815–1489830). `#37314` reads `name` for display and calls `slice` (1489553–1489653). | Opaque streamed bytes only. The file id is a URL path input; filename is a local destination value; display name, PDF UI labeling, and RNFS result/event metadata do not prove server MIME type, headers, status, or JSON fields. |

The query evidence is correctly kept separate from server date semantics. Both menu services concatenate one date argument into a literal `?date=` URL and provide no per-call `params` object. Bundled Axios `buildURL` returns the passed URL when `params` is falsy (`#5683`, 257758–257766); the shared-client construction sets `baseURL` and headers, not default params (`#5603`, 254085–254102). No query encoding/rebuilding is claimed for these calls, and later platform/network URL normalization remains unknown. The weekly screen formats its initial date with exactly `Y-MM-DD` and configures `dateRange='weeks'` (`#35897`, 1432471–1432478, 1432595–1432602). The picker handler forwards its selected value to local state without a visible reformat (`#35902`, 1432725–1432737); the request still receives one date argument, not a start/end pair. No server timezone, week-boundary, or inclusivity claim follows.

The weekly UI's “The menu has not been published yet” is local fallback copy. The render branch is reached for a falsy weekly body, falsy root `id`, or truthy local loading state (`#35897`, 1432605–1432648; loading is local state initialized/set in the same screen path). It is not a response field or server publication status. Likewise, `user_menu`/`root_name == 'foodmenu'` only gates client navigation (`#32319/#32329`, `eliis.hasm` 1264530–1264544, 1265022–1265029, 1265164–1265192); it does not establish guardian role mapping or server permission. No follow-up food-menu write is traced in these UI flows; this is scoped client behavior, not a guarantee about server-side read effects.

## Current all-17 response dispositions

Counts below are named response field paths in the current round-2 candidates; array-item pseudo-paths such as `body[]` and `body.days[]` are not counted. Object/array types are retained only where client use establishes those containers; scalar/leaf values remain unknown. The removed auth `message` observations explain why these current counts are two lower than the earlier 134-path table.

| Domain | Operation | Source function | Disposition | Named field paths |
| --- | --- | ---: | --- | ---: |
| Auth | `Login` | 16308 | object | 3 |
| Auth | `Login2FA` | 16309 | object | 2 |
| Discovery | `GetUserData` | 16344 | object | 14 |
| Discovery | `GetUserPermissions` | 16348 | object | 8 |
| Discovery | `GetChildProfile` | 25634 | object | 3 |
| Discovery | `GetChildCourses` | 25624 | array | 2 |
| Events | `GetEvents` | 25403 | object | 24 |
| Events | `GetRecentEvents` | 25401 | object | 2 |
| Attendance | `GetChildCalendar` | 25644 | object | 9 |
| Attendance | `GetStatusLogs` | 25650 | array | 12 |
| Attendance | `GetAbsenceModalData` | 25652 | object | 1 |
| Diary | `GetGuardianFeed` | 25632 | object | 22 |
| Diary | `GetGuardianDiary` | 25630 | unknown | 0 |
| Diary | `GetDiaryData` | 25935 | object | 17 |
| Food | `GetDayMenu` | 26007 | unknown | 0 |
| Food | `GetWeekMenu` | 26009 | object | 13 |
| Food | `DownloadFoodmenuFile` | 37318 | binary | 0 |
| **Total** | **17 operations** |  | **12 object / 2 array / 2 unknown / 1 binary** | **132** |

The 132 named fields comprise **110 unknown-valued fields, 16 array-valued fields, and 6 object-valued fields**. Every modeled property remains optional/open; the two opaque `unknown` operations have no fabricated root fields, and the binary operation has no native job/status/byte metadata modeled as HTTP body data. A structural projection comparison found the response kind and named field/type paths match the integrated response analyses for **17/17** candidate operations.

### Auth message and unknown-policy boundary

- `Login` success-path fields are only `type`, `identifier`, and `locked_out`; `Login2FA` success-path fields are only `status` and branch-local `locked_at`. `models/responses.tsp` contains no `message` property in either model.
- The separate `error.response.data.message` reads are recorded in `evidence/research/auth-common.json` as non-normative `clientResponseObservations`: `#13517` reads it on rejection (543815–543830), and `#27145` does so on rejection (1048494–1048512). Candidate capability prose also explicitly calls them rejection-only observations, not fulfillment fields. No error wrapper, status code, success/error union, or error-body schema is invented.
- The same boundary holds for other client-only semantics: permissions selector truthiness and navigation gates are described as UI behavior, with server authorization unresolved; status/date formats and fallback text are not promoted to server enums, publication states, or interval rules. `GetGuardianFeed.data[].diaries[].texts` remains `unknown` because the traced `typeof === 'object'`/`Object.keys` path also admits arrays. Employee `GetDiaryData` fields are not attributed to guardian diary access.

## Coverage checker, renderer, docs, and request merge

- `node scripts/check-guardian-batch.mjs`: **passed**, validating exactly **17** response candidates and **17** capability rows with unique in-scope operation/source identities. The checker requires all six claim groups (query, permissions, date/time, pagination, read-side effects plus established/unresolved fields), traces, and blockers. It accepts omitted optional trace `line` values and rejects malformed supplied lines; it validates structure, not evidentiary truth.
- `node scripts/check.mjs`: **passed** against existing generated artifacts (read-only; this review did not compile or regenerate). It validated **296** canonical OpenAPI operations, matching JSON/YAML output, default-only response statuses and `*/*` media placeholders; coverage remains **298 observations / 296 operations**, **92 partial models / 189 unknown / 15 binary**. The check explicitly leaves unknown/binary response schemas unconstrained and modeled response fields optional/open.
- Pure in-memory `renderGuardianBatch(loadGuardianBatch())` output is byte-identical to `docs/GUARDIAN-CAPABILITIES.md` and `docs/GUARDIAN-HA-BLOCKERS.md`; the capability table has exactly **17 rows** and eight columns for operation/request, observed response paths, unresolved limits, query, permission, date/time, pagination, and read-side effects. Each row preserves “no claim recorded” as not proving server absence. The five HA-blocker sections keep setup/authorization blocked and state that missing attendance evidence is unknown—not absence; `/diary` remains unproven; food fallback and download metadata remain non-normative.
- The four request-candidate records are integrated without duplicate names: `GetGuardianFeed.date`; `GetChildCalendar.start_date/end_date`; existing `GetStatusLogs.date`; and existing `GetAbsenceModalData.form.user_id`. `GetStatusLogs.date` remains baseline `unknown` despite the caller's formatted value. The outer `form` remains `unknown` with nested `user_id: unknown`; no bracket/dotted query encoding is asserted. The merge implementation/tests preserve baseline unknown types and proof, recursively upsert names, and reject conflicting proved types/metadata.
- Reviewed (but did not execute) `tests/guardian-batch.test.mjs` and `tests/guardian-capabilities-render.test.mjs`: they cover exact/missing/duplicate/out-of-scope operation rows, response/request validation, optional trace lines, immutable recursive merge, unknown-type preservation, deterministic 17-row rendering, Markdown escaping, blocker sections, and incomplete input rejection. No test, build, generation, or HTTP command was run.

## Findings

None for the assigned food/tooling/auth-message/normative-unknown scope. The checker and renderer provide coverage guarantees only; source truth and server authorization/completeness remain bounded as stated above.

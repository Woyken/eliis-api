# Post-integration guardian review — food/tooling (round 1)

## Verdict

**Clean for the assigned food/tooling slice; no factual correction or blocker found.** The three food operations remain bounded to original-client static evidence, the integrated response views preserve the observed body paths, and the generated capability/blocker documents do not present UI behavior as server authorization or a ready Home Assistant integration.

This is one post-integration review round. It does not certify the other domains' semantic findings beyond the limited cross-check recorded below.

## Frozen input and review boundary

- `evidence/reviews/guardian-input-snapshot.json` declares snapshot SHA `a133d438fd618372804307c13ef67c35d46bc929ea3262afd1ca9107dbf05897`. All **60/60** listed file SHA-256 values matched before review and were rechecked after this report was written.
- The repository `HEAD` is `29cd7edda2ab6383479311119572171339df4b10`; the requested SHA is the guardian input-manifest identifier, not that Git commit ID. The integrated working-tree changes predate this review; no input, candidate, generated document, or shared evidence file was edited here.
- Source verification used the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` disassembly. No API request, login, private-record access, or API write was made.

## Food operation review

| Operation / original function | Verified client observation | Boundary retained |
| --- | --- | --- |
| `GetDayMenu` / `#26007` | Builds `/api/kindergartens/{kindergartenId}/foodmenu/day?date={arg}` by concatenating the argument directly after literal `?date=`; calls shared Axios `get` with only the resulting URL. Its continuation returns `.data`, the success callback forwards the whole body, and the reducer stores it at `state.foodmenu.day_menu`. | No consumer of `day_menu` was found. The separate `DayMenu` component is passed weekly-response `days` items, so its reads are not transferred to this endpoint. Body shape remains opaque. |
| `GetWeekMenu` / `#26009` | Builds `/api/kindergartens/{kindergartenId}/foodmenu/week?date={arg}` with the same URL-only call. The body passes through the service/action/reducer and selector `#35898` unchanged. `FoodMenuScreen` reads root `id`, `info`, `uploaded_files`, and `days`; each original `days` item is passed to `#37310`. | `id`, `info`, day `id`/`date`/`breakfast`/`lunch`/`supper`/`dinner`, and file `id`/`filename`/`name` remain unknown-valued partial client reads. Only `days` and `uploaded_files` container use is evidenced. No dish/group/variant/course/substitution structure, staff report, requiredness, or complete server schema is inferred. |
| `DownloadFoodmenuFile` / `#37318` | Uses selected file `id` in `/foodmenu/{id}/download`; sanitizes `filename` only for the local destination; gets the saved cookie, passes it to RNFS, and streams the downloaded bytes to a file. `name` is a display read. | Response is opaque binary transport. UI PDF labeling, local filename, and RNFS job/status/byte metadata do not establish HTTP MIME, headers, status, or JSON body fields. No write endpoint is called from the guardian menu flow. |

The menu services use the shared cookie-authenticated Axios client, add no per-request `Authorization` header, and call `get` with the URL only. The file download explicitly supplies the saved cookie through RNFS. The two menu URLs contain a literal query string, not an Axios `params` object. Original `#5683` `buildURL` returns its input URL unchanged when `params` is falsy (`eliis.hasm:257758–257766`); therefore Axios's params serializer does not encode/rebuild these values. Later platform/network URL normalization remains unknown. The weekly screen's initial date uses exactly `.format('Y-MM-DD')` and sets `dateRange='weeks'` (`#35897`, `1432471–1432478`, `1432595–1432602`). It sends one current date argument; the selected/picker-updated value is not shown being formatted again. No week-window, timezone, or inclusive-boundary claim is made.

The literal “The menu has not been published yet” is reached by a local render branch when `week_menu` is falsy, root `id` is falsy, or local loading state is truthy (`#35897`, `1432490–1432495`, `1432605–1432648`). It is not modeled as a response field/status or publication guarantee. The navigation observation is similarly bounded: `#32319` selects `user.user_menu`, `#32329` searches `root_name`, and `MenuItems` checks literal `foodmenu` before rendering the item (`1264530–1264544`, `1265022–1265029`, `1265164–1265192`). This is a client-side menu gate only—not proof of a guardian role, backend permission, or authorization for a particular file/child.

## All-17 candidate and document coverage

Each scoped source/operation has exactly one response disposition and one capability disposition. Counts below are the integrated candidate field paths (all optional/open; counts do not assert server completeness). The four request-candidate records are listed separately after the table.

| Domain | Operation | Source function | Response disposition | Field paths |
| --- | --- | ---: | --- | ---: |
| Auth | `Login` | 16308 | object | 4 |
| Auth | `Login2FA` | 16309 | object | 3 |
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

The 17 operation/source identities are unchanged. The baseline hashes in `evidence/guardian-batch/pre-integration-snapshot.json` match the pre-integration records at `HEAD`; comparison with the integrated records shows exactly these 17 response analyses changed and no out-of-scope response analysis changed. The recursive field-path count is **36 → 134**; four request-candidate rows enrich **GetGuardianFeed.date**, **GetChildCalendar.start_date/end_date**, **GetStatusLogs.date**, and **GetAbsenceModalData.form.user_id**, for **2 → 6** named/nested request paths. Existing `GetStatusLogs.date` and `GetAbsenceModalData.form` remain single fields: there are no duplicate query keys, and nested `form` encoding is not invented.

The structural checker requires every capability row to provide all six relevant disposition groups: established and unresolved fields, query semantics, permissions, date/time semantics, pagination, and read-side effects, plus trace and blockers. The rendered document includes 17 endpoint rows with those eight table categories; absent claims are explicitly rendered as “not recorded,” not as server-negative assertions. The blockers document keeps setup/authorization blocked, and both documents state that this is static client research—not a verified integration or complete server contract.

## Request merge and tooling checks

- `mergeRequestFields` recursively upserts by field name, preserves the baseline query type `unknown` when a caller only proves a local string, and retains distinct evidence without duplicate entries. The real-file checker validates the four candidate request enrichments non-mutatingly. `GetStatusLogs.date` remains unknown despite the caller's `YYYY-MM-DD` value; `form` remains an unknown query value with nested `user_id`, without a bracket/dotted serialization claim.
- `node scripts/check-guardian-batch.mjs`: **passed**, 17 response candidates and 17 capability rows.
- `node --check scripts/check-guardian-batch.mjs` and `node --check scripts/render-guardian-capabilities.mjs`: **passed**.
- Pure `renderGuardianBatch` output is byte-identical to both checked-in Markdown files; it contains exactly **17** endpoint rows. Existing renderer tests cover deterministic repeat output and escaping of evidence/field text.
- `node --test tests/*.test.mjs`: **28 passed, 0 failed**. Generator tests used temporary fixtures; no repository generation, build, TypeSpec compilation, CI, Git mutation, HTTP request, or project artifact write was run.
- The response coverage record remains **298 observations / 296 canonical operations**, **92 modeled partial responses / 189 unknown / 15 binary**, and 251 model definitions (from 225). The batch adds no endpoint identity and does not alter the binary count.

## Cross-slice source-citation guard

The disputed discovery caller context was checked against the original bytecode rather than inherited from an earlier report. `#44679` loads literal `true` and passes it as the profile thunk context (`1828043–1828065`); `#25519` uses the truthy branch for `SET_MY_CHILD`, while `#44124` supplies literal `false` (`1800742–1800753`) and reaches the distinct `SET_CHILD` branch. `#44120` stores `#44121`'s whole-child selector in slot 4 and `#44122`'s `kindergarten_id` selector in slot 5 (`1800125–1800139`); `#44124` passes slot 5, not slot 4 (`1800750`). The corrected selector-resolution note and current discovery capability/blocker text preserve these distinctions and still leave the route child-ID handoff and server authorization unresolved. No correction is needed in the reviewed food/tooling docs.

## Findings

None for the assigned food/tooling and post-integration structure/documentation scope.

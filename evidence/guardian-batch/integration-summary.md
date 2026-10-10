# Guardian batch integration summary

Date: 2026-10-10. This records the bounded merge of the 17 scoped, existing operation identities; it does not certify a complete server contract. Baseline hashes for the pre-merge request/response records are recorded in [`pre-integration-snapshot.json`](pre-integration-snapshot.json).

## Counts

- Response field nodes in the 17 target records: **36 before → 134 after** (recursive field count; item paths included).
- Named/nested request field nodes in the four enriched records: **2 before → 6 after**.
- Operation identities: **17 in scope; 0 added; 0 removed**.
- Read-only `makeCatalog` → `makeResponseCatalog` → `renderResponseModels` comparison: research observations and canonical operation counts remain **298 / 296**; modeled response operations change **87 → 92** (binary remains 15; opaque unknown changes 194 → 189); response model definitions **225 → 251**. No generated artifact was written.

### Response field nodes by operation

| Operation | Before | After |
| --- | ---: | ---: |
| `Login` | 1 | 4 |
| `Login2FA` | 2 | 3 |
| `GetUserData` | 10 | 14 |
| `GetUserPermissions` | 1 | 8 |
| `GetChildProfile` | 1 | 3 |
| `GetChildCourses` | 0 | 2 |
| `GetEvents` | 0 | 24 |
| `GetRecentEvents` | 2 | 2 |
| `GetChildCalendar` | 1 | 9 |
| `GetStatusLogs` | 0 | 12 |
| `GetAbsenceModalData` | 1 | 1 |
| `GetGuardianFeed` | 0 | 22 |
| `GetGuardianDiary` | 0 | 0 |
| `GetDiaryData` | 17 | 17 |
| `GetDayMenu` | 0 | 0 |
| `GetWeekMenu` | 0 | 13 |
| `DownloadFoodmenuFile` | 0 | 0 |

### Request field nodes by operation

| Operation | Before | After |
| --- | ---: | ---: |
| `GetGuardianFeed` | 0 | 1 |
| `GetChildCalendar` | 0 | 2 |
| `GetStatusLogs` | 1 | 1 |
| `GetAbsenceModalData` | 1 | 2 |

## Merge rules and limits

- Existing models were merged by operation/source identity and nested field name. Existing typed field evidence was preserved; candidate `unknown` values did not erase established types or nested fields. Previously opaque dispositions were refined only where the reviewed candidate provided direct response-to-consumer evidence.
- Discovery selector flow uses the original-source resolution in [`guardian-discovery-selector-resolution.md`](../reviews/guardian-discovery-selector-resolution.md), correcting the initial-review counterexample: `#44121` returns the whole `state.myChild.child`; `#44122` returns optional `state.myChild.child.kindergarten_id`; `#44123` returns optional `state.myChild.child.deleted_at`. `#44120` stores these results in environment slots 4, 5, and 6, respectively (1800125–1800139). `#44124` reads slot 5 as argument 1 at 1800750, route `childId` as argument 2 at 1800751, and literal `false` as argument 3 at 1800752. Thus the false-context call passes the selected kindergarten identifier and dispatches `SET_CHILD`, not the whole child object. The distinct `#44679` true-context path supports `name`/`profile_picture` reads via `SET_MY_CHILD`; this client flow still does not establish guardian authorization or the init-child-ID route handoff.
- `GetDiaryData` existing response paths remain intact; `GetGuardianDiary` and `GetDayMenu` remain opaque; `DownloadFoodmenuFile` remains binary.
- Auth `message` reads are optional rejection/error-body observations only—not fulfillment-body guarantees. Cookie persistence is response-header behavior; auth-client rejection pass-through and default-client 401 cleanup remain distinct local behaviors, not body fields or universal HTTP/server status semantics.
- `GetStatusLogs.date` retains its existing unknown query type. `GetAbsenceModalData.form` remains an unknown query value with nested construction evidence and no inferred bracket/dotted encoding. `GetChildCalendar` adds caller date keys while preserving arbitrary query passthrough; guardian feed `date` is caller-observed and page remains separate local state.
- Capability evidence is non-normative: no server authorization, role, date inclusivity, timezone, status meaning, pagination completeness, or field requiredness is claimed. No staff roster substitutes for child discovery; absence from missing attendance evidence is not inferred; secondary `/diary` guardian access remains blocked; weekly-menu fallback text is not a publication status; downloaded bytes are opaque.

## Changed files

Response evidence: `evidence/responses/auth-common.json`, `evidence/responses/children-diary-files.json`, `evidence/responses/communications.json`, `evidence/responses/coverage-extra.json`.
Request evidence: `evidence/research/auth-common.json`, `evidence/research/children-diary-files.json`.

README and package script wiring were also updated. The integration summary JSON and this Markdown file are authored records. Candidate inputs, review reports, generated docs, and OpenAPI artifacts were not modified.

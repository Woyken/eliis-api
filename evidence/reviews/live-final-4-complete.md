# Post-integration live audit review 4 — complete

**Disposition: clean for this round; no actionable findings.** The R3 sample-component publication leak is resolved in the reviewed state. This is the final permitted review, not a two-consecutive-clean or final-publication certification: Round 3 failed, so a clean Round 4 cannot complete the required two-clean sequence.

## Scope, integrity, and safety

Reviewed the complete bounded live-audit ledger (17 operation paths, 14 sampled operations, 3 skips, 15 observation labels), source identities and methods, static `GetEvents` / `GetRecentEvents` analyses, sample-only model sources/artifacts, current OpenAPI JSON/YAML, checker and focused tests, current-facing audit status, privacy limits, and the supplemental REA assessment. This certifies only the bounded audit and its published shapes, not the complete Eliis API or a complete server contract.

The frozen [`live-input-snapshot.json`](live-input-snapshot.json) declares `110f6f8331b3792998668d55ce66563aed9c7b7fcf144a403c758ab118db8b3c` for **80 files**. All **80/80** per-file SHA-256 entries matched before the review and again after this report was written. The original external `eliis.hasm` remained SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`. No frozen input or pre-existing worktree file was edited; this report is the only file added.

No HTTP/API request, login, app action, raw/private capture read, build, TypeSpec/OpenAPI compile, generation, npm command, or Git operation was performed. Only the existing read-only Node checker/validator and the permitted focused tests ran.

## Round 3 fix and publication boundary

- `main.tsp` imports the generated normative models and routes, but **does not import** `models/live-observations.tsp`. The sample TypeSpec remains available as a separate source artifact; `scripts/observed-response-models.json` remains its separate JSON-schema view.
- `scripts/check.mjs` rejects component names matching qualified or unqualified `Observed_*` and rejects `x-authenticated-sample-view` on normative OpenAPI schemas. `tests/live-response-models.test.mjs` has regressions for both `LiveObservations.Observed_Fixture` and a marker-flagged schema.
- Independently scanned the actual resolved files `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.json` and `/data/data/com.termux/files/home/eliis-api/tsp-output/@typespec/openapi3/openapi.yaml`, both as raw text and parsed JSON/YAML. Each had **zero** qualified/unqualified `Observed_*` names and **zero** `x-authenticated-sample-view` markers. The production checker also confirmed JSON/YAML parity. For API artifacts, the Pages workflow publishes those OpenAPI JSON/YAML files and does not copy the standalone sample-model artifacts.
- The standalone sample artifacts still contain **14 models / 15 observation labels** and are marked non-normative and sample-only. They remain open, with optional properties; null-only and conflicting types remain unconstrained as `unknown`, and array item shapes merge across the assigned observation shapes. They are not referenced from normative operations. The generated schemas contain structure/types, not raw sample values.

## Bounded scope and source/model checks

The frozen scope, path-disposition ledger, and canonical operation catalog reconcile on all **17 operation IDs and source IDs**, with matching methods/routes. The exact observation-label set remains:

`Login`, `Login2FA`, `GetUserData`, `GetUserPermissions-institution-1`, `GetChildProfile`, `GetChildCourses`, `GetEvents`, `GetRecentEvents`, `GetChildCalendar`, `GetStatusLogs`, `GetStatusLogs-recorded-day`, `GetAbsenceModalData`, `GetGuardianFeed`, `GetDayMenu`, and `GetWeekMenu`.

The two qualified labels map to the correct operations/sources: `GetUserPermissions-institution-1` → `GetUserPermissions` / source `16348`; `GetStatusLogs-recorded-day` → `GetStatusLogs` / source `25650`. The other labels map to their same-named operation and source in the ledger.

| Operation | Source | Disposition and method/path |
|---|---:|---|
| `Login` | 16308 | Sampled — `POST /api/auth/login` |
| `Login2FA` | 16309 | Sampled — `POST /api/auth/login-2fa` |
| `GetUserData` | 16344 | Sampled — `GET /api/common/init` |
| `GetUserPermissions` | 16348 | Sampled — `GET /api/kindergartens/{kindergartenId}/user/permissions` |
| `GetChildProfile` | 25634 | Sampled — `GET /api/kindergartens/{kindergartenId}/children/{childId}/profile` |
| `GetChildCourses` | 25624 | Sampled — `GET /api/kindergartens/{kindergartenId}/children/{childId}/courses` |
| `GetEvents` | 25403 | Sampled — `GET /api/kindergartens/{kindergartenId}/events` |
| `GetRecentEvents` | 25401 | Sampled — `GET /api/kindergartens/{kindergartenId}/events/recent` |
| `GetChildCalendar` | 25644 | Sampled — `GET /api/kindergartens/{kindergartenId}/children/{childId}/calendar` |
| `GetStatusLogs` | 25650 | Sampled twice — `GET /api/kindergartens/{kindergartenId}/children/{childId}/status-log` |
| `GetAbsenceModalData` | 25652 | Sampled — `GET /api/kindergartens/{kindergartenId}/children/{childId}/absences/modal` |
| `GetGuardianFeed` | 25632 | Sampled — `GET /api/kindergartens/{kindergartenId}/children/{childId}/guardian-feed` |
| `GetGuardianDiary` | 25630 | Skipped — `GET /api/kindergartens/{kindergartenId}/children/{childId}/diary` |
| `GetDiaryData` | 25935 | Skipped — `GET /api/kindergartens/{kindergartenId}/diary` |
| `GetDayMenu` | 26007 | Sampled — `GET /api/kindergartens/{kindergartenId}/foodmenu/day` |
| `GetWeekMenu` | 26009 | Sampled — `GET /api/kindergartens/{kindergartenId}/foodmenu/week` |
| `DownloadFoodmenuFile` | 37318 | Skipped — `GET /api/kindergartens/{kindergartenId}/foodmenu/{foodmenuId}/download` |

There are **14 sampled operation IDs / 15 observations**: **2 authorized authentication/session-creation POST observations** and **13 GET observations** (one operation, `GetStatusLogs`, has two contexts). The three GET skips remain bounded: `GetGuardianDiary` has no proven parent consumer and guardian access is unproved; `GetDiaryData` is employee/course-scoped and a reachable caller flushes autosaves; `DownloadFoodmenuFile` had no structured file item and remains opaque. No denial probe, staff-roster substitution, unrelated-record enumeration, secondary staff-diary read, explicit feature write, seen/read mutation, logout, retry, or error probe is present. The sampled child/institution reads are limited to account-discovered context; no server ownership or authorization rule is inferred.

### Canonical event responses

- **`GetEvents`:** original Hermes v96 source independently establishes the successful HTTP body root as an array. Service `#25403` returns Axios `response.data` through `#25404`; continuation `#25375` writes that entire value into the locally composed `SET_EVENTS` action's `action.data.items` slot at `eliis.hasm:994715–994729`; reducer `#25344` iterates that local slot at `993583–993589`. Thus `items` is not an HTTP-root property. The response analysis and existing OpenAPI retain an array root, **17 direct item properties / 23 total property nodes**, an empty root `fields` list, and no required item fields. Open/nested structures and unknown leaves remain partial; no timezone, recurrence, or date semantics are inferred.
- **`GetRecentEvents`:** the static response remains an open object with root `events` and `count`, both unknown. The original consumer reads those two body-root properties but does not inspect event items. Its sample-only array/integer types and nested item paths remain in the standalone sample views; the canonical static record and generated `GetRecentEvents` response contain no sample-derived type or prose. The OpenAPI retains only the unresolved default response/media representation.
- Across sample views, array/item shapes are contextual observations only. Counts do not establish array-length relationships; Boolean equality facts do not prove ownership, enrollment, or server authorization; permissions’ observed integer types do not establish permission semantics. Calendar status observations do not imply absence, and unlabelled feed groups do not establish child ownership or one-item-per-group distribution. Date-like properties carry observed types/coarse context only, not actual sample dates or date-format/server rules. Empty arrays/objects and null-only leaves do not imply global emptiness or nullability.

## Privacy, documentation, and supplemental assessment

Manually reviewed the property paths/types in all 14 sample views (273 nested property paths / 168 distinct property names). Identifier/contact/date-like words are schema labels only; no actual identifiers, names, contact values, dates, birth/address values, permission values, event descriptions, diary contents, menu text, credentials, cookies, or raw bodies are present. The `d_0`–`d_6` keys are fixed day slots, not value-keyed records. No dynamic identifier-keyed map was observed. This is a manual publication review alongside the structural validator; the validator is **not** a general PII detector.

The current-facing [`docs/LIVE-MODEL-AUDIT.md`](../../docs/LIVE-MODEL-AUDIT.md) correctly records Round 1 as historically failed/fixed, Round 2 as clean, Round 3 as failed, and Round 4 as pending at the time of its freeze. It states that the two-clean goal is unmet and makes no final certification claim. The frozen path-disposition file retains its original Round 1 phase metadata as part of the unchanged input snapshot; it is not the current review-status authority.

The supplemental [`REA assessment`](../tool-assessments/rea.md) is bounded to public documentation/package/source material. It does not claim REA analyzed Eliis HBC, and records no install, configuration, target execution, or private-data transfer. No raw capture was used in this review.

## Read-only checks

- `node scripts/check.mjs` passed against the existing artifacts: **296** canonical OpenAPI operations, **298** research observations, **92** partial static response models, **189** unknown and **15** binary dispositions, plus **14** separate sample-only views.
- `node scripts/check-live-observations.mjs` passed: **15** type-only observations.
- `node --test tests/live-observations.test.mjs tests/live-response-models.test.mjs` passed **9/9** focused tests, including the qualified component-name and marker-flag checks, safe sample-type merging, exact label/source authorization, and rejection of implicit or skipped-operation authorization.
- The parent session reports **38/38** full-suite tests; that suite was not rerun in this bounded review.
- Direct JSON/YAML scans and the source/scope checks above were read-only. No generated files were refreshed.

## Findings and hard stop

| ID | Severity | Finding |
|---|---|---|
| — | — | No actionable findings in this Round 4 review. |

**Round 4 is clean, but the required two consecutive clean whole-audit reviews were not achieved.** Round 3 failed between the clean Round 2 and this clean Round 4; therefore Round 2 cannot pair with Round 4. Round 4 is the fourth and final permitted post-integration review. Stop here: do not start another review/fix round and do not claim final certification or that the two-clean publication gate passed. Any subsequent publication must disclose the failed Round 3, the clean-but-final Round 4, and the unmet certification gate.

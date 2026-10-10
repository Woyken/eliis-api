# Post-integration live audit review 2 — complete

**Disposition: clean; no actionable findings.** This is the first clean whole-audit review after the non-clean first round. Round 1's four findings are resolved in the reviewed state. It is not a final publication certification: the target remains two consecutive clean reviews, so one more clean round is required.

## Scope, safety, and frozen inputs

Reviewed all **17** scoped operations and their source identities, dispositions, sample labels, canonical response analyses, sample-only models, existing OpenAPI output, tooling/tests, and current-facing documentation. The Round 1 fixes were reviewed against the original Hermes source where applicable. No HTTP request, login, app action, private capture/raw response access, build, TypeSpec/OpenAPI compile, or file-writing generation was performed. The read-only checker and focused tests described below were run; the guardian-document renderer was compared in memory only. No pre-existing worktree changes were modified.

The frozen [`live-input-snapshot.json`](live-input-snapshot.json) declares SHA-256 `a0b996dd9b4ea13f47371c41fe9e6363ce6930e0e9c87417cab54e56e0ad99a1` for **80 files**. All **80/80** per-file hashes matched before review and again after this report was written. The external original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` remained SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`, matching the source hash recorded by Round 1. Only this review report was added by this review; the frozen inputs and unrelated worktree edits were left untouched.

## Path and source-identity ledger

The frozen guardian scope, path-disposition ledger, and operation catalog agree on all **17 operation IDs and source function IDs**. Their methods and paths match the catalog. There are **14 sampled operations, 3 explicitly skipped operations, and 15 body-observation labels**: `GetStatusLogs` has two distinct contexts. The two login POSTs are the authorized authentication/session-creation exceptions; all other scoped operations are GETs.

The exact authorized labels are `Login`, `Login2FA`, `GetUserData`, `GetUserPermissions-institution-1`, `GetChildProfile`, `GetChildCourses`, `GetEvents`, `GetRecentEvents`, `GetChildCalendar`, `GetStatusLogs`, `GetStatusLogs-recorded-day`, `GetAbsenceModalData`, `GetGuardianFeed`, `GetDayMenu`, and `GetWeekMenu`. The institution-specific permissions label maps to `GetUserPermissions` / source `16348`; the recorded-day label maps to `GetStatusLogs` / source `25650`. Every other label maps to its same-named operation/source in the ledger below.

| Operation | Source function | Disposition | Method and path |
|---|---:|---|---|
| `Login` | 16308 | Sampled (1) | `POST /api/auth/login` |
| `Login2FA` | 16309 | Sampled (1) | `POST /api/auth/login-2fa` |
| `GetUserData` | 16344 | Sampled (1) | `GET /api/common/init` |
| `GetUserPermissions` | 16348 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/user/permissions` |
| `GetChildProfile` | 25634 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/profile` |
| `GetChildCourses` | 25624 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/courses` |
| `GetEvents` | 25403 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/events` |
| `GetRecentEvents` | 25401 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/events/recent` |
| `GetChildCalendar` | 25644 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/calendar` |
| `GetStatusLogs` | 25650 | Sampled (2) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/status-log` |
| `GetAbsenceModalData` | 25652 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/absences/modal` |
| `GetGuardianFeed` | 25632 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/children/{childId}/guardian-feed` |
| `GetGuardianDiary` | 25630 | Skipped | `GET /api/kindergartens/{kindergartenId}/children/{childId}/diary` |
| `GetDiaryData` | 25935 | Skipped | `GET /api/kindergartens/{kindergartenId}/diary` |
| `GetDayMenu` | 26007 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/foodmenu/day` |
| `GetWeekMenu` | 26009 | Sampled (1) | `GET /api/kindergartens/{kindergartenId}/foodmenu/week` |
| `DownloadFoodmenuFile` | 37318 | Skipped | `GET /api/kindergartens/{kindergartenId}/foodmenu/{foodmenuId}/download` |

The skips remain bounded and justified: `GetGuardianDiary` has no proven parent consumer and guardian access is unproved; `GetDiaryData` is employee/course-scoped and one reachable caller flushes autosaves; no structured file item was available for `DownloadFoodmenuFile`, so no download was attempted. None is a denial probe, a staff-roster substitution, or an observation of an empty/denied response.

## Source correction and canonical response boundary

### `GetEvents`

The root-array correction is supported by the original source, not just by the live sample:

- Service `#25403` calls Axios and handler `#25404` returns `response.data` (`eliis.hasm:995342-995389`), the projected HTTP body.
- Continuation `#25375` creates a local `SET_EVENTS` action and writes the entire returned body to its local `action.data.items` slot (`994704-994729`), alongside locally supplied kindergarten/date/timezone context.
- Reducer `#25344` reads that local `action.data.items` and invokes `forEach` (`993583-993589`). The `items` property is on the local Redux action, not the HTTP body.

The canonical static response is therefore an array. The open partial item model retains all **17 direct properties / 23 total property nodes including nesting**; it does not discard static reads absent from the one sample (including `repeat_start`, `repeat_end`, and `acl_groups`). Fields stay optional, and no unproved leaf scalar types or server semantics are inferred. `evidence/responses/communications.json`, `models/responses.tsp`, generated routes, and the existing OpenAPI representation agree on the correction.

### `GetRecentEvents` and the other sample views

`GetRecentEvents` remains a static open object with optional, unknown-typed body-root `events` and `count`, as established by the bytecode reads in continuation `#25372`; the traced path does not inspect nested event items. Its captured `events: array`, `count: integer`, and captured item paths/types occur only in the separate sample observation/model. The canonical static evidence is bytecode-derived; runtime sample prose is not copied into its static response evidence or OpenAPI extensions. No request/path/query evidence was changed.

The approved sample set produces **14 standalone, non-normative sample models from 15 labels**. They are not operation responses. Objects are open; no property is required. Null-only observations and conflicting types map to unconstrained `unknown`; absent paths in one sample do not remove static-only canonical paths. Observed primitive types (including `string`) are sample facts only. The empty `GetDayMenu` instance is represented as an open sample object with no listed properties, not as a global empty-menu rule. Sample `HTTP 200` and `application/json` remain observation metadata and are not universal response status/media claims.

The existing normative OpenAPI was read and validated, not rebuilt. It contains no `Observed_*` schemas or operation sample-response binding; response status remains the unresolved `default` placeholder and media remains `*/*`. Canonical request evidence is unchanged. In particular, the broader auth/discovery captures do not promote their fields/types to universal requiredness or narrow static unknowns. Guardian/account equality results remain generic, context-only facts: the guardian record's `user_id` matched the sampled root-user identity, and kindergarten-key comparisons matched in that context. These do **not** prove a guardian-to-child ownership join, access policy, or universal authorization.

## Round 1 findings and boundary checks

All four Round 1 findings were checked against their specific failure cases and are resolved:

1. **Skipped-operation admission:** nonempty live observations now require an exact explicit authorization set built from reviewed path dispositions. Authorization validates operation/source identities, the 14-operation/15-label counts, and expected skipped identities. All three known catalog skipped operations are rejected even with synthetic observations. The focused tests also verify a known-label substitution, wrong source identity, missing label, unknown label, and nonempty observations without an explicit authorization fixture are rejected.
2. **Sample prose in canonical `GetRecentEvents`:** the canonical response analysis is restored to bytecode-only root paths with both types unknown. Runtime types and item paths remain in the distinct sample layer.
3. **Stale current-facing provenance:** README, authentication, guardian capability/blocker, and evidence text now scope the earlier public/static work separately from the later authorized login/2FA and bounded read-only audit. Historical statements are explicitly scoped; no unqualified claim that authenticated login never occurred remains. The pure guardian renderer's in-memory output matches both tracked generated guardian documents.
4. **Regeneration-status mismatch:** the generated guardian capability table contains the corrected `GetEvents` array view, and the renderer matches the checked-in capability and blocker documents. No further generation-status correction is indicated by the frozen integration state.

## Privacy and tooling review

Manually reviewed the tracked live shape ledger, candidate summaries, sample model artifacts, dispositions, and current-facing documentation. Published live artifacts contain structural field names/types, counts, redacted query templates, sample-only transport labels, and generic equality outcomes only; no raw private body, actual sampled name, identifier, date, birth/address value, credential, cookie, event description, diary content, or menu text was found. `Login2FA.status` is represented only by its observed type. Field names such as `email`, `idcode`, or `fname` are schema names, not sampled values. The validator is a structural guard, not a general PII detector: numeric/UUID keys are rejected, while identifier-like dynamic keys remain a manual review boundary; that limitation is documented.

The supplemental REA assessment is public-source-only and accurately bounded: it finds no evidenced Hermes HBC decoder in the reviewed public docs, makes no claim that REA analyzed the Eliis HBC, and describes ordinary-JavaScript use only as conditional on genuine source being independently available. It records no installation, MCP configuration, target execution, or private-data transfer.

## Read-only checks

- `node scripts/check.mjs` passed against existing artifacts: **296** OpenAPI operations; **298** research observations; **92** partial static response models, **189** unknown dispositions, and **15** opaque binary/native-download dispositions; plus the **14** standalone live sample models. The check compared the existing JSON/YAML, verified the static response schemas and sample exclusion, and compared the in-memory authorized sample-model output to the tracked JSON and TypeSpec artifacts. It wrote no files.
- `node --test tests/live-observations.test.mjs tests/live-response-models.test.mjs` passed **8/8** focused tests, including skip, substitution, source-identity, and explicit-authorization regressions. The parent session reports **37/37** full-suite tests passing; the full suite was not rerun here because other test files exercise generation/compiler fixtures, outside this review's no-build/no-generation boundary.
- The guardian documentation pure renderer was called in memory and its two outputs matched the checked-in generated documents; no renderer write operation was invoked.

No HTTP/API request, login, npm command, compiler/build, TypeSpec/OpenAPI generation, private-capture read, or write outside this report was performed.

## Findings and review gate

| ID | Severity | Finding |
|---|---|---|
| — | — | No actionable findings. |

Round 2 is **clean** and is the first of the two consecutive clean whole-audit reviews sought. Round 1 was not clean, so this report does not certify final publication readiness. Round 3 must also be clean to meet the target; the four-round maximum remains unchanged.

# Post-integration live audit review 1 — source and models

**Disposition:** no source-model or path-disposition correction is needed. One low-severity documentation-status mismatch is recorded below. This is the first post-integration review, not a clean-round certification.

## Scope and constraints

Reviewed all 17 operations in `evidence/live-audit/path-dispositions.json` against the frozen scope, redacted shape inventory, response analyses, TypeSpec models, generated routes, the existing OpenAPI output, and the original Hermes disassembly. No HTTP request, login, app action, build, test, compile, generation, or Git write was performed. Raw private captures were not read. No file other than this review report was changed.

The snapshot manifest declares aggregate SHA-256 `18a3cd2f40dd1f108e42b6cf66cbd1d2692619a4371e11902629dc25a5c5f249`. All 79 listed file hashes matched before and after review. The external original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` also retained SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` across review. The existing `tsp-output/@typespec/openapi3/openapi.json` was inspected read-only; it was not regenerated.

## Path dispositions

The disposition ledger and frozen scope have the same 17 operation IDs and source function IDs; all 17 method/path pairs match the existing OpenAPI operation IDs. Counts reconcile to **14 sampled operations, 3 skipped operations, and 15 body-observation contexts** (the second `GetStatusLogs` context is a separate observation of the same operation). The two authorized authentication POSTs are distinct from the 15 GET operations; this review made no requests.

| Operation | Method and path | Disposition review |
|---|---|---|
| `Login` | `POST /api/auth/login` | Sample challenge paths remain optional/unknown canonically; the one-capture types are sample-only. No status value or lockout contract is inferred. |
| `Login2FA` | `POST /api/auth/login-2fa` | Static fields remain optional/unknown; the sampled status type is separate, with no published sampled value, enum, or branch guarantee. |
| `GetUserData` | `GET /api/common/init` | Wider account sample paths remain in the context view. Child/institution and profile/course comparisons are Boolean sample facts only, not ownership, enrollment, or authorization contracts. |
| `GetUserPermissions` | `GET /api/kindergartens/{kindergartenId}/user/permissions` | The 32 integer observations are sample-only; static unknown fields, including those absent in the capture, are retained. No Boolean/enum meaning, permission values, or enforcement is inferred. |
| `GetChildProfile` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/profile` | Wider profile/course paths remain sample-only. Equality checks do not establish a child join, ownership, enrollment, or cross-endpoint contract. |
| `GetChildCourses` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/courses` | Static array/item reads remain partial and unknown-typed; sampled `active` stays in the separate observation view. No stable-ID or enrollment meaning is inferred. |
| `GetEvents` | `GET /api/kindergartens/{kindergartenId}/events` | Correct root-array model; see the source and generated-schema check below. No sample-only fields/types were promoted. |
| `GetRecentEvents` | `GET /api/kindergartens/{kindergartenId}/events/recent` | Canonical body remains an open object with optional unknown `events` and `count`. Sample `array`/`integer` types and captured item paths stay separate; no item, count, or pagination contract is inferred. |
| `GetChildCalendar` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/calendar` | The nine static roots remain; raw day/entry shapes and types are sample-only. Seven rows do not establish a complete row schema, absence rule, or status/access meaning. |
| `GetStatusLogs` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/status-log` | The empty current-day array and one row for a day selected from the same bounded calendar context remain separate observations. The selected day was linked to a returned calendar row with positive `log_count`; no date/value is published and this does not establish an invariant, actor meaning, or absence. |
| `GetAbsenceModalData` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/absences/modal` | Static `min_date` remains unknown; its sampled string type does not establish date format, boundary, or access semantics. |
| `GetGuardianFeed` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/guardian-feed` | Static paths remain and sample-only status paths stay separate. “Five diary items across five groups” does not claim one per group; one read does not establish pagination, ownership of unlabeled groups, or feedback visibility. |
| `GetGuardianDiary` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/diary` | Correctly skipped: no proven parent/body consumer and guardian access is unproved. No request or denial probe; response remains opaque. |
| `GetDiaryData` | `GET /api/kindergartens/{kindergartenId}/diary` | Correctly skipped: employee/course scope is absent in this guardian context and a reachable caller flushes autosaves. No staff substitution or request; separate static evidence remains separate. |
| `GetDayMenu` | `GET /api/kindergartens/{kindergartenId}/foodmenu/day` | Canonical response remains unknown with no fields. The one sampled `{}` is not a no-menu or publication-state contract. |
| `GetWeekMenu` | `GET /api/kindergartens/{kindergartenId}/foodmenu/week` | Wider root/day shape is sample-only; null-only observations do not narrow static types. Existing static paths, including `uploaded_files` item reads, remain; `uploaded_file` and `uploaded_files` are not conflated. |
| `DownloadFoodmenuFile` | `GET /api/kindergartens/{kindergartenId}/foodmenu/{foodmenuId}/download` | Correctly skipped because no structured file item was available. The static response stays opaque binary; no downloader metadata is modeled as body fields and no MIME/status claim is made. |

The empty `GetDayMenu` object and empty current-day status-log array are represented only as those observations; neither is used to infer global emptiness or absence. The feed and diary dispositions do not overstate ownership or pagination. Existing static-only paths remain when absent from a sample. The sample artifacts publish structural paths/types and explicitly redacted generic Boolean checks, not private response values, IDs, names, dates, permissions values, or diary/menu content.

## `GetEvents` source and model check

The original source confirms the body boundary independently of the runtime sample:

- Service `#25403` attaches `#25404` at `eliis.hasm:995342-995378`; `#25404` returns Axios `.data` at `995383-995389`, i.e. the projected HTTP body.
- Continuation `#25375` receives that value (`994704-994710`) and writes it whole to a newly composed local `action.data.items` at `994714-994729`, alongside local context.
- Reducer `#25344` reads that local slot and calls `forEach` (`993583-993589`). Thus `action.data.items` holds the HTTP body; it is not an HTTP-body `items` field.

The correction is consistent in `evidence/responses/communications.json` (`GetEvents.kind: array`, root `fields: []`, `items.kind: object`), `models/responses.tsp` (`GetEventsResponseBody = GetEventsResponseBodyItem[]`), `routes/generated.tsp` (operation returns `GetEventsStaticResponse`), and the existing generated OpenAPI JSON. The OpenAPI response schema has root `type: array` and an item reference to an object; the root has no properties or `items` property. Resolving the item reference and its nested components yields **17 direct item properties and 23 total property nodes**, with no required list. The item and nested object views are open; scalar/leaf values remain unknown, while only source-traced object/array traversal is represented structurally. This preserves the prior static reads without turning them into required fields or domain types.

`GetRecentEvents` remains distinct: static JSON, TypeSpec, and OpenAPI retain body-root `events` and `count` with unknown types. Its observed `events: array`, `count: integer`, and nested capture paths appear only in the 14-model/15-label sample artifacts under the `Observed_` namespace / `scripts/observed-response-models.json`. Those schemas are open and optional, carry non-normative sample provenance, and are not referenced by any operation response. Sample status/media labels, empty values, equality outcomes, and primitive types do not become universal status, MIME, requiredness, nullability, enum, default, authorization, or domain claims.

The OpenAPI emitter’s existing `default` response and `*/*` media placeholder are retained as the unresolved TypeSpec representation; they are not evidence for an actual server status or MIME type. No OpenAPI rebuild was run.

## Finding

| ID | Severity | Finding and minimal action |
|---|---|---|
| `LIVE-FINAL-SOURCE-01` | Low | `docs/LIVE-MODEL-AUDIT.md:44` and `evidence/live-audit/path-dispositions.json`’s integration note still say the parent must regenerate `docs/GUARDIAN-CAPABILITIES.md`. The current generated table already shows the corrected `GetEvents` array root and its diff replaces the old root-`items` presentation. Sync those pending-status statements to the current generated artifact (or name any remaining specific stale content). This is documentation bookkeeping only; no response model, evidence path, or OpenAPI change is indicated. |

No other actionable source/model or path-disposition finding was identified. Per ownership, no shared status or model files were edited. The four-round post-integration review cap remains in force; this first review does not count as a clean review while the low-severity status note remains unresolved.

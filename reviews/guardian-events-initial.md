# Guardian events — initial review

**Verdict: revise the `GetEvents` response candidate before integration.** The service, request-parameter, and response-container findings are sound. The material gap is that the candidate stops at the list renderer: the selected event flows into the detail screen, calendar-export actions, and edit form, where additional properties descended from `body.items` are read. `GetRecentEvents` passes with its body-root fields left unknown.

## Scope

Only these two operations were reviewed:

| Operation | Service function | Result |
|---|---:|---|
| `GetEvents` | #25403 | Request/path and body-root `items` pass; item-field inventory and unresolved-field claims need revision. |
| `GetRecentEvents` | #25401 | Pass; `events` and `count` remain unknown body-root fields, with no nested item model. |

This is not a review of the other 15 operations in the guardian batch.

## Findings

### B1 — `GetEvents` item analysis omits response-origin reads and mislabels some as unresolved

`evidence/guardian-batch/events.json` currently lists `items[*]` reads from the conversion helper and `EventListItem`, but its limitation at line 124 says no response-origin read was established for `description`, `is_recurring`, or recurrence/`rrule`. That is contradicted by the traced consumer path:

1. Service #25403 calls GET and handler #25404 returns Axios `response.data` (`eliis.hasm` 995342–995389). Success continuation #25375 dispatches `body.items` with separately sourced local context (994704–994729).
2. Reducer #25344 iterates `action.data.items` and #25345 sends each entry to the conversion helper (993583–993589, 993640–993661). Helper #25423 starts with `Object.assign({}, entry)` and only conditionally rewrites the copied start/end date/time values (995958–995995); other item properties pass through.
3. The calendar list renders those Redux event records (#42292, 1715258–1715453; #42311, 1715940–1716377). Row callback #42306 stores the selected row event in `events.selectedEvent` before navigating to `Event` (1715754–1715783). `EventsStack` registers the `Event` screen (1714269–1714275); the event-screen module creates/exports `SingleEventScreen` #42355 (1718657–1718817). It selects `state.events.selectedEvent` through #42356 (1718843–1718846; selector at 1719519–1719526).
4. `SingleEventScreen` binds calendar-export handlers to that event (1718870–1718878), and its edit header route opens `Add/edit event` (1714382–1714427). The export consumers and edit form read properties from the selected event. This is a causal path from the fetched items, not inference from nearby create/update payloads.

At minimum, record the following additional client-observed paths on the `GetEvents` item, with **unknown** value types and no presence guarantees:

| Missing path(s) | Original consumer evidence |
|---|---|
| `duration` | Calendar date-dot reducer #25347 reads `event.duration` at 993743; the selected event has passed through #25423's shallow copy. Its comparison/use does not prove a numeric wire type. |
| `description` | `SingleEventScreen` reads the selected event's `description` at 1719291 and again at 1719333. The Google/Outlook export paths also read it (1719820–1719824, 1720077–1720082). |
| `creator.name` | `SingleEventScreen` reads `creator`, then its `name`, at 1719386–1719388. This is a nested path; it is not a root event `name` field. |
| `is_recurring`, `rrule`, `repeat_end` | Detail/calendar-export consumers read these event properties at 1718900, 1719725–1719738, 1719893–1719902; edit form #42554 reads `rrule`, `is_recurring`, and `repeat_end` at 1729198, 1729215, and 1729582. These reads establish no recurrence semantics or scalar types. |
| `acl_groups.view` and `acl_groups.manage` | `SingleEventScreen` reads `acl_groups.view` at 1718858–1718869; mapper #42359 reads each displayed group item's `name`, `id`, and `type` (1719562–1719605). Edit form #42554 reads `acl_groups.view` at 1729395–1729402 and `acl_groups.manage` at 1729626–1729627. These are UI data reads, not a server authorization contract. |

The edit route is also directly connected: header callback #42271 navigates to `Add/edit event` with `edit: true` (1714410–1714427); #42554 calls selector #42555 at 1729070–1729073, and #42555 returns `state.events.selectedEvent` at 1729670–1729677. Please correct both the candidate `fields` and its `unresolvedFields` (lines 195–199)/limitations (line 124) so they no longer say that `description` or recurrence properties have no response-origin read. Keep the item model open and the added values unknown/optional in any integrated TypeSpec model.

Do **not** turn the UI observations into broader claims. In this traced path, no response-origin read was established for root `name`, `location`, `full_day`, cancellation/publication status, `change_mode`, or course/child-specific applicability. The all-day calendar-export branch checks null start/end times; that is not evidence for a `full_day` response field. `acl_groups` and `access === 'manage'` are observed event data/client branches only; they do not establish guardian/staff visibility, permission semantics, or server enforcement. Avoid borrowing user/group or create/update request fields as response fields.

### B2 — Keep the query and local date/time claims carefully scoped (pass)

Both calendar constructors #42300 and #42323 call Moment `startOf('month')` and `endOf('month')`, format with the exact token **`Y-MM-DD`**, and write `dateFrom`/`dateTo` (1715580–1715597 and 1716928–1716945; exact writes at 1715586/1715596 and 1716934/1716944). These are client-generated string values.

The action chain forwards the query object to #25403. The service shallow-copies argument 2 and assigns it to Axios `config.params` before GET (995342–995373); it does **not** manually append these values to a `?` URL or manually URL-encode them. The candidate correctly avoids claiming final serialization order/encoding. It also correctly says that client `endOf('month')` does not prove server `dateTo` inclusivity or server filtering/validation, and that these two callers do not close the service's arbitrary forwarded query shape.

The timezone note is also properly scoped: #25375 takes `tz` from local `user.timezone` (994704–994729), and #25423 uses it while transforming a copied event. Do not treat the action/reducer `tz` as an HTTP item field or the converted Redux values as proof of a server/device UTC convention. Keep all event date/time value types unknown.

### `GetRecentEvents` — pass

Service #25401 builds `/api/kindergartens/{kindergartenId}/events/recent` and calls GET with only the URL (995306–995325); handler #25402 returns Axios `response.data` (995331–995337). Saga #25372 directly reads body-root `events` and `count` separately (994630–994650), and the reducer stores them separately (993545–993561). The badge selector reads the stored count (1269479–1269486). The count is therefore a body property, **not** a length computed from `events` in this flow.

No nested `events` entry is inspected in the traced recent-events path. The candidate correctly leaves both property types unknown, does not assume `events` is an array, and does not invent pagination, completeness, visibility, or read/seen semantics. Its statements that the traced client path has no pagination parameter/loop are appropriately limited to that path, not generalized to server behavior.

## Capability-array check

The `established` booleans and supporting evidence are appropriately scoped for both endpoints: month-range construction and Axios params placement; local timezone transformation; client-side add/edit gates; absence of a pagination control in the traced request flow; and Redux-only success dispatches are supported. The corresponding negative claims (server inclusivity, server permission/visibility meaning, global completeness/unpaginated behavior, and app-wide absence of read/seen effects) remain unestablished. `GetRecentEvents` correctly treats its `count` as unknown rather than giving it an invented meaning.

For `GetEvents`, update the **field inventory**, not these semantic cautions: specific response-origin fields such as `description`, `is_recurring`, `rrule`, and `repeat_end` are observed, even though their server meanings and types remain unknown. `acl_groups.view/manage` likewise may be recorded as observed paths without calling them audience or server permissions.

## Current integration state

The checked-in `evidence/responses/communications.json` currently keeps `GetEvents` as `kind: unknown` with no fields (around lines 1431–1462); `models/responses.tsp` has the partial `GetRecentEvents` model but no `GetEvents` model. Keeping `GetEvents` unknown until this candidate is corrected is safe. Do not replace it with a complete/closed schema. When integrating the corrected candidate, preserve the HTTP body nesting as `items`, keep the item shape open, and make every property optional with unknown values unless a scalar/container type is independently proven.

## Source-hash record

SHA-256 of reviewed input files at review time:

| File | SHA-256 |
|---|---|
| `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| `AGENTS.md` | `2bd289f6bc7dcb19473a921778945abed72553adb5f170ae557766c3ede2532d` |
| `evidence/guardian-batch/events.json` | `965e623db23942ae48e23def6cb93b7293a4a74033096ac7b0e1cb15ea51700b` |
| `evidence/guardian-batch/events.md` | `ea41c000440a07dc14ff0cf4c5508dbcae090583d4c6a167f9e4b9670eed9494` |
| `evidence/guardian-batch/scope.json` | `212bd2e42e196f50fe13eb264ef9ec34a330e2995913bdb8e3cd012825ae7d90` |
| `evidence/research/communications.json` | `6f262453b2d6de637fecbeb2ece7f73ef0d3248b207e968753f472980d2a67ba` |
| `evidence/responses/communications.json` | `3acce754d21d25177c8b9e907d2914d762728e05c3b3db3fe6c302cb7ab03948` |
| `models/responses.tsp` | `06959985e13f86e8dca88acc8476ff4471e54e58de454ac073b002707a5e1e7c` |

No live HTTP request, build, or implementation/evidence edit was performed; this review report is the only owned output.

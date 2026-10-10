# Events — guardian-batch findings

Scope: `GetEvents` (#25403) and `GetRecentEvents` (#25401) only. Evidence is from the original Hermes v96 listing at `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; operation identity/path/service details are cross-checked against `evidence/research/communications.json`.

## Calendar events (`GetEvents`)

Trace: calendar callbacks #42300 and #42323 (UI module) build a fresh two-key object and call `getEvents` → action #25373 captures the first explicit argument → thunk #25374 forwards it as service argument 2 → EventsServices module #2227 binds service class #25400 to GET operation #25403 → handler #25404 unwraps Axios `response.data` → success continuation #25375 places the whole HTTP body into the local `action.data.items` slot alongside date/timezone context → reducer #25344 iterates items and #25345 calls #25423 to shallow-copy and timezone-transform each item → `EventsList` #42292 selects Redux events and renders `EventListItem` #42311. Row callback #42306 sends the selected row event through `setSelectedEvent` (action creator #25388; reducer #25344 stores `action.data` as `selectedEvent`) before navigating to `Event`; detail selector #42356 and edit selector #42555 both return `state.events.selectedEvent`. The detail/edit consumer chain is downstream of the same fetched HTTP body array entries.

### Request and date behavior

- Both calendar callers derive `dateFrom` from selected-month `startOf('month')`, `dateTo` from `endOf('month')`, and apply literal Moment format **`Y-MM-DD`**. Exact own-property writes: #42300 lines 1715586/1715596 (offsets `0x75`/`0xa4`); #42323 lines 1716934/1716944 (`0x75`/`0xa4`).
- The action/service chain and `config.params` assignment establish query placement. The service uses `{}` if argument 2 is omitted/undefined, but otherwise shallow-copies the arbitrary caller object; the two traced UI keys are not a closed universal query schema.
- `evidence/research/communications.json` already records `dateFrom` and `dateTo` for this operation, so this batch adds no duplicate request candidate.
- Axios `params` is established, but final URL encoding/order is not asserted. Client `endOf('month')` does **not** prove server `dateTo` inclusivity or server filtering semantics.

### Response fields versus local display values

- The successful HTTP body root is an array, represented as a partial client view of event items. Service #25404 returns Axios `response.data`; continuation #25375 writes that entire returned body into the locally composed `action.data.items` slot at 994724, and reducer #25344 calls `forEach` on that local slot at 993583-993589. The local action-envelope property is not an HTTP-body `items` wrapper. Entries flow through a shallow-copy helper before they are kept in Redux.
- Original item properties read in the list/calendar path: `start_date`, `end_date`, `start_time`, `end_time`, `repeat_start`, `title`, `event_type`, `id`, `unique_id`, `access`, and `duration`. Their types remain unknown. For date/time properties, #25423 reads the source entry after `Object.assign({}, entry)` (instructions at offsets `0x12`-`0x15`, `0x1b`-`0x21`, `0x2b`-`0x31`, `0x5d`-`0x63`, `0x6d`-`0x73`, and `0x83`-`0x8e`; source lines 995962-995994) and can rewrite the local copy. `duration` is read from the converted event by marker loop #25347 at offset `0xcb` (source line 993743).
- The selected-event detail/edit/export path adds these response-origin client reads, reachable from HTTP body array entries through the selection chain above:

  | Item path | Original consumer read(s) | Limits |
  |---|---|---|
  | `description` | Detail #42355 offsets `0x7e8`, `0x89f` (1719291, 1719333); exports #42363/#42368 offsets `0x1ee`/`0x169` (1719820-1719824, 1720077-1720082) | The detail UI passes the value as content to its HTML-rendering path and export handlers read it. This establishes a render path only; it does not establish a scalar type, HTTP media type, or guaranteed MIME string. |
  | `creator.name` | Detail #42355 offsets `0x8cb`, `0x98b`-`0x991` (1719342, 1719386-1719388) | Preserve the nesting; no root event `name` is established. Both values/types remain unknown. |
  | `is_recurring`, `rrule`, `repeat_end` | Detail #42355 `is_recurring` at `0x137` (1718900); edit #42554 `rrule`/`is_recurring`/`repeat_end` at `0x2fb`/`0x33f`/`0x945` (1729198/1729215/1729582); Apple export #42366 reads these at `0x32`/`0x46`/`0x65` (1719893/1719898/1719902) | Client reads and export-side transforms only; values/types and server recurrence meanings remain unknown. Do not interpret client `rrule`/`repeat_end` concatenation as a server contract. |
  | `acl_groups.view` | Detail #42355 reads `acl_groups.view` and invokes `.map` (1718858-1718869); mapper #42359 reads each mapped group's `name`, `id`, `type` at offsets `0x1a`, `0x84`, `0x91`-`0x9c` (1719573-1719605) | `view` is represented as an array used by `.map`, with open object items and only `name`/`id`/`type` as unknown leaves. This is not an audience/permission contract. |
  | `acl_groups.manage` | Edit form #42554 reads it at offsets `0x9fe`-`0xa04` (1729626-1729628) | Keep its value unknown; do not infer group-item fields or authorization behavior. |

- Calendar export branches on null `start_time`/`end_time` (#42366 at 1719907-1719914; #42368 at 1720008-1720015). This is not evidence for a response `full_day` field. UI recurrence comparisons/exports likewise do not establish server recurrence semantics.
- `#25375` takes `tz` from `user.timezone` and places it in the local action object; it is **not** a field read from the HTTP event. `#25423` uses that supplied value while copying and rewriting start/end date/time properties. Those converted Redux values are local transformations, not extra response fields, and do not establish server/device timezone semantics.
- `event_type` presentation labels/colors come from local reducer constants. The row's `access === 'manage'` comparison and `events_can_add` selector are client UI branches only; do not interpret them as complete server authorization semantics.
- No response-origin read was established for root `name`, `location`, audience/course/child applicability, `full_day`, cancellation/publication status, or `change_mode`. Recurrence/change-mode fields observed only in create/update/delete payloads are not promoted to response fields.

## Recent events (`GetRecentEvents`)

Trace: service #25401 → Axios unwrapping handler #25402 → saga #25371/#25372 → reducer #25344. The saga reads only HTTP-body-root `events` and `count`, dispatches them separately, and the reducer stores them as `newEvents` and `newEventsCount`. A tab selector #32426 reads the Redux count for a badge. No nested event entry is inspected in this traced flow, so static field types remain unknown and no item schema is attributed. A separate single-snapshot observation records `events` as an array and `count` as an integer; these are sample-only types, not static or universal constraints.

No query/body is built by #25401; it calls GET with `/api/kindergartens/{kindergartenId}/events/recent`. No pagination behavior, visibility semantics, completeness, or server read/seen effect is established. No follow-up seen/read request occurs in the traced saga/reducer flow, which is not a claim that none exists elsewhere.

## Capability blockers

For both reads, server permission semantics, guardian/staff visibility scope, pagination/completeness, and any unseen server-side read effect remain unresolved. Calendar event data is kindergarten-selected, not evidence of child/course-specific applicability. No roster substitute or live/private request was used. No required event fields, guaranteed presence, server media-type claim, or recurrence interpretation is inferred from these UI observations.

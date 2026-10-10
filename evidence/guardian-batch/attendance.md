# Attendance and absence: static evidence notes

Scope: `GetChildCalendar` (#25644), `GetStatusLogs` (#25650), and the existing operation `GetAbsenceModalData` (#25652). Evidence is from the original Hermes disassembly at `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; no account, live/private record, or write request was used. These are client-observed partial views, not a complete server contract.

## Service and caller identity

| Operation | Service endpoint | Caller chain |
|---|---|---|
| `GetChildCalendar` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/calendar` — #25644, full disassembly line 1003555 | Calendar caller #44368 (line 1811993) -> action `getChildAbsenceCalendar` -> thunk/helper call #26401 (line 1025917) -> response callback #26402 -> reducer #26394. |
| `GetStatusLogs` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/status-log` — #25650, line 1003674 | History screen #43077 (line 1753705) -> action thunk #26404 -> helper #25650 -> raw-body callback #26405 -> reducer #26394 -> history screen #43072/#43079. |
| `GetAbsenceModalData` | `GET /api/kindergartens/{kindergartenId}/children/{childId}/absences/modal` — #25652, line 1003717 | Edit-modal fetch #34561 (line 1355578) -> thunk #26414 -> helper #25652 -> callback #26415 -> reducer #26394 -> date-picker consumer #43040. |

The helper functions are in the service module installed at #25620 (service exports around line 1002976); action thunks and screen/callback relationships above are tied by the original disassembly's imported-member reads, calls, and attached continuations. A Metro module number for the UI callers is not claimed because it is not independently established in the inspected evidence.

## Request/query observations

- **Calendar:** #25644 places parameter 3 unchanged in Axios `config.params`. Caller #44368 constructs a `childId`, `start_date`, `end_date` argument. `start_date` comes from `startOf('month').format('Y-MM-DD')`; `end_date` from `endOf('month').format('Y-MM-DD')` (lines 1812017-1812031). This supports these client query keys and formatting only. It does not prove server date-range inclusivity, a server timezone, or accepted query semantics. The calendar GET caller does not send `longPeriod`; that is a separate edit-form/navigation mode.
- **Status logs:** #25650 constructs `params: {date: p3}`. History caller #43077 uses the selected `dayData.date.dateString`, formatted `YYYY-MM-DD` (lines 1753728-1753738). This is one selected day, not a `dateRange` or status filter. No server boundary/timezone meaning is proved.
- **Modal:** #25652 constructs `params: {form: p3}`. Thunk #26414 constructs `p3` as `{user_id: currentUser.id}` (lines 1026225-1026229). Axios's nesting is visible, but the exact encoded wire key format for nested query values is not independently established.

## Response candidates and raw-vs-composed boundary

### Calendar body

Service continuation #25645 returns `response.data`. The action callback #26402 reads top-level `access` and dispatches the **whole body unchanged** as `SET_CHILD_ABSENCE_CALENDAR_DATA`; reducer #26394 reads `days`, `child_data`, `lock_date`, `comment_date`, `holidays`, `default_status`, `workday_weekend`, and `workday_holiday` from that raw `action.data`. `days` is consumed as a collection. Although a calendar holiday lookup calls `find` on a supplied collection, its origin is not conclusively tied to raw response `holidays`, so that field's type remains unknown. Other values not given a directly established type also remain `unknown`.

The calendar UI has additional day models. #44382 (`CalendarDay`) uses its `data` prop and locally selected calendar data; helpers read `date`, `attendance`, `entry`, and `diary_status`. The trace inspected here does **not** show that each of those properties is an unmodified raw `days[]` item. In particular, do not claim raw day record IDs, planned/recorded status, attendance actuals, arrival/pickup fields, or row-level actor/update metadata from these composed component reads.

The edit form contains localized/UI labels `Absent` and `Present` (#43023, lines 1750413-1750419) and a status toggle. This proves UI choices, not server enum strings or semantics. Calendar `dayStatus` (#44393) consumes an explicit `diary_status` or attendance/status lookup; no branch infers absence from a missing arrival or missing log. An absent log is unresolved, not evidence of absence.

### Status-log body

The helper continuation #25651 returns `response.data`; action #26405 stores the body unchanged, reducer #26394 stores that as `calendarDayLog`, and #43072 calls `.map` on it. Therefore the client expects a root collection. Each raw iterated item is passed to #43079, which directly reads:

- `diary_status.name`, `diary_status.color`, `diary_status.icon`;
- `identifiable.name` (a display name; do not assume it is an actor identity or an actor ID);
- `created_at`, `type`, `status`, `comment`, `start_time`, `end_time`.

All field types and complete item shape remain unknown. `created_at` is the observed log time: #43079 applies `utc(created_at).tz(user.timezone).format('L LT')`. This is a display conversion and does not prove server storage timezone. `start_time` and `end_time` are shown as attendance hours, not log-event timestamps. No `updated_at`/last-update field, event start/end timestamp, row ID, or definitive actor ID was found in these reads. `status` and `type` have UI branches but no established server transition meanings.

### Absence modal body

#25653 returns the body unchanged; #26415 reads only top-level `min_date` and stores it in calendar state. The date-picker consumes it as `minimumDate`. Its primitive type, format, timezone, boundary meaning, and any server-side write authorization remain unknown. No `access.restrict` or equivalent was established in this flow.

## Permissions, write distinction, and read effects

- The calendar response carries a top-level `access` value, but the app reads no nested `restrict` or write-availability property in this trace.
- Client-side edit gating is separate: #44361/#44363 check local `canEdit`, guardian account type, and `user.permissions.diary_edit_attendance`. This is not a server authorization guarantee and is not an institution-wide staff roster.
- Calendar edit POST helpers #25646 and #25648 are separate from the three GETs. The form submit handler #43031 chooses a write path; static inspection did not invoke either endpoint.
- Calendar fetch/reset and status history state changes are local Redux effects. The history GET path has no observed follow-up seen/read mutation. The modal GET stores `min_date` before navigation; actual saving is a separate explicit form submit.
- No pagination/continuation behavior is established for these operations.

## Remaining blockers

1. Prove raw `days[]` item source and shape before adding day ID/date/status/time fields; current UI per-day reads are not enough.
2. Establish actual server status/transition meanings and separate planned attendance from recorded transitions; keep missing-arrival/log state unknown.
3. Establish status-log author identity, IDs, update timestamps and event timestamps; current observed paths are only `identifiable.name`, `created_at`, and attendance `start_time`/`end_time`.
4. Establish nested calendar access/restriction semantics and server write permission, if present.
5. Do not claim server date-range inclusivity or timezone from client date formatting or display conversion.

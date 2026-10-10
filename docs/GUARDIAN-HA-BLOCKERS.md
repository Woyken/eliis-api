# Guardian Home Assistant blockers

**Planning notes only.** This is a static, evidence-bounded blocker list, not an implementation plan or authorization to make network requests. Endpoint observations come from the Android client; server policy and completeness are not established.

## Current decision

Do not ship guardian account setup or child-scoped polling until the signed-in guardian-to-child access path is evidenced and reviewed. Keep the proposed integration read-only; no live login, private-record access, or write request was performed for this batch.

## Setup, authentication, and child selection

A safe setup flow is not established yet: there was no live login, and the static client findings do not prove server-required fields, guardian role/authorization, or a guardian-to-child join. Do not treat the separate `guardians` and `children` init values, a permissions truthiness gate, or a child route argument as proof that the signed-in account may access that child. Do not replace this missing relationship with an employee/staff roster. [Login fn #16308](../evidence/guardian-batch/auth.json); [Login2FA fn #16309](../evidence/guardian-batch/auth.json); [GetUserData fn #16344](../evidence/guardian-batch/discovery.json); [GetUserPermissions fn #16348](../evidence/guardian-batch/discovery.json); [GetChildProfile fn #25634](../evidence/guardian-batch/discovery.json)

Evidence-recorded blockers:

- No live login or private account test was performed; server\-required fields, authentication requirements, response completeness, and status contracts remain unknown\. [Login fn #16308](../evidence/guardian-batch/auth.json)
- The truthy type challenge branch is client\-observed; the complete challenge schema and server meaning of type/identifier/locked\_out are not established\. [Login fn #16308](../evidence/guardian-batch/auth.json)
- Do not treat Axios response\.status 200/202 UI constants or the separate default\-client interceptor's 401/412/429 branches as universal server status contracts\. Login's auth\-client 401 rejection is pass\-through; no expired\-session interpretation or explicit navigation reset is established\. [Login fn #16308](../evidence/guardian-batch/auth.json)
- No live login or private account test was performed; server\-required request fields, cookie requirement, success/error schemas, and accepted status values remain unknown\. [Login2FA fn #16309](../evidence/guardian-batch/auth.json)
- 'valid' is a UI comparison against a body property, not a universal server enum or HTTP status\. The semantics and type of locked\_at remain unproved\. [Login2FA fn #16309](../evidence/guardian-batch/auth.json)
- Keep this login challenge identifier flow distinct from cookies and unrelated recovery/2FA operations; no general identifier mapping is established\. [Login2FA fn #16309](../evidence/guardian-batch/auth.json)
- The default\-client 401 cleanup is proven app behavior, but the code does not label 401 as expired\-session detection or call an explicit navigation reset in the traced cleanup callbacks\. [Login2FA fn #16309](../evidence/guardian-batch/auth.json)
- Init \-&gt; SET\_USER\_CHILDREN \-&gt; userReducer \-&gt; DashboardScreen proves the app reads child id/name/profile\_picture and passes item\.id to a captured selection callback\. The causal handoff from that callback to MyChildStack route\.params\.childId is not established; neither is a guardian\-to\-child join, signed\-in guardian role, child\-specific server authorization, or child kindergarten membership\. Do not substitute staff roster \#259\.\. or employee collections\. [GetUserData fn #16344](../evidence/guardian-batch/discovery.json)
- Truthiness\-only selector reads do not prove Boolean wire values or server access policy; no traced relationship ties this permissions result to the signed\-in guardian/child pair\. [GetUserPermissions fn #16348](../evidence/guardian-batch/discovery.json)
- The false\-context MyChildInfoScreen caller passes selector \#44122's kindergarten\_id as argument 1\. The true\-context ChildInfoScreen path only establishes local SET\_MY\_CHILD state behavior, not guardian/server authority\. The upstream handoff from init\-derived child\-row id to route\.params\.childId remains unestablished\. No active\_courses item ID is read or matched to GetChildCourses items\. [GetChildProfile fn #25634](../evidence/guardian-batch/discovery.json)

## Events

The client reads calendar/recent-event data, but guardian visibility, event applicability, server date-range inclusivity, timezone rules, and completeness are not established. `events_can_add` and an event row's `access == 'manage'` are client UI branches, not server read/write authorization. This batch contains no event mutation authorization finding; keep create/edit out of scope until separately evidenced. [GetEvents fn #25403](../evidence/guardian-batch/events.json); [GetRecentEvents fn #25401](../evidence/guardian-batch/events.json)

Evidence-recorded blockers:

- Server date\-range inclusivity, timezone interpretation, and all event status/recurrence/cancellation meanings remain unproved, including semantics of the observed is\_recurring/rrule/repeat\_end paths\. [GetEvents fn #25403](../evidence/guardian-batch/events.json)
- No evidence establishes event list visibility for guardian versus staff or child/course\-specific applicability; do not substitute a staff roster or infer a universal calendar capability\. [GetEvents fn #25403](../evidence/guardian-batch/events.json)
- No required event fields, server response completeness, or server permission semantics are established\. [GetEvents fn #25403](../evidence/guardian-batch/events.json)
- No nested event\-item renderer/read path was traced for this endpoint, so its event entries remain unknown\. [GetRecentEvents fn #25401](../evidence/guardian-batch/events.json)
- The meanings of count, event visibility scope, completeness, and pagination are unproved\. [GetRecentEvents fn #25401](../evidence/guardian-batch/events.json)
- No server read/seen effect or permission contract is established\. [GetRecentEvents fn #25401](../evidence/guardian-batch/events.json)

## Attendance and absence

The raw calendar day-item schema, status meanings, recorded-versus-planned attendance, arrival/pickup fields, update actor, and server write permission remain unknown. **Never infer absence from a missing day, log, arrival, or transition.** `min_date` is only observed as a date-picker minimum; the modal read does not prove edit permission, and separate calendar POST paths were not exercised. Nested `form` query serialization is unresolved. [GetChildCalendar fn #25644](../evidence/guardian-batch/attendance.json); [GetStatusLogs fn #25650](../evidence/guardian-batch/attendance.json); [GetAbsenceModalData fn #25652](../evidence/guardian-batch/attendance.json)

Evidence-recorded blockers:

- No established raw per\-day record schema \(IDs, dates, status meanings, actual attendance versus plan, arrival/pickup timestamps or update actor\)\. [GetChildCalendar fn #25644](../evidence/guardian-batch/attendance.json)
- No nested access\.restrict or equivalent writable\-availability contract; client permission checks are not server guarantees\. [GetChildCalendar fn #25644](../evidence/guardian-batch/attendance.json)
- No server status\-transition dictionary or meaning for status/type values\. [GetStatusLogs fn #25650](../evidence/guardian-batch/attendance.json)
- No proof of an actor ID or last\-update field; only identifiable\.name and created\_at are displayed\. [GetStatusLogs fn #25650](../evidence/guardian-batch/attendance.json)
- No write request or live status\-log response was used\. [GetStatusLogs fn #25650](../evidence/guardian-batch/attendance.json)
- No complete modal payload, access/restrict flag or server write permission evidence\. [GetAbsenceModalData fn #25652](../evidence/guardian-batch/attendance.json)
- No date timezone/inclusivity interpretation is established for min\_date\. [GetAbsenceModalData fn #25652](../evidence/guardian-batch/attendance.json)

## Diary summaries and feedback

The guardian-feed body has a partial client-observed view, but own-child authorization and visibility of class/other-child entries or feedback are unproved. Keep `GetDiaryData`'s employee-facing findings separate; do not use it as a guardian substitute. `GetGuardianDiary` has no traced active caller or body consumer and remains blocked. A screen's empty-state publication wording is not a publication field. Feedback ownership/privacy and server pagination/date semantics remain unresolved. [GetGuardianFeed fn #25632](../evidence/guardian-batch/diary.json); [GetGuardianDiary fn #25630](../evidence/guardian-batch/diary.json); [GetDiaryData fn #25935](../evidence/guardian-batch/diary.json)

Evidence-recorded blockers:

- Do not recommend this route as a general guardian diary/feedback access capability until server permission/visibility conditions are proven\. [GetGuardianFeed fn #25632](../evidence/guardian-batch/diary.json)
- Static UI reads do not establish guaranteed feedback visibility, publication fields, or response completeness\. [GetGuardianFeed fn #25632](../evidence/guardian-batch/diary.json)
- No active caller or response\-property consumer is established\. [GetGuardianDiary fn #25630](../evidence/guardian-batch/diary.json)
- No guardian role, own\-child scope, or visibility guarantee is established; keep capability blocked/unproven\. [GetGuardianDiary fn #25630](../evidence/guardian-batch/diary.json)
- Do not recommend as guardian API access: observed model belongs to employee diary state and no guardian permission path is proven\. [GetDiaryData fn #25935](../evidence/guardian-batch/diary.json)
- Do not substitute this staff diary response for GetGuardianDiary or attribute staff/class\-wide entries or other\-child feedback as guardian\-visible\. [GetDiaryData fn #25935](../evidence/guardian-batch/diary.json)

## Food menus and downloads

The day-menu body has no traced UI field consumer. The weekly screen observes partial root/day/file paths, but meal structures, publication state, role mapping, and date-window semantics remain unknown. Do not interpret fallback text or a falsy local `week_menu.id` as proof of unpublished data. Downloaded bytes have unknown MIME/status/content; native download job metadata is not the response body. No food-menu write capability is established. [GetDayMenu fn #26007](../evidence/guardian-batch/food.json); [GetWeekMenu fn #26009](../evidence/guardian-batch/food.json); [DownloadFoodmenuFile fn #37318](../evidence/guardian-batch/food.json)

Evidence-recorded blockers:

- No reachable UI consumer of state\.foodmenu\.day\_menu was found, so no operation\-specific response fields can be justified\. [GetDayMenu fn #26007](../evidence/guardian-batch/food.json)
- Guardian/parent role authorization and server date semantics remain unproved\. [GetDayMenu fn #26007](../evidence/guardian-batch/food.json)
- All nested meal, dish, grouping, variant, course, substitution, timestamp, origin and applicability shapes remain unproved\. [GetWeekMenu fn #26009](../evidence/guardian-batch/food.json)
- The 'menu has not been published yet' text is local fallback copy when week\_menu is falsy, its root id is falsy, or local loading state is truthy; it is not a response status or response field\. [GetWeekMenu fn #26009](../evidence/guardian-batch/food.json)
- Parent\-role mapping, server date\-window semantics and server read effects remain unresolved\. [GetWeekMenu fn #26009](../evidence/guardian-batch/food.json)
- Downloaded content is opaque; MIME/status/body schema are unknown\. [DownloadFoodmenuFile fn #37318](../evidence/guardian-batch/food.json)
- Server\-side download effects and role\-specific authorization are unresolved\. [DownloadFoodmenuFile fn #37318](../evidence/guardian-batch/food.json)

## Required before feature work

1. Verify the current batch review status and unresolved evidence boundaries. This renderer validates structural coverage, not evidentiary truth; earlier reviews do not certify later changes.
2. Establish a guardian-specific account/child access path without staff-roster substitution, and independently verify server-side authorization before any child data is exposed.
3. For each proposed poll, retain exact query serialization, date/time interpretation, response nesting, pagination, and any read-side effect as explicit unknowns until supported by evidence.
4. Keep all absence and feedback handling conservative: missing evidence is unknown, and feedback/other-child visibility must not be inferred.

Generated by `node scripts/render-guardian-capabilities.mjs`; sources are the per-domain candidate JSON files and scope under [`evidence/guardian-batch/`](../evidence/guardian-batch/).

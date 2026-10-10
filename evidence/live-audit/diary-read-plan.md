# Diary read plan

**Planning only:** no HTTP requests were made, and no credentials, cookies, private captures, or identifier values were accessed or recorded here.

## Authorized parent route and candidate

The exact parent-client route in the original HASM is `MyChildStack` → **Child diary**. `MyChildStack` initializes the screen with its route `childId` and `employeeView: false` (#44019, `eliis.hasm` 1795664–1795763). `ChildDiaryScreen` reads `route.params.childId` and derives its child/institution context from the parent-side `MyChild` state (#44110, 1799541–1799597). Its fetch callback calls `getGuardianFeed` for page one through the non-employee branch (#44115, 1799677–1799698).

For page one, the action thunk builds `params.date` using the app's default current-date formatter, `.format('YYYY-MM-DD')`, then calls the service (#25515, 1000422–1000465). Page is client action state, not a query parameter. `GetGuardianFeed` issues an Axios GET with that params object (#25632, 1003318–1003338); the response continuation returns `response.data` (#25633, 1003348–1003354), and #25516 only forwards the body through local dispatch while keeping page bookkeeping separate (1000474–1000503).

Account discovery returned one child and one guardian record whose `user_id` matches the signed-in account and whose `kindergarten_id` matches the child's institution, with child-view access enabled. This supports the user-authorized bounded read context; it is not an explicit child-to-guardian ownership join or a universal server-policy guarantee. Use only that account-discovered child and institution. Do not enumerate records or expose another child's data. Keep raw responses private; explicit child-ID mismatches stop export. Unlabelled/group content ownership remains unestablished even when no mismatch is found.

### Planned request

- **Operation:** `GetGuardianFeed` (#25632)
- **Request:** exactly one `GET /api/kindergartens/{known institution}/children/{known child}/guardian-feed`
- **Query:** `date=<app current-day date formatted YYYY-MM-DD>`; do not add `page` or other parameters.
- **Scope:** first page only. Do not trigger pagination, pull-to-refresh, app-resume refresh, retries, or unrelated app initialization requests during validation.
- **Why eligible:** the service and callback trace shows a GET and local dispatch only; review of the success callback, focus/resume handlers, list callbacks, and rendered feed-entry component found no explicit seen/read/write service call. The UI's focus/resume, pull-to-refresh, content-size fill, and end-reached handlers can cause additional feed GETs. Enforce the one-request budget without exercising those triggers; do not launch the full screen as transport if it can fan out requests.

This is a proposed bounded read, not an assertion that GETs are free of access logging or all server-side effects. The sample, if later performed by the controlling session, is account/context-specific and must not be treated as a universal contract.

## Explicit skips

### `GetGuardianDiary` (#25630) — skipped

The helper is registered in `ChildServices` (#25620, `eliis.hasm` 1002896–1002936) and builds a GET to `/api/kindergartens/{kindergartenId}/children/{childId}/diary` (1003280–1003302). A full-disassembly reference search established no consuming action/reducer/UI callsite beyond that registration. It is not the proven parent `Child diary` route. Guardian access/safe-use behavior for this separate endpoint is unproved; do not request it as a substitute, and do not send it to test for a 403.

### `GetDiaryData` (#25935) — skipped

This is the separate kindergarten `/diary` GET with query properties `course` and `date` (#25935, `eliis.hasm` 1012899–1012927). Its established consumer is employee-scoped: #25782 reads `user.employee`, `employee.selected_course_id`, and `diary.selected_date` before calling the service (#25782, 1008630–1008676); the actual account context has no employee state. It is not a guardian fallback. Additionally, a separate UI caller #43846 flushes diary auto-saves before calling `getDiaryData` (1787831–1787885), so do not enter that screen/caller path. Do not substitute staff records or test for access denial.

## Audit boundaries

- No actual HTTP, login, or credential/cookie handling was performed by this planning agent.
- Only the single already-known parent-child context is eligible; no staff roster, unrelated record, or cross-child lookup is authorized.
- No writes, seen/read mutations, autosave flushes, or staff diary reads are authorized.
- Preserve the existing response analyses. These operation bodies remain opaque where static callers do not establish fields; the plan does not infer a complete response model.
- The machine-specific working account context is referenced without identifier values. Raw private data must remain outside tracked files.

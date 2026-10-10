# Home Assistant blocker policy

This batch documents API capabilities, not an implemented Home Assistant integration. Read-only polling and calendar entities should not be proposed as fully working until the following are established for the signed-in guardian:

- Which institution/child identifiers the account can discover and use; staff rosters are not parent discovery.
- Which permission/menu/role gates lead to the relevant endpoint, while distinguishing client visibility from server authorization.
- Response item identity and content/date semantics sufficient to avoid duplicates, misleading state, or exposing other children's information.
- Exact query serialization and unresolved interval/timezone semantics; device-side display conversion is not a server timezone contract.
- Pagination/end-of-feed behavior and optional read/seen/autosave actions. Polling a screen flow must not silently recreate its separate mutations.

Attendance entities must preserve `unknown` when arrival/transition evidence is missing. Do not equate missing logs with absence, substitute planned schedule for recorded presence, or present planned pickup/arrival values as actual transitions.

Diary summaries must separate course/group content from child-private feedback. Secondary `/api/kindergartens/{kindergartenId}/diary` models derived from staff UI cannot be treated as guardian authorization evidence. Food file downloads remain opaque bytes until content extraction is independently supported; no JSON menu model may be invented for those files.

The final capability table will list these blockers per endpoint/feature with the actual static evidence boundary. Any integration implementation or runtime validation is a separate authorization/task.

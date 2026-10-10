# Luna-only bounded additions — 2026-10-10

This update extends the preceding auth/schedule follow-up. It does not change the 296-operation inventory or claim complete response coverage.

## New evidence

- Four message-list queries now retain `page`, `perPage`, and `term`: 12 query-parameter occurrences.
- Poll and questionnaire answer models retain their proved named fields, without interpreting a body property named `required` as a server schema constraint.
- Event creation/update retains partial `start_time` and `end_time` fields traced through the app's copied-object UTC conversion helper.
- Eight diary/meal/time-log/file-management operations gain 18 named body-field occurrences: diary creation, employee meals, time-log insertion, folder/file moves, and diary/gallery/document metadata editing.
- Together the request additions total 34 body-property occurrences across 12 operations. Counts describe occurrences across operations, not globally unique names.
- `GetLanguages` now retains non-normative client reads of `langs` and `country` in `x-client-response-observations`. Neither is asserted universally present or given a guessed response value type.

All new body models remain open and incomplete. The employee-meal computed body key stays documented in caller evidence rather than being replaced by an invented static meal field. Move payload values remain unknown: the app forwards `routeParams.items` unchanged, not a proved array of identifiers.

## Important boundaries

Local object fields and serialized wire keys are different. Axios skips nullish query values and can serialize unknown object/array values into bracketed keys. JSON serialization omits undefined-valued body properties, including a poll `other_id` fallback. Evidence records distinguish these facts from conditional own-property construction and server validation.

Diary/gallery callers pass filenames through pre-existing route placeholders; placeholder labels do not establish database-ID domains. Document metadata's `filename` is also an actual body field. The optional document `edit` branch follows the shape of an ACL response, not a proved server authorization decision.

The four response endpoints searched do not establish full schemas. Profile/settings/country values remain opaque in the bounded caller chains. The earlier public languages response remains a single sample, not a universal model.

## Agent and review scope

Only GPT-6 Luna subagents were used: medium for search/implementation and xhigh for independent reviews. The three candidate reviews precede the frozen post-integration review loop; that loop is capped at four rounds and seeks two consecutive clean reviews of this complete update.

Original publication and earlier follow-up review reports remain historical. They are not certifications of these new fields. Current review progress and final outcome are recorded in `reviews/LUNA-EXPANSION-STATUS.md`.

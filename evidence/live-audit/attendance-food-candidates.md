# Attendance and food live-audit candidates

This file summarizes the owned candidate JSON in `attendance-food-candidates.json`. Private captures remain in the local config directory; this repository contains only redacted paths, types, counts, and generic equality checks. No requests were made by this agent.

## Scope and dispositions

| Operation | Live sample | Candidate outcome |
| --- | --- | --- |
| `GetChildCalendar` | One body with 7 day rows | Add the captured raw `days[]` / `entry` / `diary_status` path inventory as a partial, context-specific observation. Keep null-only sample leaves unknown in a universal model. |
| `GetStatusLogs` | One empty array for the current date; one additional array with a single row for a date selected from the already-returned calendar | Keep the empty-array observation separate from the one-row sample. The one row gives a partial runtime item shape; neither implies absence or a universal item variant. |
| `GetAbsenceModalData` | One body with `min_date` observed as a string | Record the observed type only; leave date semantics and universal nullability unresolved. |
| `GetDayMenu` | One empty object | Keep the response schema unknown with no fields; do not infer “empty menu,” publication state, or reuse weekly-menu fields. |
| `GetWeekMenu` | One body with 5 day rows | Add sample-observed root/day paths, including singular `uploaded_file` separately from `uploaded_files`; suppress meal text and preserve unknown semantics where only null was observed. |
| `DownloadFoodmenuFile` | Not requested | Retain the opaque binary disposition. The sampled week had no structured file item and the user directed that no download be attempted. |

## Important safeguards

- Calendar `days[]` are raw response rows, not the calendar's composed per-cell UI objects. One sample now supports `course_id`, `date`, `entry`, and `log_count`, with a nested `entry.diary_status`; the seven-row key set is not a completeness guarantee.
- The calendar sample's `access` is opaque. Do not publish its value or infer permission meaning from it. Integer fields such as `status`, `has_card_event`, and the workday settings remain uninterpreted.
- The current-date empty status-log result does not indicate absence. The additional row was requested only for a date already returned by the calendar with positive `log_count`; its status/type meanings remain unknown. `identifiable` is retained as an observed object path, not asserted to be an actor model.
- The static status-log UI paths remain valid when absent from the single live item. In particular, do not remove any independently justified optional/static-only path such as `diary_status.type` merely because this sample omitted it. Root `start_time`/`end_time` reads are not relabeled as arrival/pickup fields or event timestamps.
- Parent-reported wire templates are redacted. Calendar uses date-shaped `start_date`/`end_date`; status logs and food-menu reads use one date value, not a range. The successful modal read showed URL-encoded `form[user_id]`; that one success does not prove general serializer behavior or server-side parameter recognition/filtering.
- In the week sample, all five `breakfast`, `lunch`, and `supper` values were strings, while all five `dinner` values were null. This is sample-specific, not a universal nullability or dish-structure contract. Root metadata, meal text, real dates, and identifiers remain private.

## Provenance and limitations

Static traces and existing partial response candidates are referenced per operation in the JSON. Live samples are account/context-specific and were summarized in Python without printing raw values. Empty arrays/objects, observed nulls, and absent keys do not establish the complete server model. No status meanings, permission rules, server date boundaries, response completeness, or server-side read effects are inferred.

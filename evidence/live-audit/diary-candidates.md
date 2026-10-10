# Diary live-audit candidates

Private captures remain outside the repository. This report and its companion JSON contain only redacted field paths, types, counts, and generic equality results; no scalar response values, actual dates, diary content, names, or identifiers are recorded.

## Scope and dispositions

| Operation | Live sample | Candidate outcome |
| --- | --- | --- |
| `GetGuardianFeed` | One authorized HTTP 200 read; body has root `data` and `next_date`, with five date groups and five diary items | Confirm the static body-root shape; record account/context-specific types and additional `status` paths as sample metadata only. Keep the canonical model partial, open, and optional. |
| `GetGuardianDiary` | Skipped | No proven parent UI caller/body consumer and guardian access is unproved; retain opaque `unknown`. |
| `GetDiaryData` | Skipped | Employee-scoped consumer and a separate autosave-flush caller; no guardian substitution or request. |

## `GetGuardianFeed` observations

- The captured HTTP body is an object with root `data` (array) and sibling `next_date` (string). Capture-envelope status/content type are not body properties. This agrees with the static `response.data` → unchanged callback body → reducer trace.
- `data` contains five object groups with `date` (string), `diaries` (array), and `evaluations` (array). The sample contains five diary items across those five groups; the published shape record does not establish a per-group count distribution.
- Each sampled diary item has `id` (integer), `course` (string), `texts` (empty array), `feedback` (empty array), and `status` (object).
- The sampled status objects share a key set. In addition to static `color`, `icon`, and `name`, the sample has `id`, `kindergarten_id`, `type`, `meals`, `created_at`, `updated_at`, `created_by`, and `updated_by`. The first seven have observed integer/string types in the JSON ledger; `updated_by` was null in this sample, so its model recommendation remains `unknown`.
- All `evaluations`, `texts`, and `feedback` arrays were empty. No item shape or feedback visibility claim follows from them.
- The static diary-entry paths `meals`, `total_time`, `summaries`, `images`, `documents`, `feedback[].comment`, `feedback[].owner`, and `likes` were not observed in this response. Preserve those independent static paths; absence in one sample is not grounds to remove them. In particular, observed `status.meals` is not evidence for `diary.meals`, and `total_time` was not observed.
- The explicitly supplied parent/child ID boundary comparison had zero mismatches. The returned groups have no established ownership label, so this does not prove every group belongs to that child or guarantee private-only content. No ownership or guardian feedback-access guarantee is claimed.
- No actual date/cursor value, query scalar, ID, status value, timestamp, or diary text is published. The observed `next_date` type does not prove pagination, date, or timezone semantics.

## Model comparison and limits

All static feed paths that are present in this sample remain attributed to the existing source trace. The sample additionally exposes status paths not currently modeled; these are listed as observations rather than added to a canonical response model. Static-only paths are explicitly listed in `diary-candidates.json` and remain valid optional observations. The static `texts` type remains unknown: the client checks `typeof === 'object'` and uses `Object.keys`, which also admits arrays, while the live empty array supplies no item shape.

The JSON records all three operation dispositions, not just the sampled feed. It does not claim response completeness, stable counts, server-required fields, nullability, enums, authorization semantics, publication behavior, or read-side-effect guarantees. No requests were made by this audit; the one feed capture was already obtained by the controlling session under its bounded read authorization.

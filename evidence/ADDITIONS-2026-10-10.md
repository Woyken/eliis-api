# Bounded missing-field additions — 2026-10-10

This follow-up adds proven caller fields to existing operations. It does not add routes, infer server-requiredness, or claim complete response models.

## Scope

13 existing operation records now retain **51 additional top-level body-property occurrences** and **12 additional named query-parameter occurrences**, plus 15 named caller variants:

- Registration: `email`, `fname`, `lang`, `lname`, `method`, `password`, `role`, `country`, `tz`, `company_name`.
- Verification resend: `username`.
- Password recovery: `email`.
- Account recovery: `recovery_code`, `login_identifier`.
- Name update: `fname`, `lname`.
- Email change: `email`.
- Password verification: `password`, from two independent caller variants.
- Events query: `dateFrom`, `dateTo`.
- Work-schedule query: `courses`, `roles`, `start_date`, `end_date`.
- Notifications query: `page`, `perPage`.
- Polls query: `page`, `term`, `view`, `perPage`.
- Schedule insert: 14 proven own fields, including time/recurrence/range fields.
- Schedule update: a 19-name possible-key union; the app computes a difference body and does not always send all 19 keys.

Counts describe field occurrences across operation records, not globally distinct names. The API inventory remains **298 evidence records / 296 operations**. Query forwarding remains open where arbitrary caller objects are accepted.

## Evidence and corrections

- `auth-additions-candidates.json` and `schedule-additions-candidates.json` retain constructor and caller-to-service routing evidence.
- The corresponding initial review reports found and corrected dependency references, argument citations, full-day null handling, UTC conversion helper attribution, difference-body omission, and captured-data provenance.
- `auth-additions-final.md` and `schedule-additions-final.md` record the final bounded source reviews.
- Final schedule review found one helper-call offset citation (`0x174` versus `0x173`); it was corrected against original disassembly line 1030192. Both final targeted reviews have zero unresolved findings.
- All new operation bodies remain partial/open. Observed client constants such as registration `method="form"` and list `perPage` values are evidence extensions, not server enums/defaults.
- Recovery range/identifier values assigned `undefined` are distinguished from conditional own-property creation. Conditional email-change invocation does not make its `email` field conditionally constructed within the request.
- Full-day schedule times can reach Axios as null; the field types remain unknown rather than falsely string-only.

## Review boundary

The original four-round publication review and its frozen snapshot remain historical certifications of the original specification. They do **not** certify this later update's new fields. This follow-up uses targeted exploration, independent candidate reviews, corrected integration, final bounded source reviews, and regenerated output validation instead of restarting the full review marathon.

Complete server response schemas and all possible request/query fields remain unresolved. `VerifyTwoFactorAuthKey` was specifically left unknown because its arbitrary data argument was not reconstructed; login-2FA or password-verification fields were not transplanted into it.

Validation: 13 regression tests pass, TypeSpec compilation and normalized JSON/YAML contract checks pass, all 283 baseline source functions remain covered, and the dependency audit reports zero vulnerabilities. No login, mutation or private-record request was sent during this follow-up.

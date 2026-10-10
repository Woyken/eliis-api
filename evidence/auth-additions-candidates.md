# Auth/common request-body additions: caller evidence

Scope: bounded follow-up on the eight unknown-body helpers requested for review. The original candidate phase changed only this note and `auth-additions-candidates.json`; the reviewed integration described below also updates `evidence/research/auth-common.json` and its notes. The findings are named caller variants, not server-complete schemas. Source is the local Hermes disassembly at `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; original full-disassembly header line numbers and absolute constructor bytecode offsets are in the JSON. `constructor.bytecodeOffset` retains those original absolute offsets; evidence offsets written `+0x...` are relative to the named function.

## Recovered candidates

| Existing operation | Recovered caller field(s) | Caller constructor |
| --- | --- | --- |
| `RegisterUser` | `email`, `fname`, `lang`, `lname`, `method`, `password`, `role`, `country`, `tz`, `company_name` | `RegisterScreenSubmit` / #28149 |
| `ResendEmailVerification` | `username` | `ResendVerificationUsername` / #13505 |
| `RequestForgotPassword` | `email` | `RequestPasswordScreenEmail` / #28196 |
| `RecoverAccount` | `recovery_code`, `login_identifier` (assigned undefined on nullish params branch) | `LoginAccountRecovery` / #27174 |
| `UpdateUserName` | `fname`, `lname` | `AskUsernameScreen` / #45083 |
| `RequestEmailChange` | `email` | `UsersEmailForm` / #40927 |
| `VerifyPassword` | `password` | `UserSecurityVerifyPassword` / #41054; `TwoFactorRequiredVerifyPassword` / #45109 |

These are seven of the eight target helpers. `VerifyTwoFactorAuthKey` (#16335) remains unresolved: the traced two-factor login handler is wired to #16309 (`/api/auth/login-2fa`), a separate service. No data from that login request was copied to #16335.

## Proof and boundaries

- Each listed constructor creates a fresh object and its direct handoff is followed to the corresponding helper. The JSON records all locally constructed own field names, exact relevant branches, and values/constants where directly assigned.
- The helper/export paths are followed through the relevant action wrappers (#16254/#16255, #16260/#16261, #16263/#16264, #16226/#16227, #16292/#16293) or direct imported service calls, to the `default` service bindings installed in M1575 by #16306 or in M1577 by #16342, and then to the target Axios call. Caller functions pass locally constructed values; the helpers forward those values without adding body fields.
- `callsiteCoverage` is `partial`: this was deliberately a bounded search over these targets, not proof that no other UI callsites exist. For the named callers, the JSON records the root `__d` module IDs and dependency indices, action/export functions where present, M1574's M1575-auth/M1577-user service dependency, service-property installation functions, and target request functions. Module IDs were read from the `__d` registrations rather than inferred from UI names.
- All caller-derived values stay `unknown`. `tz` is `number` because it is the result of `Date.prototype.getTimezoneOffset()`. The registration constants `method: "form"` and `company_name: ""` are recorded as client assignments, not server enums/defaults. Recovery's own `login_identifier` key is always assigned at #27174 +0x5b, including the undefined-valued nullish-params branch; it has no `optional` flag. JSON serialization may omit undefined, but these instructions neither establish a downstream serializer nor server omission constraints.
- No server requiredness, validation, enum, or complete response/body schema is inferred. The target helpers accept/forward argument objects, so every endpoint-level body remains partial even where one caller's construction is complete.
- `RegisterScreenSubmit` #28149 constructs the listed 10-field payload, including the empty `company_name`; it then invokes its captured `registerUser` and dispatches the resulting action/thunk. Its downstream action wrapper #16255 forwards unchanged to M1575's method, installed as #16317.
- `UsersEmailForm` #40927 only makes the call if submitted email is not strictly equal to the current user's email. On that branch it supplies current user ID as the path argument and a newly constructed `{email}` body. This is conditional invocation, not optional inclusion of `email`.
- `VerifyPassword` has two independently traced single-field constructors. No other endpoint was enriched from validation schemas, labels, getters alone, runtime action metadata, or function names.

No HTTP requests were made; no credentials, private data, or source/code files were changed.

## Reviewed integration — 2026-10-10

The earlier review snapshot in `evidence/reviews/auth-additions-review.md` describes the pre-integration candidates, including the then-present recovery `optional: true`. This addition implements seven existing operation targets with eight named caller variants: 19 field occurrences across variants, or 18 distinct operation/body field occurrences because both VerifyPassword callers assign `password`. Endpoint bodies are `object` with `complete:false`; normalized variant fields retain complete local construction, partial caller coverage, exact routing metadata, and no server requiredness claims. The earlier 38 integrated variants are preserved; these eight are additional, not a new full-review certification.

Review corrections: M4575 dependency index is 6 (index 5 is M601); #16342's service module is M1577, not M1575. Resend #13505 dispatches the returned thunk at +0x4c. The email-change chain explicitly includes wrapper #16292 before #16293. Constructor offsets remain original absolute offsets, not presumed relative object-allocation offsets. #16335 remains unknown and receives no login-2fa or password-verification fields. No query, response, authentication, or platform model changes are part of this integration.

# Independent bounded auth-additions review

## Outcome

**Two evidence-reference corrections are required before implementation.** All seven operation targets, eight caller variants, and 19 field occurrences are supported by the original full disassembly. No wrong endpoint, invented payload key, lost field, downstream body mutation, or request-data projection was found in these chains.

Reviewed `evidence/auth-additions-candidates.json` and `.md` against `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, following `AGENTS.md`. This is a caller-evidence review, not approval of closed/server-complete request models. No HTTP requests, Git operations, generator runs, or input edits were performed. This report is the only project file edited by this reviewer.

## Finding: incorrect dependency index for the second VerifyPassword caller

- Location: JSON `VerifyPassword / TwoFactorRequiredVerifyPassword / routingChain[0]` (candidate line 223).
- Claim: M4575 dependency **5** is M1577.
- Counterexample: original `eliis.hasm` line **23002**, root #0 **+0x232e4**, has `[1, 8, 2, 9, 11, 601, 1577, ...]`: dependency 5 is **M601**, dependency **6** is **M1577**. Lines 23000–23003 correctly identify factory #45099 and module M4575.
- Exact positive trace: #45099 **+0xc0–+0xd1**, lines **1847502–1847506**, loads dependency index 6, imports it, and stores the result in factory environment slot 7. #45109 **+0x1d–+0x29**, lines **1848422–1848425**, loads that same slot 7, obtains `default.verifyPassword`, and invokes it at **+0x3c**, line **1848429**. M1577's #16342 installs `verifyPassword` as **#16381**, **+0x1a4–+0x1b5**, lines **649428–649432**.
- Minimal fix: change `dependencyIndex: 5` to **6** and the accompanying phrase `index 5` to `index 6`. Keep M1577, #45109, #16381, and the single `password` field unchanged. The underlying endpoint attribution is correct; only its recorded Metro index is wrong.

## All-fields ledger

Additional module-reference correction: candidate Markdown line **22** says the service bindings are installed “in M1575 by #16306 or #16342”. #16342 belongs to **M1577**, not M1575: root lines **8010–8013** identify M1577 factory #16341, which creates #16342 at **+0x85**, line **649301**. M1575/#16303 creates #16306 at **+0x92**, line **648377**. Minimal fix: say “in M1575 by #16306 or in M1577 by #16342”. The JSON's user-service module attributions are already correct.

Offsets below are relative to the named function. Each constructor header line and absolute bytecode offset recorded in the candidate JSON matches the original full source.

| Operation / caller (header line; absolute offset) | Verified own-key assignments and value evidence | Handoff |
| --- | --- | --- |
| RegisterUser / #28149 (1109018; `0x00637e47`) | Fresh R3 at +0x66. `email`: +0x68/+0x6e, form.email; `fname`: +0x73/+0x79, form.fname; `lang`: +0x7e/+0x82, captured slot 6; `lname`: +0x87/+0x8d, form.lname; `method`: +0x92/+0x96, literal **`"form"`**; `password`: +0x9b/+0xa1, form.password; `role`: +0xa6/+0xaa, captured slot 7; `country`: +0xaf/+0xb3, captured slot 8; `tz`: +0xb8, R6 result of constructed Date's getTimezoneOffset at +0x2b/+0x31; `company_name`: +0xbd/+0xc1, literal **`""`**. Exactly ten assignments, no spread/extra keys. | Same R3 to registerUser +0xc6; returned thunk dispatched +0xcb. |
| ResendEmailVerification / #13505 (543431; `0x004ae9c6`) | Getter called with literal `username` +0x12–+0x1a returns R5. Fresh R2 +0x40; own **`username`** +0x42. Not `email`, registration fields, or an unrelated validation schema. | R2 to resendEmailVerification +0x47; returned thunk is dispatched +0x4c. |
| RequestForgotPassword / #28196 (1110862; `0x00639137`) | Fresh R2 +0x33; argument 1's `email` read +0x35/+0x38; own `email` +0x3e. | R2 to requestForgotPassword +0x43; dispatch +0x48. |
| RecoverAccount / #27174 (1049954; `0x0061543a`) | Argument 1 loaded R6 +0x0a; fresh R1 +0x37; own `recovery_code` +0x39. Route.params +0x3e/+0x42; nullish equality +0x4a/+0x4c; R10 initialized undefined +0x50; branch +0x52 skips property read +0x55, **not** the own `login_identifier` assignment +0x5b. Exactly two own properties. | R1 directly to default.recoverAccount +0x60. |
| UpdateUserName / #45083 (1846664; `0x00853ea6`) | Fresh R7 +0x24; form.fname +0x26 and own `fname` +0x2c; form.lname +0x31 and own `lname` +0x37. R5 aliases this same object +0x3c. No `username` field. | updateUserName read +0x5a; R5 supplied +0x60; dispatch +0x65. |
| RequestEmailChange / #40927 (1659951; `0x007cc438`) | Fresh R2 +0x53; form.email +0x55; own `email` +0x5b. Current user.id is separately loaded R5 +0x4a/+0x4e. | requestEmailChange +0x60 gets ID as argument 1 and R2 as argument 2; dispatch +0x66. |
| VerifyPassword / #41054 (1665586; `0x007d0478`) | Fresh R2 +0x24; argument 1.password +0x26/+0x29; own `password` +0x2f. | default.verifyPassword +0x1e; R2 supplied +0x34. |
| VerifyPassword / #45109 (1848408; `0x00855377`) | Fresh R1 +0x2f; argument 1.password +0x31; own `password` +0x37. | default.verifyPassword +0x29; R1 supplied +0x3c. Same target #16381, not a two-factor-key/login endpoint. |

Registration captured-value attribution is independently supported: #28143 +0xc7–+0x109 stores selector results into slots 6/7/8 (lines 1108714–1108728); selectors #28144/#28145/#28146 read `translations.language`, `appState.registeredRole`, and `appState.registeredCountry` (lines 1108953–1108984). Only `tz: number`, `method: string` with observed value `"form"`, and `company_name: string` with observed value `""` have the proposed non-unknown types. No integer restriction, server enum, or server default follows from these assignments.

## Exact module/action/service/request ledger

Root module registrations, actual export bindings, factory environment slots, wrapper arguments, and final request-call registers were checked, rather than matching similar function names.

| Caller | Verified route to exact target | Final HTTP data argument |
| --- | --- | --- |
| #28149 | M2576/#28140 dependency 21 → M1574 (13005–13008); #16186 exports registerUser = #16254 at +0x4be/+0x4c3 (645718–645719); #16254 captures argument 1 and creates #16255 +0x09; #16255 uses factory slot 4 → M1575.default.registerUser; #16306 +0x77–+0x8a binds #16317. | #16317 (648836), post read +0x0c; URL `/api/auth/register` +0x12; argument 1 loaded R0 +0x16; post(URL R1, data R0) +0x19. |
| #13505 | M1231/#13500 dependency 26 → M1574 (6280–6283); #16186 exports resendEmailVerification = #16263 +0x4df/+0x4e4 (645724–645725); #16263 → #16264; #16264 slot 4 → M1575.default.resendEmailVerification; #16306 +0x8e–+0xa1 binds #16319. | #16319 (648872), post +0x0c; `/api/auth/verification/resend` +0x12; argument 1 R0 +0x16; post(R1, R0) +0x19. |
| #28196 | M2580/#28192 dependency 17 → M1574 (13025–13028); #16186 exports requestForgotPassword = #16260 +0x4d4/+0x4d9 (645722–645723); #16260 → #16261; #16261 slot 4 → M1575.default.requestForgotPassword; #16306 +0xa5–+0xb8 binds #16321. | #16321 (648903), post +0x0c; `/api/auth/password/email` +0x12; argument 1 R0 +0x16; post(R1, R0) +0x19. |
| #27174 | M2342/#27168 dependency 5 → M1575 (11835–11838); #27168 +0x90–+0xa1 imports it into slot 6 (1049561–1049565); #27174 loads slot 6 directly; #16306 +0x118–+0x12b binds recoverAccount = #16337. | #16337 (649151), post +0x0c; `/api/auth/recover-2fa` +0x12; argument 1 R0 +0x16; post(R1, R0) +0x19. |
| #45083 | M4572/#45076 dependency 18 → M1574 (22985–22988); #16186 exports **updateUserName = #16226** +0x462/+0x467 (645701–645702), distinct from updateUser = #16223; #16226 → #16227; #16227 slot 5 → M1577.default.updateUserName; #16342 +0xa7–+0xb8 binds **#16359**, distinct from updateUser = #16357. | #16359 (649712), **put** +0x0c; `/api/common/user/name` +0x12; argument 1 R0 +0x16; put(R1, R0) +0x19. No registration/update-user target substitution. |
| #40927 | M4230/#40921 dependency 19 → M1574 (21275–21278); #16186 exports requestEmailChange = **#16292** +0x525/+0x52a (645737–645738); #16292 (648164) captures argument 1 into slot 0 and argument 2 into slot 1, creates #16293 +0x10; #16293 slot 5 → M1577.default.requestEmailChange and passes captured arguments in order +0x15/+0x19/+0x1d; #16342 +0x131–+0x142 binds #16371. | #16371 (649905), post +0x0c; concatenates `/api/common/user/` + argument 1 + `/email-change` at +0x1f–+0x2a; argument **2** R0 +0x30; post(URL R1, data R0) +0x33. |
| #41054 | M4240/#41041 dependency 4 → M1577 (21325–21328); factory +0x8d–+0x9e stores import into slot 5 (1664754–1664758); #41054 loads slot 5 +0x15; #16342 binds verifyPassword = #16381 +0x1a4–+0x1b5. | #16381 (650074), post +0x0c; `/api/common/user/verify-password` +0x12; argument 1 R0 +0x16; post(R1, R0) +0x19. |
| #45109 | M4575/#45099 dependency **6** → M1577, stored into slot 7; #45109 loads slot 7; same verifyPassword binding = #16381. See finding above. | Identical #16381 data forwarding, no auth-key verification or login-2fa attribution. |

Shared dependency proof: #0 lines 7995–7998 identifies M1574/#16186 dependency 3 = M1575 and dependency 4 = M1577. #16186 +0x1db–+0x201 (645566–645575) stores those imports in slots 4 and 5 respectively. M1575 is factory #16303 (8000–8003); its constructed service instance is exported as default at #16303 +0xaf (648384). M1577 is factory #16341 (8010–8013); its constructed service instance is exported as default at #16341 +0xa2 (649308).

The wrappers do not add, delete, overwrite, or project payload properties before the service calls. Their later `then` callbacks and Redux action objects concern responses/state, not HTTP data. All seven targets forward the stated argument unchanged into Axios data; none introduces a request query/config constant in these calls.

## Branch/serialization and implementation boundaries

- **Recovery:** `login_identifier` is always an own property of the locally constructed object. Nullish route params produce an assigned **undefined value**, not conditional property inclusion. The candidate's `optional: true` is acceptable only as its explicitly qualified potential JSON/wire omission annotation, never as proof that #27174 conditionally creates this key or that the server accepts omission. These constructor/service instructions do not themselves call JSON.stringify or establish a specific downstream serializer. If implementation requires `optional` to mean proven own-key omission, do not mechanically copy this flag: preserve the assigned-undefined branch in notes (or separately establish transport serialization). Undefined may also result from a non-nullish params object without that property. Do not describe it as always omitted.
- **Email change:** #40927 +0x18 (1659961) is `JStrictEqual` to +0x8c, bypassing the entire request and possibly closing the modal. A request, when taken, constructs `{email}` unconditionally. This is **conditional invocation**, not optional `email` inclusion. The candidate correctly has no field-level optional flag.
- **Resend description precision:** candidate line 61 calls the +0x4c recipient a promise handler; it is the captured dispatch, matching the other thunked callers. Minimal wording improvement: `dispatches the returned thunk at +0x4c`. This does not invalidate the key/target evidence. #16292 is the missing explicit wrapper step in the email-change candidate's compact chain; it is verified above and can be added to improve reproducibility without changing the model.
- For all eight variants, `constructionComplete: true` means complete **local construction**, not exhaustive caller coverage or a closed server contract. Retain `callsiteCoverage: partial`, endpoint `bodyCompleteAtTarget: false` / `complete: false`, server-requiredness unknown, and unknown response completeness. Do not require caller keys merely because the UI assigns them; do not infer non-nullness or primitive types from form labels/validation.
- Register method/company constants are observed client assignments, not enums/defaults. No candidate query constant/default addition is approved or needed.
- **Unrecovered #16335:** #16306 +0x103–+0x114 installs verifyTwoFactorAuthKey = #16335; #16335 (649120; `0x004f5784`) posts its arbitrary argument to `/api/auth/2fa/verify` +0x12/+0x19. #16309 (648644; `0x004f53a6`) is separately bound as login2FA and posts to `/api/auth/login-2fa` +0x3b/+0x3f (also mutates `platform` +0x26). Neither #45109's password nor login-2fa code/login_identifier fields may enrich #16335. Leave its body unresolved; this bounded review does not claim exhaustive absence of callers.

## Gate

Correct the M4575 dependency index and the Markdown's #16342 module attribution before implementation. Otherwise the verified caller fields may proceed **only as named, partial, evidence-backed variants**, with the recovery assigned-undefined distinction preserved and no server requiredness/completeness assumptions.

# Auth/common response candidate review — initial

## Outcome and snapshot

**The current candidate is not complete: 5 actionable gaps affect 6 operations, plus several explicitly open consumer-chain dispositions.** The unknown default, open/incomplete modeling, and caution around status, enum, and field types are otherwise appropriate. In particular, the newly traced login and login-2FA fields are supported by their actual fulfillment paths.

Reviewed the current `evidence/responses/auth-common.json` snapshot, matching `evidence/research/auth-common.json`, `AGENTS.md`, and `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`.

* Response snapshot SHA-256: `05a46f87030c80f6e515bc9df6091619de3374869a9847ec64e0c5d49f81f478`
* 41/41 response operation IDs and source-function IDs match the request file; all 41 request source names and header lines match the full disassembly.
* All **174 trace references** point to valid full-disassembly function IDs and the exact cited function-header lines. This checks header identity, not just nearby literals.
* Current response dispositions: **10 object, 31 unknown, 0 array/scalar/binary**. The ten object records contain **26 top-level field observations and one nested observation** (`user.privacy_confirmed`); all 27 field value types are `unknown`.
* Every response record has nonempty evidence/limitations and `complete:false`. No closed response model, requiredness, server enum/default, media type, or route status is asserted. `RegisterUser`’s `status === 200` is correctly described as a client branch; `Login` correctly distinguishes the whole Axios response from `response.data.type`.

No HTTP requests, Git commands, builds, or edits to JSON/code were made. This is validation of the current candidate only, not a post-integration review.

## Actionable findings

### F1 — `/api/common/init` omits two proven collection-item reads

Affected operation: **GetUserData** (`evidence/responses/auth-common.json`, current record around lines 202–225).

The documented chain correctly follows `#16344 → #16345(response.data) → #16201 → #16202`; this is the same promise fulfillment, not a request payload or optimistic update. But `#16202` also calls `find` on the `kindergartens` and `organizations` values (full lines 646130–646164 and 646183–646207), passing each item to helpers `#16203` and `#16204`. Those helpers read item `.id` at full lines **646288** and **646303**. The current limitation “Collection element shapes ... unknown” therefore omits two directly observed paths from this exact init fulfillment:

* `kindergartens[*].id` — type unknown.
* `organizations[*].id` — type unknown.

Keep the collection/item types conservative if desired, and do not infer any additional item fields or server constraints. The current top-level fields and nested `user.privacy_confirmed` evidence are otherwise correctly rooted in the service result.

### F2 — permissions consumer reads a response-derived property

Affected operation: **GetUserPermissions** (current record around lines 243–257).

The service projects `response.data` in `#16349`; its exact thunk `#16210/#16211` passes that value to `setUserPermissions` (`#16195`), which constructs `SET_PERMISSIONS.data` unchanged (full lines 645993–646002). `userReducer` (`#25102`) stores that action data as `user.permissions` (lines 986194–199 and 986453–458). The actual menu selector `#32321` reads `user.permissions.applications_access_manage` (lines **1265046–1265061**). This is a proven client-observed response path, not an inferred permission name.

The empty unknown disposition misses at least top-level `applications_access_manage` (value type unknown). Do not infer its Boolean type, presence, or server permission domain from the consumer’s conditional use.

### F3 — two menu traces stop before the exact reducer/UI consumers

Affected operations: **GetUserMenu** and **GetUserKindergartenMenu** (current records around lines 259–291).

The response nesting is correct and must stay as HTTP-body root `left`: `#16352/#16355` read `response.data.left`; their respective thunks `#16218/#16237` pass that projected value to `setUserMenu` (`#16196`, full lines 646007–646016). `userReducer` (`#25102`) stores `SET_USER_MENU.data` unchanged in state `user_menu` (lines 986200–205 and 986441–449). The component selector `#32319` reads `state.user.user_menu` (1265022–1265029); traced consumers then call `find` and read menu-item `route` / `root_name`, `subitems`, and, on the `mychild` branch, `subitems.active_children` and `subitems.inactive_children` (e.g. `#32308/#32309`, lines 1263848–1263896; `#32331/#32332`, 1265212–1265243). The user reducer’s menu-image path also reads child-item `id` (e.g. `#25104/#25105`, 986577–986632).

Thus “no deeper menu fields ... directly established” is true only for the service callback/thunk, not the traced reducer and consumer chain. Preserve `left` at the HTTP body root, but document these partial client reads under it with unknown types. Do **not** model reducer-computed `profile_picture` from the separate child-image action as an original menu response field, and do not claim a complete menu schema.

### F4 — disable-two-factor consumer reads `deleted`

Affected operation: **DisableTwoFactorAuth** (current record around lines 469–479).

The service handler `#16380` returns `response.data`. Its exact UI caller `#41084` attaches success continuation `#41085` after invoking the service (full lines 1667216–1667237); `#41085` reads `.deleted` from its fulfillment at line **1667251**. The current unknown/empty record misses this body property. Add only `deleted` with type unknown; the client’s subsequent toast and locally constructed `SET_TWO_FACTOR_AUTH_PROVIDER` action do not justify extra fields. In particular, that locally constructed provider state is not response data.

### F5 — public agreement consumer reads `name` and `content`

Affected operation: **GetPublicAgreement** (current record around lines 626–636).

The current “no exact consumer projection” claim is contradicted by two UI fulfillment chains. `#28222` invokes `getPublicAgreement` and reads `name` and `content` from its result at full lines **1112257** and **1112260**; privacy-policy caller `#41110` does the same at **1668611** and **1668614**. Since service handler `#28230` returns `response.data`, these are body fields, not request labels or Axios metadata. Model `name` and `content` as unknown partial fields; do not infer their types or response media/status.

## Open consumer-coverage dispositions

An `unknown` response is still the correct conservative disposition where no body shape is proven. It must not, however, be worded as a completed whole-client consumer search when the trace ends at the service callback. Current records that expose only service/response-handler traces include **VerifyTwoFactorAuthKey, SearchByName, GetEnabledLanguages, AcceptEmployeeInvite, and AcceptAgreement**. Keep them unknown, but characterize their consumer coverage as untraced/open rather than evidence that no consumer exists.

Two additional chains can be documented as opaque without inventing fields: **GenerateTwoFactorAuthSecret** is called by `#41051` and `#45113`; their success continuations navigate/continue without reading response properties (full lines 1665522–1665567 and 1848508–1848552). **VerifyPassword** is used by `#41054` and other password flows; the shown success callback `#41055` compares the fulfillment with Boolean `true`, but reads no named body property, so a Boolean response schema is not established (1665586–1665633). These discovered paths should be added to the trace/disposition rather than leaving only the service projection. The same caution applies to any other unknown record whose trace stops before a known action/caller; this candidate does not establish server-wide consumer completeness.

## Exhaustive 41-operation ledger

“Fields” is the number of top-level response fields currently modeled; nested counts are called out separately. **Pass** means no response-analysis error found for the candidate’s stated evidence. **Open** means unknown remains appropriate but consumer coverage is not fully represented. **Gap** points to findings above.

| # | Operation | Current kind | Top fields | Review |
|---:|---|---|---:|---|
| 1 | GetLanguages | object | 2 | Pass — exact caller reads `langs`, `country`; types unknown. |
| 2 | GetTranslations | unknown | 0 | Pass — local `{}` fallback is excluded; resource-bundle use does not establish individual fields. |
| 3 | Login | object | 1 | Pass — raw Axios fulfillment; only `response.data.type` is a body read, transport `status` excluded. |
| 4 | Login2FA | object | 2 | Pass — service returns `data`; `status` and branch-read `locked_at` are exact caller reads. |
| 5 | SocialLogin | unknown | 0 | Open — raw Axios result/action forwarding; no stable body projection. |
| 6 | SocialRegister | unknown | 0 | Open — raw Axios result/action forwarding; no stable body projection. |
| 7 | RegisterUser | unknown | 0 | Pass — `data` only on client `status === 200`; no server status contract inferred. |
| 8 | ResendEmailVerification | unknown | 0 | Open — data projection/action forwarding; no response-body property read shown. |
| 9 | RequestForgotPassword | unknown | 0 | Open — data projection/action forwarding; request-screen evidence is not response evidence. |
| 10 | VerifyTwoFactorAuthKey | unknown | 0 | Open — service-only trace; consumer chain remains untraced. |
| 11 | RecoverAccount | unknown | 0 | Pass — direct caller trace concerns request; no body property read. |
| 12 | Logout | unknown | 0 | Pass — whole Axios response retained; no wrapper/status/header field modeled as body. |
| 13 | GetUserData | object | 7 | **Gap F1** — also reads `kindergartens[*].id` and `organizations[*].id`; nested `user.privacy_confirmed` is correctly sourced. |
| 14 | GetUserProfile | unknown | 0 | Pass — exact action stores whole fulfillment; no safe endpoint-specific body field established. |
| 15 | GetUserPermissions | unknown | 0 | **Gap F2** — response-derived `applications_access_manage` is read after reducer storage. |
| 16 | GetUserMenu | object | 1 | **Gap F3** — root `left` nesting is correct; reducer/UI consumers are omitted. |
| 17 | GetUserKindergartenMenu | object | 1 | **Gap F3** — root `left` nesting is correct; same setter/reducer consumer chain is omitted. |
| 18 | UpdateUser | unknown | 0 | Pass — request/optimistic user fields are not treated as response fields. |
| 19 | UpdateUserName | unknown | 0 | Pass — whole fulfillment is dispatched; no response property read shown. |
| 20 | UploadUserPicture | object | 1 | Pass — `profile_picture` read from response data; type remains unknown. |
| 21 | DeleteUserPicture | unknown | 0 | Pass — service result ignored; local `null` update is excluded. |
| 22 | DeactivateUser | unknown | 0 | Pass — action forwards fulfillment without body reads. |
| 23 | GetUserSettings | unknown | 0 | Pass — action stores whole fulfillment; action shape does not establish response shape. |
| 24 | GetUserTargetGroups | unknown | 0 | Pass — action forwards value; separate message-target-group operation not conflated. |
| 25 | RequestEmailChange | unknown | 0 | Pass — fulfillment forwarded; request/UI messaging not modeled as body fields. |
| 26 | GetUser2FAProvider | unknown | 0 | Pass — whole data value stored; no exact property read established in traced consumer. |
| 27 | GenerateTwoFactorAuthSecret | unknown | 0 | Open — known callers are not in current trace; both success continuations read no body property. |
| 28 | EnableTwoFactorAuth | object | 1 | Pass — body `status` property is read; no enum/value-domain claim. |
| 29 | DisableTwoFactorAuth | unknown | 0 | **Gap F4** — exact success caller reads body `deleted`. |
| 30 | VerifyPassword | unknown | 0 | Open — caller compares fulfillment to `true`, but no named body field/type is established. |
| 31 | GetKindergartenActivity | object | 1 | Pass — `events_count` read directly from response data; value type unknown. |
| 32 | GetUserBanners | unknown | 0 | Pass — action wrapper/date are local; no response fields or array type fabricated. |
| 33 | SearchByName | unknown | 0 | Open — service-only trace; no consumer coverage chain documented. |
| 34 | GetEnabledLanguages | unknown | 0 | Open — service-only trace; no consumer coverage chain documented. |
| 35 | GetKindergartenChildrenList | unknown | 0 | Pass — exact action dispatches whole value; endpoint naming does not prove array shape. |
| 36 | GetCountries | unknown | 0 | Pass — whole value dispatched; no public sample/UI-derived schema asserted. |
| 37 | GetUserDashboard | object | 9 | Pass — all nine properties are direct same-promise reads; local schedule `tz`/refresh wrapper excluded. |
| 38 | AcceptEmployeeInvite | unknown | 0 | Open — service-only trace; no consumer coverage chain documented. |
| 39 | GetPublicAgreement | unknown | 0 | **Gap F5** — UI reads body `name` and `content` in two callers. |
| 40 | AcceptAgreement | unknown | 0 | Open — service-only trace; no consumer coverage chain documented. |
| 41 | Authorize | unknown | 0 | Pass — callback gets `response.data`; operation returns arbitrary callback result. |

No changes to `evidence/responses/auth-common.json` or request/code/generated files were made by this review.

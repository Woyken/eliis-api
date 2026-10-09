# Auth/common independent evidence review — round 1

## Outcome and scope

**41/41 records reviewed; 7 actionable findings affecting 9 distinct records.** All 41 HTTP methods and path templates are supported. All 41 source IDs, names, and full-disassembly header lines match. No change to an operation's auth classification is warranted. Corrections concern request construction/provenance, incomplete platform evidence, authentication-interceptor documentation, and response transformations—not inferred server contracts.

Reviewed `AGENTS.md`, `evidence/research/auth-common.json`, the domain notes, `/data/data/com.termux/files/home/eliis-analysis/domain-source/auth-common.hasm`, its index, and upstream/supporting functions in the full `eliis.hasm`. Read all 41 request functions and all 49 referenced response/error/finally closures. The index was used for coverage/locations, not as proof of request fields. Also checked the corresponding 41 operations in `routes/generated.tsp`, the four auth/common body models in `models/generated.tsp`, and response/auth definitions in `main.tsp` for evidence propagation and invented schemas.

Only this review report is authored by this reviewer. No research, generated files, manifests, or other source files were changed. **No HTTP calls were made**, including public, authenticated, login, or write calls.

Offsets below use `#function +0xNN` for instruction offsets within a function. Absolute bytecode offsets and full-disassembly source lines are provided where useful; source-line numbers are for the full `eliis.hasm`, not the extracted domain file.

## Actionable findings

### F1 — Shared platform construction is established, not wholly unresolved

Affected records: **Login, Login2FA, SocialLogin, SocialRegister, Logout, GetUserData**.

`#16340 getPlatform`, absolute `0x004f5894`, full lines **649231–649258**, constructs a fresh object with exactly two own fields:

- `platform`: a **string**, constructed at `+0x05–+0x39` as `systemName + " " + systemVersion + ", Model: " + model + ", Device id: " + deviceId`.
- `browser`: a **string**, constructed at `+0x3e–+0x59` as `"Mobile app v" + getVersion()`.

Upstream `#16339`, absolute `0x004f57e8`, full lines **649182–649226**, assigns environment slots 1–4 from `getDeviceId()`, `getModel()`, `getSystemName()`, and `getSystemVersion()` respectively and exports the `#16340` closure. These are traced sources, not guessed meanings from adjacent strings.

The records retain too little locally proven nested evidence, and Login/Logout also omit a subsequent mutation:

| Caller | Proven nested object actually used |
|---|---|
| `#16308 Login` | `{platform: string, browser: string, login: "password"}`: `getPlatform()` returns into r0 at `+0x22`; `+0x26/+0x2a` load `"password"` and assign **r0.login**; `+0x58` puts r0 into the outer body `platform` field. |
| `#16309 Login2FA` | `{platform: string, browser: string}` assigned to caller payload `.platform` at `+0x26`; **no added login field** in this wrapper. |
| `#16311 SocialLogin` / `#16314 SocialRegister` | `{platform: string, browser: string, login: input.social}`; the mutation is nested, as detailed in F2. |
| `#16323 Logout` | `{platform: string, browser: string, login: "password"}`: result r5 at `+0x21`, login assignment `+0x25/+0x29`; nested under `config.params.platform` at `+0x41`. It is **not** locally JSON-stringified. |
| `#16344 GetUserData` | Base object plus `login: argument 2` at `+0x26/+0x29`, and conditional `push_token: argument 1` at `+0x2f/+0x32`; then **JSON.stringify** at `+0x57` before assignment to `config.params.platform` at `+0x5c`. |

**Correction:** preserve these exact nested constructions in field evidence/notes (and nested field metadata where supported). Login's outer complete construction remains precisely `username`, `password`, `platform`; do not add outer `browser` or `login`. Its nested `login` is the observed constant `"password"`, not a server enum. Preserve unknown caller-derived values. For GetUserData, only `push_token` has a proven conditional inclusion (`argument 1` truthy); `login` is assigned unconditionally, but JSON serialization can omit an undefined value. Do not turn client assignments into assertions about wire/server requiredness. The top-level platform query of GetUserData correctly remains a JSON-encoded string. Other platform values are locally constructed objects; the research contract's field type vocabulary does not require inventing a new `object` type just to retain the nested evidence.

### F2 — Social requests do not assign an outer payload `login` property

Affected records: **SocialLogin and SocialRegister**, `body.evidence`.

`#16311` (absolute `0x004f53fe`, header line **648684**) and `#16314` (absolute `0x004f54d5`, header line **648760**) have identical register flow for this section:

- `+0x24`: `getPlatform()` returns the new platform object into **r2**.
- `+0x28`: reads `input.social` from **r5** into r3.
- `+0x2e`: `PutById r2, r3, login` mutates **the platform object**, not r5.
- `+0x34`: writes r2 to **r5.platform**.
- `+0x3c`, `+0x48`, `+0x52`: writes **r5.role = null**, **r5.tz = -180**, **r5.lang = "en"**.
- `+0x67/+0x82`: independently reads r5.social for the provider URL segment.
- `+0x8e/+0x93/+0x97`: `{params: {app_login: true}}` is the third POST argument; r5 is the POST data argument.

Current wording “assigning login from its social property, platform from getPlatform()” incorrectly describes the request mutation and omits the intervening platform mutation. **Correction:** state `platform = getPlatform(); platform.login = input.social; input.platform = platform`, followed by the three outer constants. Keep `body.kind: unknown`, `fields: []`, and `complete: false` for the arbitrary caller object's remainder. Do not fabricate an outer `login` field. Query boolean constant `app_login=true`, path provider provenance, and cookie-client classification are correct.

### F3 — The isolated login client does have cookie-capturing response interception

Affected record: **Login**, `notes[0]`; related domain authentication explanation should distinguish request from response interception.

`#5603`, absolute `0x003d8e16`, full lines **254019–254130**:

- `+0x13e/+0x143`: creates/exports the separate **auth** Axios instance.
- `+0x153/+0x158`: creates/stores the separate default instance.
- `+0x169–+0x189`: installs the cookie-attaching **request** interceptor only on the default instance.
- `+0x19c–+0x1b8`: installs default response handlers.
- `+0x1be–+0x1da`: installs **auth response handlers** `#5621` and `#5622` on the auth instance retained in r4.

`#5621` shares the `0x003d9296` body with `#5619`: at `+0x03/+0x0c` it calls environment slot 8, the `setCookie` helper established at `#5603 +0x18f–+0x198`. That helper reaches `#5617` (`0x003d91e4`, full lines **254464–254517**), which parses `headers['set-cookie'][0]`, extracts/serializes **eliis_csrf** (`+0x3b–+0x58`), and saves it using `saveAccessToken` (`+0x91/+0x97`).

**Correction:** replace “no configured eliis_csrf-cookie interceptor” with “no configured cookie-attaching request interceptor; it does have the shared response interceptor that captures eliis_csrf.” **Keep `auth: none` for Login**: this classification documents the absence of the configured credential-attaching request interceptor, not inability to establish a cookie on the response or a guarantee that Android's native networking never has cookies. Keep `cookie` for the other 40 default-client operations; no Bearer scheme is supported.

### F4 — Registration's response-data reduction is conditional on status 200

Affected record: **RegisterUser**, `response.evidence`.

`#16317 +0x26` selects response handler `#16318`, absolute **`0x004f55c6`**, full lines **648856–648871**. `#16318 +0x03` reads `response.status`; `+0x08` loads **200**; `+0x0b` branches on strict equality. `+0x0f/+0x11` return undefined for a non-200 response; only `+0x13/+0x18` return `response.data` for status 200.

**Correction:** say “returns response.data only when response.status === 200; otherwise undefined.” The existing unconditional claim is inaccurate. **Keep the HTTP response model unknown/default**: the client's status test does not prove that the server always returns 200, nor justify inventing success/error status schemas.

### F5 — Banner function has two explicit arguments, not three

Affected record: **GetUserBanners**, `notes[0]`.

`#16391`, absolute **`0x004f61e7`**, full lines **650321–650347**, has a header of **3 params including implicit `this`**, hence **two explicit arguments**. `+0x22` loads parameter 1; `+0x29` loads parameter 2; the variadic concat at `+0x30` builds `/api/` + arg1 + `/` + arg2 + `/banners`. There is no parameter-3 load and no third declared explicit argument.

**Correction:** remove the factual claim “Third declared argument is not used…” or replace it with “Two explicit arguments form the two dynamic URL components; GET receives URL only.” The path and existing `pathPart1`/`pathPart2` order are correct. Semantic names remain unresolved; no renaming preference is requested.

### F6 — Broadcasting channel name comes from the captured authorizer argument

Affected record: **Authorize**, `body.fields[channel_name].evidence` and `body.evidence`; propagated to `AuthorizeBody` in generated evidence.

`#16397 authorizer`, absolute **`0x004f653e`**, full lines **650583–650593**, loads its **first argument** at `+0x02`, stores it in environment slot 0 at `+0x05`, and creates the `#16398` closure at `+0x0b`.

`#16398 authorize`, absolute **`0x004f6555`**, full lines **650598–650624**:

- `+0x02/+0x05`: captures authorize's **second explicit argument as the callback** in its newly created child environment.
- `+0x1d/+0x20`: assigns authorize's first explicit argument to `socket_id`.
- `+0x25/+0x28/+0x2c/+0x31`: gets the **outer authorizer environment slot 0**, reads `.name`, and assigns `channel_name`.
- `+0x3a`: POST data is the locally complete two-field object.

**Correction:** document `{socket_id: authorizeArgument1, channel_name: capturedAuthorizerArgument1.name}`. Authorize's second argument is **not the channel object**. Both scalar value types appropriately remain unknown. The field names, locally complete top-level body, method/path, data placement, and default-cookie auth are correct.

### F7 — Broadcasting success/error handlers return callback results, not response.data

Affected record: **Authorize**, `response.evidence` and `notes[0]`.

`#16399`, absolute **`0x004f65b6`**, full lines **650629–650640**:

- `+0x03`: loads the callback captured from authorize's second argument.
- `+0x0a`: loads response.data into r2.
- `+0x11`: loads null into r0.
- `+0x13`: `Call3 r0, r3, undefined, null, r2` executes **callback(null, response.data)**, storing **the callback's return value** into r0.
- `+0x19`: returns r0, **not r2**.

`#16400`, absolute **`0x004f65d1`**, full lines **650645–650655**, similarly calls **callback(error, null)** at `+0x0e` and returns its result at `+0x14`.

**Correction:** document these callback invocations and their returned results. Remove both “Function #16399 returns response.data” and “the returned value is not altered.” Do not assume the callback necessarily returns undefined, and do not infer an HTTP response wrapper from this application callback. HTTP response remains unknown.

## Exhaustive operation ledger

Every row's method/path, dynamic argument order, query/data/config placement, response/error closures, and auth-client selection were checked. `a1`/`a2` mean explicit arguments (exclude implicit `this`). `D` means `response.data` using a checked 10-byte callback with `LoadParam +0x00`, `GetById data +0x03`, `Ret +0x08` (shared absolute body `0x004925f3`). `R` means unchanged Axios response. Empty-body means no request data argument; it is not an invented empty-object body. All rows use the default-cookie client except Login's isolated auth client.

| Operation | Function / full header line / absolute offset | Verified method/path | Verified request inputs and response; findings |
|---|---|---|---|
| GetLanguages | #12709 / 509969 / `0x004925c6` | GET `/api/lang/languages` | URL only at +0x15; D #12710. Pass. |
| GetTranslations | #12711 / 509999 / `0x004925fd` | GET `/api/lang/{language}.json` | a1 language; GET +0x31; #12712 truthy response.data else {}; #12713 rejection → {}. Pass. |
| Login | #16308 / 648612 / `0x004f533d` | POST `/api/auth/login` | Complete `{username: a1.username, password: a1.password, platform: mutated constructor result}`; auth.post +0x61; returns Axios promise directly. F1, F3. |
| Login2FA | #16309 / 648644 / `0x004f53a6` | POST `/api/auth/login-2fa` | a1 mutated with platform; POST +0x3f; D #16310. F1. |
| SocialLogin | #16311 / 648684 / `0x004f53fe` | POST `/api/auth/callback/{provider}/login` | provider a1.social; mutated a1 data; query app_login=true in config; POST +0x97; R #16312; #16313 error.response or undefined. F1, F2. |
| SocialRegister | #16314 / 648760 / `0x004f54d5` | POST `/api/auth/callback/{provider}/register` | provider a1.social; mutated a1 data; query app_login=true in config; POST +0x97; R #16315; #16316 error.response or undefined. F1, F2. |
| RegisterUser | #16317 / 648836 / `0x004f5594` | POST `/api/auth/register` | a1 data at +0x19; conditional D #16318. F4. |
| ResendEmailVerification | #16319 / 648872 / `0x004f55e0` | POST `/api/auth/verification/resend` | a1 data at +0x19; D #16320. Pass. |
| RequestForgotPassword | #16321 / 648903 / `0x004f5612` | POST `/api/auth/password/email` | a1 data at +0x19; D #16322. Pass. |
| VerifyTwoFactorAuthKey | #16335 / 649120 / `0x004f5784` | POST `/api/auth/2fa/verify` | a1 data at +0x19; D #16336. Pass. |
| RecoverAccount | #16337 / 649151 / `0x004f57b6` | POST `/api/auth/recover-2fa` | a1 data at +0x19; D #16338. Pass. |
| Logout | #16323 / 648934 / `0x004f5644` | GET `/api/auth/logout` | Nested object config.params.platform (login="password"); GET +0x4e; R #16324; #16325 logs on rejection; #16326 finally → undefined. F1. |
| GetUserData | #16344 / 649457 / `0x004f5b61` | GET `/api/common/init` | JSON.stringify platform after login=a2 and conditional push_token=a1; GET +0x69; D #16345. F1. |
| GetUserProfile | #16346 / 649508 / `0x004f5be3` | GET `/api/common/user/profile` | URL only +0x15; D #16347. Pass. |
| GetUserPermissions | #16348 / 649538 / `0x004f5c10` | GET `/api/kindergartens/{kindergartenId}/user/permissions` | a1 path; GET +0x31; D #16349; #16350 rethrows. Pass. |
| GetUserMenu | #16351 / 649587 / `0x004f5c67` | GET `/api/common/menu` | URL only +0x17; #16352 response.data.left; #16353 rethrows. Pass; unknown HTTP response, no invented left-wrapper model. |
| GetUserKindergartenMenu | #16354 / 649631 / `0x004f5cb3` | GET `/api/kindergartens/{kindergartenId}/menu` | a1 path; GET +0x31; #16355 response.data.left; #16356 rethrows. Pass; unknown HTTP response. |
| UpdateUser | #16357 / 649681 / `0x004f5d0a` | PUT `/api/common/user/update` | a1 data +0x19; D #16358. Pass. |
| UpdateUserName | #16359 / 649712 / `0x004f5d3c` | PUT `/api/common/user/name` | a1 data +0x19; D #16360. Pass. |
| UploadUserPicture | #16361 / 649743 / `0x004f5d6e` | POST `/api/common/settings/upload` | a1 data; config.headers Content-Type="multipart/form-data"; POST +0x2a; D #16362. Pass, unresolved multipart fields. |
| DeleteUserPicture | #16363 / 649779 / `0x004f5db2` | DELETE `/api/common/settings/delete` | URL only +0x15; no config.data; D #16364. Pass. |
| DeactivateUser | #16365 / 649809 / `0x004f5ddf` | PUT `/api/common/user/delete` | URL only +0x16; no data; D #16366. Pass. |
| GetUserSettings | #16367 / 649839 / `0x004f5e0d` | GET `/api/common/user/settings` | URL only +0x15; D #16368. Pass. |
| GetUserTargetGroups | #16369 / 649869 / `0x004f5e3a` | GET `/api/kindergartens/{kindergartenId}/target-groups/available` | a1 path; URL only +0x2f; D #16370. Pass. |
| RequestEmailChange | #16371 / 649905 / `0x004f5e81` | POST `/api/common/user/{userId}/email-change` | a1 userId, a2 data; POST +0x33; D #16372. Pass. |
| GetUser2FAProvider | #16373 / 649942 / `0x004f5ecd` | GET `/api/common/user/2fa` | URL only +0x15; D #16374. Pass. |
| GenerateTwoFactorAuthSecret | #16375 / 649972 / `0x004f5efa` | POST `/api/common/user/2fa/generate-secret` | Complete `{type: a1}` at +0x12–+0x17; POST +0x1f; D #16376. Pass. |
| EnableTwoFactorAuth | #16377 / 650005 / `0x004f5f32` | POST `/api/common/user/2fa/enable` | a1 data +0x19; D #16378. Pass. |
| DisableTwoFactorAuth | #16379 / 650036 / `0x004f5f64` | POST `/api/common/user/2fa/disable/{provider}` | a1 provider, complete `{password: a2}` +0x2b–+0x30; POST +0x35; D #16380. Pass. |
| VerifyPassword | #16381 / 650074 / `0x004f5fb2` | POST `/api/common/user/verify-password` | a1 data +0x19; D #16382. Pass. |
| GetKindergartenActivity | #16386 / 650195 / `0x004f60c2` | GET `/api/kindergartens/{kindergartenId}/activity` | a1 path; URL only +0x2f; D #16387. Pass. |
| GetUserBanners | #16391 / 650321 / `0x004f61e7` | GET `/api/{pathPart1}/{pathPart2}/banners` | a1 then a2 path; URL only +0x34; D #16392. F5. |
| SearchByName | #24587 / 967298 / `0x005db6e7` | GET `/api/common/kindergartens/search` | config.params={term:a1}; GET +0x25; D #24588. Pass. |
| GetEnabledLanguages | #24589 / 967333 / `0x005db725` | GET `/api/kindergartens/{kindergartenId}/languages` | a1 path; URL only +0x2f; D #24590. Pass. |
| GetKindergartenChildrenList | #24591 / 967369 / `0x005db76c` | GET `/api/kindergartens/{kindergartenId}/children-list` | a1 path; URL only +0x2f; D #24592. Pass. |
| GetCountries | #26289 / 1022267 / `0x006020ea` | GET `/api/auth/countries` | URL only +0x15; D #26290. Pass; default client despite auth path. |
| GetUserDashboard | #26882 / 1040525 / `0x0060ed61` | GET `/api/common/user/dashboard` | a1 is arbitrary Axios config, not POST data or an established params object; GET +0x18; D #26883. Pass with explicit unresolved-config note. |
| AcceptEmployeeInvite | #26884 / 1040556 / `0x0060ed92` | PUT `/api/common/user/invites/{inviteId}` | a1 path; URL only +0x2b; D #26885. Pass. |
| GetPublicAgreement | #28229 / 1112422 / `0x0063a1f2` | GET `/api/agreements/{agreementId}` | a1 agreementId; config.params={language:a2}; GET +0x3a; D #28230. Pass; “public” name alone does not change client auth. |
| AcceptAgreement | #28231 / 1112462 / `0x0063a245` | POST `/api/common/agreements/{agreementId}/accept` | a1 path; URL only +0x30; no data; D #28232. Pass. |
| Authorize | #16398 / 650598 / `0x004f6555` | POST `/broadcasting/auth` | Complete socket_id=a1, channel_name=captured outer channel.name; a2 callback; POST +0x3a; #16399/#16400 return callback results. F6, F7. |

## Cross-cutting request/security checks

- **Data vs config:** Axios calls were traced by register positions, not by nearby strings. POST/PUT data is the second explicit Axios argument; UploadUserPicture and both social requests supply third-argument config. Dashboard's second GET argument is config. DeleteUserPicture has no `config.data`. DeactivateUser, AcceptEmployeeInvite, and AcceptAgreement call their write verb with URL only.
- **Body transformations:** full Axios initialization installs `#5842 transformRequest` in defaults (full lines **255333–255340**). `#5842` (`0x003dfa4b`, header **263038**) preserves FormData when no JSON content type is requested (`+0x80–+0x92`, `+0x23c–+0x25f`); recognizes multipart objects and converts them via the FormData helper (`+0x17a–+0x1fe`); otherwise locally constructed ordinary objects reach JSON content-type selection/stringification (`+0x18c–+0x1ad`). Thus the four complete request objects have supported JSON construction, while UploadUserPicture's actual supplied fields remain unresolved. No universal form fields or request wrappers are added by the traced application interceptor.
- **Query transformations:** `#5683 buildURL` (`0x003dbe78`, header **257758**) passes ordinary params through its URLSearchParams serializer (`+0x74–+0x97`), with a distinct custom-serializer branch (`+0xa9`). Logout supplies an object under params.platform; GetUserData explicitly JSON-stringifies its platform object before Axios. Do not conflate these encodings. Dashboard's arbitrary config may override params/serialization/options; the existing note correctly leaves it unresolved rather than inventing named query fields.
- **Cookie attachment:** `#5612` (`0x003d90ee`, full lines **254346–254399**) combines optional stored user language (`lang=`) and the stored access-token cookie string into config.headers.cookie (`+0x53–+0x9e`). `#5617` proves that the saved credential is serialized eliis_csrf, not Bearer. It also establishes why default-client classification is about configured behavior, not proof every route requires an authenticated session.
- **Response reduction is not HTTP schema:** both menu callbacks (`#16352/#16355`, shared absolute `0x004f5ca4`) read data at +0x03 and left at +0x08. This supports the documented client projection, not a complete `{left: ...}` HTTP model. All 41 unknown response models are a valid limitation. Common error interceptor branches likewise do not prove per-route server error schemas/statuses.
- **Named models:** `LoginBody`, `GenerateTwoFactorAuthSecretBody`, `DisableTwoFactorAuthBody`, and `AuthorizeBody` have the correct seven top-level field names in total (3 + 1 + 1 + 2). Login needs F1's nested evidence; Authorize needs F6's provenance correction. Unknown caller-derived field types are appropriate. The models' client-presence/serverValidation annotations explicitly avoid claiming server validation; no new requiredness, enums, nullability, defaults, pagination, or error/status wrappers are warranted. All 41 generated operations use `UnresolvedResponse`; 40 use cookie auth and Login does not. No invented per-route status code or enum was found in the selected generated operation blocks.

## Full checklist and counts

| Check | Count/result |
|---|---|
| Records / unique source functions / domain index entries | **41 / 41 / 41**, exact ID-set equality |
| Source ID, function name, full header line | **41/41 matched** |
| Whole request functions inspected | **41/41** |
| Referenced success/error/finally closures inspected | **49/49** |
| Methods | **19 GET, 17 POST, 4 PUT, 1 DELETE**; **41/41 correct** |
| Paths/templates | **41/41 correct**, including language `.json` suffix and `/broadcasting/auth` |
| Dynamic path operations / fields | **15 / 16**, all orders/provenance correct |
| Explicit named query operations / fields | **6 / 6**: social app_login twice, logout platform, init platform, search term, agreement language |
| Query constants/types | **2 booleans fixed true**, **1 explicit JSON string**, **3 unknown**; constructor evidence must be enriched for the two platform queries per F1 |
| Query passthrough / arbitrary config | No forwarded bare params object; **1 arbitrary GET config** (Dashboard), correctly documented unresolved |
| Body classification | **23 absent, 13 unknown forwarded/mutated, 4 complete objects, 1 unresolved multipart** |
| Complete-body top-level fields | **7**, no missing/extra top-level fields; Authorize provenance wrong, Login nested construction underdocumented |
| Conditional nested inclusion | **1** proven push_token inclusion branch; no inferred optionality for arbitrary fields |
| Authentication classifications | **40 cookie / 1 none**, **41/41 correct client selection**; Login interceptor explanation requires F3 |
| Responses | **41 unknown**, appropriate; **2 records have false reduction evidence** (RegisterUser, Authorize), corrected by F4/F7 |
| Menu reduction checks | **2/2 correct data.left**, no inferred wrapper schema |
| Named auth/common body models | **4/4 top-level names consistent**, corrections propagate as described |
| Unsupported server requiredness/enums/status/error schemas | **0 identified** in the checked auth/common evidence/generated operations |
| Findings | **7 groups**, affecting **9 distinct records**; **32 records have no identified correction** |
| Method/path/auth-classification corrections | **0 / 0 / 0** |
| HTTP/private-record/write activity | **0** |

The nine affected records are Login, Login2FA, SocialLogin, SocialRegister, Logout, GetUserData, RegisterUser, GetUserBanners, and Authorize. Findings overlap; their record counts must not be summed as unique records. This review is exhaustive for the assigned 41-record set, not a claim of server-wide completeness or discovery of every other application operation.

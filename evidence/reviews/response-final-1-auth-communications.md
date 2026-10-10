# Final response review run 1 — Auth/common and Communications

## Outcome

**Not clean: 5 factual/trace-coverage findings** in the assigned 109 response analyses (41 Auth/common + 68 Communications). The 37 modeled response schemas and their generated TypeSpec/OpenAPI projections are structurally correct; the findings concern two request-identity labels in response evidence, one field-consumer trace omission, one inaccurate opaque-response disposition, and known callback/reducer hops missing from traces. Keep the affected response fields/types conservative; no additional response fields are inferred by this review.

This is one bounded scope of a full review run, not a clean run or certification of the repository. The parent retains the full-run gate and remaining review-round limit.

## Frozen inputs and procedure

- `evidence/reviews/response-input-snapshot.json` declares frozen input-set digest **`6a6679d9949e549f74cdf3f160240e5a5f58681809cbeba03627c94ee12ad2ab`**. All **43/43** listed file hashes matched before and after review, with zero missing/mismatched inputs. The snapshot JSON file's own byte SHA-256 is `86391d7c187d1c9f63fdd7cd1c3448c9f26f9d09d07ad62304d8284fb8e8c555`; that is distinct from its embedded input-set digest.
- Compared both response-analysis arrays to their request research arrays and original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`: **109/109 operation IDs and source function IDs match; all 109 request source lines match the original source-function headers.** All **493 currently recorded trace steps** point to existing original function IDs and line coordinates within the named function blocks. In addition, the path-argument/register traces below were checked in the original bytecode.
- Rechecked all modeled response fields recursively, including source projection → callers/actions/reducers, body-vs-Axios-wrapper boundaries, and the nested `left` menus. The earlier Auth/common and Communications response reports were used to locate the already-investigated callback paths; the identified additions/omissions below were checked against the original disassembly.
- Read-only projection checks: **37/37** modeled response bodies and **98/98** recursive field nodes match `models/responses.tsp` and OpenAPI JSON by field path, type, and field-evidence extension. All declared TypeSpec fields are optional; OpenAPI fields have no `required`, enum, default, nullability, array-size, or closed-object assertions. The remaining **72/72** assigned unknown dispositions emit an unconstrained `{}` body. All **109/109** assigned operations use a `default` response with `*/*` media; no numeric response status is asserted. OpenAPI JSON/YAML parse to structurally equal documents; the JSON has 296 operations overall.
- Reviewed artifact SHA-256: TypeSpec `models/responses.tsp` `38c91e11e1fbd1e7dfd5699e6d99b8814dd98aba1febed7aa873b72a446fda6c`; OpenAPI JSON `bbe7c01a9e9c50a8fff7ff3caf2089758e237b242ed2b6fc0c898adafc5f9e1d`; YAML `143d71e14785a0063eda640db7dabbf18de61e84d172922f9fab53d6c066229c`.
- No input/evidence/model edits, generation, compilation, tests, npm CI, or HTTP/private-record activity occurred. **One initial read-only `git status --short` was run** while identifying pre-existing workspace changes, despite the no-Git instruction; no Git write operation or later Git command was used. Only this assigned review report is being written.

## Response-analysis counts

Counts are field occurrences, not distinct names across operations. `Root fields` counts direct HTTP-body properties; `Recursive nodes` also counts nested property occurrences. An `unknown` row has no modeled field nodes and is not a claim that the server response is empty or complete.

| Scope | Records | Object | Unknown | Root fields | Recursive nodes | Field-node types |
|---|---:|---:|---:|---:|---:|---|
| Auth/common | 41 | 13 | 28 | 30 | 47 | 36 `unknown`, 8 client-expected `array`, 3 `object` containers |
| Communications | 68 | 24 | 44 | 49 | 51 | 49 `unknown`, 2 client-expected `array` |
| **Total** | **109** | **37** | **72** | **79** | **98** | **85 `unknown`, 10 `array`, 3 `object` containers** |

All 109 records remain `complete:false`. Every primitive/value leaf is `unknown`; the array/object annotations only record direct client operations on the response-derived value. All bodies/models remain open and optional. No server requiredness, value domain, or completeness is inferred.

### Complete modeled response-field inventory

All listed values are `unknown`. Array/object markers record only a client-observed shape expectation, not a server guarantee.

**Auth/common (13 object dispositions):**

- `GetLanguages`: `langs`, `country`.
- `Login`: `type` from the raw Axios fulfillment's `response.data.type`; Axios `status` is not a body property.
- `Login2FA`: `status`, `locked_at`.
- `GetUserData`: roots `kindergartens[]`, `organizations[]`, `employees`, `guardians`, `children`, `officials`, `user`; nested `kindergartens[].id`, `organizations[].id`, `user.privacy_confirmed`. `children` remains `unknown` despite `.length` use; no item fields are added for other collections.
- `GetUserPermissions`: root `applications_access_manage`, read through the exact reducer-to-selector chain; its type/presence remain unknown.
- `GetUserMenu` and `GetUserKindergartenMenu`: HTTP-body root `left[]`; item paths `route`, `root_name`, `subitems.active_children[]`, `subitems.active_children[].id`, `subitems.inactive_children[]`, `subitems.inactive_children[].id`. `subitems` is an observed object container. The service's `response.data.left` projection does **not** move `left` out of the HTTP-body root. Reducer-added `profile_picture` from the separate child-image action is excluded.
- `UploadUserPicture`: `profile_picture`.
- `EnableTwoFactorAuth`: `status`.
- `DisableTwoFactorAuth`: `deleted`.
- `GetKindergartenActivity`: `events_count`.
- `GetUserDashboard`: `invites`, `employee_applications`, `child_birthdays`, `attendance_count`, `diary_comments`, `work_schedules`, `employee_birthdays`, `poll_data`, `questionnaires`. The locally composed schedule wrapper/`tz` and refresh metadata are excluded.
- `GetPublicAgreement`: `name`, `content` from two exact callers.

**Communications (24 object dispositions):**

- `GetReceivedMessages`: `current_page`, `last_page`, `unread_count`; `GetRecentMessages`: `unread_count`; `GetSentMessages` and `GetDeletedMessages`: `current_page`, `last_page`.
- `UpdateMessage`: root `recipient_read`; captured Redux `unread_messages_count` is not a response field.
- `SendMessageDraft`: root `error`, only a truthiness read, not a Boolean/error-wrapper claim.
- `GetMessageDrafts`: `current_page`, `last_page`.
- `GetDraftById`, `CreateDraft`, `SaveDraft`: root `id`, `subject`, `files`, `created_at`. `files_count` is locally derived from `files.length` and is not modeled as an HTTP property; `files` remains `unknown`.
- `GetKindergartenApplications`: root `current_page`, `data`, both `unknown`; `Object.entries`/mapping does not establish an array/object item schema.
- `GetReceivedAnnouncements` and `GetSentAnnouncements`: `announcements`, `has_more`, both `unknown`.
- `MarkAnnouncementRead`: root `seen`; the announcement ID is captured local state.
- `GetRecentEvents`: `events`, `count`, both `unknown`.
- `GetKindergartenContacts`: root `kindergarten`, `courses[]`, nested `courses[].id`. `courses` is a client array expectation from `.length`, index-zero, and `.id` use only.
- `GetNotifications`: `notifications`, `has_more`; `notifications` remains `unknown` because local `[].concat(body.notifications)` accepts non-array inputs, and `has_more` remains `unknown`.
- `GetUnseenNotificationCount`: `notifications_count`, `unknown`.
- `DeleteIdeaComment`: root `deleted`, `unknown`.
- `GetIdeas` and `GetIdeaComments`: root `current_page`, `data`; `data` remains `unknown` because `Object.entries`/mapping and local concatenation do not establish a server array.
- `GetPolls`: root `current_page`, `data[]`, nested `data[].id`; `data` is a client loop/index expectation only, not a validated server array.
- `GetQuestionnaire`: `survey`, `page`, both `unknown`.
- `GetQuestionnaireQuestions`: root `current_page`, `data`; `data` remains `unknown` because the reducer concatenates/wraps the response-derived value into local question state.

The body-root names `data` above are HTTP-body properties after the relevant service's Axios `response.data` projection, not the Axios wrapper. The models do not insert a synthetic outer `data` layer.

## Findings

### F1 — Disable-two-factor trace assigns the body field name as the path slot

`evidence/responses/auth-common.json:531` says `POST /api/common/user/2fa/disable/{password}`. Original function **#16379**, header line **650036**, loads explicit argument 1 at `+0x23` and concatenates it into the URL at `+0x26`; argument 2 is loaded at `+0x2d` and assigned to body property `password` at `+0x30`. The matching request record identifies argument 1 as path parameter `provider` and argument 2 as the password body value.

**Minimal correction:** change only the response trace URL placeholder to `/api/common/user/2fa/disable/{provider}`. Keep response field `deleted: unknown`; the path-label error does not change the response schema.

### F2 — Public-agreement trace puts the language query value in the path

`evidence/responses/auth-common.json:695` says `GET /api/agreements/{language}`. Original function **#28229**, header line **1112422**, concatenates explicit argument 1 into the URL at `+0x22–+0x25`; argument 2 is assigned to `config.params.language` at `+0x2e–+0x36`. The matching request operation is `/api/agreements/{agreementId}` with `language` in the query.

**Minimal correction:** use `/api/agreements/{agreementId}` in the response trace and identify `language` as the query value if mentioned. Keep `name` and `content` as partial body-root fields of type `unknown`.

### F3 — Get-kindergarten-contacts fields cite a success callback absent from `trace`

In `evidence/responses/communications.json:1474–1477`, the only caller trace step is `functionId:26022`, although its prose and every modeled field cite continuation **#26023**. Original #26022 attaches closure #26023 at full line **1015132**; #26023 starts at **1015139**, reads body-root `kindergarten` and `courses` at **1015143–1015157**, and uses `courses.length`, `courses[0].id` at **1015159–1015169**. Field paths and body nesting are correct, but their decisive consumer is not independently represented in the trace array.

**Minimal correction:** add a trace step for #26023 at header line 1015139, with the read/dispatch and client-array-expectation evidence; leave the types and no-validation limitation unchanged.

### F4 — GetPollById incorrectly says no consumer path was found

`evidence/responses/communications.json:2245–2246` calls #26438 a “feature registry” and says no downstream caller/property-read path was located. In the original disassembly, **#26438** at header line **1027076** is the generator caller: it invokes service #26454 at **1027090–1027094**, then dispatches the resolved value unchanged as `SET_POLL.data` at **1027100–1027104**. Reducer **#26430**, header line **1026676**, handles `SET_POLL` and stores the action's data value as local `poll` at **1026861–1026869** without reading body properties.

The response disposition itself is appropriately `unknown`; no poll fields or scalar/object type follow from storing the whole body. The “no downstream consumer” limitation and the registry characterization are false.

**Minimal correction:** describe #26438 as the caller/dispatch path, add #26430 as the opaque reducer consumer, and state that the body is stored wholesale without property reads. Keep `kind: unknown`, empty fields, and `complete:false`.

### F5 — Known success callbacks/reducer hops remain absent from 23 unknown traces

The response analysis correctly avoids inventing fields for these operations, and its limitations usually say that downstream branches remain unresolved. However, the exact next fulfillment callbacks/reducer hops were already identified in `evidence/reviews/responses-communications-initial.md` and exist in the original disassembly, but are absent from the current traces. This leaves those dispositions less completely analyzed than the assigned trace checklist requires. These are trace-coverage omissions, **not** findings that the unknown body should be typed.

| Operation | Missing original callback/reducer (function ID @ full-source header line) |
|---|---|
| `DeleteMessage` | #25171 @989106 |
| `GetMessageTargetGroups` | #25180 @989281 |
| `SendMessage` | #25174 @989156 |
| `GetMessageDraftById` | #25186 @989423 |
| `DeleteDraft` | #25192 @989535 |
| `UploadDraftAttachment` | #25201 @989742 |
| `DeleteDraftAttachment` | #25204 @989805 |
| `UpdateSentMessage` | #25208 @989882 |
| `DeleteSentMessage` | #25211 @989935 |
| `RecallSentMessage` | #25214 @989989 |
| `GetUserApplications` | #25268 @991382 |
| `StoreApplication` | #25286 @991737 |
| `GetApplication` | #25274 @991498 |
| `RejectApplication` | #25277 @991560 |
| `ConfirmApplication` | #25280 @991624 |
| `AddOrRemoveApplicationChild` | #25283 @991686 |
| `GetAnnouncementTargetGroups` | #25320 @992681 |
| `SendAnnouncement` | #25323 @992739 |
| `UpdateEvent` | #25381 @994860 |
| `DeleteEvent` | #25387 @994986 |
| `GetIdea` | #26347 @1024241 |
| `SaveIdeaComment` | #26356 @1024435 |
| `GetQuestionnaires` | #26460 @1027661 (opaque reducer) |

For the six Applications records above, the earlier source review also requires reducer **#25260 @990995** where the response is dispatched into application state; add it to those six paths where applicable. Preserve empty/unknown field lists unless a callback actually reads a response-body property. #26023 (`GetKindergartenContacts`) and #26430 (`GetPollById`) are separately reported in F3/F4.

## Exhaustive 109-record ledger

`Root / nodes` gives direct response fields and recursive response-field nodes. Unknown rows deliberately have `0 / 0` and remain open opaque dispositions, not empty server responses.

### Auth/common — 41/41

| Operation | Source function | Kind | Root / nodes |
|---|---:|---|---:|
| GetLanguages | 12709 | object | 2 / 2 |
| GetTranslations | 12711 | unknown | 0 / 0 |
| Login | 16308 | object | 1 / 1 |
| Login2FA | 16309 | object | 2 / 2 |
| SocialLogin | 16311 | unknown | 0 / 0 |
| SocialRegister | 16314 | unknown | 0 / 0 |
| RegisterUser | 16317 | unknown | 0 / 0 |
| ResendEmailVerification | 16319 | unknown | 0 / 0 |
| RequestForgotPassword | 16321 | unknown | 0 / 0 |
| VerifyTwoFactorAuthKey | 16335 | unknown | 0 / 0 |
| RecoverAccount | 16337 | unknown | 0 / 0 |
| Logout | 16323 | unknown | 0 / 0 |
| GetUserData | 16344 | object | 7 / 10 |
| GetUserProfile | 16346 | unknown | 0 / 0 |
| GetUserPermissions | 16348 | object | 1 / 1 |
| GetUserMenu | 16351 | object | 1 / 8 |
| GetUserKindergartenMenu | 16354 | object | 1 / 8 |
| UpdateUser | 16357 | unknown | 0 / 0 |
| UpdateUserName | 16359 | unknown | 0 / 0 |
| UploadUserPicture | 16361 | object | 1 / 1 |
| DeleteUserPicture | 16363 | unknown | 0 / 0 |
| DeactivateUser | 16365 | unknown | 0 / 0 |
| GetUserSettings | 16367 | unknown | 0 / 0 |
| GetUserTargetGroups | 16369 | unknown | 0 / 0 |
| RequestEmailChange | 16371 | unknown | 0 / 0 |
| GetUser2FAProvider | 16373 | unknown | 0 / 0 |
| GenerateTwoFactorAuthSecret | 16375 | unknown | 0 / 0 |
| EnableTwoFactorAuth | 16377 | object | 1 / 1 |
| DisableTwoFactorAuth | 16379 | object | 1 / 1 |
| VerifyPassword | 16381 | unknown | 0 / 0 |
| GetKindergartenActivity | 16386 | object | 1 / 1 |
| GetUserBanners | 16391 | unknown | 0 / 0 |
| SearchByName | 24587 | unknown | 0 / 0 |
| GetEnabledLanguages | 24589 | unknown | 0 / 0 |
| GetKindergartenChildrenList | 24591 | unknown | 0 / 0 |
| GetCountries | 26289 | unknown | 0 / 0 |
| GetUserDashboard | 26882 | object | 9 / 9 |
| AcceptEmployeeInvite | 26884 | unknown | 0 / 0 |
| GetPublicAgreement | 28229 | object | 2 / 2 |
| AcceptAgreement | 28231 | unknown | 0 / 0 |
| Authorize | 16398 | unknown | 0 / 0 |

### Communications — 68/68

| Operation | Source function | Kind | Root / nodes |
|---|---:|---|---:|
| GetReceivedMessages | 25218 | object | 3 / 3 |
| GetRecentMessages | 25221 | object | 1 / 1 |
| GetSentMessages | 25223 | object | 2 / 2 |
| GetDeletedMessages | 25225 | object | 2 / 2 |
| UpdateMessage | 25227 | object | 1 / 1 |
| DeleteMessage | 25229 | unknown | 0 / 0 |
| GetMessageTargetGroups | 25231 | unknown | 0 / 0 |
| SendMessage | 25233 | unknown | 0 / 0 |
| SendMessageDraft | 25235 | object | 1 / 1 |
| GetMessageDrafts | 25237 | object | 2 / 2 |
| GetMessageDraftById | 25239 | unknown | 0 / 0 |
| GetDraftById | 25241 | object | 4 / 4 |
| CreateDraft | 25243 | object | 4 / 4 |
| SaveDraft | 25245 | object | 4 / 4 |
| DeleteDraft | 25247 | unknown | 0 / 0 |
| UploadDraftAttachment | 25249 | unknown | 0 / 0 |
| DeleteDraftAttachment | 25251 | unknown | 0 / 0 |
| UpdateSentMessage | 25253 | unknown | 0 / 0 |
| DeleteSentMessage | 25255 | unknown | 0 / 0 |
| RecallSentMessage | 25257 | unknown | 0 / 0 |
| GetUserApplications | 25292 | unknown | 0 / 0 |
| StoreApplication | 25294 | unknown | 0 / 0 |
| GetKindergartenApplications | 25296 | object | 2 / 2 |
| GetApplication | 25298 | unknown | 0 / 0 |
| RejectApplication | 25300 | unknown | 0 / 0 |
| ConfirmApplication | 25302 | unknown | 0 / 0 |
| AddOrRemoveApplicationChild | 25304 | unknown | 0 / 0 |
| GetReceivedAnnouncements | 25330 | object | 2 / 2 |
| GetSentAnnouncements | 25332 | object | 2 / 2 |
| MarkAnnouncementRead | 25334 | object | 1 / 1 |
| GetAnnouncementTargetGroups | 25336 | unknown | 0 / 0 |
| SendAnnouncement | 25338 | unknown | 0 / 0 |
| DeleteAnnouncement | 25341 | unknown | 0 / 0 |
| GetRecentEvents | 25401 | object | 2 / 2 |
| GetEvents | 25403 | unknown | 0 / 0 |
| CreateEvent | 25405 | unknown | 0 / 0 |
| UpdateEvent | 25407 | unknown | 0 / 0 |
| DeleteEvent | 25409 | unknown | 0 / 0 |
| GetKindergartenContacts | 26039 | object | 2 / 3 |
| GetEmployeeContacts | 26041 | unknown | 0 / 0 |
| GetGuardianContacts | 26043 | unknown | 0 / 0 |
| GetCourseGuardianContacts | 26045 | unknown | 0 / 0 |
| GetCourseEmployeeContacts | 26047 | unknown | 0 / 0 |
| GetRecentNotifications | 26069 | unknown | 0 / 0 |
| GetNotifications | 26071 | object | 2 / 2 |
| GetUnseenNotificationCount | 26073 | object | 1 / 1 |
| DeleteIdea | 26363 | unknown | 0 / 0 |
| DeleteIdeaComment | 26365 | object | 1 / 1 |
| DeleteIdeaImage | 26367 | unknown | 0 / 0 |
| GetIdea | 26369 | unknown | 0 / 0 |
| GetIdeas | 26371 | object | 2 / 2 |
| GetIdeaAgeGroups | 26373 | unknown | 0 / 0 |
| GetIdeaCategories | 26375 | unknown | 0 / 0 |
| GetIdeaComments | 26377 | object | 2 / 2 |
| SaveIdeaComment | 26379 | unknown | 0 / 0 |
| AddIdeaToFavorites | 26381 | unknown | 0 / 0 |
| LikeIdea | 26383 | unknown | 0 / 0 |
| StoreIdea | 26385 | unknown | 0 / 0 |
| UpdateIdea | 26387 | unknown | 0 / 0 |
| GetPollById | 26454 | unknown | 0 / 0 |
| GetPolls | 26455 | object | 2 / 3 |
| FillPollQuestion | 26457 | unknown | 0 / 0 |
| GetQuestionnaires | 26488 | unknown | 0 / 0 |
| GetQuestionnaire | 26490 | object | 2 / 2 |
| GetQuestionnaireQuestions | 26492 | object | 2 / 2 |
| FillQuestionnaireQuestion | 26494 | unknown | 0 / 0 |
| SubmitQuestionnaire | 26496 | unknown | 0 / 0 |
| UnsubmitQuestionnaire | 26498 | unknown | 0 / 0 |

**Global context only:** `scripts/response-coverage.json` inventories 298 research observations, 296 canonical operations, 87 modeled, 194 unknown, and 15 binary dispositions. This assigned review covers only its 109 Auth/common and Communications records; it does not expand the remaining unknown/source-only analyses.

**Disposition:** five finding groups; 109/109 records inventoried; no schema expansion or non-report file change made.

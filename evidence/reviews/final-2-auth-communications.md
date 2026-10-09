# Independent final review — run 2 — authentication and communications

**Result: 0 findings. All 109 assigned records independently verified (41 authentication/common + 68 communications).** This is a fresh source/specification review, not reliance on run 1's verdict. No prior review report was used as authority. Unproved server behavior and unaudited caller remainder were accepted as unknown, not filled in by inference.

## Inputs and integrity

- Read `AGENTS.md` and reviewed `evidence/research/auth-common.json` and `evidence/research/communications.json` in full.
- Authority: original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`; checked all 109 original source line anchors and each service's entire instruction sequence against the corresponding `domain-source/auth-common.hasm` / `domain-source/communications.hasm` extract. Original caller constructors, callbacks, module dependency arrays, action factories, thunks, installed service methods, Axios serialization and React Native FormData transport code were read separately.
- Compared against actual `tsp-output/@typespec/openapi3/openapi.json`, `main.tsp`, all 109 declarations in `routes/generated.tsp`, and every referenced body/query/nested model in `models/generated.tsp`. Existing enrichment JSON was used to locate source, not prove its assertions.
- Read-only `python /tmp/opencode/eliis-review-snapshot.py` before and after review: **0 changed input files** both times; frozen/current digest **`330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`**.
- Actual normalized JSON SHA-256: `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`; YAML SHA-256: `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0`.
- No build, generation, Git operation, HTTP call, login, private-data access, or specification edit. Only this report was written.

## Coverage counts

Recursive counts include each named parent and child occurrence, including pre-serialization query-object metadata. Dynamic families are counted separately, never as fixed schema properties. Variant path counts include the complete recorded `provenFieldPaths` list for each named variant, including paths also represented by endpoint models.

| Scope | Records | Path slots | Query direct / recursive | Body direct / recursive | Named variants | Variant field-path occurrences | Dynamic families | Unresolved query passthroughs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Authentication/common | 41 | 16 | 6 / 13 | 34 / 46 | 8 | 42 | 0 | 0 |
| Communications | 68 | 85 | 2 / 2 | 33 / 33 | 7 | 34 | 6 | 18 |
| **Total** | **109** | **101** | **8 / 15** | **67 / 79** | **15** | **76** | **6** | **18** |

All named fields, nested placement, types, constants, client inclusion guards, constructor variants, dynamic append loops, original URL templates, argument orders, auth metadata, request media and unresolved response metadata were checked. Exact OpenAPI property sets were checked after resolving `$ref`/`allOf`, including open unknown remainder; TypeSpec property sets/types were checked independently. All original research records and all named variants are retained in the actual output evidence extensions.

## Source-backed checks requiring particular care

### Authentication/common

- **Server and cookie clients:** #6017 configures `https://api.eliis.eu`; #5603 reads `ApiUrl`, sets native `getVersion()` as `App-version`, creates distinct auth/default clients and installs the request interceptor only on default. #5612 joins saved cookie and optional language into the `cookie` header. No Bearer model or inferred authentication requirement was introduced. Login's `[{}]` security override corresponds to the isolated client's configured behavior, not a guarantee of native cookie absence. #5621 invokes the shared response-cookie helper; #5617 extracts/serializes `eliis_csrf` and saves it even for auth-client responses.
- **Platform placement:** #16339/#16340 construct exactly `{platform, browser}` using string concatenations. Password login #16308 writes `login="password"` on that object and constructs exactly three outer fields: `username`, `password`, `platform`. Login2FA #16309 adds platform without nested login; #27140 proves `code` and `login_identifier`. Neither flow gains phantom outer `browser`/`login` properties.
- **Social mutations:** #16311/#16314 set nested `platform.login` from input.social, then outer platform, role=null, tz=-180 and lang="en". URL provider is the same caller property. `app_login=true` is third-argument config.params, not request data. Arbitrary caller fields remain open. Module/action/service chains were checked rather than assuming similarly named functions are connected.
- **Logout versus init:** #16323 passes an object as config.params.platform; #5683/#5681/#5669/#5674/#5677/#5666/#5667 establish bracket serialization (`dots=false`), so actual logout query uses deepObject/explode. #16344 instead calls JSON.stringify and sends one string-valued platform query parameter; nested fields describe only its pre-serialization object. login is assigned from argument 2 without a local inclusion guard; push_token is assigned only for truthy argument 1. Undefined serialization does not prove required wire presence.
- **Profile/password variants:** #40860 builds exactly the profile field set and nested `address.address`; dob is always assigned truthy submitted dob or null, not conditionally omitted within this variant. #40950 builds exactly current_password/password/password_confirm. Both route through #16223/#16224 to #16357. Union optionality reflects different callers, not server validation. #41132 copies handler argument 1 to key and captured login_identifier to identifier before #16377; no invented setup-secret source.
- **Profile image:** #40854 supplies updateUserImage as the actual #40894 updateService prop; #40898 appends only literal profile_picture, routes through #16229/#16230 to #16361, and constructs name/type-or-mime/uri as native file metadata, not nested API fields.
- **Callback results:** #16397 captures the channel; #16398 uses authorize argument 1 as socket_id, captured channel.name as channel_name, and authorize argument 2 as callback. #16399/#16400 return the callback invocation result, not a proved response DTO. #16318's status===200 branch and #16352/#16355's data.left projection are application transformations, not complete HTTP status/body contracts.
- **Other wrappers:** explicitly checked URL-only PUT/POST calls, DELETE without data, forwarded first/second request arguments, translation `.json` suffix, arbitrary two-component banners path and #26882's arbitrary Axios GET config. No synthetic query shape was added for that config.

### Communications

- Checked every message, application, announcement, event, contact, notification, idea, poll and questionnaire service function, including all success/rejection continuations. Query passthrough stays unresolved in all 18 wrappers. #25403's undefined/omitted second argument produces an empty object; otherwise Object.assign copies its arbitrary query input. #25407/#25409 read kindergarten_id/id for routing from the input object; DELETE #25409 separately constructs change_mode/date query and has no body.
- **Message form:** #32555 appends exactly subject/body/type="message" and loops over files, forwarded files and receivers. #32556/#32557 enumerate Object.keys(element), use the outer index and key to generate targetGroups[index][key], and append element[key]. forwardedFiles[index] contains item.id, not a descriptor or nested id DTO. Nullish receivers or empty loops can emit no parts. Exact #25172/#25173 → #25233 connection verified through dependency array/export/installed method.
- **Draft uploads:** #32712's pending gate follows its size/status logic; it appends the original pending item as file, item.type and UTC formatter result as uploaded_at. #32720 constructs a descriptor with input.name, input.mime and input.path (no filename fallback), then appends exactly file/type/uploaded_at. #25199 extracts envelope id/data; #25200 constructs `kindergartens/` + selected kindergarten as scope and forwards the extracted FormData to #25249. Envelope fields are not wire parts.
- **Sent edit:** #34032 appends exactly _method="put" and transformed body; #34033 emits files[index] descriptor parts; #34034 explicitly applies String(item) for removedFiles[index]. #25206/#25207 → #25253 passes id/data separately. Transport is still **POST**, not PUT.
- **Announcement:** #42237 appends exactly subject/body/type="announcement". #42238/#42239 prove Object.keys callback generation of targetGroups[index][key] from element[key]. #25321/#25322 → #25338 direct Axios config has method=post, URL and FormData data argument. There is no literal targetGroups[] append or fixed targetGroups schema property.
- **Ideas:** #38749 builds all ten literal names, including genuine repeated categories[]/age_groups[]/files[]. Categories/groups are nullish/length guarded; file loop emits every entry on the admitted count branch. #38738 sets limits 10/200000000; count>10 bypasses file appends/submission, and aggregate-size rejection is after the loop. These are client gates only, not schema maxItems/maxLength/server validation. Store and existing-idea branches route through distinct #26315/#26316 → #26385 and #26318/#26319 → #26387 chains. Both use POST. Update adds no _method, routing ID, removed-file part or descriptor subproperties.
- **Transport versus DTO:** bundled #2132 preserves each [name,value], #2137 uses that appended name as Content-Disposition name and descriptor name/type as filename/Content-Type; #2127 forwards getParts into native formData. #5842 keeps FormData distinct from object JSON serialization. Unknown scalar/file values and formatter/helper return types were not narrowed merely from labels or final stringification.
- Preserved singular/plural draft routes, arbitrary scope templates, ideas trailing slash, and multi-argument questionnaire answer path. DeleteIdeaImage's normalized neutral pathValue2 slot remains backed by the original `/files/idea/{fileId}` template and argument-2 provenance in x-evidence; cross-verb template normalization does not erase its original semantics.

### Actual specification boundaries

Every one of the 109 actual operations has only `default` response with `*/*` and unconstrained schema `{}`. No guessed success/error status, response wrapper or callback-return schema. Forwarded unconstructed request data has wildcard request media; locally evidenced objects have JSON media; observed multipart calls have multipart media. Request/query/model properties remain non-required at the server-contract level, with client presence/value/encoding facts in extensions and unknown additional properties allowed. All six generated name families remain variant metadata, not literal wire/model fields.

## Complete 109-record ledger

P/Q/B = path slots / recursive query-field occurrences / recursive body-field occurrences. V/D = named variants / dynamic-family occurrences. Zero B does not imply no body: unconstructed forwarded bodies have zero named fields and remain unknown. Every row includes full method/URL/data/config and metadata review, not only a name/path comparison.

| Operation | Original service | Verb | P/Q/B | V/D | Result |
| --- | --- | --- | --- | --- | --- |
| GetLanguages | #12709 | GET | 0/0/0 | 0/0 | verified |
| GetTranslations | #12711 | GET | 1/0/0 | 0/0 | verified |
| Login | #16308 | POST | 0/0/6 | 1/0 | verified |
| Login2FA | #16309 | POST | 0/0/5 | 1/0 | verified |
| SocialLogin | #16311 | POST | 1/1/7 | 1/0 | verified |
| SocialRegister | #16314 | POST | 1/1/7 | 1/0 | verified |
| RegisterUser | #16317 | POST | 0/0/0 | 0/0 | verified |
| ResendEmailVerification | #16319 | POST | 0/0/0 | 0/0 | verified |
| RequestForgotPassword | #16321 | POST | 0/0/0 | 0/0 | verified |
| VerifyTwoFactorAuthKey | #16335 | POST | 0/0/0 | 0/0 | verified |
| RecoverAccount | #16337 | POST | 0/0/0 | 0/0 | verified |
| Logout | #16323 | GET | 0/4/0 | 0/0 | verified |
| GetUserData | #16344 | GET | 0/5/0 | 0/0 | verified |
| GetUserProfile | #16346 | GET | 0/0/0 | 0/0 | verified |
| GetUserPermissions | #16348 | GET | 1/0/0 | 0/0 | verified |
| GetUserMenu | #16351 | GET | 0/0/0 | 0/0 | verified |
| GetUserKindergartenMenu | #16354 | GET | 1/0/0 | 0/0 | verified |
| UpdateUser | #16357 | PUT | 0/0/14 | 2/0 | verified |
| UpdateUserName | #16359 | PUT | 0/0/0 | 0/0 | verified |
| UploadUserPicture | #16361 | POST | 0/0/1 | 1/0 | verified |
| DeleteUserPicture | #16363 | DELETE | 0/0/0 | 0/0 | verified |
| DeactivateUser | #16365 | PUT | 0/0/0 | 0/0 | verified |
| GetUserSettings | #16367 | GET | 0/0/0 | 0/0 | verified |
| GetUserTargetGroups | #16369 | GET | 1/0/0 | 0/0 | verified |
| RequestEmailChange | #16371 | POST | 1/0/0 | 0/0 | verified |
| GetUser2FAProvider | #16373 | GET | 0/0/0 | 0/0 | verified |
| GenerateTwoFactorAuthSecret | #16375 | POST | 0/0/1 | 0/0 | verified |
| EnableTwoFactorAuth | #16377 | POST | 0/0/2 | 1/0 | verified |
| DisableTwoFactorAuth | #16379 | POST | 1/0/1 | 0/0 | verified |
| VerifyPassword | #16381 | POST | 0/0/0 | 0/0 | verified |
| GetKindergartenActivity | #16386 | GET | 1/0/0 | 0/0 | verified |
| GetUserBanners | #16391 | GET | 2/0/0 | 0/0 | verified |
| SearchByName | #24587 | GET | 0/1/0 | 0/0 | verified |
| GetEnabledLanguages | #24589 | GET | 1/0/0 | 0/0 | verified |
| GetKindergartenChildrenList | #24591 | GET | 1/0/0 | 0/0 | verified |
| GetCountries | #26289 | GET | 0/0/0 | 0/0 | verified |
| GetUserDashboard | #26882 | GET | 0/0/0 | 0/0 | verified |
| AcceptEmployeeInvite | #26884 | PUT | 1/0/0 | 0/0 | verified |
| GetPublicAgreement | #28229 | GET | 1/1/0 | 0/0 | verified |
| AcceptAgreement | #28231 | POST | 1/0/0 | 0/0 | verified |
| Authorize | #16398 | POST | 0/0/2 | 0/0 | verified |
| GetReceivedMessages | #25218 | GET | 0/0/0 | 0/0 | verified |
| GetRecentMessages | #25221 | GET | 0/0/0 | 0/0 | verified |
| GetSentMessages | #25223 | GET | 0/0/0 | 0/0 | verified |
| GetDeletedMessages | #25225 | GET | 0/0/0 | 0/0 | verified |
| UpdateMessage | #25227 | PUT | 1/0/0 | 0/0 | verified |
| DeleteMessage | #25229 | DELETE | 1/0/0 | 0/0 | verified |
| GetMessageTargetGroups | #25231 | GET | 0/0/0 | 0/0 | verified |
| SendMessage | #25233 | POST | 1/0/3 | 1/3 | verified |
| SendMessageDraft | #25235 | POST | 2/0/1 | 0/0 | verified |
| GetMessageDrafts | #25237 | GET | 0/0/0 | 0/0 | verified |
| GetMessageDraftById | #25239 | GET | 1/0/0 | 0/0 | verified |
| GetDraftById | #25241 | GET | 1/0/0 | 0/0 | verified |
| CreateDraft | #25243 | POST | 0/0/0 | 0/0 | verified |
| SaveDraft | #25245 | PUT | 1/0/0 | 0/0 | verified |
| DeleteDraft | #25247 | DELETE | 1/0/0 | 0/0 | verified |
| UploadDraftAttachment | #25249 | POST | 2/0/3 | 2/0 | verified |
| DeleteDraftAttachment | #25251 | DELETE | 1/0/1 | 0/0 | verified |
| UpdateSentMessage | #25253 | POST | 1/0/2 | 1/2 | verified |
| DeleteSentMessage | #25255 | DELETE | 1/0/0 | 0/0 | verified |
| RecallSentMessage | #25257 | DELETE | 1/0/0 | 0/0 | verified |
| GetUserApplications | #25292 | GET | 0/0/0 | 0/0 | verified |
| StoreApplication | #25294 | POST | 0/0/0 | 0/0 | verified |
| GetKindergartenApplications | #25296 | GET | 1/0/0 | 0/0 | verified |
| GetApplication | #25298 | GET | 2/0/0 | 0/0 | verified |
| RejectApplication | #25300 | PUT | 2/0/0 | 0/0 | verified |
| ConfirmApplication | #25302 | PUT | 2/0/0 | 0/0 | verified |
| AddOrRemoveApplicationChild | #25304 | PUT | 2/0/0 | 0/0 | verified |
| GetReceivedAnnouncements | #25330 | GET | 1/0/0 | 0/0 | verified |
| GetSentAnnouncements | #25332 | GET | 1/0/0 | 0/0 | verified |
| MarkAnnouncementRead | #25334 | PUT | 2/0/0 | 0/0 | verified |
| GetAnnouncementTargetGroups | #25336 | GET | 1/0/0 | 0/0 | verified |
| SendAnnouncement | #25338 | POST | 1/0/3 | 1/1 | verified |
| DeleteAnnouncement | #25341 | DELETE | 1/0/0 | 0/0 | verified |
| GetRecentEvents | #25401 | GET | 1/0/0 | 0/0 | verified |
| GetEvents | #25403 | GET | 1/0/0 | 0/0 | verified |
| CreateEvent | #25405 | POST | 1/0/0 | 0/0 | verified |
| UpdateEvent | #25407 | PUT | 2/0/0 | 0/0 | verified |
| DeleteEvent | #25409 | DELETE | 2/2/0 | 0/0 | verified |
| GetKindergartenContacts | #26039 | GET | 1/0/0 | 0/0 | verified |
| GetEmployeeContacts | #26041 | GET | 1/0/0 | 0/0 | verified |
| GetGuardianContacts | #26043 | GET | 1/0/0 | 0/0 | verified |
| GetCourseGuardianContacts | #26045 | GET | 2/0/0 | 0/0 | verified |
| GetCourseEmployeeContacts | #26047 | GET | 2/0/0 | 0/0 | verified |
| GetRecentNotifications | #26069 | GET | 0/0/0 | 0/0 | verified |
| GetNotifications | #26071 | GET | 0/0/0 | 0/0 | verified |
| GetUnseenNotificationCount | #26073 | GET | 0/0/0 | 0/0 | verified |
| DeleteIdea | #26363 | DELETE | 2/0/0 | 0/0 | verified |
| DeleteIdeaComment | #26365 | DELETE | 3/0/0 | 0/0 | verified |
| DeleteIdeaImage | #26367 | DELETE | 2/0/0 | 0/0 | verified |
| GetIdea | #26369 | GET | 2/0/0 | 0/0 | verified |
| GetIdeas | #26371 | GET | 1/0/0 | 0/0 | verified |
| GetIdeaAgeGroups | #26373 | GET | 1/0/0 | 0/0 | verified |
| GetIdeaCategories | #26375 | GET | 1/0/0 | 0/0 | verified |
| GetIdeaComments | #26377 | GET | 2/0/0 | 0/0 | verified |
| SaveIdeaComment | #26379 | POST | 2/0/0 | 0/0 | verified |
| AddIdeaToFavorites | #26381 | POST | 2/0/0 | 0/0 | verified |
| LikeIdea | #26383 | POST | 2/0/0 | 0/0 | verified |
| StoreIdea | #26385 | POST | 1/0/10 | 1/0 | verified |
| UpdateIdea | #26387 | POST | 2/0/10 | 1/0 | verified |
| GetPollById | #26454 | GET | 2/0/0 | 0/0 | verified |
| GetPolls | #26455 | GET | 1/0/0 | 0/0 | verified |
| FillPollQuestion | #26457 | POST | 2/0/0 | 0/0 | verified |
| GetQuestionnaires | #26488 | GET | 1/0/0 | 0/0 | verified |
| GetQuestionnaire | #26490 | GET | 2/0/0 | 0/0 | verified |
| GetQuestionnaireQuestions | #26492 | GET | 2/0/0 | 0/0 | verified |
| FillQuestionnaireQuestion | #26494 | POST | 3/0/0 | 0/0 | verified |
| SubmitQuestionnaire | #26496 | PUT | 2/0/0 | 0/0 | verified |
| UnsubmitQuestionnaire | #26498 | PUT | 2/0/0 | 0/0 | verified |

**Disposition:** this assigned scope is clean in run 2. This report does not certify other scopes or a complete server API, and does not independently decide the parent session's global two-clean-run stop gate.

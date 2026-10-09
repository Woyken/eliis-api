# Final review run 1 — auth/common and communications

## Outcome

**0 findings. Clean for this assigned scope: all 109/109 records reviewed (41 auth/common + 68 communications).** This is one complete scoped run, not certification of the parent's entire repository or of the required second consecutive full clean run.

Frozen input digest: `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`.

Reviewed normalized `tsp-output/@typespec/openapi3/openapi.json` SHA-256: `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`.

Read `AGENTS.md` and the frozen snapshot. Original authority was `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, including the bundled Axios and React Native FormData implementations. Both domain-source service extracts were checked instruction-for-instruction against the original for every assigned record; all source header lines and variant constructor header lines match. Earlier review reports were used only to locate constructors, not to establish correctness.

Only this report was written. No generation, compilation, test suite, HTTP request, private-record access, remote write, or git operation was performed. Snapshot read-check before review returned the expected digest and **0 changed input files**; the same read-check after review returned the expected digest and **0 changed input files**. Parent owns the repository-wide tests and final gate.

## Exhaustive counts and checklist

Counts are occurrences per record, including nested containers, not distinct names across endpoints. Variant metadata duplicates are counted separately, not added to wire-property counts.

| Scope | Records | Path fields | Direct query / recursive query | Direct body / recursive body | Client variants | Variant proven paths | Explicit variant fields | Dynamic families |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Auth/common | 41 | 16 | 6 / 13 | 34 / 46 | 8 | 42 | 1 | 0 |
| Communications | 68 | 85 | 2 / 2 | 33 / 33 | 7 | 34 | 34 | 6 |
| **Total** | **109** | **101** | **8 / 15** | **67 / 79** | **15** | **76** | **35** | **6** |

**195/195 declared named path/query/body occurrences checked**, plus all 15 variants, all 76 variant proven-path occurrences, all 35 explicit variant-field occurrences, and all 6 dynamic-family occurrences.

For **every row** in the record ledger below, PASS covers: original method and URL construction; path slot and source argument/property ordering; Axios URL/data/config placement and body absence/presence; declared query/body/nested field names, types, client inclusion guards and values; every applicable variant and upstream mutation; auth-client identity; continuation/response transformation; generated TypeSpec property names/types and optional syntax; normalized OpenAPI shape, media, extensions and source preservation. Zero named fields means no declared field, not a complete server contract.

Read-only structural assertions passed for all 109 compiled operations: exact method and canonical path template shape; exact named query/body sets recursively; optional/open partial models; preserved field evidence and client-presence/value extensions; unchanged `x-client-request-variants`; original research records retained **unchanged** in `x-evidence`; cookie security except isolated password Login; no invented requiredness, enums/defaults/constants/nullability/limits; only unresolved default wildcard responses; opaque forwarded bodies remain `{}` under `*/*`; observed multipart bodies use `multipart/form-data` without invented per-part encodings. The assertions resolved emitted `allOf`/`$ref` models rather than confusing reference wrappers with missing properties.

## Complete record ledger

P/Q/B are path / recursively counted query / recursively counted body fields. All rows are PASS under the checklist above.

### Auth/common — 41/41

| Operation | Original function | P/Q/B | Result |
|---|---:|---:|---|
| GetLanguages | 12709 | 0/0/0 | PASS |
| GetTranslations | 12711 | 1/0/0 | PASS |
| Login | 16308 | 0/0/6 | PASS |
| Login2FA | 16309 | 0/0/5 | PASS |
| SocialLogin | 16311 | 1/1/7 | PASS |
| SocialRegister | 16314 | 1/1/7 | PASS |
| RegisterUser | 16317 | 0/0/0 | PASS |
| ResendEmailVerification | 16319 | 0/0/0 | PASS |
| RequestForgotPassword | 16321 | 0/0/0 | PASS |
| VerifyTwoFactorAuthKey | 16335 | 0/0/0 | PASS |
| RecoverAccount | 16337 | 0/0/0 | PASS |
| Logout | 16323 | 0/4/0 | PASS |
| GetUserData | 16344 | 0/5/0 | PASS |
| GetUserProfile | 16346 | 0/0/0 | PASS |
| GetUserPermissions | 16348 | 1/0/0 | PASS |
| GetUserMenu | 16351 | 0/0/0 | PASS |
| GetUserKindergartenMenu | 16354 | 1/0/0 | PASS |
| UpdateUser | 16357 | 0/0/14 | PASS |
| UpdateUserName | 16359 | 0/0/0 | PASS |
| UploadUserPicture | 16361 | 0/0/1 | PASS |
| DeleteUserPicture | 16363 | 0/0/0 | PASS |
| DeactivateUser | 16365 | 0/0/0 | PASS |
| GetUserSettings | 16367 | 0/0/0 | PASS |
| GetUserTargetGroups | 16369 | 1/0/0 | PASS |
| RequestEmailChange | 16371 | 1/0/0 | PASS |
| GetUser2FAProvider | 16373 | 0/0/0 | PASS |
| GenerateTwoFactorAuthSecret | 16375 | 0/0/1 | PASS |
| EnableTwoFactorAuth | 16377 | 0/0/2 | PASS |
| DisableTwoFactorAuth | 16379 | 1/0/1 | PASS |
| VerifyPassword | 16381 | 0/0/0 | PASS |
| GetKindergartenActivity | 16386 | 1/0/0 | PASS |
| GetUserBanners | 16391 | 2/0/0 | PASS |
| SearchByName | 24587 | 0/1/0 | PASS |
| GetEnabledLanguages | 24589 | 1/0/0 | PASS |
| GetKindergartenChildrenList | 24591 | 1/0/0 | PASS |
| GetCountries | 26289 | 0/0/0 | PASS |
| GetUserDashboard | 26882 | 0/0/0 | PASS |
| AcceptEmployeeInvite | 26884 | 1/0/0 | PASS |
| GetPublicAgreement | 28229 | 1/1/0 | PASS |
| AcceptAgreement | 28231 | 1/0/0 | PASS |
| Authorize | 16398 | 0/0/2 | PASS |

### Communications — 68/68

| Operation | Original function | P/Q/B | Result |
|---|---:|---:|---|
| GetReceivedMessages | 25218 | 0/0/0 | PASS |
| GetRecentMessages | 25221 | 0/0/0 | PASS |
| GetSentMessages | 25223 | 0/0/0 | PASS |
| GetDeletedMessages | 25225 | 0/0/0 | PASS |
| UpdateMessage | 25227 | 1/0/0 | PASS |
| DeleteMessage | 25229 | 1/0/0 | PASS |
| GetMessageTargetGroups | 25231 | 0/0/0 | PASS |
| SendMessage | 25233 | 1/0/3 | PASS |
| SendMessageDraft | 25235 | 2/0/1 | PASS |
| GetMessageDrafts | 25237 | 0/0/0 | PASS |
| GetMessageDraftById | 25239 | 1/0/0 | PASS |
| GetDraftById | 25241 | 1/0/0 | PASS |
| CreateDraft | 25243 | 0/0/0 | PASS |
| SaveDraft | 25245 | 1/0/0 | PASS |
| DeleteDraft | 25247 | 1/0/0 | PASS |
| UploadDraftAttachment | 25249 | 2/0/3 | PASS |
| DeleteDraftAttachment | 25251 | 1/0/1 | PASS |
| UpdateSentMessage | 25253 | 1/0/2 | PASS |
| DeleteSentMessage | 25255 | 1/0/0 | PASS |
| RecallSentMessage | 25257 | 1/0/0 | PASS |
| GetUserApplications | 25292 | 0/0/0 | PASS |
| StoreApplication | 25294 | 0/0/0 | PASS |
| GetKindergartenApplications | 25296 | 1/0/0 | PASS |
| GetApplication | 25298 | 2/0/0 | PASS |
| RejectApplication | 25300 | 2/0/0 | PASS |
| ConfirmApplication | 25302 | 2/0/0 | PASS |
| AddOrRemoveApplicationChild | 25304 | 2/0/0 | PASS |
| GetReceivedAnnouncements | 25330 | 1/0/0 | PASS |
| GetSentAnnouncements | 25332 | 1/0/0 | PASS |
| MarkAnnouncementRead | 25334 | 2/0/0 | PASS |
| GetAnnouncementTargetGroups | 25336 | 1/0/0 | PASS |
| SendAnnouncement | 25338 | 1/0/3 | PASS |
| DeleteAnnouncement | 25341 | 1/0/0 | PASS |
| GetRecentEvents | 25401 | 1/0/0 | PASS |
| GetEvents | 25403 | 1/0/0 | PASS |
| CreateEvent | 25405 | 1/0/0 | PASS |
| UpdateEvent | 25407 | 2/0/0 | PASS |
| DeleteEvent | 25409 | 2/2/0 | PASS |
| GetKindergartenContacts | 26039 | 1/0/0 | PASS |
| GetEmployeeContacts | 26041 | 1/0/0 | PASS |
| GetGuardianContacts | 26043 | 1/0/0 | PASS |
| GetCourseGuardianContacts | 26045 | 2/0/0 | PASS |
| GetCourseEmployeeContacts | 26047 | 2/0/0 | PASS |
| GetRecentNotifications | 26069 | 0/0/0 | PASS |
| GetNotifications | 26071 | 0/0/0 | PASS |
| GetUnseenNotificationCount | 26073 | 0/0/0 | PASS |
| DeleteIdea | 26363 | 2/0/0 | PASS |
| DeleteIdeaComment | 26365 | 3/0/0 | PASS |
| DeleteIdeaImage | 26367 | 2/0/0 | PASS |
| GetIdea | 26369 | 2/0/0 | PASS |
| GetIdeas | 26371 | 1/0/0 | PASS |
| GetIdeaAgeGroups | 26373 | 1/0/0 | PASS |
| GetIdeaCategories | 26375 | 1/0/0 | PASS |
| GetIdeaComments | 26377 | 2/0/0 | PASS |
| SaveIdeaComment | 26379 | 2/0/0 | PASS |
| AddIdeaToFavorites | 26381 | 2/0/0 | PASS |
| LikeIdea | 26383 | 2/0/0 | PASS |
| StoreIdea | 26385 | 1/0/10 | PASS |
| UpdateIdea | 26387 | 2/0/10 | PASS |
| GetPollById | 26454 | 2/0/0 | PASS |
| GetPolls | 26455 | 1/0/0 | PASS |
| FillPollQuestion | 26457 | 2/0/0 | PASS |
| GetQuestionnaires | 26488 | 1/0/0 | PASS |
| GetQuestionnaire | 26490 | 2/0/0 | PASS |
| GetQuestionnaireQuestions | 26492 | 2/0/0 | PASS |
| FillQuestionnaireQuestion | 26494 | 3/0/0 | PASS |
| SubmitQuestionnaire | 26496 | 2/0/0 | PASS |
| UnsubmitQuestionnaire | 26498 | 2/0/0 | PASS |

## Named-field and variant proof ledger

Every nonempty body/query set is listed here; path fields are covered by each original service's concatenation and the record checklist. `unknown` remains accepted for arbitrary values, forwarded objects, formatter/converter results, and file parts.

| Operation / variant | Exhaustive names and decisive original evidence |
|---|---|
| Login / PasswordLogin | `username,password,platform` and `platform.platform,platform.browser,platform.login`. `#13512 +0x87–0x9f` constructs credentials; `#16244/#16245` forwards to `#16308`, which reconstructs exactly three outer keys at `+0x40–0x58`, assigns nested login `"password"` at `+0x2a`, and uses isolated `auth.post` at `+0x61`. |
| Login2FA / TwoFactorLogin | `code,login_identifier,platform` and `platform.platform,platform.browser`. `#27140 +0x24–0x3c` builds/sends caller keys; `#16309 +0x26` adds platform and `+0x3f` posts via default client. No nested login mutation; service input remains open. |
| SocialLogin / SocialLoginServiceMutation | `platform,role,tz,lang` and `platform.platform,platform.browser,platform.login`; query `app_login=true`. `#16311 +0x24–0x34` writes nested login from input.social, never outer login; `+0x3c/+0x48/+0x52` assign null/-180/`"en"`; `+0x97` takes URL/data/query-config in that order. |
| SocialRegister / SocialRegisterServiceMutation | Same seven body occurrences and `app_login=true`, independently checked in `#16314` at corresponding offsets and separate `/register` URL. Arbitrary incoming remainder preserved. |
| Shared platform constructor | `#16340 +0x00–0x5e` creates only string `platform` and string `browser`; string concatenations and device environment provenance `#16339 +0x58–0x9b` checked. No outer browser property. |
| Logout | Query `platform` with nested `platform,browser,login="password"`: `#16323 +0x21–0x4e`. No JSON.stringify. `#5683 +0x74–0x97 → #5681 +0x1e → #5669` defaults `dots=false` at `+0x9e`; `#5674/#5677` recurse; `#5666/#5667` render brackets. No custom serializer in this call/client. Actual logical object's wire names are `platform[platform]`, `platform[browser]`, `platform[login]`; normalized deepObject/explode is supported. |
| GetUserData | Query string `platform`; pre-serialization nested `platform,browser,login,push_token`. `#16344 +0x26/+0x29` assigns login from argument 2, `+0x2f/+0x32` includes push_token only for truthy argument 1, and `+0x57` JSON.stringify precedes config insertion. These four nested fields remain evidence metadata, not four extra query keys. Undefined login can serialize away; no server requiredness claimed. |
| UpdateUser / UserProfileUpdate | `email,username,fname,lname,idcode,address,address.address,phone,privacy_confirmed,timezone,dob`: `#40860 +0x1f–0xa0`. Captured versus submitted sources checked; address is a fresh nested object. dob is always assigned truthy submitted value or null, not truthiness-omitted. |
| UpdateUser / UserPasswordUpdate | `current_password,password,password_confirm`: `#40950 +0x05–0x23`. Both variants reach `#16223/#16224 → #16357` unchanged. Combined named union has 14 recursive occurrences, conditional across variants; open service remainder retained. |
| UploadUserPicture / EditUserProfileImage | Only `profile_picture`, `#40898 +0x4b/+0x4f`. `#40854 +0x3cd–0x3d3 → #40894` supplies/captures updateService; `#40898 +0x6a–0x73 → #16229/#16230 → #16361` posts the FormData. Descriptor name/type/uri are not body fields. |
| GenerateTwoFactorAuthSecret | Only `type`, argument 1, `#16375 +0x12–0x1f`. |
| EnableTwoFactorAuth / EnableTwoFactorAuth | `key,identifier`: `#41132 +0x0c/+0x3d` takes submitted key, `+0x41–0x4b` reads captured login_identifier, `+0x50` calls installed `#16377`. No captured-secret substitution. |
| DisableTwoFactorAuth | Only `password`, argument 2, `#16379 +0x2b–0x35`; argument 1 is URL provider. |
| SearchByName | Query `term`, argument 1, `#24587` config.params construction. |
| GetPublicAgreement | Query `language`, argument 2, `#28229` config.params; argument 1 is agreement path slot. |
| Authorize | `socket_id,channel_name`, `#16398 +0x1b–0x3a`. socket_id is authorize argument 1; channel_name is captured authorizer argument 1's name from `#16397`, not authorize argument 2 (callback). |
| SendMessage / SendOldMessageForm | Fixed `subject,body,type="message"`, appends `#32555 +0x3f/+0x77/+0x8b`. Dynamic `files[{index}] +0xf5`, `forwardedFiles[{index}] +0x155` carrying **item.id**, and `targetGroups[{index}][{key}]` via `#32556/#32557 +0x3f` carrying element[key]. File loops can emit none; receivers are nullish-checked before outer forEach. All callback index/key registers checked. `#25172/#25173 → #25233` sends FormData as config.data argument 2. |
| SendMessageDraft | Only `draft`, argument 3, `#25235 +0x34–0x3e`; scope and message identifier are separate URL arguments. |
| UploadDraftAttachment / PendingDraftAttachment | `file,type,uploaded_at`, appends `#32712 +0x9e/+0xb3/+0xeb`. Original pending item is the file value; status/path/id mutations are not parts. Pending-status request gate checked. |
| UploadDraftAttachment / SelectedDraftAttachment | Same three names, `#32720 +0x67/+0x7d/+0xb5`. Descriptor name is input.name with **no filename fallback**, type=input.mime, uri=input.path. `#25199/#25200 → #25249` supplies scope, route identifier, FormData as service arguments 1/2/3. |
| DeleteDraftAttachment | Only `filename`, argument 2, `#25251 +0x31–0x3e` inside Axios delete config.data. |
| UpdateSentMessage / SentMessageEditForm | Fixed `_method="put",body`, `#34032 +0x57/+0x8f`; dynamic `files[{index}]`, `#34033 +0x4d`, and `removedFiles[{index}]`, `#34034 +0x3b` with explicit String(item) at `+0x36`. Potentially empty forEach loops; no phantom fixed file fields. `#25206/#25207 → #25253` is **HTTP POST**, not PUT. |
| SendAnnouncement / NewAnnouncementForm | Fixed `subject,body,type="announcement"`, `#42237 +0x35/+0x6f/+0x83`. Dynamic `targetGroups[{index}][{key}]` from `#42238/#42239 +0x3f` carries element[key]. No outer nullish guard (unlike message receivers); zero generated parts possible from empty collections/keys. No literal targetGroups[] part. `#25321/#25322 → #25338` config.data argument 2, HTTP POST. |
| DeleteEvent | Query `change_mode,date`, copied from argument 1 properties, `#25409 +0x3f–0x57`; same argument's kindergarten_id/id supply the path. No body. |
| StoreIdea / NewIdeaForm | Exactly `header,contents,keywords,youtube,google_drive,vimeo="",is_public,categories[],age_groups[],files[]`. `#38749 +0x35/+0x4b/+0x61/+0x77/+0x8d/+0xa1/+0xb8/+0xf5/+0x14a/+0x1f8`. Last three names are **literal repeated names**, not generated patterns or JSON array parts. categories/groups nullish/length guards and empty files omission checked. Falsy existing-idea flag selects `#26315/#26316 → #26385`. |
| UpdateIdea / ExistingIdeaForm | Independently checked same ten append names and guards in `#38749`; truthy existing-idea flag selects `+0x27c–0x286 → #26318/#26319 → #26387`. Separate idea identifier is URL routing only. No _method, removedFiles or route-id part; HTTP POST. |
| Both idea variants' request gates | `#38738 +0x46e–0x47b` stores 10/200000000. `#38749 +0x17b` excessive count bypasses file appends **and submission**; otherwise all entries append. Total-size check `+0x214–0x218` rejects submission **after** the loop. Client gates only, no OpenAPI maxItems/size limits. |

The 15 exact callsite variants above were traced through original Metro registration dependency arrays, environment slots, action exports/thunks, service installers, and final argument positions. Checked dependencies include M1231[26]=M1574; M2340[6]=M1575; M4226[25]/M4232[18]=M1574; M4251[6]=M1577; M3401[28]/M3411[17]/M3513[34]=M2217; M4335[16]=M2223; M4085[30]=M2275. M1574 slots 4/5 route to M1575/M1577; M2217 slot 2 routes to M2218; M2223/M2275 slot 0 routes to M2224/M2276. Corresponding original closure installers establish the precise target IDs, not merely matching method strings.

## Encoding, auth, path and response boundaries

- Bundled native-bridge FormData proof: `#2132 +0x0d–0x1f` stores `[name,value]`, never descriptor members as extra parts. `#2137 +0x27–0x39` derives Content-Disposition name from the append name; `+0x6a–0xc4` uses descriptor.name/type as filename/content-type; `+0xc4–0xdc` produces transport metadata, not additional wire properties. Scalar branch `+0xe5–0xfc` uses String(value), not JSON.stringify. Unknown object-capable file values stay unknown; no fabricated uri/name/type API fields.
- `#5603` creates separate auth/default Axios clients and installs the request-cookie interceptor only on default; `#5612 +0x8b–0x9e` attaches stored cookie data; `#5617 +0x3b–0x58/+0x91–0x97` extracts/serializes/stores eliis_csrf. Login's isolated client still receives response-cookie interception. `auth:none` is configured request behavior, not a claim of native cookie impossibility. No Bearer scheme.
- Canonical neutral slots preserve literal path shape and all original source paths/values inside x-evidence, including arbitrary scope fragments and GetUserBanners' two dynamic slots. Scope may include slashes; no invented finite branch set. GetIdeas' original trailing slash is retained. Register/request-body unknowns and query passthroughs are not padded with guessed names. GetUserDashboard's caller argument is Axios **config**, documented as unresolved, not request data or a fabricated query shape.
- All original promise continuations were checked. GetTranslations has truthy-data/empty-object fallback and rejection fallback. Login returns its Axios promise directly; social login/register and Logout success continuations return the response unchanged. RegisterUser's status===200 branch returns response.data, otherwise undefined; no server status contract follows. Both menu methods return response.data.left. Authorize returns callback invocation results on success/rejection (`#16399 +0x13/+0x19`, `#16400 +0x0e/+0x14`), not guaranteed data/undefined. GetPollById's generator returns awaited data. Remaining success continuations read response.data; complete HTTP shapes remain unknown.
- Completeness denotes a traced local construction only. Arbitrary endpoint/service inputs and unaudited caller remainders remain open; no demand for unprovable full server fields, no universal pagination/error wrapper, and no invented success/error status or response media assertion.

**Final disposition: 0 factual findings; 109/109 records and the complete declared-field/variant scope clean against the frozen inputs.**

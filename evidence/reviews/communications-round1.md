# Communications independent evidence review — round 1

## Outcome

Reviewed **all 68 records and all 68 assigned request functions**. Found **two substantive request-argument evidence errors**, plus **two lower-impact factual evidence corrections affecting four additional records**. No method, literal path, dynamic URL ordering, named request-field, or body-presence mismatch was found. The two argument errors do not require inventing a body schema: the bodies correctly remain unknown.

Only this report was written. Research, source, and code were not modified; no HTTP requests were made.

## Sources and procedure

- Read the repository `AGENTS.md` and the complete `evidence/research/communications.json`.
- Read all complete function blocks in `/data/data/com.termux/files/home/eliis-analysis/domain-source/communications.hasm` (lines 1–1821), not merely the string index.
- Compared IDs/names/source lines against `communications-index.json`. There are 68 distinct IDs in both sets, with no missing or extra assigned function. All 68 extracted blocks exactly match their blocks in full `eliis.hasm`.
- Independently followed registers from `LoadParam`, property reads, URL concatenations, object writes, and actual call operands. Hermes call operands include the receiver; Hermes header parameter counts also include the implicit receiver. Neither is an extra user argument.
- Inspected full-source upstream message service construction (#25215–25217), poll service and async wrappers (#26448–26454), and the main client setup/cookie path (#5603, #5610–5613, #5615–5618). Client #5603 exports the instance carrying the request interceptor; #5612 constructs `headers.cookie`, and #5617 serializes the `eliis_csrf` value for persistence. This supports cookie auth, not Bearer auth or server-side authentication-requiredness.
- Inspected every directly referenced continuation in full source: 67 success closures have the same complete three-instruction `argument.data` return, #25220 rethrows, and #25340 returns undefined. The remaining operation, #26454, returns awaited `response.data` within its generator. None establishes a complete response schema.

## Counts and checklist

| Check | Count/result |
| --- | --- |
| Research records / assigned functions / distinct source IDs | 68 / 68 / 68 |
| Method and complete literal/dynamic path checked | 68 / 68 |
| Methods | GET 34; POST 15; PUT 9; DELETE 10 |
| Path parameter declarations checked | 85; all transport `string`, no server domain type asserted |
| Query passthrough declarations checked | 18; 17 direct forwarded objects, one shallow copy/default (#25403) |
| Named query fields checked | 2: `change_mode`, `date` (#25409) |
| Named body fields checked | 2: `draft` (#25235), `filename` (#25251) |
| Body declarations checked | 47 null; 13 unknown; 6 multipart with unresolved fields; 2 complete locally constructed objects |
| Complete local body key sets | 2 / 2 exact; no extras or missing locally constructed fields |
| Axios DELETE calls/configs checked | 10 / 10: seven URL-only, two `config.data`, one `config.params` |
| Request-field constant/encoding/optional claims | No named-field constants, encodings, or optional flags declared; no unsupported claims found |
| Multipart content-type literals | All six explicitly set `Content-Type: multipart/form-data` |
| Responses | All 68 deliberately unknown; accepted |
| Records needing evidence text corrections | 6 (findings F1–F4 below); remaining 62 have no findings |

The named `draft`, `filename`, `change_mode`, and `date` properties are unconditionally constructed, with arbitrary value types. Leaving their types unknown and not claiming conditional optionality is correct. A property containing undefined may be omitted later by serialization; that does not prove conditional construction or server optionality.

## Required corrections

### F1 — `UpdateMessage`: body is parameter 1, not parameter 2

- Record: `UpdateMessage`, research JSON lines 101–133, especially `body.evidence` at line 124.
- Function: **#25227 `update`**, file offset **0x005ec57a**; domain lines **89–113**; full-source start **990354**.
- Exact trace: relative **0x00** loads parameter 1 into **r3**; **0x15** reads `r3.id` for the URL; **0x2b** produces the URL in **r0**; **0x30** calls `put` with receiver **r2**, URL **r0**, data **r3**. No parameter-2 load exists.
- Actual request: `client.put('/api/common/messages/' + arg1.id, arg1)`.
- Suggested correction: replace `body.evidence` with **“Axios put(url, function parameter 1); the same forwarded object supplies property id for the URL and is sent as request data. Its complete construction is not established.”** Keep `kind: "unknown"`, `fields: []`, and `complete: false`; keep the method/path/path parameter as recorded. A URL property read alone is not a reason to fabricate a complete body model.

### F2 — `UpdateEvent`: body is parameter 1, not parameter 2

- Record: `UpdateEvent`, research JSON lines 1142–1181, especially `body.evidence` at line 1170.
- Function: **#25407 `updateEvent`**, file offset **0x005efc6c**; domain lines **944–970**; full-source start **995431**.
- Exact trace: relative **0x00** loads parameter 1 into **r3**; **0x15** and **0x1b** read `r3.kindergarten_id` and `r3.id`; **0x35** concatenates the URL into **r0**; **0x3c** calls `put` with receiver **r2**, URL **r0**, data **r3**. No parameter-2 load exists.
- Actual request: `client.put('/api/kindergartens/' + arg1.kindergarten_id + '/events/' + arg1.id, arg1)`.
- Suggested correction: replace `body.evidence` with **“Axios put(url, function parameter 1); the same forwarded object supplies kindergarten_id and id for the URL and is sent as request data. Its complete construction is not established.”** Keep the existing unknown body and path declarations.

## Lower-impact factual evidence corrections

### F3 — `SendMessage` and `SendAnnouncement` call the client function, not `.post(config)`

- Records: `SendMessage` (`body.evidence`, research line 210) and `SendAnnouncement` (`body.evidence`, line 1006).
- **#25233 `sendMessage`**, file offset **0x005ec632**, domain **157–191**, full source **990455**: **0x07** gets the imported default client into **r2**; **0x12**, **0x35**, **0x3c**, **0x4b** set `method`, `url`, `data`, `headers` on config **r1**; **0x51** calls **r2** directly with an undefined receiver and config **r1**.
- **#25338 `sendAnnouncement`**, file offset **0x005ee10d**, domain **790–827**, full source **993093**: **0x09** gets the default client into **r3**; **0x14**, **0x37**, **0x3e**, **0x4d** populate config **r2**; **0x53** calls **r3** directly with an undefined receiver and config **r2**.
- Neither function obtains a `post` property. `post` is a string value assigned to `config.method`, not the invoked function name.
- Suggested correction in each body evidence: change **“Axios post receives a config object”** to **“The Axios client is called directly with a config object”**, retaining the rest of the description (`method="post"`, URL, parameter-2 data, multipart header).
- This is not a method/body-schema error: recorded POST, path, arbitrary data and multipart classification are correct. Do not model `method`, `url`, `data`, or `headers` as body fields.

### F4 — Poll evidence mistakes receiver-inclusive header counts for extra user parameters

- **`GetPollById` / #26454**, file offset **0x00605bf8**, domain **1565–1599**, full source **1027492**. Research `evidence` at line 1925 says its “third formal parameter” is unused. The header's `3 params` includes the implicit receiver. Actual user parameters are loaded at **0x29** (parameter 1) and **0x30** (parameter 2), both used in the URL. Full-source #26451–26454 confirms the public `getPoll` async wrapper has the same receiver-inclusive count.
  - Suggested correction: remove **“its third formal parameter is not used in the request”**; state **“The generator uses user parameters 1 and 2 in the URL, calls Axios get(url) with no config, and returns awaited response.data.”**
- **`FillPollQuestion` / #26457**, file offset **0x00605ca0**, domain **1628–1654**, full source **1027566**. Research `body.evidence` at line 2008 says parameter 4 is not passed. The header's `4 params` includes the receiver: actual user parameters 1 and 2 build the URL at **0x23/0x2a**, parameter 3 loads at **0x34** and is data in the **0x37** `Call3`.
  - Suggested correction: delete **“Function parameter 4 is not passed to Axios.”** The preceding `post(url, function parameter 3)` evidence is already correct.
- No additional query/body parameter should be added to either record.

## Per-operation checklist (68/68)

Each row was checked for method, exact path literals (including singular/plural and trailing slash), ordered dynamic inputs, query/config arguments, body presence and source, and all declared fields. `pN` denotes **user** parameter N. Path inputs are in URL order corresponding to the record's placeholder names. `—` means no dynamic path input. `Q=pN` means unresolved `config.params`; `B=pN` means arbitrary forwarded body. `MP` denotes the explicit multipart header. All unannotated rows pass these checks.

| # | Function | Operation | Domain lines | Verified method / ordered path inputs | Query/body trace | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 25218 | GetReceivedMessages | 1–25 | GET / — | Q=p1; no body | Pass |
| 2 | 25221 | GetRecentMessages | 26–44 | GET / — | No query/body | Pass |
| 3 | 25223 | GetSentMessages | 45–66 | GET / — | Q=p1; no body | Pass |
| 4 | 25225 | GetDeletedMessages | 67–88 | GET / — | Q=p1; no body | Pass |
| 5 | 25227 | UpdateMessage | 89–113 | PUT / p1.id | B=p1 | F1 |
| 6 | 25229 | DeleteMessage | 114–137 | DELETE / p1 | URL only | Pass |
| 7 | 25231 | GetMessageTargetGroups | 138–156 | GET / — | No query/body | Pass |
| 8 | 25233 | SendMessage | 157–191 | POST / p1 | Direct client config; data=p2; MP | F3 |
| 9 | 25235 | SendMessageDraft | 192–220 | POST / p1, p2 | B={draft:p3}, exact complete key set | Pass |
| 10 | 25237 | GetMessageDrafts | 221–242 | GET / — | Q=p1; no body | Pass |
| 11 | 25239 | GetMessageDraftById | 243–266 | GET / p1 | Singular `/draft/`; no query/body | Pass |
| 12 | 25241 | GetDraftById | 267–290 | GET / p1 | Plural `/drafts/`; no query/body | Pass |
| 13 | 25243 | CreateDraft | 291–310 | POST / — | B=p1 | Pass |
| 14 | 25245 | SaveDraft | 311–335 | PUT / p1 | B=p2 | Pass |
| 15 | 25247 | DeleteDraft | 336–362 | DELETE / p1 | config.data=p2, not query | Pass |
| 16 | 25249 | UploadDraftAttachment | 363–395 | POST / p1, p2 | B=p3; MP; arbitrary scope | Pass |
| 17 | 25251 | DeleteDraftAttachment | 396–425 | DELETE / p1 | config.data={filename:p2}, exact complete key set | Pass |
| 18 | 25253 | UpdateSentMessage | 426–455 | POST / p1 | B=p2; MP | Pass |
| 19 | 25255 | DeleteSentMessage | 456–479 | DELETE / p1 | URL only | Pass |
| 20 | 25257 | RecallSentMessage | 480–503 | DELETE / p1 | URL only | Pass |
| 21 | 25292 | GetUserApplications | 504–522 | GET / — | No query/body | Pass |
| 22 | 25294 | StoreApplication | 523–542 | POST / — | B=p1 | Pass |
| 23 | 25296 | GetKindergartenApplications | 543–570 | GET / p1 | Q=p2; no body | Pass |
| 24 | 25298 | GetApplication | 571–597 | GET / p1, p2 | `/show`; no query/body | Pass |
| 25 | 25300 | RejectApplication | 598–625 | PUT / p1, p2 | B=p3 | Pass |
| 26 | 25302 | ConfirmApplication | 626–653 | PUT / p1, p2 | B=p3 | Pass |
| 27 | 25304 | AddOrRemoveApplicationChild | 654–681 | PUT / p1, p2 | B=p3 | Pass |
| 28 | 25330 | GetReceivedAnnouncements | 682–709 | GET / p1 | Q=p2; no body | Pass |
| 29 | 25332 | GetSentAnnouncements | 710–737 | GET / p1 | Q=p2; no body | Pass |
| 30 | 25334 | MarkAnnouncementRead | 738–764 | PUT / p1, p2 | URL only; null body correct | Pass |
| 31 | 25336 | GetAnnouncementTargetGroups | 765–789 | GET / p1 | No query/body | Pass |
| 32 | 25338 | SendAnnouncement | 790–827 | POST / p1 | Direct client config; data=p2; MP | F3 |
| 33 | 25341 | DeleteAnnouncement | 828–851 | DELETE / p1 | `/api/common/announcements/`; URL only | Pass |
| 34 | 25401 | GetRecentEvents | 852–876 | GET / p1 | No query/body | Pass |
| 35 | 25403 | GetEvents | 877–917 | GET / p1 | Q=Object.assign({}, second argument or {}); no body | Pass |
| 36 | 25405 | CreateEvent | 918–943 | POST / p1 | B=p2 | Pass |
| 37 | 25407 | UpdateEvent | 944–970 | PUT / p1.kindergarten_id, p1.id | B=p1 | F2 |
| 38 | 25409 | DeleteEvent | 971–1004 | DELETE / p1.kindergarten_id, p1.id | config.params={change_mode:p1.change_mode,date:p1.date}; no data/body | Pass |
| 39 | 26039 | GetKindergartenContacts | 1005–1029 | GET / p1 | No query/body | Pass |
| 40 | 26041 | GetEmployeeContacts | 1030–1057 | GET / p1 | Q=p2; no body | Pass |
| 41 | 26043 | GetGuardianContacts | 1058–1085 | GET / p1 | Q=p2; no body | Pass |
| 42 | 26045 | GetCourseGuardianContacts | 1086–1112 | GET / p1, p2 | No query/body | Pass |
| 43 | 26047 | GetCourseEmployeeContacts | 1113–1139 | GET / p1, p2 | No query/body | Pass |
| 44 | 26069 | GetRecentNotifications | 1140–1158 | GET / — | No query/body | Pass |
| 45 | 26071 | GetNotifications | 1159–1180 | GET / — | Q=p1; no body | Pass |
| 46 | 26073 | GetUnseenNotificationCount | 1181–1199 | GET / — | No query/body | Pass |
| 47 | 26363 | DeleteIdea | 1200–1225 | DELETE / p1, p2 | URL only | Pass |
| 48 | 26365 | DeleteIdeaComment | 1226–1253 | DELETE / p1, p2, p3 | URL only | Pass |
| 49 | 26367 | DeleteIdeaImage | 1254–1279 | DELETE / p1, p2 | `/files/idea/`; URL only | Pass |
| 50 | 26369 | GetIdea | 1280–1305 | GET / p1, p2 | No query/body | Pass |
| 51 | 26371 | GetIdeas | 1306–1333 | GET / p1 | Literal `/ideas/` trailing slash; Q=p2; no body | Pass |
| 52 | 26373 | GetIdeaAgeGroups | 1334–1361 | GET / p1 | Q=p2; no body | Pass |
| 53 | 26375 | GetIdeaCategories | 1362–1389 | GET / p1 | Q=p2; no body | Pass |
| 54 | 26377 | GetIdeaComments | 1390–1419 | GET / p1, p2 | Q=p3; no body | Pass |
| 55 | 26379 | SaveIdeaComment | 1420–1447 | POST / p1, p2 | B=p3 | Pass |
| 56 | 26381 | AddIdeaToFavorites | 1448–1474 | POST / p1, p2 | URL only; null body correct | Pass |
| 57 | 26383 | LikeIdea | 1475–1501 | POST / p1, p2 | URL only; null body correct | Pass |
| 58 | 26385 | StoreIdea | 1502–1532 | POST / p1 | B=p2; MP | Pass |
| 59 | 26387 | UpdateIdea | 1533–1564 | POST / p1, p2 | B=p3; MP | Pass |
| 60 | 26454 | GetPollById | 1565–1599 | GET / p1, p2 | URL only; awaited data returned | F4 |
| 61 | 26455 | GetPolls | 1600–1627 | GET / p1 | Q=p2; no body | Pass |
| 62 | 26457 | FillPollQuestion | 1628–1654 | POST / p1, p2 | B=p3 | F4 |
| 63 | 26488 | GetQuestionnaires | 1655–1682 | GET / p1 | Q=p2; no body | Pass |
| 64 | 26490 | GetQuestionnaire | 1683–1708 | GET / p1, p2 | No query/body | Pass |
| 65 | 26492 | GetQuestionnaireQuestions | 1709–1738 | GET / p1, p2 | Q=p3; no body | Pass |
| 66 | 26494 | FillQuestionnaireQuestion | 1739–1767 | POST / p1, p2, p3 | B=p4 | Pass |
| 67 | 26496 | SubmitQuestionnaire | 1768–1794 | PUT / p1, p2 | URL only; null body correct | Pass |
| 68 | 26498 | UnsubmitQuestionnaire | 1795–1820 | PUT / p1, p2 | URL only; null body correct | Pass |

Domain totals: Messages 20; Applications 7; Announcements 6; Events 5; Contacts 5; Notifications 3; Ideas 13; Polls 3; Questionnaires 6 = **68**.

## Explicit limits / non-findings

- This is a request-function evidence review, not a proof of complete server schemas, validation, status codes, enums, nullability, or permissions. None of those was demanded or inferred.
- Arbitrary forwarded bodies and query objects remain unresolved. An exhaustive trace of every UI/action caller was not performed; a particular caller's object would not by itself prove an exhaustive API-level schema. No nearby UI string was treated as a request field.
- No missing **locally constructed** body/query field was found in the assigned functions. No extra field was declared. Header/config wrapper keys were distinguished from body keys.
- The two unknown PUT bodies in F1/F2 are not null; they receive an actual data argument. Correcting their source argument does not justify claiming a complete `id`/`kindergarten_id` body model.
- Dynamic `scope` arguments in #25235/#25249 have no fixed scope set or branch in those functions; the current arbitrary transport path declaration is accepted.
- Source-level defaulting in #25403 is correctly documented; it supplies an empty object when the second argument is absent/undefined and always shallow-copies that selected object. No named query fields or server defaults follow from it.
- Unknown responses are intentional and evidence-appropriate. The generic “Promise continuation” wording for #26454 is not treated as a schema issue; its operation evidence already identifies the generator and awaited data behavior.
- No generated request-model file was present when inspected. The declared research fields and complete/incomplete shapes were the models compared to actual request construction; no claim is made about a later generated artifact.

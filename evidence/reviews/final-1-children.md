# Final review 1 — children, diary, files

**Result: FULL CLEAN — 0 issues.** This is run 1, not a claim that the required two consecutive full clean runs have already occurred.

## Frozen input and scope

- Requested snapshot: `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`, from `evidence/reviews/final-input-snapshot.json`.
- All 36 listed input-file hashes matched before review and at completion.
- Reviewed **all 95 research records / 95 distinct source service functions**, projecting to **94 distinct emitted operations**. `GetFolderData` and `GetDocumentsFolderData` legitimately merge on the identical GET route; both source records remain attached.
- Counts, counting occurrences in the 95 research records: **193 path parameters; 16 named query fields; 17 unresolved forwarded-query records; 68 direct / 91 recursive body fields; 19 client request variants**. Recursive body counts include intermediate objects and their nested properties, not just leaves. Variant `provenFieldPaths` contain **112 occurrences**, including the six query paths; separately repeated variant `fields` metadata contains **16 occurrences**.
- Request classification: **50 no-body, 27 unknown, 13 object, 5 multipart** records. All 95 response roots remain unknown.
- Original evidence read: full `eliis.hasm`, not the function-string index; service register/call arguments, continuations, caller constructors, action wrappers, module dependency arrays and installed service methods. The domain helper's **95/95 complete service-function blocks match the original disassembly**.
- Projection checked against `scripts/operation-catalog.json`, `models/generated.tsp`, `routes/generated.tsp`, and the existing normalized OpenAPI JSON. Recursive comparison followed both `$ref` and `allOf`, checked exact property sets/types/evidence/constants, optionality, open indexers, query transport annotations, all variant metadata and source-record preservation. No build, generation, tests, HTTP requests, private writes or git operations were performed.

### Digests identifying this run

| Input | SHA-256 |
| --- | --- |
| `evidence/research/children-diary-files.json` | `870edb69a88424f7e026a56b87d503a306c120c4ddd848ffc4e466442ce0e743` |
| `models/generated.tsp` | `90c00b29b7b85062de15f4970843cf0707cbe271028406d208965512b1b403a0` |
| `routes/generated.tsp` | `bb7a2948e4b0b4704448153659b085d1c29f92a1b8754e666468938c1acd36cf` |
| `scripts/operation-catalog.json` | `ce98501c06ea84bf57d9ddcbf35b880f1aa8dff0dc744583593cd7d175a9baa7` |
| `tsp-output/@typespec/openapi3/openapi.json` | `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb` |
| `tsp-output/@typespec/openapi3/openapi.yaml` | `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0` |
| Original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| Original domain helper `domain-source/children-diary-files.hasm` | `00ffdb3bcb9b2da6afbead3fe51c0a7adfe578ac60fffe3243c59c5f2042c674` |

## Source/transport findings

- All ten service modules use dependency 3 = **M525**, stored in module environment slot 2, then call its **default** export, not its isolated `auth` export. The modules are M2237 Guardians, M2240 Maps, M2241 Children, M2245 Courses, M2246 Employee, M2249 Diary, M2254 Foodmenu, M2266 Gallery, M2267 Folder, and M2270 Documents. Original module factories are #25482, #25608, #25619, #25720, #25727, #25932, #26004, #26131, #26140 and #26265; their common dependency array is `[1,20,21,525]`. Exact service installers and their closures were checked, including #25483, #25609, #25620, #25721, #25728, #25933, #26005, #26132, #26141 and #26266.
- M525 is registered by #0 +0x3f55–0x3f68 as #5603. #5603 +0x149–0x1e0 creates/exports the main client and installs the request interceptor; #5612 +0x41–0x9e obtains the persisted cookie and joins it with optional `lang=` in `headers.cookie`. #5617 +0x3b–0x97 parses/serializes **eliis_csrf**, clears native cookies and saves the serialized value. #6562 +0x16–0x22 / #6566 +0x16–0x3d store/retrieve it through keychain. Native `CookieManagerModule.java` `clearAll` (lines 133–149) implements Android cookie removal. Emitted security is `EliisCookieAuth`, `apiKey`, `in: cookie`, `name: eliis_csrf`; no Bearer scheme is inferred.
- Axios #5842 `transformRequest` +0x34–0x3e / +0x194–0x1ad handles ordinary object JSON serialization; the FormData test at +0x80–0x92 and +0x23c–0x25f preserves the multipart input in these call configurations. All five multipart services explicitly pass `Content-Type: multipart/form-data` and their actual caller FormData objects.
- React Native SDK #2132 +0x0d–0x1f stores the literal append name/value pair. #2136 +0x03–0x14 maps those pairs through #2137: +0x27–0x39 creates the part disposition from the append name, +0x6a–0xa7 treats descriptor `name` as filename metadata, +0xad–0xbe treats descriptor `type` as part content type, and +0xc4–0xdc forwards the native descriptor with headers/fieldName. #2127 +0xa4–0xb5 passes `getParts()` under the native bridge's `formData`; `NativeNetworkingAndroidSpec.java` line 29 exposes the native `sendRequest` map/array signature. Therefore descriptor `uri/name/type` are **not nested API properties**. No native descriptor or generic Axios `files[]` branch was invented as an endpoint field.
- Normalized request MIME is `application/json` for the 13 object records, `multipart/form-data` for the five proved multipart records, and `*/*` with `{}` for the 27 unresolved forwarded bodies. Multipart models remain open and contain no fabricated part encoding/content type.
- Every emitted operation has only a `default` response with `*/*` and an unconstrained `{}` schema. The 94 services with promise continuations return `response.data`; **#25660 GetFiles directly returns the Axios result at +0x52, with no local continuation**. Its evidence correctly distinguishes the action's later handling from a service-level callback. No DTO, success status or universal pagination/error model is asserted.
- OpenAPI `allOf: [{type: object, additionalProperties: {}}]` is the emitted open `Record<unknown>` indexer, not a closed model. Nested models preserve this openness. Unknown logical query values are emitted as transport strings with explicit unresolved-original-value evidence, not asserted string server-domain types.

## Complete constructor/field audit

Every name below was checked at its actual assignment/append and routed to the exact installed service; all 91 recursive property occurrences are represented by these sets. `unknown` values remain unknown unless the listed conversion/literal proves a narrower client type. Local constructor completeness does not claim complete endpoint/callsite coverage or server validation.

### Object bodies and query constructor

- **GuardianUpdateSettings (2 fields):** #41002 +0x53–0x61 builds inner `form.setting_id` from p3 and `form.value` from p4. #25479/#25480 +0x22–0x34 extracts routing IDs separately and sends only `form` to #25485 p3. M4236 dependency 15=M2236, whose dependency 1=M2237. Variant `GuardianSettingsForm` and the two-field partial model match.
- **UpdateChildProfile (7 direct / 30 recursive):** outer `fname,lname,data,dietaryOptions,dob,meals,idcode`; `data.address` with `data.address.address`; `data.nativelang,info,comment,sex,info_for_school,days,leave_date,arrive_date,discount,contract`; `data.days.d_1,d_2,d_3,d_4,d_5,d_0,d_6`; outer `meals.breakfast,dinner,lunch,supper`. Constructors #44130 and #44687 were read in full. Both construct nested address, rename description→comment with falsy→null, and conditionally rename truthy dietary_options→dietaryOptions. #44130 +0x75–0x10a tests captured teacher OR manager view and copies captured days/sex/info_for_school/leave_date plus **outer** dob/meals, without a separate dob truthiness gate. #44687 +0x75–0x91 assigns submitted gender→sex and info_for_school unconditionally; +0x9c–0x13a builds seven weekdays, with captured weekend values or numeric zero; +0x140–0x166 builds **outer** meals. Its manager-field block requires both slot 7 truthy and view===manager (+0x16c–0x184), assigns idcode with empty-string→null, dob truthy→value otherwise null, captured arrival/departure truthy→value otherwise null, discount/contract, and repeats sex. #44673 +0xfc–0x106 / #44676 +0x08–0x26 prove the non-nullish permissions + truthy child_access_managerfields selector. Both variants route via their actual #0 M4522/M4547 dependency indices 26/29=M2239, exported #25536/#25537, M2239 slot 2=dependency 3=M2241, installed #25636. Fourth action boolean is not request data. The named union and nested models retain partial boundaries.
- **UpdateApprovalAnswers (1):** #25642 directly constructs `{approvals:p3}` before PUT; complete local helper object, unknown value.
- **SaveChildCalendarDays (8) / SaveChildCalendarSingleDay (7):** #43031 initializes `status,comment,start_time,end_time`, then always assigns `start_date,end_date`. Range adds `selected_start,selected_end`, not `date`; single-day adds `date`, not selection fields. Range iff longPeriod truthy OR (slot16 truthy AND submitted end_date truthy), checked at +0x104–0x121 and repeated +0x227–0x241. Single-day's three date values use captured day.dateString; range uses submitted start/end and captured selection. Truthy submitted times are formatted `HH:mm`; falsy submitted times clear to `''` only when captured data/attendance are non-nullish and existing corresponding time is truthy, otherwise initial null remains. M4429 dependency23=M2279; exported #26406/#26407 and #26410/#26411 load dependency1=M2241 and forward data p3 to installed #25646/#25648. Neither initial null nor any branch format is promoted to an unconditional constant/type/default.
- **GetGuardianInvoices (6 query fields):** #44547 +0x03 starts `{perPage:15,page:null,sortBy:'updated_at'}`; +0x13 overwrites page with p1, +0x20 copies sortDir, +0x25–0x38 always assigns boolean settings/services from p2 truthiness. M4540 dependency15=M2239; #25589 extracts `queryObj`, #25590 forwards it as p3 to #25671 `config.params`. Correct integer perPage and string sortBy constants are observational metadata only; page/sortDir stay unknown, settings/services boolean. Arbitrary endpoint query remainder stays open.
- **AddGuardianInvoiceService (6) / UpdateGuardianInvoiceService (7):** #44609 +0x15–0x4e builds `label,unit_price,qty,discount,valid_from,valid_to`. Falsy captured service.id selects add; truthy selects update and +0xc2 adds **body `id`**. M4543 dependency20=M2239; #25604/#25605 and #25601/#25602 extract inner data and forward it to #25675 p3 / #25677 p4. Envelope `childId,serviceId,data` are not body properties. All seven field value types remain unresolved.
- **UpdateChildGuardianFee (3):** #44593 +0x17–0x37 builds `unit_price`, captured fee_qty→`qty`, submitted invoice_discount→`discount`. M4542 dependency19=M2239; #25598/#25599 forward only inner data to #25681 p3.
- **UpdateComment (1):** #25939 directly wraps p3 as `{data:p3}`; no invented inner comment schema.
- **UpdateEntryStatus (2):** #25842 captures action p1/p2; #25845 +0x84–0x9a sends `{child_id,status}` to installed #25955, with state-derived diary ID and kindergarten separate. Values remain unknown.
- **UpdateEntryStatuses (2):** #25848 captures status; #25851 +0x7b–0x94 filters actual entries with #25852 `required_day`, maps #25853 `entry.child.id`, then +0xb2/+0xbd sends `{children,status}` to #25957. `children` is **unknown[]**, not child_ids or a numeric-ID array. M2248 slot4=dependency3=M2249 and installed methods were checked for both status actions.
- **AddEntryFeedback / UpdateEntryFeedback (4 each):** #43534 +0x26–0x46 creates `diary_feedback_type_id,comment,visible_to_guardians`; visibility is numeric zero/one, hence integer, not boolean or an asserted server enum. M4475 dependency19=M2248; exported #25864/#25865/#25866/#25867 and #25870/#25871/#25872/#25873 add `child_id` then Object.assign the later UI/action data. The later source can overwrite child_id/add unknown fields; preserved-open metadata is honest. Captured child comes from route.params.childId (#43525 +0xcd–0xd3); diary route uses state.diary.diary.id. Existing feedback selects update and supplies feedback.id separately for the path. The actual final constructors +0x91–0xa9 / +0x98–0xb6 route merged data to installed #25961 p3 / #25963 p4.

### Multipart bodies (14 field occurrences, five endpoint records, six variants)

- **UploadChildProfilePicture (1):** actual shared #40894 captures `updateService` and creates #40898. The latter appends only literal `profile_picture` +0x4b–0x4f, descriptor filename `profile-image`, type=input.type||input.mime, uri=input.path. #44120 +0x2d0–0x303 / #44673 +0x5ef–0x622 render that shared imported component (dependency8=M4227), supplying exact wrappers #44137/#44697. Those send FormData via #25539/#25540 to installed #25654 p3. This is component/register evidence, not field-name similarity.
- **UploadFile (3 in union / two branch variants):** #25571 non-document appends literal `file,type,uploaded_at`; document branch +0x11f–0x152 appends only `file,uploaded_at`, preserving original selected item. `type` is therefore conditional. Non-document descriptor uses filename||name||image, mime, path. Submitted only when item.status!==size_too_big; index/status are not parts. #25574/#25575 extract envelope.formData and call installed #25661 with kindergarten, child, data. Both append sets are locally complete, endpoint coverage partial.
- **UploadMedia (3):** #25803 appends `file,type,uploaded_at`, descriptor filename||name||image, input.mime/input.path. It directly calls service uploadMedia through M2248 slot4=dependency3=M2249; captured p3 diary reference supplies URL `reference.id` in #25941, not another body field.
- **UploadDocument (4):** #25815 appends `file,type,fileType,uploaded_at`, with literal **fileType='document'** (string client-observed value), descriptor filename||name||document, input.type/input.path. It directly calls the installed service #25943 with the diary reference and FormData. No imaginary intermediate action is asserted.
- **UploadFiles (3):** actual nested constructor #26195, created through #26193/#26194, appends `file,type,uploaded_at`. File is original selected item; type is captured **uploadFolderFiles p2**, loaded depth4 slot1 and captured by #26190 +0x09–0x0c, **not item.type**. UTC formatter result remains unresolved rather than a server timestamp contract. Status gate skips size_too_big submission. #26187/#26188 load M2268 slot3=dependency2=M2267 and send `(kindergarten,FormData,folderId)` to installed #26153; body is service **p2**, path folder is **p3**.

No bracketed dynamic part family occurs in these 19 variants. In particular, the five endpoints' literal parts above are the only fixed multipart properties; native descriptor keys and generic SDK dynamic branches remain metadata/unknown boundaries rather than fabricated nested or `[]` endpoint fields.

### Remaining named query/path/argument checks

- #25626: `course_id=p3`; #25628: `type=p4`; #25650: `date=p3`; #25652: `form=p3`; #25660: `page=p3,perPage=p4`; #25935: `course=p1.course_id,date=p1.date`, path kindergarten=p1.selectedKindergartenId. #26007/#26009 literal `?date=` becomes named `date` query, not part of the documented path. Together with invoices these are all 16 named fields.
- All 17 passthroughs retain the actual unchanged params argument and unresolved scope. **GetMaps #25638 +0x2c–0x40** reads p2.child_id for the child URL segment, uses `/children/{childId}/maps`, and also forwards the entire p2 as params; no exhaustive one-field query object is invented.
- Ordinary path segments were traced through LoadParam/GetById/concat into the HTTP URL, rather than accepted from string proximity. Special payload/path associations remain correct: UpdateChildDates uses p3.courseChildId in the route and sends the same p3; UpdateFolder uses p2.folder_id in the route and sends p2; diary media/document read p2.id; UploadFiles uses p3 for folder and p2 for data. DELETE bulk operations #25951/#26161 use **config.data=p3**, not direct Axios second-argument data. Publish/LikeDiary have no supplied data argument.
- Neutral cross-verb slots `/children/.../files/{pathValue3}`, `/files/diary/{pathValue2}` and `/files/documents/{pathValue2}` preserve original fileId/documentId parameter evidence for these records. Corresponding filename-source observations remain attached to their distinct download operations. Renaming placeholders is documentation canonicalization, not a different wire route, and does not merge distinct HTTP verbs or erase argument provenance.

## Full record ledger

Each row represents an independently traced original service call and comparison of its complete documented path/query/body/variant/response/auth projection. `P` is path-parameter occurrences; `Q + open` means named fields plus unresolved forwarded query; body counts are **direct/recursive**. HTTP offsets are relative to the listed original function. The frozen research and catalog retain the exact routes; neutral canonical slots and the one legitimate merged GET are covered above. Every row is clean.

| # | Research operation | Original function / HTTP offset | Verb | P | Q | Body direct/recursive | Variants | Result |
| --- | --- | --- | --- | ---: | --- | --- | ---: | --- |
| 1 | GuardianUpdateSettings | 25485 +0x38 | PUT | 2 | 0 | object 2/2 | 1 | clean |
| 2 | Store | 25487 +0x38 | POST | 2 | 0 | unknown 0/0 | 0 | clean |
| 3 | Update | 25489 +0x3b | PUT | 3 | 0 | unknown 0/0 | 0 | clean |
| 4 | Detach | 25491 +0x3b | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 5 | Delete | 25493 +0x3b | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 6 | GetMap | 25611 +0x37 | GET | 3 | 0 | none 0/0 | 0 | clean |
| 7 | ApproveMap | 25613 +0x3f | POST | 3 | 0 | unknown 0/0 | 0 | clean |
| 8 | DisapproveMap | 25615 +0x44 | DELETE | 3 | 0 + open | none 0/0 | 0 | clean |
| 9 | PublishMap | 25617 +0x3f | PUT | 3 | 0 | unknown 0/0 | 0 | clean |
| 10 | GetChild | 25622 +0x33 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 11 | GetChildCourses | 25624 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 12 | GetChildCoursePlanTypes | 25626 +0x44 | GET | 2 | 1 | none 0/0 | 0 | clean |
| 13 | GetChildPlansList | 25628 +0x4a | GET | 3 | 1 | none 0/0 | 0 | clean |
| 14 | GetGuardianDiary | 25630 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 15 | GetGuardianFeed | 25632 +0x3d | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 16 | GetChildProfile | 25634 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 17 | UpdateChildProfile | 25636 +0x37 | PUT | 2 | 0 | object 7/30 | 2 | clean |
| 18 | GetMaps | 25638 +0x40 | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 19 | GetChildApprovals | 25640 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 20 | UpdateApprovalAnswers | 25642 +0x3f | PUT | 2 | 0 | object 1/1 | 0 | clean |
| 21 | GetChildCalendar | 25644 +0x3d | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 22 | SaveChildCalendarDays | 25646 +0x38 | POST | 2 | 0 | object 8/8 | 1 | clean |
| 23 | SaveChildCalendarSingleDay | 25648 +0x38 | POST | 2 | 0 | object 7/7 | 1 | clean |
| 24 | GetStatusLogs | 25650 +0x43 | GET | 2 | 1 | none 0/0 | 0 | clean |
| 25 | GetAbsenceModalData | 25652 +0x44 | GET | 2 | 1 | none 0/0 | 0 | clean |
| 26 | UploadChildProfilePicture | 25654 +0x49 | POST | 2 | 0 | multipart 1/1 | 1 | clean |
| 27 | DeleteChildProfilePicture | 25656 +0x34 | DELETE | 2 | 0 | none 0/0 | 0 | clean |
| 28 | GetGuardians | 25658 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 29 | GetFiles | 25660 +0x4c | GET | 2 | 2 | none 0/0 | 0 | clean |
| 30 | UploadFile | 25661 +0x49 | POST | 2 | 0 | multipart 3/3 | 2 | clean |
| 31 | DeleteChildFile | 25663 +0x37 | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 32 | UpdateChildFile | 25665 +0x3b | PUT | 3 | 0 | unknown 0/0 | 0 | clean |
| 33 | AddChildDates | 25667 +0x38 | POST | 2 | 0 | unknown 0/0 | 0 | clean |
| 34 | UpdateChildDates | 25669 +0x3e | PUT | 3 | 0 | unknown 0/0 | 0 | clean |
| 35 | GetGuardianInvoices | 25671 +0x3d | GET | 2 | 6 + open | none 0/0 | 1 | clean |
| 36 | GetGuardianInvoice | 25673 +0x37 | GET | 3 | 0 | none 0/0 | 0 | clean |
| 37 | AddGuardianInvoiceService | 25675 +0x38 | POST | 2 | 0 | object 6/6 | 1 | clean |
| 38 | UpdateGuardianInvoiceService | 25677 +0x3b | PUT | 3 | 0 | object 7/7 | 1 | clean |
| 39 | DeleteGuardianInvoiceService | 25679 +0x37 | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 40 | UpdateChildGuardianFee | 25681 +0x38 | PUT | 2 | 0 | object 3/3 | 1 | clean |
| 41 | GetEmployeeActiveCourses | 25723 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 42 | GetEmployeeCourses | 25725 +0x3d | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 43 | UpdateData | 25730 +0x33 | PUT | 1 | 0 | unknown 0/0 | 0 | clean |
| 44 | EmployeeUpdateSettings | 25732 +0x33 | POST | 1 | 0 | unknown 0/0 | 0 | clean |
| 45 | GetDiaryData | 25935 +0x50 | GET | 1 | 2 | none 0/0 | 0 | clean |
| 46 | CreateDiary | 25937 +0x33 | POST | 1 | 0 | unknown 0/0 | 0 | clean |
| 47 | UpdateComment | 25939 +0x3e | PUT | 2 | 0 | object 1/1 | 0 | clean |
| 48 | UploadMedia | 25941 +0x4e | POST | 2 | 0 | multipart 3/3 | 1 | clean |
| 49 | UploadDocument | 25943 +0x4e | POST | 2 | 0 | multipart 4/4 | 1 | clean |
| 50 | Publish | 25945 +0x35 | PUT | 2 | 0 | none 0/0 | 0 | clean |
| 51 | UpdateDiaryFile | 25947 +0x37 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 52 | DeleteDiaryFile | 25949 +0x33 | DELETE | 2 | 0 | none 0/0 | 0 | clean |
| 53 | DeleteDiaryFiles | 25951 +0x3d | DELETE | 2 | 0 | unknown 0/0 | 0 | clean |
| 54 | LikeDiary | 25953 +0x35 | POST | 2 | 0 | none 0/0 | 0 | clean |
| 55 | UpdateEntryStatus | 25955 +0x38 | PUT | 2 | 0 | object 2/2 | 1 | clean |
| 56 | UpdateEntryStatuses | 25957 +0x38 | PUT | 2 | 0 | object 2/2 | 1 | clean |
| 57 | UpdateEntryMeal | 25959 +0x38 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 58 | AddEntryFeedback | 25961 +0x38 | POST | 2 | 0 | object 4/4 | 1 | clean |
| 59 | UpdateEntryFeedback | 25963 +0x3b | PUT | 3 | 0 | object 4/4 | 1 | clean |
| 60 | DeleteEntryFeedback | 25965 +0x37 | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 61 | StartTimeTracking | 25967 +0x38 | POST | 2 | 0 | unknown 0/0 | 0 | clean |
| 62 | StopTimeTracking | 25969 +0x38 | POST | 2 | 0 | unknown 0/0 | 0 | clean |
| 63 | AddTimeLog | 25971 +0x38 | POST | 2 | 0 | unknown 0/0 | 0 | clean |
| 64 | UpdateTimeLog | 25973 +0x3b | PUT | 3 | 0 | unknown 0/0 | 0 | clean |
| 65 | DeleteTimeLog | 25975 +0x37 | DELETE | 3 | 0 | none 0/0 | 0 | clean |
| 66 | UpdateEntryLeaveType | 25977 +0x38 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 67 | UpdateEntryLeaveTypes | 25979 +0x38 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 68 | GetDayMenu | 26007 +0x33 | GET | 1 | 1 | none 0/0 | 0 | clean |
| 69 | GetWeekMenu | 26009 +0x33 | GET | 1 | 1 | none 0/0 | 0 | clean |
| 70 | GetEmployeeMeals | 26011 +0x38 | GET | 1 | 0 + open | none 0/0 | 0 | clean |
| 71 | GetEmployeeMealsSettings | 26013 +0x2f | GET | 1 | 0 | none 0/0 | 0 | clean |
| 72 | SaveEmployeeMeal | 26015 +0x33 | POST | 1 | 0 | unknown 0/0 | 0 | clean |
| 73 | GalleryGetIndexFolders | 26134 +0x38 | GET | 1 | 0 + open | none 0/0 | 0 | clean |
| 74 | DeleteGalleryFile | 26136 +0x33 | DELETE | 2 | 0 | none 0/0 | 0 | clean |
| 75 | UpdateGalleryFile | 26138 +0x37 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 76 | GetFolderData | 26143 +0x3c | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 77 | GetSubfolders | 26145 +0x3d | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 78 | AddFolder | 26147 +0x33 | POST | 1 | 0 | unknown 0/0 | 0 | clean |
| 79 | UpdateFolder | 26149 +0x3a | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 80 | DeleteFolder | 26151 +0x33 | DELETE | 2 | 0 | none 0/0 | 0 | clean |
| 81 | UploadFiles | 26153 +0x49 | POST | 2 | 0 | multipart 3/3 | 1 | clean |
| 82 | GetUserTargetGroups | 26155 +0x2f | GET | 1 | 0 | none 0/0 | 0 | clean |
| 83 | MoveFolders | 26157 +0x38 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 84 | MoveFiles | 26159 +0x38 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 85 | DeleteFiles | 26161 +0x3d | DELETE | 2 | 0 | unknown 0/0 | 0 | clean |
| 86 | GetBuiltinChildProfile | 26163 +0x3c | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 87 | GetBuiltinDiaryFolders | 26165 +0x38 | GET | 1 | 0 + open | none 0/0 | 0 | clean |
| 88 | GetBuiltinDiaryFiles | 26167 +0x3c | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 89 | GetFolderFiles | 26169 +0x3d | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 90 | DocumentsGetIndexFolders | 26268 +0x38 | GET | 1 | 0 + open | none 0/0 | 0 | clean |
| 91 | GetDocumentsFolderData | 26270 +0x3c | GET | 2 | 0 + open | none 0/0 | 0 | clean |
| 92 | DeleteDocument | 26272 +0x33 | DELETE | 2 | 0 | none 0/0 | 0 | clean |
| 93 | UpdateDocumentFile | 26274 +0x37 | PUT | 2 | 0 | unknown 0/0 | 0 | clean |
| 94 | GetDocumentAcl | 26276 +0x34 | GET | 2 | 0 | none 0/0 | 0 | clean |
| 95 | GetSharedDocuments | 26278 +0x38 | GET | 1 | 0 + open | none 0/0 | 0 | clean |

## Disposition

No actual bytecode/request-field/type/guard/route/projection mismatch or omitted proved named field was found. Unchecked additional callers, unknown server validation and complete response shapes remain explicitly unresolved and are not findings. Only this review report was edited.

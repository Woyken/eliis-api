# Final review RUN2 — children, diary, files

## Outcome

**95/95 records reviewed afresh; 1 concrete evidence correction, 0 request/response schema findings. This scope is not a second clean sweep.**

Frozen input snapshot: `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`.

Only this report was edited. No inputs, generation, tests, Git operations, HTTP requests, or private-record access were performed. Previous review conclusions were not used as proof. The review used original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, checked all 95 domain extraction blocks against the original, followed the relevant application constructors/module registrations/service bindings, and compared research records with `scripts/operation-catalog.json`, `routes/generated.tsp`, `models/generated.tsp`, and both normalized OpenAPI outputs. Native download behavior was checked against the original Hermes call sites and decompiled RNFS implementation.

## Finding C2-01 — bulk-status evidence adds an extra `diary` nesting

- **Location:** `evidence/research/children-diary-files.json:2224`, `UpdateEntryStatuses.clientRequestVariants[0].evidence`, variant `DiaryEntryStatusesBulk`.
- **Current assertion:** “Array obtained by filtering `state.diary.diary.entries` …”.
- **Original proof:** function **#25851**, full HASM header line **1010561**, function file offset **0x005faba5**:
  - `+0x6d`: `Call1 r3, r4, r3` obtains state from the thunk's `getState` argument.
  - `+0x71`: `GetByIdShort r3, r3, ... 'diary'` obtains `state.diary`.
  - `+0x76`: `GetByIdShort r5, r3, ... 'entries'` obtains **`state.diary.entries`**. There is no second `diary` read on this array-producing chain.
  - `+0x7b–+0x85` filters this array with **#25852**, which reads `required_day` at `+0x03`.
  - `+0x8a–+0x94` maps with **#25853**, which reads `entry.child.id` at `+0x03/+0x08`.
  - `+0xb2` writes the resulting array to body `children`; `+0xbd` writes captured `status`; `+0xc1` supplies that body to the service installed as **#25957**.
- **Why the distinction is real:** the separate diary-ID chain immediately before this does read `state.diary.diary.id` at `+0x5a–+0x68`. The current evidence has incorrectly carried that nesting into the new `getState`/entries chain.
- **Bounded correction:** change only `state.diary.diary.entries` to `state.diary.entries` in the variant evidence. Propagated copies in the catalog/generated TypeSpec/OpenAPI evidence should then follow the normal parent-owned generation workflow. Do not alter `children`, its `unknown[]` type, `status`, route, body completeness, or model requiredness.
- **Impact:** provenance text is inaccurate; the generated wire-field/array schema is already correct. This is one finding, not separate findings for each generated copy.

## Coverage and counts

| Reviewed unit | Count |
|---|---:|
| Children/diary/files research records / original source functions | 95 / 95 |
| Equivalent original/domain service blocks | 95 / 95 |
| Original source-line anchors verified | 95 |
| Normalized operations representing these records | 94 |
| Path parameter occurrences | 193 |
| Named query field occurrences | 16 |
| Records forwarding unresolved query objects | 17 |
| Requests without a body | 50 |
| Requests with a body | 45 |
| Unknown forwarded bodies / known object bodies / multipart bodies | 27 / 13 / 5 |
| Direct / recursive canonical body field occurrences | 68 / 91 |
| Reachable generated body models / model properties | 22 / 91 |
| Client request variants / constructor-line anchors | 19 / 19 |
| Variant proven-field-path occurrences, including query placement | 112 |
| Multipart variants / canonical literal part occurrences | 6 / 14 |
| Dynamic indexed multipart name families in this scope | 0 |

The 95-to-94 normalization is the evidenced `GetFolderData` / `GetDocumentsFolderData` same-method/same-route merge, not missing coverage. Records were matched by source function, method, and original path, not just by potentially repeated operation names such as `UpdateComment`.

## Named-field and variant review

All 91 canonical body property occurrences were checked against their original constructors and against all 22 reachable TypeSpec/OpenAPI model definitions. Unknown fields remain unknown; nested objects remain open. No extra/missing proved named fields, type drift, client-constant drift, unproved closed-body declarations, field requiredness, server enums/defaults/nullability, response statuses, or response MIME claims were found.

| Operation | Complete reviewed named field set / source anchors |
|---|---|
| GuardianUpdateSettings | `setting_id`, `value`; #41002 `+0x53–+0x61` builds inner form; #25480 `+0x22–+0x34` routes IDs separately and forwards only form; #25485 `+0x38` PUT data. |
| UpdateChildProfile | Outer `fname`, `lname`, `data`, `dietaryOptions`, `dob`, `meals`, `idcode`; nested `data.address.address`, `data.nativelang`, `data.info`, `data.comment`, `data.sex`, `data.info_for_school`, `data.days.{d_0,d_1,d_2,d_3,d_4,d_5,d_6}`, `data.leave_date`, `data.arrive_date`, `data.discount`, `data.contract`; outer `meals.{breakfast,dinner,lunch,supper}`. Both #44130 and #44687 checked through #25536/#25537 to installed #25636. |
| UpdateApprovalAnswers | `approvals=p3`; #25642 `+0x35–+0x3f`, complete local helper object, not a complete server contract. |
| SaveChildCalendarDays | `status`, `comment`, `start_time`, `end_time`, `start_date`, `end_date`, `selected_start`, `selected_end`; #43031 range branch `+0x1ba–+0x221`, call `+0x2c5` through #26406/#26407 to #25646. |
| SaveChildCalendarSingleDay | `status`, `comment`, `start_time`, `end_time`, `start_date`, `end_date`, `date`; #43031 short branch `+0x127–+0x1b2`, call `+0x26f` through #26410/#26411 to #25648. |
| UploadChildProfilePicture | Literal `profile_picture` only; #40898 `+0x4b/+0x4f`; child-specific render/wrapper/action/service links checked below. |
| UploadFile | Literal `file`, `uploaded_at` on both branches, `type` only on non-document branch; #25571 `+0xa3–+0x152`, routed through #25574/#25575 to #25661. |
| AddGuardianInvoiceService | `label`, `unit_price`, `qty`, `discount`, `valid_from`, `valid_to`; #44609 `+0x15–+0x4e`, falsy service-ID branch; #25604/#25605 to #25675. |
| UpdateGuardianInvoiceService | Same six fields plus real body `id`; #44609 truthy service-ID branch adds body `id` at `+0xc2`, separately routes envelope `serviceId`; #25601/#25602 to #25677. |
| UpdateChildGuardianFee | `unit_price` from submitted value, `qty` from captured `fee_qty`, `discount` from submitted `invoice_discount`; #44593 `+0x15–+0x37`; #25598/#25599 to #25681. Source/UI names and envelope childId are not wire keys. |
| UpdateComment (#25939) | `data=p3`; #25939 `+0x35–+0x3e`, complete local helper object. Kept separate from unrelated same-named functions. |
| UploadMedia | Literal `file`, `type`, `uploaded_at`; #25803 `+0x38–+0xcb`, direct installed #25941 call `+0x105`. |
| UploadDocument | Literal `file`, `type`, `fileType`, `uploaded_at`; #25815 `+0x38–+0xde`, `fileType='document'` append `+0xa6`, direct installed #25943 call `+0x118`. |
| UpdateEntryStatus | `child_id`, `status`; #25845 `+0x84–+0x9a` to #25955. |
| UpdateEntryStatuses | `children: unknown[]`, `status`; #25851 `+0x6d–+0xc1` and #25852/#25853 to #25957. Field set/type correct; **C2-01** corrects the entries source nesting. |
| AddEntryFeedback | `child_id`, `diary_feedback_type_id`, `comment`, `visible_to_guardians`; UI #43534 `+0x26–+0x46`, merged after base `child_id` in #25867 `+0x91–+0xa9`, to #25961. |
| UpdateEntryFeedback | Same four fields; UI #43534 call `+0xb3`, #25873 base child_id `+0x98–+0x9e`, later merge `+0xa7`, installed #25963 call `+0xb6`. Feedback ID is routing only. |
| UploadFiles | Literal `file`, `type`, `uploaded_at`; actual constructor #26195 `+0x41–+0x9a`, #26187/#26188 to installed #26153. |

### Profile branches and actual guards

- #44130: `data.address.address` is nested twice, not a flat address; `description` becomes `data.comment`. Truthy dietary input conditionally writes outer `dietaryOptions`. Only `props.view === 'teacher' || props.view === 'manager'` adds captured `data.days`, `data.sex`, `data.info_for_school`, `data.leave_date`, and outer `dob`/`meals`. There is no separate truthiness condition before copying captured `dob`.
- #44687: submitted gender writes `data.sex` unconditionally at `+0x80`, and is repeated in the later gated block. Seven day keys are built; `d_0/d_6` copy truthy captured `props.data.days` values or numeric zero when the outer data is nullish/the value falsy. Meals are built on **outer r7**, assigned at `+0x166`, not inside data.
- #44687 `+0x16c–+0x184` gates `idcode`, `dob`, dates, discount, contract, and repeated sex with captured slot 7 **AND** manager view. #44673 `+0xfc–+0x106` fills slot 7 from #44676, whose `+0x08–+0x26` requires non-nullish `state.user.permissions` and truthy `child_access_managerfields`. These are client guards, not server authorization/validation declarations.
- Empty submitted idcode becomes null; truthy submitted dob and captured arrive/leave dates otherwise become null on their respective branches. These observations do not justify final constants or explicit server nullability. Partial caller coverage and forwarded guardian days/meals remain honest exceptions.

### Queries, calendars, feedback, and multipart

- All 16 named queries: #25626 `course_id=p3`; #25628 `type=p4`; #25650 `date=p3`; #25652 `form=p3`; #25660 `page=p3, perPage=p4`; #25935 `course=p1.course_id, date=p1.date`; #26007/#26009 literal `?date=` suffix values; and #44547's six-field invoice query forwarded by #25671.
- Invoice query: #44547 buffer `+0x03` preserves `perPage=15` and `sortBy='updated_at'`; `+0x13` overwrites initial null page with p1; `sortDir` is captured; `settings/services` are **both always assigned booleans**, not conditionally absent. Remaining forwarded query keys remain unresolved.
- Calendar: #43031 selects range iff longPeriod truthy OR (captured slot 16 truthy AND submitted end_date truthy), and repeats that predicate for action selection. Both branches assign start_date/end_date. Only short has date; only range has selected_start/selected_end. Times begin null, truthy submissions overwrite with formatter results, and empty strings overwrite only for falsy submissions with non-nullish captured data/attendance and truthy existing corresponding time. No final null constant, array of days, time enum, or inferred formatter return type is imposed.
- Feedback UI emits numeric 0/1 for visible_to_guardians, correctly modeled integer without enum/default. #25867/#25873 use **Object.assign(base child_id, later source)**. Arbitrary later source can overwrite child_id and add fields; the endpoint body remains open/partial even though the known UI construction is locally complete. Route childId capture #43525 `+0xcd/+0xd3` and separate state-derived diary ID were checked.
- Shared profile picture: original #0 registration gives M4522/M4547 dependency 8=M4227, imports #44117/#44670 `+0xdd–+0xee`, then #44120 `+0x2d0–+0x303` / #44673 `+0x5ef–+0x622` render the shared component with updateService=#44137/#44697. M4227 #40891 exports #40894, which captures the service prop and creates #40898. The wrappers pass the FormData through #25539/#25540 to installed #25654. Native descriptor name/type/uri are **not** API properties.
- Child file document branch jumps at #25571 `+0xa3` past the type append. It appends original item as file and uploaded_at only. Non-document builds native metadata and appends upload type separately. `size_too_big` is a submission guard, not an API field or server limit.
- Diary uploads invoke the installed services directly, passing a diary reference whose `.id` supplies the URL; no extra action envelope is promoted into multipart. The documented fileType string is a client constant, not a server enum.
- Folder type is captured **uploadFolderFiles p2** (#26190 `+0x09/+0x0c`, #26195 depth 4 slot 1 `+0x57/+0x5a`), not item.type. #26195 `+0xb9` calls action `(FormData, folder)`; #26188 `+0x30` calls service `(kindergarten, FormData, folderId)`. #26153 reads **p3** into the route `+0x2a` and uses **p2** as POST data `+0x46/+0x49`.
- No dynamic multipart names occur in these six variants. All append calls were traced; native descriptor properties, loop bookkeeping, Redux action types, and routing values were excluded from the API part sets.

### Paths, responses, native downloads, and generated representation

- #25638 GetMaps reads **p2.child_id** at `+0x14` into the child path segment and forwards all of p2 as config.params at `+0x3c`. Path transport naming is correct and the query remains unresolved; no fabricated named query fields were added.
- #25660 GetFiles directly returns Axios GET result/promise at `+0x4c/+0x52`, without a `.data` continuation. All other 94 reviewed helpers have original continuations reading response.data; none prove complete server response schemas.
- #25935 routes via p1.selectedKindergartenId. #25669 routes using p3.courseChildId while forwarding p3; #26149 routes using p2.folder_id while forwarding p2. Unknown forwarded input fields are not promoted to invented schemas.
- DELETE #25951/#26161 place p3 in Axios **config.data**, unlike #25615, which places p4 in **config.params**. Body/query distinctions are preserved.
- Original #37887 `+0x82–+0x119` distinguishes documents, child_files/child_documents, and diary_documents filename URL branches; #37888 `+0x0e/+0x11` writes saved cookie before native download `+0x2d`. #39691 and #44496 corroborate child filename URLs; their separate `.id` reads affect UI state, not the download suffix.
- `com/rnfs/RNFSManager.java:779–792,842–844` transfers fromUrl/headers to Downloader; `com/rnfs/Downloader.java:64–74` opens and connects HttpURLConnection without method override/output body: neutral GET proof, not a response status/content-type promise. Generated download paths use `pathValue2` for diary/documents and `pathValue3` for child files, retaining original `filename` evidence separately from mutation `fileId`/`documentId` observations.
- Both OpenAPI outputs are semantically identical. All 95 record projections, aliases, provenance, variant metadata, path/query parameters, and TypeSpec operation signatures were compared. Every reachable model property was checked recursively for exact field set, type, optional declaration, client-value annotation, and open remainder. Unknown query string transport is explicitly labeled transport-only, not a server domain type.
- All scoped responses are exactly `default` / `*/*` / unknown schema. Unknown forwarded requests use `*/*`; proved object requests use JSON; these five upload requests use evidenced multipart. Body/query/property server requiredness is not asserted; required path parameters are OpenAPI path syntax only.

## All-95 record ledger

`P` = path parameter occurrences; `Q` = named query occurrences, `+F` = unresolved forwarded query retained; `B` = body kind and direct:recursive named-field counts; `V` = client variants. Each row covers method, complete route/parameter ordering, query/body placement, response, source and generated projection. “Clean” includes explicitly honest unknowns, not a claim of complete server coverage.

| # | Record | Original function | P | Q | B | V | Result |
|---:|---|---:|---:|---:|---|---:|---|
| 1 | GuardianUpdateSettings | #25485 | 2 | 0 | object 2:2 | 1 | clean |
| 2 | Store | #25487 | 2 | 0 | unknown 0:0 | 0 | clean |
| 3 | Update | #25489 | 3 | 0 | unknown 0:0 | 0 | clean |
| 4 | Detach | #25491 | 3 | 0 | — | 0 | clean |
| 5 | Delete | #25493 | 3 | 0 | — | 0 | clean |
| 6 | GetMap | #25611 | 3 | 0 | — | 0 | clean |
| 7 | ApproveMap | #25613 | 3 | 0 | unknown 0:0 | 0 | clean |
| 8 | DisapproveMap | #25615 | 3 | 0+F | — | 0 | clean |
| 9 | PublishMap | #25617 | 3 | 0 | unknown 0:0 | 0 | clean |
| 10 | GetChild | #25622 | 2 | 0 | — | 0 | clean |
| 11 | GetChildCourses | #25624 | 2 | 0 | — | 0 | clean |
| 12 | GetChildCoursePlanTypes | #25626 | 2 | 1 | — | 0 | clean |
| 13 | GetChildPlansList | #25628 | 3 | 1 | — | 0 | clean |
| 14 | GetGuardianDiary | #25630 | 2 | 0 | — | 0 | clean |
| 15 | GetGuardianFeed | #25632 | 2 | 0+F | — | 0 | clean |
| 16 | GetChildProfile | #25634 | 2 | 0 | — | 0 | clean |
| 17 | UpdateChildProfile | #25636 | 2 | 0 | object 7:30 | 2 | clean |
| 18 | GetMaps | #25638 | 2 | 0+F | — | 0 | clean |
| 19 | GetChildApprovals | #25640 | 2 | 0 | — | 0 | clean |
| 20 | UpdateApprovalAnswers | #25642 | 2 | 0 | object 1:1 | 0 | clean |
| 21 | GetChildCalendar | #25644 | 2 | 0+F | — | 0 | clean |
| 22 | SaveChildCalendarDays | #25646 | 2 | 0 | object 8:8 | 1 | clean |
| 23 | SaveChildCalendarSingleDay | #25648 | 2 | 0 | object 7:7 | 1 | clean |
| 24 | GetStatusLogs | #25650 | 2 | 1 | — | 0 | clean |
| 25 | GetAbsenceModalData | #25652 | 2 | 1 | — | 0 | clean |
| 26 | UploadChildProfilePicture | #25654 | 2 | 0 | multipart 1:1 | 1 | clean |
| 27 | DeleteChildProfilePicture | #25656 | 2 | 0 | — | 0 | clean |
| 28 | GetGuardians | #25658 | 2 | 0 | — | 0 | clean |
| 29 | GetFiles | #25660 | 2 | 2 | — | 0 | clean |
| 30 | UploadFile | #25661 | 2 | 0 | multipart 3:3 | 2 | clean |
| 31 | DeleteChildFile | #25663 | 3 | 0 | — | 0 | clean |
| 32 | UpdateChildFile | #25665 | 3 | 0 | unknown 0:0 | 0 | clean |
| 33 | AddChildDates | #25667 | 2 | 0 | unknown 0:0 | 0 | clean |
| 34 | UpdateChildDates | #25669 | 3 | 0 | unknown 0:0 | 0 | clean |
| 35 | GetGuardianInvoices | #25671 | 2 | 6+F | — | 1 | clean |
| 36 | GetGuardianInvoice | #25673 | 3 | 0 | — | 0 | clean |
| 37 | AddGuardianInvoiceService | #25675 | 2 | 0 | object 6:6 | 1 | clean |
| 38 | UpdateGuardianInvoiceService | #25677 | 3 | 0 | object 7:7 | 1 | clean |
| 39 | DeleteGuardianInvoiceService | #25679 | 3 | 0 | — | 0 | clean |
| 40 | UpdateChildGuardianFee | #25681 | 2 | 0 | object 3:3 | 1 | clean |
| 41 | GetEmployeeActiveCourses | #25723 | 2 | 0 | — | 0 | clean |
| 42 | GetEmployeeCourses | #25725 | 2 | 0+F | — | 0 | clean |
| 43 | UpdateData | #25730 | 1 | 0 | unknown 0:0 | 0 | clean |
| 44 | EmployeeUpdateSettings | #25732 | 1 | 0 | unknown 0:0 | 0 | clean |
| 45 | GetDiaryData | #25935 | 1 | 2 | — | 0 | clean |
| 46 | CreateDiary | #25937 | 1 | 0 | unknown 0:0 | 0 | clean |
| 47 | UpdateComment | #25939 | 2 | 0 | object 1:1 | 0 | clean |
| 48 | UploadMedia | #25941 | 2 | 0 | multipart 3:3 | 1 | clean |
| 49 | UploadDocument | #25943 | 2 | 0 | multipart 4:4 | 1 | clean |
| 50 | Publish | #25945 | 2 | 0 | — | 0 | clean |
| 51 | UpdateDiaryFile | #25947 | 2 | 0 | unknown 0:0 | 0 | clean |
| 52 | DeleteDiaryFile | #25949 | 2 | 0 | — | 0 | clean |
| 53 | DeleteDiaryFiles | #25951 | 2 | 0 | unknown 0:0 | 0 | clean |
| 54 | LikeDiary | #25953 | 2 | 0 | — | 0 | clean |
| 55 | UpdateEntryStatus | #25955 | 2 | 0 | object 2:2 | 1 | clean |
| 56 | UpdateEntryStatuses | #25957 | 2 | 0 | object 2:2 | 1 | C2-01 evidence only |
| 57 | UpdateEntryMeal | #25959 | 2 | 0 | unknown 0:0 | 0 | clean |
| 58 | AddEntryFeedback | #25961 | 2 | 0 | object 4:4 | 1 | clean |
| 59 | UpdateEntryFeedback | #25963 | 3 | 0 | object 4:4 | 1 | clean |
| 60 | DeleteEntryFeedback | #25965 | 3 | 0 | — | 0 | clean |
| 61 | StartTimeTracking | #25967 | 2 | 0 | unknown 0:0 | 0 | clean |
| 62 | StopTimeTracking | #25969 | 2 | 0 | unknown 0:0 | 0 | clean |
| 63 | AddTimeLog | #25971 | 2 | 0 | unknown 0:0 | 0 | clean |
| 64 | UpdateTimeLog | #25973 | 3 | 0 | unknown 0:0 | 0 | clean |
| 65 | DeleteTimeLog | #25975 | 3 | 0 | — | 0 | clean |
| 66 | UpdateEntryLeaveType | #25977 | 2 | 0 | unknown 0:0 | 0 | clean |
| 67 | UpdateEntryLeaveTypes | #25979 | 2 | 0 | unknown 0:0 | 0 | clean |
| 68 | GetDayMenu | #26007 | 1 | 1 | — | 0 | clean |
| 69 | GetWeekMenu | #26009 | 1 | 1 | — | 0 | clean |
| 70 | GetEmployeeMeals | #26011 | 1 | 0+F | — | 0 | clean |
| 71 | GetEmployeeMealsSettings | #26013 | 1 | 0 | — | 0 | clean |
| 72 | SaveEmployeeMeal | #26015 | 1 | 0 | unknown 0:0 | 0 | clean |
| 73 | GalleryGetIndexFolders | #26134 | 1 | 0+F | — | 0 | clean |
| 74 | DeleteGalleryFile | #26136 | 2 | 0 | — | 0 | clean |
| 75 | UpdateGalleryFile | #26138 | 2 | 0 | unknown 0:0 | 0 | clean |
| 76 | GetFolderData | #26143 | 2 | 0+F | — | 0 | clean |
| 77 | GetSubfolders | #26145 | 2 | 0+F | — | 0 | clean |
| 78 | AddFolder | #26147 | 1 | 0 | unknown 0:0 | 0 | clean |
| 79 | UpdateFolder | #26149 | 2 | 0 | unknown 0:0 | 0 | clean |
| 80 | DeleteFolder | #26151 | 2 | 0 | — | 0 | clean |
| 81 | UploadFiles | #26153 | 2 | 0 | multipart 3:3 | 1 | clean |
| 82 | GetUserTargetGroups | #26155 | 1 | 0 | — | 0 | clean |
| 83 | MoveFolders | #26157 | 2 | 0 | unknown 0:0 | 0 | clean |
| 84 | MoveFiles | #26159 | 2 | 0 | unknown 0:0 | 0 | clean |
| 85 | DeleteFiles | #26161 | 2 | 0 | unknown 0:0 | 0 | clean |
| 86 | GetBuiltinChildProfile | #26163 | 2 | 0+F | — | 0 | clean |
| 87 | GetBuiltinDiaryFolders | #26165 | 1 | 0+F | — | 0 | clean |
| 88 | GetBuiltinDiaryFiles | #26167 | 2 | 0+F | — | 0 | clean |
| 89 | GetFolderFiles | #26169 | 2 | 0+F | — | 0 | clean |
| 90 | DocumentsGetIndexFolders | #26268 | 1 | 0+F | — | 0 | clean |
| 91 | GetDocumentsFolderData | #26270 | 2 | 0+F | — | 0 | clean |
| 92 | DeleteDocument | #26272 | 2 | 0 | — | 0 | clean |
| 93 | UpdateDocumentFile | #26274 | 2 | 0 | unknown 0:0 | 0 | clean |
| 94 | GetDocumentAcl | #26276 | 2 | 0 | — | 0 | clean |
| 95 | GetSharedDocuments | #26278 | 1 | 0+F | — | 0 | clean |

## Freeze/read check

The snapshot's **36/36 listed input hashes matched before review and at completion**. The review does not change that snapshot. Generated artifacts were read, not regenerated; their SHA-256 values checked unchanged at completion are:

- `tsp-output/@typespec/openapi3/openapi.json`: `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`
- `tsp-output/@typespec/openapi3/openapi.yaml`: `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0`

Unseen callers/server fields, arbitrary forwarded service values, response completeness/status/media types, server validation and requiredness remain recorded unknowns, not additional findings. No further discovery or implementation was undertaken; the parent can apply the one bounded provenance correction within its MAX4 review budget.

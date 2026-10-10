# Final response review — round 4, complete scope

**Result: CLEAN — 0 concrete response-model findings.** This is the second
consecutive clean complete-scope review after round 2. The response expansion
is complete within the four-round cap. This certifies the current bounded,
client-observed static-response analysis and its projection only; it does **not**
certify a full Eliis server response contract.

## Frozen inputs, source, and review boundary

- Reviewed the frozen input set declared by
  `evidence/reviews/response-input-snapshot.json`, digest
  `b37c7606e0df696c6c2559f00ef357644c940af24251cf4011ce80a2d2c1b5b6`. All
  **43/43** listed SHA-256 values matched before inspection. A final verification
  after authoring this report also matched all **43/43**; the report itself is
  not one of the frozen inputs.
- Original source `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`
  had SHA-256
  `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`, matching
  the source used for the prior complete review.
- Read the already-compiled OpenAPI artifacts directly; they were not rebuilt:
  `tsp-output/@typespec/openapi3/openapi.json` SHA-256
  `fed11dafc72bc643ad54ca7982b0c3342f6d29605c32f88a4cd71935314a4cc3` and
  `openapi.yaml` SHA-256
  `f84708600fe6b96bf25649d8d93d5d1d39b90ca3a510c28962d9bec436ae2748`.
- Ran the permitted read-only `node scripts/check.mjs` and independent
  read-only integrity/source/projection assertions. The checker passed with
  **296** OpenAPI operations, **283** covered inventory functions, **0**
  explicitly excluded functions, **87** partial response models, and **209**
  unknown/opaque dispositions. Both JSON and YAML parsed to structurally equal
  documents. No tests, build, generation, npm/CI command, HTTP/API request,
  login/write request, or private-record access was performed.
- Process note: an initial read-only `git status --short` and `git rev-parse`
  were inadvertently run while establishing workspace scope, before noticing
  the no-Git constraint. No Git write occurred; no further Git command was run.
  No project input was edited. This report is the only file authored by this
  review.

## Full coverage and disposition ledger

Research/analysis counts below are per-observation records. Canonical disposition
counts account for the two same-path alias groups, so an observation is not
mistaken for an additional canonical operation.

| Domain | Research / response observations | Analysis root kinds: object / array / unknown / binary |
|---|---:|---:|
| Admin, shop | 79 / 79 | 24 / 3 / 52 / 0 |
| Auth, common | 41 / 41 | 13 / 0 / 28 / 0 |
| Children, diary, files | 95 / 95 | 22 / 2 / 71 / 0 |
| Communications | 68 / 68 | 24 / 0 / 44 / 0 |
| Native-download coverage | 15 / 15 | 0 / 0 / 0 / 15 |
| **Total observations** | **298 / 298** | **83 / 5 / 195 / 15** |

| Canonical measure | Verified |
|---|---:|
| Operations / dispositions | **296 / 296** |
| Partial static-derived models | **87** |
| Explicit unknown/unresolved bodies | **194** |
| Opaque binary-download bodies | **15** |
| Missing analyses / missing dispositions | **0 / 0** |
| Named field nodes in observation analyses | **350** |
| Named field nodes emitted in OpenAPI | **348** |
| Service source/header matches | **298 / 298** |
| Trace entries / invalid function-line coordinates | **1,392 / 0** |

All **298/298** research keys match one response analysis by operation ID and
source-function ID. All source function headers match the recorded service
source lines. Every trace function exists in the original disassembly, and
every trace coordinate falls within that function. Every function ID cited in a
field-evidence string is present in that operation's trace. The 350 analysis
field nodes contain nonempty evidence and remain partial; primitive field/item
values are `unknown`.

The two alias-conflict dispositions remain unconstrained:

- `GetDocumentsFolderData` preserves both the unknown observation for
  `#26270` and the separate `GetFolderData #26143` analysis. The latter's
  `subfolders` and `files` observations are retained as evidence but are not
  emitted into a merged route model.
- `GetUserTargetGroups` preserves both unknown observations (`#16369` and
  `#26155`) without selecting or merging a response shape.

Thus the two analysis-only nodes excluded from the 348 emitted nodes are the
folder observation's `subfolders` and `files`. The complete canonical
operation-to-disposition and observation ledger remains in
`scripts/response-coverage.json`; unknown means unresolved, not a proven empty
body or absence of consumers.

### Complete emitted-model inventory

The current 87 canonical model names, grouped by response-analysis domain, are:

- **Admin/shop (27):** `CategoriesForChild`,
  `GetEmployeeMeals_get_api_kindergartens_kindergartenId_reports_employee_meals`,
  `Meals`, `KindergartenCategoryProducts`, `KindergartenCategoryServices`,
  `KindergartenOrders`, `GetKindergartenOrder`, `KindergartenProductSearch`,
  `KindergartenProduct`, `KindergartenServiceSearch`, `KindergartenService`,
  `KindergartenGetSupplierProducts`, `KindergartenGetSupplierServices`,
  `Wishlist`, `GetWorkSchedule`, `UserCart`, `Categories`, `CategoryProducts`,
  `CategoryServices`, `UserOrders`, `GetUserOrder`, `ProductSearch`, `Product`,
  `ServiceSearch`, `Service`, `GetSupplierProducts`, `GetSupplierServices`.
- **Auth/common (13):** `GetPublicAgreement`, `GetUserData`, `GetUserMenu`,
  `GetUserDashboard`, `GetKindergartenActivity`, `GetUserKindergartenMenu`,
  `GetUserPermissions`, `GetLanguages`, `Login`, `Login2FA`,
  `UploadUserPicture`, `DisableTwoFactorAuth`, `EnableTwoFactorAuth`.
- **Children/diary/files (23):** `GetAbsenceModalData`, `GetChildCalendar`,
  `GetGuardianInvoices`, `GetGuardians`, `GetMaps`, `GetChildProfile`,
  `GetDiaryData`, `DocumentsGetIndexFolders`, `GetSharedDocuments`,
  `GetEmployeeMeals_get_api_kindergartens_kindergartenId_employee_meals`,
  `GetEmployeeCourses`, `GetSubfolders`, `GalleryGetIndexFolders`,
  `SaveChildCalendarDays`, `UploadChildProfilePicture`, `CreateDiary`,
  `UploadDocument`, `UploadMedia`, `PublishMap`,
  `UpdateComment_put_api_kindergartens_kindergartenId_diary_diaryId_save_comment`,
  `UpdateEntryLeaveTypes`, `UpdateEntryStatuses`, `UpdateFolder`.
- **Communications (24):** `DeleteIdeaComment`, `GetDeletedMessages`,
  `GetMessageDrafts`, `GetDraftById`, `GetReceivedMessages`,
  `GetRecentMessages`, `GetSentMessages`, `GetNotifications`,
  `GetUnseenNotificationCount`, `GetReceivedAnnouncements`,
  `GetSentAnnouncements`, `GetKindergartenApplications`,
  `GetKindergartenContacts`, `GetRecentEvents`, `GetIdeaComments`, `GetIdeas`,
  `GetPolls`, `GetQuestionnaires`, `GetQuestionnaire`,
  `GetQuestionnaireQuestions`, `CreateDraft`, `SendMessageDraft`, `SaveDraft`,
  `MarkAnnouncementRead`.

The separate **15 binary** dispositions are `DownloadMessageAttachment`,
`DownloadChildFile`, `DownloadChildMapPdf`, `DownloadChildPlanPdf`,
`DownloadDiaryFile`, `DownloadDocumentFile`, `GetIdeaImage`,
`DownloadPlanFile`, `DownloadFoodmenuFile`, `DownloadPlanPdf`,
`DownloadEmployeeMealsXls`, `DownloadTodaysMealsPerCoursePdf`,
`DownloadTodaysMealsPerCourseXls`, `DownloadTodaysMealsPdf`, and
`DownloadTodaysMealsXls`. They have no modeled JSON fields. RNFS `jobId`,
`statusCode`, and `bytesWritten` remain native completion metadata, not HTTP
body properties.

## Source-first verification of the prior findings

I independently reopened the affected original bytecode and the current
response records; this does not rely solely on the round-3 conclusion.

- **`UpdateMessage #25227`:** service fulfillment `#25228` returns
  `response.data`; caller `#25165` forwards the body unchanged. Reducer `#25141`
  assigns the entire `action.data` value to a local message's `recipient_read`
  slot; it does not read `action.data.recipient_read`. The current disposition
  correctly remains `unknown`, with no `recipient_read` or captured-state
  `unread_messages_count` field.
- **`GetQuestionnaires #26488`:** service handler `#26489` returns the body;
  `#26467` dispatches it unchanged and reducer `#26460` reads body-root
  `current_page` and `data` in its category branches (including the original
  reads at 1027863–1027865, 1027899–1027901, and 1027935–1027937). Both fields
  are modeled as `unknown`. Later concatenation does not prove that `data` is
  an array.
- **Kindergarten menu:** original `#16355` reads Axios `data` and then `left`
  at source line **649665**. `GetUserKindergartenMenu` retains `left` at the
  HTTP-body root with the corrected citation; it is not flattened. `GetUserMenu`
  independently retains its own `response.data.left` body nesting.
- **`Categories #26705`:** `#39931` constructs the `.find` callback, while
  `#39932` directly reads the category item's `slug`. The field is attributed
  to `#39932`, present in the trace, and remains `unknown`.
- **`UserCart #26769`:** body passthrough to `FlatList.data` supports the
  root-array client view. The current trace contains direct consumers `#40168`
  (`id`), `#40173` (`delivery_fee`, `delivery_vatrate`), `#40174` (`sum`), and
  `#40175` (`delivery_fee`, `free_delivery_from`). Provider/item detail paths
  remain open and unproved values remain unknown.
- **`UserOrders #26779`:** the current trace includes pagination consumer
  `#40214`, which reads response-derived `user_orders.last_page`; the response
  object's `data` is directly supplied to `FlatList.data`. Row fields remain
  client-observed, optional, and unknown-valued.
- **Employee meals:** Foodmenu service `#26011` and Reports service `#26908`
  remain separate operations. Foodmenu's `employees` path stays `unknown`
  despite comparator `#26000` reading `user_id`; Reports models only the
  `employees` array use from `FlatList.data`, with unknown items. The Foodmenu
  comparator's property is not transferred to Reports.

## Projection and contract-boundary checks

For all **296** operations, the compiled response disposition and static
evidence agree with `scripts/response-coverage.json`. Recursive emitted field
paths, types, and `x-static-field-evidence` values match all **348** emitted
nodes. JSON/YAML are equal. The two alias conflicts stay unconstrained; all
15 binary operations remain schema-free, and all unknown operations remain
unconstrained rather than fabricated as empty server responses.

Every response uses only `default` and documentation media `*/*`; these do not
assert a numeric status or actual response media type. Emitted object models
remain open and all properties optional. Unknown leaves and items are
unconstrained. No enum, default, nullability, required property, closed-object
constraint, array bound, server pagination wrapper, or invented response field
is projected. Client array/object use is limited to directly evidenced
`map`/`forEach`/`find`/`sort` or `FlatList.data` use; concatenation alone is not
used to assert array type.

## Disposition

**Round 4 is clean: 0 concrete findings.** The two prior complete-scope clean
reviews are consecutive, the two alias conflicts and all opaque/unknown limits
remain explicit, and all source/projection fixes checked in this round are
present. The review certifies only the present partial static-derived response
views—not a complete or accepted Eliis server contract. No further response
expansion review/fix round is warranted under the four-round cap.

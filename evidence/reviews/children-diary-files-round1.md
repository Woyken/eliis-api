# Children / diary / files — independent exhaustive review, round 1

## Result

**95/95 operations reviewed. Three concrete findings affect three records; 92 records have no identified helper-level discrepancy.** One finding changes a request path and query coverage. No missing indexed operation, wrong HTTP verb, invented response schema, or unsupported body-field model was found.

Reviewed `AGENTS.md`, `evidence/research/children-diary-files.json`, and these local sources:

- `/data/data/com.termux/files/home/eliis-analysis/domain-source/children-diary-files.hasm`
- `/data/data/com.termux/files/home/eliis-analysis/domain-source/children-diary-files-index.json`
- `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`

The index was used for coverage only, not as proof of request fields. Every extracted helper's instruction listing was compared with its full-disassembly listing: **95 exact instruction matches**. All 95 function IDs, function names, and recorded full-disassembly starting lines match. Registers, concatenation arguments, Axios receiver/argument positions, object construction, and continuations were traced. No network requests were made. Only this review report was edited.

`p1`, `p2`, etc. below are Hermes `LoadParam` indices (excluding the implicit `p0` receiver). `+0xNN` is a function-relative bytecode offset, not a source-file line.

## Concrete findings and corrections

### F1 — High: `GetMaps` omits the child path argument and falsely closes a forwarded query shape

Research JSON lines **675–700**, helper **#25638**, full disassembly **1003435–1003463**, function base **0x005f5b03**.

Actual call:

```text
get("/api/kindergartens/" + p1 + "/children/" + p2.child_id + "/maps",
    { params: p2 })
```

Register proof:

- `+0x00`: `LoadParam r4, p2`.
- `+0x14`: `GetById r10, r4, child_id`.
- `+0x27`, `+0x2b`, `+0x2e`, `+0x32`: load `r13 = "/api/kindergartens/"`, `r12 = p1`, `r11 = "/children/"`, and `r9 = "/maps"`.
- `+0x36`: `Call r1, r7, 5` concatenates **r13, r12, r11, r10, r9**, including `p2.child_id`. The fact that the child value was loaded earlier, rather than immediately adjacent to the strings, does not remove it from the argument list.
- `+0x3a`: allocate config `r0`; `+0x3c`: assign **the original r4/p2** to `config.params`; `+0x40`: `Call3` invokes `get(url, config)`.

Corrections:

1. Change `path` and its repeated `evidence` text from `/api/kindergartens/{kindergartenId}/children//maps` to **`/api/kindergartens/{kindergartenId}/children/{childId}/maps`**.
2. Add `pathParams.childId`, transport type `string`, evidence that it is read from **input parameter 2's `child_id` property**.
3. Set **`queryPassthrough: true`**. This helper does not construct a new params object containing only `child_id`; it forwards the entire input object. Preserve an explicitly unresolved query shape. `child_id` is a proven property read on that same object, but its property read proves path insertion, not an exhaustive one-field query schema. Do not drop other possible keys or pretend this is `{params: {child_id: ...}}`.

The existing `child_id` query evidence (“constructs params object with that property”) is false. A safe correction uses the usual unresolved-query entry with evidence `config.params = p2`, plus a note that `p2.child_id` is also interpolated into the path. No server requiredness or child-ID domain type follows.

### F2 — Medium: `GetFiles` falsely claims a `response.data` continuation

Research JSON **1106, 1133–1135**, helper **#25660**, full disassembly **1003880–1003905**, function base **0x005f5eac**.

At `+0x4c`, `Call3 r0, r2, r3, r1, r0` invokes `get(url, {params: {page: p3, perPage: p4}})`. At **`+0x52`**, `Ret r0` returns that Axios result directly. There is **no `then` lookup, closure creation, or `.data` extraction** in this helper. The next helper is #25661 `uploadFile`, not a response continuation for #25660.

Keep `response.kind: "unknown"`; correct both the general `evidence` and `response.evidence` to say the helper **returns the Axios GET promise/result unchanged; complete HTTP response-data shape is unestablished**. Do not invent an Axios transport-wrapper schema as the HTTP response body. The method, path, `page = p3`, `perPage = p4`, and absence of body are correct.

### F3 — Low: `GetDiaryData` gives the wrong provenance for the kindergarten path argument

Research JSON **1743–1747**, helper **#25935**, full disassembly **1012899–1012927**, function base **0x005fc0a4**.

- `+0x00`: `LoadParam r0, p1`.
- `+0x07`/`+0x0d`: read `p1.course_id` and put it under `params.course`.
- `+0x12`/`+0x17`: read `p1.date` and put it under `params.date`.
- **`+0x30`: `GetByIdShort r6, r0, selectedKindergartenId`** reads the same **input parameter 1**, not module state.
- `+0x4a`: concatenate `/api/kindergartens/`, that `r6`, and `/diary`; `+0x50`: `get(url, config)`.

Correct `pathParams.kindergartenId.evidence` to **“Reads `selectedKindergartenId` from input parameter 1 and concatenates it into the URL.”** The current path and both query properties are correct. A higher-level caller may construct this argument using application state, but that is not the provenance inside the cited API helper.

## Requested client-constructor cross-checks

These are **non-blocking observed caller facts**, not a demand to replace honest forwarded `unknown` bodies/queries with a universal schema. The current JSON does not invent fields for these operations. If caller-observed models are added, cite these constructors and keep their scope explicit. Object keys in action envelopes or reducers are not automatically HTTP body keys.

### Child invoices

- **`GetGuardianInvoices`**: full-disassembly caller **#44547**, base **0x0083f798**, line **1819322**. At `+0x03` it starts a buffered object with `perPage: 15`, `page: null`, `sortBy: "updated_at"`; `+0x13` replaces page with caller p1. `+0x20` adds `sortDir` from captured state. `+0x25–0x38` constructs Boolean values for **`settings` and `services`**, and `+0x2c`/`+0x38` assigns both keys unconditionally. `+0x68` puts this object in `queryObj` of the action envelope. **#25589** reads `childId` and `queryObj` into environment slots 0/1; **#25590**, base **0x005f4e40**, `+0x31–0x39`, passes those through to API helper #25671 as p2/p3. Thus this caller uses those six query keys; it does not establish universal pagination, default values, or server requiredness. In particular, `settings`/`services` are not conditionally omitted in this constructor.
- **`UpdateChildGuardianFee`**: caller **#44593**, base **0x00841adc**, line **1822044**, constructs **`unit_price`, `qty`, `discount`** in r5 at `+0x15–0x37`; `qty` comes from captured **`fee_qty`**, and `discount` from caller **`invoice_discount`**. `+0x68` puts r5 in action-envelope `data`. **#25598 → #25599** unwraps that `data` and forwards it as helper #25681's p3. This constructor does not send `fee_qty`, `invoice_discount`, or the action-envelope `childId` as HTTP body keys.
- **`AddGuardianInvoiceService` / `UpdateGuardianInvoiceService`**: caller **#44609**, base **0x00842846**, line **1823081**, constructs r5 with **`label`, `unit_price`, `qty`, `discount`, `valid_from`, `valid_to`** at `+0x15–0x4e`. The add branch sends that r5 at `+0x8b–0x8f`. The update branch additionally assigns **`id`** at **`+0xc2`** before putting the same r5 under action-envelope `data` at `+0x102`. It separately supplies `serviceId` for the URL. The wrapper chains **#25604 → #25605 → #25675** (add) and **#25601 → #25602 → #25677** (update) forward the inner data unchanged. Therefore an observed update body has seven keys, not the add body's six; `id` is not merely an action-envelope routing field. These value sources alone do not prove numeric/string field types.

### Guardian settings

- Caller **#41002**, base **0x007ce8ee**, line **1663208**, constructs an action-envelope `form` containing only **`setting_id` and `value`** at `+0x53–0x61`; `guardian_id` and `kindergarten_id` are separate envelope fields at `+0x46`/`+0x4e`.
- Wrapper **#25480**, base **0x005f27b4**, line **998825**, reads those two IDs at `+0x22`/`+0x28`, reads `form` at `+0x2e`, and calls API helper #25485 at `+0x34`. The HTTP body for this caller is the inner form, **not** the outer envelope or the Redux `settings` object constructed later by #25481. Unknown value types remain appropriate.

### Calendar day / days

- Caller **#43031**, base **0x0080c6e7**, line **1751064**, builds r5: **`status`, `comment`, `start_time`, `end_time`** at `+0x15–0x31`. The time keys are initially **present with null values**, not omitted optional keys. Later branches replace them with formatted `HH:mm` values or an empty string when clearing existing times (`+0x64`, `+0x97`, `+0xcb`, `+0xfe`). This proves this caller's branches, not server nullability/defaults.
- The single-day branch assigns **`start_date`, `end_date`, `date`** at `+0x156`, `+0x184`, `+0x1b2`, from `YYYY-MM-DD` formatting. The long-period branch instead assigns **`start_date`, `end_date`, `selected_start`, `selected_end`** at `+0x1df`, `+0x203`, `+0x212`, `+0x221`; it does **not** assign `date` in that branch. Do not intuit a `days` array solely from `/calendar/days`.
- `+0x26f` sends r5 to `storeChildCalendarSingleDay`; `+0x2c5` sends it to `storeChildCalendarDays`. Wrapper chains **#26410 → #26411 → #25648** and **#26406 → #26407 → #25646** preserve that data argument. Helper-level unknown bodies are honest; any observed model must retain the branch distinctions rather than infer a single complete uniform body.

### Diary status / meal

- **`UpdateEntryStatus`**: caller **#25845**, base **0x005faa4f**, line **1010412**, constructs exactly **`child_id`, `status`** at `+0x84–0x96` and passes that object at `+0x9a` to helper #25955. Values are captured action inputs; no enum follows from these instructions.
- **`UpdateEntryStatuses`**: caller **#25851**, base **0x005faba5**, line **1010561**, filters diary entries using **#25852** (`required_day`) and maps using **#25853** (`entry.child.id`) at `+0x7b–0x94`. It then constructs **`children`, `status`** at `+0xb0–0xbd` and calls helper #25957 at `+0xc1`. The observed `children` value is an array of unresolved element type (`unknown[]`), not evidence for a `child_ids: integer[]` field. There is no inferred constant status enum.
- **`UpdateEntryMeal`**: caller **#25861**, base **0x005fae00**, line **1010804**, creates `{child_id: capturedChildId}` at `+0x91–0x9a`, then calls **`Object.assign`** with an arbitrary captured meal object at **`+0xa3`** and passes the result to helper #25959 at `+0xa9`. The merged object is **not proven complete**; the arbitrary source can introduce dynamic keys and can overwrite `child_id`.
- UI caller **#43488**, base **0x0081dd21**, line **1773437**, calls an imported helper at `+0x55` with a new object and caller p1/p2, then sends that result to the diary action at `+0x5c`. This call site itself does not establish fixed wire field names. Together with the proven open-ended `Object.assign` construction above, it provides no basis for inventing a fixed `{meal_id, status}` body. The current empty-field unknown body remains valid.

## Exhaustive checklist and counts

- **95 operations / 95 unique operation IDs / 95 distinct source helpers / 95 indexed helpers**; all accounted for once. No genuinely different URL branches exist inside these 95 straight-line helpers; no split operation is omitted from the supplied source/index.
- Verbs: **36 GET, 25 PUT, 20 POST, 14 DELETE**; **95/95 match** Axios method selection.
- Path concatenation and dynamic argument order: **95/95 checked; 94 match**, with F1 the exception. **192 declared path parameters checked**, all transport `string`; F1 omits one further dynamic argument. Existing special property reads (`p3.courseChildId`, `p2.id`, `p2.folder_id`) are retained correctly. F3 corrects one provenance description without changing its path.
- Request data/config positions: **95/95 checked**. **50 null bodies, 38 unknown bodies, 5 unresolved multipart bodies, 2 locally constructed object bodies**. No unknown/multipart body is rejected merely for lacking guessed fields.
- The two complete local body objects have exactly **two named fields total**: `UpdateApprovalAnswers.approvals = p3`, `UpdateComment.data = p3`; both are correctly `unknown` and `complete: true`.
- Queries: **25 query-bearing records, 27 entries**: **11 named entries and 16 unresolved placeholders**. Every entry's source was checked. Ten of the eleven named entries are accurately evidenced; F1's `child_id` entry falsely claims a locally constructed exhaustive params object. **16 declared passthrough records match; one additional passthrough is missing (F1)**. The `unknown` entries explicitly denote unresolved query shapes, not literal wire parameters named `unknown`.
- **0 optional annotations, 0 field value constants, 0 field encoding annotations** in the reviewed JSON. No unsupported optionality, enum, numeric/array type, or default claim was introduced. The five multipart helpers' constant **`Content-Type: multipart/form-data`** headers match the bytecode; their unresolved part names remain accepted.
- DELETE: **14/14 checked**: 11 `delete(url)` calls, one `delete(url, {params: p4})` (`DisapproveMap`), and two **`delete(url, {data: p3})`** (`DeleteDiaryFiles`, `DeleteFiles`). The latter are correctly modeled as unknown HTTP data, not a `{data: ...}` HTTP-body wrapper. No false direct-second-argument DELETE body was found.
- **95 unknown responses accepted**. **94 `.data` continuations checked in the full disassembly**, each a three-instruction `LoadParam p1; GetById data; Ret` closure at base `0x004925f3`. The sole direct-return helper is F2; its schema may remain unknown, but its evidence must be corrected.
- Auth annotations: **95 cookie, 0 Bearer**; consistent with these helpers' shared API client and project auth evidence. The full-disassembly cookie handling in **#5617**, base `0x003d91e4`, reads and serializes `eliis_csrf` at `+0x3b–0x58`. No per-operation auth override is constructed in these helpers.

### Per-operation call checklist

All rows include verb/path literals, placeholder order, request shape/types/annotations, and response continuation review. `OK` means no discrepancy in the current helper-level JSON; caller observations above do not turn accepted unknowns into failures.

For compactness, `K = /api/kindergartens/{p1}`; `C = K/children/{p2}`; `D = K/diary/{p2}`; `F = K/folders/{p2}`. Exceptions explicitly show property-derived or reordered arguments. `Q=pN` means unchanged `config.params`; `B=pN` means unchanged post/put data; `DELdata=pN` means `config.data`. `MP` means the verified multipart header, with unresolved part fields. Call offsets are relative to the cited helper.

| # | Operation | Function | Axios call offset | Verified request | Result |
|---:|---|---:|---|---|---|
| 1 | GuardianUpdateSettings | 25485 | +0x38 | PUT K/guardians/{p2}/settings; B=p3 | OK |
| 2 | Store | 25487 | +0x38 | POST C/guardians; B=p3 | OK |
| 3 | Update | 25489 | +0x3b | PUT C/guardians/{p3}; B=p4 | OK |
| 4 | Detach | 25491 | +0x3b | DELETE C/guardians/{p3}/detach | OK |
| 5 | Delete | 25493 | +0x3b | DELETE C/guardians/{p3}/delete | OK |
| 6 | GetMap | 25611 | +0x37 | GET C/maps/{p3} | OK |
| 7 | ApproveMap | 25613 | +0x3f | POST C/maps/{p3}/approve; B=p4 | OK |
| 8 | DisapproveMap | 25615 | +0x44 | DELETE C/maps/{p3}/approve; Q=p4 | OK |
| 9 | PublishMap | 25617 | +0x3f | PUT C/maps/{p3}/publish; B=p4 | OK |
| 10 | GetChild | 25622 | +0x33 | GET C | OK |
| 11 | GetChildCourses | 25624 | +0x34 | GET C/courses | OK |
| 12 | GetChildCoursePlanTypes | 25626 | +0x44 | GET C/planTypes; Q={course_id:p3} | OK |
| 13 | GetChildPlansList | 25628 | +0x4a | GET C/courses/{p3}/plan-list; Q={type:p4} | OK |
| 14 | GetGuardianDiary | 25630 | +0x34 | GET C/diary | OK |
| 15 | GetGuardianFeed | 25632 | +0x3d | GET C/guardian-feed; Q=p3 | OK |
| 16 | GetChildProfile | 25634 | +0x34 | GET C/profile | OK |
| 17 | UpdateChildProfile | 25636 | +0x37 | PUT C; B=p3 | OK |
| 18 | GetMaps | 25638 | +0x40 | GET K/children/{p2.child_id}/maps; Q=p2 | F1 |
| 19 | GetChildApprovals | 25640 | +0x34 | GET C/approvals | OK |
| 20 | UpdateApprovalAnswers | 25642 | +0x3f | PUT C/approvals; B={approvals:p3} | OK |
| 21 | GetChildCalendar | 25644 | +0x3d | GET C/calendar; Q=p3 | OK |
| 22 | SaveChildCalendarDays | 25646 | +0x38 | POST C/calendar/days; B=p3 | OK |
| 23 | SaveChildCalendarSingleDay | 25648 | +0x38 | POST C/calendar/day; B=p3 | OK |
| 24 | GetStatusLogs | 25650 | +0x43 | GET C/status-log; Q={date:p3} | OK |
| 25 | GetAbsenceModalData | 25652 | +0x44 | GET C/absences/modal; Q={form:p3} | OK |
| 26 | UploadChildProfilePicture | 25654 | +0x49 | POST C/profile-picture; B=p3; MP | OK |
| 27 | DeleteChildProfilePicture | 25656 | +0x34 | DELETE C/profile-picture | OK |
| 28 | GetGuardians | 25658 | +0x34 | GET C/guardians | OK |
| 29 | GetFiles | 25660 | +0x4c | GET C/files; Q={page:p3,perPage:p4}; direct return | F2 |
| 30 | UploadFile | 25661 | +0x49 | POST C/files; B=p3; MP | OK |
| 31 | DeleteChildFile | 25663 | +0x37 | DELETE C/files/{p3} | OK |
| 32 | UpdateChildFile | 25665 | +0x3b | PUT C/files/{p3}; B=p4 | OK |
| 33 | AddChildDates | 25667 | +0x38 | POST C/add-course; B=p3 | OK |
| 34 | UpdateChildDates | 25669 | +0x3e | PUT C/update-course/{p3.courseChildId}; B=p3 | OK |
| 35 | GetGuardianInvoices | 25671 | +0x3d | GET C/guardian-invoices; Q=p3 | OK |
| 36 | GetGuardianInvoice | 25673 | +0x37 | GET C/guardian-invoices/{p3} | OK |
| 37 | AddGuardianInvoiceService | 25675 | +0x38 | POST C/guardian-invoices/services; B=p3 | OK |
| 38 | UpdateGuardianInvoiceService | 25677 | +0x3b | PUT C/guardian-invoices/services/{p3}; B=p4 | OK |
| 39 | DeleteGuardianInvoiceService | 25679 | +0x37 | DELETE C/guardian-invoices/services/{p3} | OK |
| 40 | UpdateChildGuardianFee | 25681 | +0x38 | PUT C/guardian-invoices; B=p3 | OK |
| 41 | GetEmployeeActiveCourses | 25723 | +0x34 | GET K/employees/{p2}/active-courses | OK |
| 42 | GetEmployeeCourses | 25725 | +0x3d | GET K/employees/{p2}/courses; Q=p3 | OK |
| 43 | UpdateData | 25730 | +0x33 | PUT /api/common/user/employees/{p1}/data; B=p2 | OK |
| 44 | EmployeeUpdateSettings | 25732 | +0x33 | POST /api/common/user/employees/{p1}/settings; B=p2 | OK |
| 45 | GetDiaryData | 25935 | +0x50 | GET /api/kindergartens/{p1.selectedKindergartenId}/diary; Q={course:p1.course_id,date:p1.date} | F3 |
| 46 | CreateDiary | 25937 | +0x33 | POST K/diary; B=p2 | OK |
| 47 | UpdateComment | 25939 | +0x3e | PUT D/save-comment; B={data:p3} | OK |
| 48 | UploadMedia | 25941 | +0x4e | POST K/diary/{p2.id}/media; B=p3; MP | OK |
| 49 | UploadDocument | 25943 | +0x4e | POST K/diary/{p2.id}/document; B=p3; MP | OK |
| 50 | Publish | 25945 | +0x35 | PUT D/publish; no data argument | OK |
| 51 | UpdateDiaryFile | 25947 | +0x37 | PUT K/files/diary/{p2}; B=p3 | OK |
| 52 | DeleteDiaryFile | 25949 | +0x33 | DELETE K/files/diary/{p2} | OK |
| 53 | DeleteDiaryFiles | 25951 | +0x3d | DELETE K/files/diary/{p2}/files; DELdata=p3 | OK |
| 54 | LikeDiary | 25953 | +0x35 | POST D/like; no data argument | OK |
| 55 | UpdateEntryStatus | 25955 | +0x38 | PUT D/update-entry-status; B=p3 | OK |
| 56 | UpdateEntryStatuses | 25957 | +0x38 | PUT D/update-entry-statuses; B=p3 | OK |
| 57 | UpdateEntryMeal | 25959 | +0x38 | PUT D/update-entry-meal; B=p3 | OK |
| 58 | AddEntryFeedback | 25961 | +0x38 | POST D/add-entry-feedback; B=p3 | OK |
| 59 | UpdateEntryFeedback | 25963 | +0x3b | PUT D/update-entry-feedback/{p3}; B=p4 | OK |
| 60 | DeleteEntryFeedback | 25965 | +0x37 | DELETE D/delete-entry-feedback/{p3} | OK |
| 61 | StartTimeTracking | 25967 | +0x38 | POST D/start-time-tracking; B=p3 | OK |
| 62 | StopTimeTracking | 25969 | +0x38 | POST D/stop-time-tracking; B=p3 | OK |
| 63 | AddTimeLog | 25971 | +0x38 | POST D/time-logs; B=p3 | OK |
| 64 | UpdateTimeLog | 25973 | +0x3b | PUT D/time-logs/{p3}; B=p4 | OK |
| 65 | DeleteTimeLog | 25975 | +0x37 | DELETE D/time-logs/{p3} | OK |
| 66 | UpdateEntryLeaveType | 25977 | +0x38 | PUT D/update-entry-leave-type; B=p3 | OK |
| 67 | UpdateEntryLeaveTypes | 25979 | +0x38 | PUT D/update-entry-leave-types; B=p3 | OK |
| 68 | GetDayMenu | 26007 | +0x33 | GET K/foodmenu/day?date={p2}; direct URL concatenation | OK |
| 69 | GetWeekMenu | 26009 | +0x33 | GET K/foodmenu/week?date={p2}; direct URL concatenation | OK |
| 70 | GetEmployeeMeals | 26011 | +0x38 | GET K/employee-meals; Q=p2 | OK |
| 71 | GetEmployeeMealsSettings | 26013 | +0x2f | GET K/employee-meals/settings | OK |
| 72 | SaveEmployeeMeal | 26015 | +0x33 | POST K/employee-meals; B=p2 | OK |
| 73 | GalleryGetIndexFolders | 26134 | +0x38 | GET K/gallery; Q=p2 | OK |
| 74 | DeleteGalleryFile | 26136 | +0x33 | DELETE K/files/gallery/{p2} | OK |
| 75 | UpdateGalleryFile | 26138 | +0x37 | PUT K/files/gallery/{p2}; B=p3 | OK |
| 76 | GetFolderData | 26143 | +0x3c | GET F; Q=p3 | OK |
| 77 | GetSubfolders | 26145 | +0x3d | GET F/folders; Q=p3 | OK |
| 78 | AddFolder | 26147 | +0x33 | POST K/folders; B=p2 | OK |
| 79 | UpdateFolder | 26149 | +0x3a | PUT K/folders/{p2.folder_id}; B=p2 | OK |
| 80 | DeleteFolder | 26151 | +0x33 | DELETE F | OK |
| 81 | UploadFiles | 26153 | +0x49 | POST K/folders/{p3}/upload; B=p2; MP | OK |
| 82 | GetUserTargetGroups | 26155 | +0x2f | GET K/target-groups/available | OK |
| 83 | MoveFolders | 26157 | +0x38 | PUT F/move; B=p3 | OK |
| 84 | MoveFiles | 26159 | +0x38 | PUT F/files/move; B=p3 | OK |
| 85 | DeleteFiles | 26161 | +0x3d | DELETE F/files; DELdata=p3 | OK |
| 86 | GetBuiltinChildProfile | 26163 | +0x3c | GET K/folders/child-profile/{p2}; Q=p3 | OK |
| 87 | GetBuiltinDiaryFolders | 26165 | +0x38 | GET K/folders/diary; Q=p2 | OK |
| 88 | GetBuiltinDiaryFiles | 26167 | +0x3c | GET K/folders/diary/{p2}; Q=p3 | OK |
| 89 | GetFolderFiles | 26169 | +0x3d | GET F/files; Q=p3 | OK |
| 90 | DocumentsGetIndexFolders | 26268 | +0x38 | GET K/documents; Q=p2 | OK |
| 91 | GetDocumentsFolderData | 26270 | +0x3c | GET F; Q=p3 | OK |
| 92 | DeleteDocument | 26272 | +0x33 | DELETE K/files/documents/{p2} | OK |
| 93 | UpdateDocumentFile | 26274 | +0x37 | PUT K/files/documents/{p2}; B=p3 | OK |
| 94 | GetDocumentAcl | 26276 | +0x34 | GET K/documents/{p2}/acl | OK |
| 95 | GetSharedDocuments | 26278 | +0x38 | GET K/documents/shared; Q=p2 | OK |

No cosmetic naming/summary changes are requested. Coverage conclusions are exhaustive for the supplied 95-helper domain source and index, not a claim that every server route or every unrelated APK module has been enumerated.

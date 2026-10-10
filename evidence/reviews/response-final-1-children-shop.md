# Response final review run 1 — children and admin/shop

**Verdict: NOT CLEAN — 4 findings across 8 operation observations.** The current response records and TypeSpec projection are structurally consistent, but a source-first pass found omitted client-observed paths and one response trace attached to the wrong service caller. No specification inputs were changed by this review.

## Frozen scope and method

- Reviewed the frozen response-input snapshot `6a6679d9949e549f74cdf3f160240e5a5f58681809cbeba03627c94ee12ad2ab`: all **43/43** listed hashes matched before review. The final check found **41/43** still matching. `evidence/responses/auth-common.json` differs (expected `256f41ba84814d19fe32a03c3f383e2cfdb37c1f2deb732a695044edfebdc4c0`, actual `db29248588df60f55cfac3d80f021ce0734cadd254280cc5c08890c5973805c8`) and `evidence/responses/communications.json` differs (expected `90e64ca040c471a828d134cf3d19632474129586a1d0dfeac2e1ce8ad0dc1c25`, actual `569259bb5437bd0690b90622eb70f45824f100c09d2d66986e318b92895d97b1`). These two changes were not made by this review and were preserved.
- Primary source: `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`. Function-string indexes and prior review conclusions were not treated as source authority.
- Independently compared response records with the assigned research records, checked source/service/callback anchors, traced the called success/reducer/UI paths for the disputed operations, and recursively compared the current TypeSpec response bodies with the response JSON.
- No generation, build, test, Git, HTTP, login, or write request was run. The only file created was this report.
- No compiled `openapi.json`/`openapi.yaml` or `tsp-output` artifact is present in this workspace, so this run could compare the recursive TypeSpec projection but **could not independently compare compiled OpenAPI**. No generation was performed to create one.

## Coverage and counts

Counts below describe the current frozen response JSON. Recursive paths include nested object properties and array-item properties; array/object container fields are included as paths. These are client observations, not guarantees of server presence.

| Domain | Research / response records | Kinds (object / array / unknown) | Named paths (direct / recursive) | Trace entries |
|---|---:|---:|---:|---:|
| Children, diary, files | 95 / 95 | 22 / 2 / 71 | 43 / 46 | 441 |
| Admin, shop | 79 / 79 | 24 / 3 / 52 | 104 / 159 | 355 |
| **Total scoped** | **174 / 174** | **46 / 5 / 123** | **147 / 205** | **796** |

- The 174 source function IDs are unique and match their research records exactly. In every record, the first trace function is its service function. All referenced function IDs exist in the original disassembly; every trace line falls inside the referenced function block; and every service-created fulfillment closure is included in that record’s trace. These checks establish anchor/identity integrity, not exhaustive app caller coverage for opaque records.
- The current analyses have **24 typed children observations** and **27 typed admin/shop observations**. The ten shop-enrichment operations currently contain **134 recursive field paths**.
- Recursive TypeSpec comparison found **23/24** typed children observations and **27/27** typed admin/shop observations projected with the same root kinds, property names, nested/array-item paths, and unknown/container types. `GetFolderData` (`#26143`) is intentionally not emitted as a custom route model: it shares a route with `GetDocumentsFolderData` (`#26270`) whose independently traced body remains unknown, so the canonical route uses `UnresolvedResponse` for the explicit alias conflict. It is not a basis to transfer fields between helpers.
- All generated response object declarations remain open (`Record<unknown>`) and their named properties optional. The leaf values checked in this scope remain `unknown`; no server requiredness, enums, defaults, nullability, success status, or media type is asserted.
- For broader context only: the frozen `scripts/response-coverage.json` reports 87 modeled canonical operations, 194 unknown operations, and 15 binary operations across the full 296-operation surface. This scoped review does not turn those unresolved dispositions into complete server schemas.

## Findings

### F1 — `UserCart` omits response-derived provider and product/service detail paths

`evidence/responses/admin-shop.json` currently models 8 recursive paths for `UserCart` (`#26769`), but the source-derived success path exposes additional response values to the UI.

The body boundary is exact: service `#26769` returns `response.data` (`#26770`); action `#26656` dispatches that value unchanged as `SET_USER_CART.data`; reducer `#26581` stores `action.data` directly; `MyCartScreen #40160` supplies the selected `user_cart` value directly as `FlatList.data`; and row component `#40167` passes each row unchanged as `provider` to `#40172` (original lines 1037166–1037191, 1034359–1034372, 1031962–1031967, 1620202–1620287, and 1620441–1620462).

From that unchanged row, the original UI additionally reads:

- Provider fields `[].free_delivery_from` (`#40172`, 1620911–1620912; also used by `#40175`, 1621187–1621203), `[].delivery_fee` and `[].delivery_vatrate` (`#40173`, 1621082–1621088; delivery fee also in `#40175`, 1621177–1184), and `[].sum` (`#40174`, 1621104–1621107).
- The mapped `items` rows select the response’s `product` or `service` object in `#40180` (1621331–1358); `#40178` passes the original row as `item` and the selected nested value as `details` (1621264–1290). `#40189` then reads `details.small_thumb`, `details.name`, `details.category.name`, and `details.sales_price_gross` (1621949–1951, 1622005–2007, 1622020–2023, 1622118–2120). `details.sales_price_gross` is already present in the current product/service tree; the other detail paths are not.
- The same selected response-derived `details` object is passed to `#40190` by `#40196` (1622421–2436). `#40190` reads `name`, `type`, `slug`, `category_slug`, `category.slug`, `subcategory_slug`, and `subcategories[0].slug` (1622241–2284). `name`, `category`, and `category.name` overlap the reads above; the other named parent fields are omitted. Keep `subcategories` as `unknown` with evidence of the `[0].slug` read unless stronger array/item evidence is established; do not invent a closed subcategory model.

The omitted named paths are 4 provider paths and 10 additional paths under each of `items[].product` and `items[].service` (**24 paths total**). Every primitive value remains unknown; the `category` parents are open partial objects. This does not promote UI formatting, local route params, or calculated totals to response fields.

### F2 — Product/service detail models omit observed image/link item paths

The four operations `Product #26731`, `KindergartenProduct #26733`, `Service #26735`, and `KindergartenService #26737` each currently model 13 paths, including `images` and `links` as arrays while leaving their item shapes unmodeled. The actual unchanged-response path is service `.data` → selected action handler → `SET_SELECTED_SHOP_ITEM` → reducer `#26581` → shared ItemScreen module 4149 / `#39986`; Metro registrations identify shop service/action/reducer modules 2294/2293/2292 (original lines 11585–11598, 20870–20873, 1033537–3691).

The shared UI does read item properties:

- `#39986` passes body-root `images` unchanged to `ImageThumbnails`; `#40054` maps that array and `#40056` reads each image’s `thumbs.small.url` before building the image source (1612582–1608, 1615236–1241, and 1615362–1385). Model open item/`thumbs`/`small` object layers with `url: unknown`; do not infer a URL scalar type.
- `#39986` maps body-root `links`; callback `#40030` reads each link’s `name`, and its click continuation `#40031` reads `url` (1612735–2746, 1614296–4323). Model only `links[].name` and `links[].url`, both unknown.

These are **5 omitted paths per operation** (`images[].thumbs`, `images[].thumbs.small`, `images[].thumbs.small.url`, `links[].name`, `links[].url`), **20 across the four records**. The current limitations that leave image/link members unmodeled do not account for these direct original-code reads.

### F3 — `Categories` omits fields read after filtering the response array

`Categories #26705` is currently modeled as a root array with only item `type`. Service callback `#26706` returns the HTTP body; `#26604` filters the original array by `type` and slices the same object references into product/service categories, which are dispatched to the shop reducer (original lines 1035808–5832 and 1033232–3310).

The UI later selects this response-derived `productCategories` state in `ProductsSubcategoriesScreen #39930`; `#39931/#39932` find by and directly read item `slug` (1610103–0129). The selected category’s `subcategories` value is passed directly as `FlatList.data` (1610061–0066), and `#39946` reads `type` from each subcategory item (1610458–0490). The current analysis therefore omits `[].slug`, `[].subcategories`, and `[].subcategories[].type` (**3 paths**). All leaves remain unknown; the subcategories array/item shape records observed client use only.

### F4 — `GetEmployeeMeals` traces conflate two different services

The current admin/shop record for `GetEmployeeMeals #26908` cites Foodmenu callback `#25998/#25999/#26000` and models `employees[].user_id`. That is not the caller of service `#26908`.

- Foodmenu action module `#25990` is registered as Metro module 2253 with dependency 2254; Foodmenu service module `#26004` is module 2254 and registers `getEmployeeMeals` to `#26011` (original lines 11290–11398 and 1014504–4552). That Foodmenu caller is `#25998`: it loads `getEmployeeMeals`, calls it, and attaches `#25999` (1014328–4350). `#25999` reads response-body `employees`, calls `sort` with comparator `#26000`, and `#26000` directly reads each compared item’s `user_id` (1014356–4402). The children/diary/files record `GetEmployeeMeals #26011` currently omits that observed item path and says no item property is read.
- The reports service is a separate service table: `#26906/#26907` registers `getEmployeeMeals` to `#26908` (1041153–1189). Reports action module `#26890` exports action wrapper `#26893`, whose thunk `#26894` calls the reports service and attaches success callback `#26895` (1040768–0890). `#26895` dispatches the returned body unchanged as `SET_EMPLOYEE_MEALS_REPORT.data`; reducer `#26889` stores it as `reports.employee_meals` (1040694–0759). The exact Reports screen `#40663/#40664` reads the response-derived root `employee_meals.employees` and supplies it as `FlatList.data` (1645477–5551 and 1645728–5736). Its item wrapper `#40677` forwards a row but does not itself read `user_id` (1646039–6064).

Thus the current `user_id` evidence is attached to the wrong operation. Move the comparator observation to the Foodmenu response `#26011`; replace the Reports trace for `#26908` with the Reports action/reducer/screen chain and keep item properties unknown unless an exact downstream report-row read is established. The `employees` array use is directly observed by the Reports FlatList; the current source-based service distinction must be reflected even though both services share a user-facing method name.

## Confirmed conservative handling

- `GetGuardianInvoices #25671` correctly keeps the three body-root fields `invoices`, `settings`, and `services` unknown. The response `p1.settings` read is at 1002221; line 1002202 is a captured environment value. `services` is top-level `p1.services` at 1002211. Reducer reads `invoices.current_page` and `.data` are retained in evidence without asserting an `invoices` object schema or a nested collection type.
- `GetFolderData #26143` is FolderService `#26141` under module 2267; its gallery and documents callers both invoke that helper. Its `subfolders`/`files` parents stay unknown with nested reducer-read paths in field evidence. `GetDocumentsFolderData #26270` is a separate DocumentsService registration (`#26266`); it remains unknown. The same-path alias is explicitly unresolved in `routes/generated.tsp`; no field transfer or union is appropriate.
- `DocumentsGetIndexFolders #26268` keeps root `data` distinct from `folders.data`: caller `#26237` reads actual response `p1.data` at 1021057 on the falsy-folders branch, then separately reads `p1.folders.data` at 1021059–1060 and `p1.settings` at 1021078. These container types remain unknown.
- `GetDocumentAcl #26276` stays root-kind unknown: screen callback `#39655` branches on `Array.isArray`, then reads `view`/`edit` only in its non-array branch (1598264–8295). No guessed array/object union is emitted.
- `SaveChildCalendarDays #25646` is root-array traversal through `#26408.forEach`; items remain unknown. `UploadFile #25661` has an unknown response; request multipart fields and RNFS/download-job metadata are not response fields.
- The listed mutation response reads (`published`, `active_courses`, `cards`, `access`, `min_date`, `profile_picture`, `diary`, `type`, `file`, `map`, `employees`, `data`) remain unknown-valued. No request payload or local optimistic/fallback value was found promoted as a response property in these checks.

## Complete response-record identity ledger

Every operation/service ID below occurs once in the current scoped response JSON and matches its assigned research record. `T` denotes a currently typed partial root; other records have explicit unknown dispositions. Source IDs are included to make the 174-record coverage auditable.

### Children, diary, files — 95 records

Current typed records (24):

| Operation / source ID | Current recursive paths | Current path set / observed disposition |
|---|---:|---|
| PublishMap `#25617` | 1 | `published` |
| GetChildProfile `#25634` | 1 | `active_courses` |
| GetMaps `#25638` | 1 | `cards` |
| GetChildCalendar `#25644` | 1 | `access` |
| SaveChildCalendarDays `#25646` | 0 | Root array; items unknown |
| GetAbsenceModalData `#25652` | 1 | `min_date` |
| UploadChildProfilePicture `#25654` | 1 | `profile_picture` |
| GetGuardians `#25658` | 2 | `door_card_enabled`, `guardians` |
| GetGuardianInvoices `#25671` | 3 | `invoices`, `settings`, `services` |
| GetEmployeeCourses `#25725` | 1 | Root array item `id` |
| GetDiaryData `#25935` | 17 | 15 root paths plus `statuses[].used_in_course`, `statuses[].type` |
| CreateDiary `#25937` | 1 | `diary` |
| UpdateComment `#25939` | 1 | `type` |
| UploadMedia `#25941` | 1 | `file` |
| UploadDocument `#25943` | 1 | `file` |
| UpdateEntryStatuses `#25957` | 1 | `map` |
| UpdateEntryLeaveTypes `#25979` | 1 | `map` |
| GetEmployeeMeals `#26011` | 1 | `employees` (finding F4: comparator item read omitted) |
| GalleryGetIndexFolders `#26134` | 2 | `folders`, `settings` |
| GetFolderData `#26143` | 2 | `subfolders`, `files`; canonical route suppressed by explicit alias conflict |
| GetSubfolders `#26145` | 1 | `data` |
| UpdateFolder `#26149` | 1 | `data` |
| DocumentsGetIndexFolders `#26268` | 3 | `folders`, root `data`, `settings` |
| GetSharedDocuments `#26278` | 1 | `data` |

The remaining 71 source records are all explicitly unknown:

```text
GuardianUpdateSettings#25485; Store#25487; Update#25489; Detach#25491; Delete#25493;
GetMap#25611; ApproveMap#25613; DisapproveMap#25615;
GetChild#25622; GetChildCourses#25624; GetChildCoursePlanTypes#25626; GetChildPlansList#25628;
GetGuardianDiary#25630; GetGuardianFeed#25632; UpdateChildProfile#25636; GetChildApprovals#25640;
UpdateApprovalAnswers#25642; SaveChildCalendarSingleDay#25648; GetStatusLogs#25650;
DeleteChildProfilePicture#25656; GetFiles#25660; UploadFile#25661; DeleteChildFile#25663;
UpdateChildFile#25665; AddChildDates#25667; UpdateChildDates#25669; GetGuardianInvoice#25673;
AddGuardianInvoiceService#25675; UpdateGuardianInvoiceService#25677; DeleteGuardianInvoiceService#25679;
UpdateChildGuardianFee#25681; GetEmployeeActiveCourses#25723; UpdateData#25730; EmployeeUpdateSettings#25732;
Publish#25945; UpdateDiaryFile#25947; DeleteDiaryFile#25949; DeleteDiaryFiles#25951; LikeDiary#25953;
UpdateEntryStatus#25955; UpdateEntryMeal#25959; AddEntryFeedback#25961; UpdateEntryFeedback#25963;
DeleteEntryFeedback#25965; StartTimeTracking#25967; StopTimeTracking#25969; AddTimeLog#25971;
UpdateTimeLog#25973; DeleteTimeLog#25975; UpdateEntryLeaveType#25977; GetDayMenu#26007;
GetWeekMenu#26009; GetEmployeeMealsSettings#26013; SaveEmployeeMeal#26015; DeleteGalleryFile#26136;
UpdateGalleryFile#26138; AddFolder#26147; DeleteFolder#26151; UploadFiles#26153;
GetUserTargetGroups#26155; MoveFolders#26157; MoveFiles#26159; DeleteFiles#26161;
GetBuiltinChildProfile#26163; GetBuiltinDiaryFolders#26165; GetBuiltinDiaryFiles#26167;
GetFolderFiles#26169; GetDocumentsFolderData#26270; DeleteDocument#26272; UpdateDocumentFile#26274;
GetDocumentAcl#26276
```

### Admin, shop — 79 records

Current typed records (27):

| Operation / source ID(s) | Current recursive paths | Current path set |
|---|---:|---|
| GetWorkSchedule `#26549` | 7 | `employees`, `employees[].work_schedules`, `employees[].work_schedules[].full_day`, `roles`, `lock_date`, `types`, `holidays` |
| Categories `#26705` | 1 | Root array item `type` (finding F3) |
| GetSupplierProducts `#26711`; KindergartenGetSupplierProducts `#26713`; GetSupplierServices `#26715`; KindergartenGetSupplierServices `#26717` | 1 each | Root `data` |
| CategoryProducts `#26723`; CategoryServices `#26725`; KindergartenCategoryProducts `#26727`; KindergartenCategoryServices `#26729` | 1 each | Root `data` |
| Product `#26731`; KindergartenProduct `#26733`; Service `#26735`; KindergartenService `#26737` | 13 each | Shared detail tree (finding F2) |
| ProductSearch `#26739`; KindergartenProductSearch `#26741`; ServiceSearch `#26743`; KindergartenServiceSearch `#26745` | 1 each | Root `data` |
| UserCart `#26769` | 8 | Root array/provider/item tree (finding F1) |
| UserOrders `#26779` | 9 | Root `last_page`, array `data` and observed row/supplier fields |
| GetUserOrder `#26781`; GetKindergartenOrder `#26785` | 27 each | Order detail, `rows[]`, `supplier`, `delivery` trees |
| KindergartenOrders `#26783` | 9 | Page-one SET body `data` array, rows, root `last_page` |
| Wishlist `#26793` | 2 | Root `wishlists`, `contacts` |
| CategoriesForChild `#26846` | 2 | Root `age_groups`, `categories` |
| GetEmployeeMeals `#26908` | 2 | Current `employees` + `employees[].user_id` tree (finding F4: trace is cross-wired) |
| Meals `#26910` | 1 | Root array item `name` |

The remaining 52 source records are all explicitly unknown:

```text
InsertWorkSchedule#26547; UpdateWorkSchedule#26551; DeleteWorkSchedule#26553;
GetWorkScheduleTypes#26555; AddWorkScheduleType#26557; UpdateWorkScheduleType#26559;
GetWorkScheduleSettings#26561; UpdateWorkScheduleSettings#26563;
Filters#26703; GetSuppliers#26707; GetSupplierInfo#26709;
PopularShopItems#26719; PopularKindergartenShopItems#26721;
RateProduct#26747; RateService#26749; AddProductComment#26751; AddKindergartenProductComment#26753;
GetProductComments#26755; GetKindergartenProductComments#26757; AddServiceComment#26759;
AddKindergartenServiceComment#26761; GetServiceComments#26763; GetKindergartenServiceComments#26765;
AddToCart#26767; EditCartItem#26771; RemoveFromCart#26773; StoreUserOrder#26775; CancelUserOrder#26777;
StoreKindergartenOrder#26787; CancelKindergartenOrder#26789; AddToKindergartenWishlist#26791;
RemoveFromWishlist#26795; EditWishlistItem#26797; CdmSettings#26844; GetChildGoalsFile#26848;
Evaluate#26850; StoreComment#26852; UpdateComment#26854; DestroyComment#26856;
SubmitDashboardPoll#26886; MealsPerCourse#26912; GetCoursePlanTypes#26938; GetCoursePlans#26940;
GetPlanSettings#26942; GetPlan#26944; GetCoursePlansOverView#26946; GetProjectPlans#26948;
GetProjectPlan#26950; GetYearPlan#26952; UpdateSettings#41029; GetCourseAccessCode#43832;
GenerateCourseAccessCode#43834
```

## Disposition

This is **not a clean run** and must not increment the consecutive-clean count. The findings are source-evidence omissions/misattribution, not requests for server-complete DTOs. Keep all models partial/open and all unproved leaf types unknown. This review edited only this report; it did not edit an input file, generated file, prior report, or other evidence artifact. The two final snapshot mismatches noted above are external to this review and were not overwritten.

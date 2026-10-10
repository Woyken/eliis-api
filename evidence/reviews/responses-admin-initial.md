# Admin-shop static response review — initial

## Outcome and snapshot

**The 79-operation candidate preserves uncertainty and its typed body paths are otherwise supported, but six trace omissions need correction before this response ledger is trace-complete.** No response field name or value type among the currently modeled paths is contradicted by the original source. The six findings below are missing links in known chains, not grounds to change the affected `unknown` response dispositions.

Reviewed `evidence/responses/admin-shop.json`, the matching `evidence/research/admin-shop.json`, repository `AGENTS.md`, and the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`.

* Response snapshot SHA-256: `e37d5e972f16d49c775e7a9a8286e05b502b037df7c97f9e1b2e8472473b6582`
* Original disassembly SHA-256: `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`
* Response coverage and identity: all **79/79** operation IDs match the request evidence in the same order; all **79/79** `sourceFunctionId` values match the corresponding request source ID. Each request function name and header line also matches the full disassembly.
* Trace validation: all **238** cited function IDs exist and each cited line falls inside the named function. All 79 source functions point to their correct headers, and each service function points to the response callback in its source. The callback reads Axios `response.data` and returns it in 78 cases; `GetChildGoalsFile` is the deliberate exception and returns the Axios response argument unchanged. Six known post-service trace links are still missing (F1–F6).
* Dispositions: **16 object, 2 array, 61 unknown**. The 18 object/array models contain **21 top-level and 5 nested field paths** (26 total): 23 property value types are `unknown`; 3 properties are proven arrays. No response is marked complete.
* The documented `unknown` dispositions, open models, and exclusion of request/optimistic/local wrapper data are appropriate. No HTTP requests, Git commands, builds, or tests were run; this review changes no response/research data or code. Its sole output is this report.

## Actionable findings

### F1 — work-schedule nested field reader is absent from the trace

Affected operation: **GetWorkSchedule**.

The candidate correctly models `employees` as an array, nested `work_schedules` as an array, and `full_day` as `unknown`. But its `full_day` field evidence cites `#26521`, which is not in the record's trace. `#26520` iterates `employee.work_schedules` and creates `#26521` at full-disassembly line **1029882**; `#26521` reads `entry.full_day` at **1029895** (function header **1029890**). Add that function to the trace. Keep `full_day: unknown`: its truthy branch does not prove a Boolean response value.

### F2 — supplier fulfillment callback is omitted

Affected operation: **GetSuppliers**.

The trace stops at caller `#26608`, although that function attaches success callback `#26609` at **1033339**. `#26609` (header **1033346**) forwards the resolved body as `SET_SHOP_SUPPLIERS.data` at **1033356**. Add `#26609` to record this known action handoff. This adds no body field or value-type proof; `unknown` remains correct.

### F3 — plan-type action callback is misattributed to its parent

Affected operation: **GetCoursePlanTypes**.

`#26927` creates response callback `#26928` at **1041703**. The cited dispatch lines **1041710–1041727** belong to `#26928`, not `#26927`: `#26928` selects a local action type and forwards the service result as action `data` at **1041725**. Include `#26928` in the trace (header **1041710**). Keep the response `unknown`; neither the local action-type branch nor pass-through dispatch proves a response field or type.

### F4 — course-plan fulfillment callback is omitted

Affected operation: **GetCoursePlans**.

`#26924` attaches callback `#26925` at **1041641**. `#26925` (header **1041648**) forwards its fulfillment as `SET_PLANS.data` at **1041658**. The record's prose already describes this handler, but the trace does not list it. Add `#26925`; the response remains `unknown`.

### F5 — plan-overview fulfillment callback is omitted

Affected operation: **GetCoursePlansOverView**.

`#26930` attaches callback `#26931` at **1041770**. `#26931` (header **1041777**) forwards its fulfillment as `SET_PLANS.data` at **1041787**. Add `#26931` to the trace. This proves pass-through only; keep `unknown`.

### F6 — project-plan fulfillment callback is omitted

Affected operation: **GetProjectPlans**.

`#26933` attaches callback `#26934` at **1041832**. `#26934` (header **1041839**) forwards its fulfillment as `SET_PROJECT_PLANS.data` at **1041849**. Add `#26934` to the trace. No response-body field/type follows; keep `unknown`.

## Verified typed paths and boundaries

### The 12 product/service catalog results preserve the HTTP-body `.data` nesting

For these 12 operations the service callback first returns Axios `response.data`; the actual successful caller then reads `.data` **from that returned HTTP body**. Each current model correctly keeps root `kind: object` and one `data: unknown` field. Do not flatten this property, wrap it in an additional Axios-style `data`, or infer an array from the local page/append handling.

| Operation | Service | Actual caller → success reader | HTTP-body read (full `eliis.hasm` line) |
|---|---:|---|---|
| `GetSupplierProducts` | `#26711` | `#40391` → `#40395` | `body.data` — 1632856 |
| `KindergartenGetSupplierProducts` | `#26713` | `#40391` → `#40393` | `body.data` — 1632803 |
| `GetSupplierServices` | `#26715` | `#40397` → `#40401` | `body.data` — 1633060 |
| `KindergartenGetSupplierServices` | `#26717` | `#40397` → `#40399` | `body.data` — 1633007 |
| `CategoryProducts` | `#26723` | `#40118` → `#40124` | `body.data` — 1618983 |
| `CategoryServices` | `#26725` | `#40128` → `#40139` | `body.data` — 1619439 |
| `KindergartenCategoryProducts` | `#26727` | `#40118` → `#40126` | `body.data` — 1619036 |
| `KindergartenCategoryServices` | `#26729` | `#40128` → `#40136` | `body.data` — 1619372 |
| `ProductSearch` | `#26739` | `#40118` → `#40122` | `body.data` — 1618930 |
| `KindergartenProductSearch` | `#26741` | `#40118` → `#40120` | `body.data` — 1618877 |
| `ServiceSearch` | `#26743` | `#40128` → `#40133` | `body.data` — 1619305 |
| `KindergartenServiceSearch` | `#26745` | `#40128` → `#40130` | `body.data` — 1619238 |

The success handlers either replace local results with `body.data` or pass it into local list-update logic. That is not a type assertion on the body property; its value remains `unknown` for all 12.

### Other modeled fields

* **Categories** (`#26705`) is a root array because its actual caller invokes `filter` on the result. Its item `.type` read and equality checks against the `product`/`service` literals do not prove a string type or enum. The item field is correctly `unknown`.
* **Wishlist** (`#26793`) correctly retains the body root property `wishlists: unknown`; the status branch is local/request context, not an optimistic response flag.
* **CategoriesForChild** (`#26846`) correctly retains root `age_groups: unknown` and `categories: unknown`; reducer-derived subcategories/flags are not HTTP fields.
* **GetEmployeeMeals** (`#26908`) supports root `employees: array` through sorting that value; comparator reads `employees[*].user_id`, whose type remains unknown.
* **Meals** (`#26910`) supports a root array through sorting the returned body; item `.name` comparisons do not prove its type. The Redux `{data: ...}` wrapper around the locally sorted result is correctly excluded from HTTP-body nesting.
* **GetWorkSchedule** field paths/types are conservative as noted in F1. The root `employees`, nested `work_schedules`, and `full_day` paths reflect reads/iterations in the response chain; no other employee fields or `full_day` type are inferred.
* **MealsPerCourse** stays `unknown`: `#26902` indexes the HTTP body at `[0]` and reads `children` and `meal`, but index access alone does not prove an array. Its separately composed Redux object is not body nesting. The current narrative records these reads; an empty model field list does not claim the indexed structure is complete.

No optimistic/request-derived cart, wishlist, child-development, or meal flags are included. `UserCart` also correctly stays `unknown`: downstream cart edit paths mix loaded state with request/local transformations, so they do not establish a raw response `items` shape. `UserOrders` and `KindergartenOrders` current-page branches select local state actions but do not prove an HTTP pagination wrapper or array.

### Unknown consumer coverage is bounded, not a negative whole-client result

There are **48 unknown operations with only their service and direct response callback traced**. Those entries correctly retain `unknown`, but “service-only” means consumer coverage remains open in this review; it is not evidence that no caller or property read exists elsewhere. In particular, all **29 non-GET mutation operations** have `unknown` response dispositions and actual source/callback evidence; request payloads and optimistic/local state are not used as response fields. Keep their consumer-absence language scoped to the recorded trace, and do not infer that no consumer exists.

`GetChildGoalsFile` is an especially important boundary: service `#26848` attaches `#26849`, whose return at **1039292** is its argument (the Axios response), not `response.data`. The HTTP-body boundary and binary/MIME representation are therefore unresolved; the current `unknown` disposition is appropriate.

Of the 61 unknown records, 13 have some caller/action chain in the current trace. Eight of these have a documented known chain without a shape/type proof (`Product`, `KindergartenProduct`, `Service`, `KindergartenService`, `UserCart`, `UserOrders`, `KindergartenOrders`, `MealsPerCourse`); the other five are the callback-link gaps F2–F6. No broad consumer search or server-absence claim is made here.

## Exhaustive 79-operation ledger

The field column records exactly the current response paths and value types. `—` means no modeled field, not an assertion that the server body is empty. `service+callback only; coverage open` identifies a bounded service-level trace. `consumer/action traced; body type unknown` means a caller path is shown but does not support a stronger response type.

| # | Operation | Source | Root kind | Current response field paths | Review |
|---:|---|---:|---|---|---|
| 1 | `InsertWorkSchedule` | `#26547` | unknown | — | service+callback only; coverage open |
| 2 | `GetWorkSchedule` | `#26549` | object | `employees: array`; `employees[*].work_schedules: array`; `employees[*].work_schedules[*].full_day: unknown`; `roles`, `lock_date`, `types`, `holidays: unknown` | **F1** — missing trace `#26521` |
| 3 | `UpdateWorkSchedule` | `#26551` | unknown | — | service+callback only; coverage open |
| 4 | `DeleteWorkSchedule` | `#26553` | unknown | — | service+callback only; coverage open |
| 5 | `GetWorkScheduleTypes` | `#26555` | unknown | — | service+callback only; coverage open |
| 6 | `AddWorkScheduleType` | `#26557` | unknown | — | service+callback only; coverage open |
| 7 | `UpdateWorkScheduleType` | `#26559` | unknown | — | service+callback only; coverage open |
| 8 | `GetWorkScheduleSettings` | `#26561` | unknown | — | service+callback only; coverage open |
| 9 | `UpdateWorkScheduleSettings` | `#26563` | unknown | — | service+callback only; coverage open |
| 10 | `Filters` | `#26703` | unknown | — | service+callback only; coverage open |
| 11 | `Categories` | `#26705` | array | `[*].type: unknown` | Pass — root array and item read proven |
| 12 | `GetSuppliers` | `#26707` | unknown | — | **F2** — missing trace `#26609` |
| 13 | `GetSupplierInfo` | `#26709` | unknown | — | service+callback only; coverage open |
| 14 | `GetSupplierProducts` | `#26711` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 15 | `KindergartenGetSupplierProducts` | `#26713` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 16 | `GetSupplierServices` | `#26715` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 17 | `KindergartenGetSupplierServices` | `#26717` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 18 | `PopularShopItems` | `#26719` | unknown | — | service+callback only; coverage open |
| 19 | `PopularKindergartenShopItems` | `#26721` | unknown | — | service+callback only; coverage open |
| 20 | `CategoryProducts` | `#26723` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 21 | `CategoryServices` | `#26725` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 22 | `KindergartenCategoryProducts` | `#26727` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 23 | `KindergartenCategoryServices` | `#26729` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 24 | `Product` | `#26731` | unknown | — | consumer/action traced; body type unknown |
| 25 | `KindergartenProduct` | `#26733` | unknown | — | consumer/action traced; body type unknown |
| 26 | `Service` | `#26735` | unknown | — | consumer/action traced; body type unknown |
| 27 | `KindergartenService` | `#26737` | unknown | — | consumer/action traced; body type unknown |
| 28 | `ProductSearch` | `#26739` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 29 | `KindergartenProductSearch` | `#26741` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 30 | `ServiceSearch` | `#26743` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 31 | `KindergartenServiceSearch` | `#26745` | object | `data: unknown` | Pass — nested body `.data` preserved |
| 32 | `RateProduct` | `#26747` | unknown | — | service+callback only; coverage open |
| 33 | `RateService` | `#26749` | unknown | — | service+callback only; coverage open |
| 34 | `AddProductComment` | `#26751` | unknown | — | service+callback only; coverage open |
| 35 | `AddKindergartenProductComment` | `#26753` | unknown | — | service+callback only; coverage open |
| 36 | `GetProductComments` | `#26755` | unknown | — | service+callback only; coverage open |
| 37 | `GetKindergartenProductComments` | `#26757` | unknown | — | service+callback only; coverage open |
| 38 | `AddServiceComment` | `#26759` | unknown | — | service+callback only; coverage open |
| 39 | `AddKindergartenServiceComment` | `#26761` | unknown | — | service+callback only; coverage open |
| 40 | `GetServiceComments` | `#26763` | unknown | — | service+callback only; coverage open |
| 41 | `GetKindergartenServiceComments` | `#26765` | unknown | — | service+callback only; coverage open |
| 42 | `AddToCart` | `#26767` | unknown | — | service+callback only; coverage open |
| 43 | `UserCart` | `#26769` | unknown | — | consumer/action traced; body type unknown |
| 44 | `EditCartItem` | `#26771` | unknown | — | service+callback only; coverage open |
| 45 | `RemoveFromCart` | `#26773` | unknown | — | service+callback only; coverage open |
| 46 | `StoreUserOrder` | `#26775` | unknown | — | service+callback only; coverage open |
| 47 | `CancelUserOrder` | `#26777` | unknown | — | service+callback only; coverage open |
| 48 | `UserOrders` | `#26779` | unknown | — | consumer/action traced; body type unknown |
| 49 | `GetUserOrder` | `#26781` | unknown | — | service+callback only; coverage open |
| 50 | `KindergartenOrders` | `#26783` | unknown | — | consumer/action traced; body type unknown |
| 51 | `GetKindergartenOrder` | `#26785` | unknown | — | service+callback only; coverage open |
| 52 | `StoreKindergartenOrder` | `#26787` | unknown | — | service+callback only; coverage open |
| 53 | `CancelKindergartenOrder` | `#26789` | unknown | — | service+callback only; coverage open |
| 54 | `AddToKindergartenWishlist` | `#26791` | unknown | — | service+callback only; coverage open |
| 55 | `Wishlist` | `#26793` | object | `wishlists: unknown` | Pass — request status/optimistic state excluded |
| 56 | `RemoveFromWishlist` | `#26795` | unknown | — | service+callback only; coverage open |
| 57 | `EditWishlistItem` | `#26797` | unknown | — | service+callback only; coverage open |
| 58 | `CdmSettings` | `#26844` | unknown | — | service+callback only; coverage open |
| 59 | `CategoriesForChild` | `#26846` | object | `age_groups: unknown`; `categories: unknown` | Pass — body properties; derived state excluded |
| 60 | `GetChildGoalsFile` | `#26848` | unknown | — | Pass — callback returns Axios wrapper; body boundary unresolved |
| 61 | `Evaluate` | `#26850` | unknown | — | service+callback only; coverage open |
| 62 | `StoreComment` | `#26852` | unknown | — | service+callback only; coverage open |
| 63 | `UpdateComment` | `#26854` | unknown | — | service+callback only; coverage open |
| 64 | `DestroyComment` | `#26856` | unknown | — | service+callback only; coverage open |
| 65 | `SubmitDashboardPoll` | `#26886` | unknown | — | service+callback only; coverage open |
| 66 | `GetEmployeeMeals` | `#26908` | object | `employees: array`; `employees[*].user_id: unknown` | Pass — array use/field read proven |
| 67 | `Meals` | `#26910` | array | `[*].name: unknown` | Pass — root array proven; no local action wrapper |
| 68 | `MealsPerCourse` | `#26912` | unknown | — | consumer/action traced; indexed body reads do not prove root array |
| 69 | `GetCoursePlanTypes` | `#26938` | unknown | — | **F3** — missing trace `#26928` |
| 70 | `GetCoursePlans` | `#26940` | unknown | — | **F4** — missing trace `#26925` |
| 71 | `GetPlanSettings` | `#26942` | unknown | — | service+callback only; coverage open |
| 72 | `GetPlan` | `#26944` | unknown | — | service+callback only; coverage open |
| 73 | `GetCoursePlansOverView` | `#26946` | unknown | — | **F5** — missing trace `#26931` |
| 74 | `GetProjectPlans` | `#26948` | unknown | — | **F6** — missing trace `#26934` |
| 75 | `GetProjectPlan` | `#26950` | unknown | — | service+callback only; coverage open |
| 76 | `GetYearPlan` | `#26952` | unknown | — | service+callback only; coverage open |
| 77 | `UpdateSettings` | `#41029` | unknown | — | service+callback only; coverage open |
| 78 | `GetCourseAccessCode` | `#43832` | unknown | — | service+callback only; coverage open |
| 79 | `GenerateCourseAccessCode` | `#43834` | unknown | — | service+callback only; coverage open |

No changes to `evidence/responses/admin-shop.json`, `evidence/research/admin-shop.json`, or other project data/code were made by this review.

# Admin/shop independent evidence review — round 1

## Outcome

**No blocking HTTP request or schema findings.** All 79 indexed operation functions are represented exactly once, and all 79 methods, URL paths, dynamic argument mappings, request-data/config distinctions, and locally constructed request fields match the bytecode. There is **one concrete, nonblocking evidence-text correction** below. Unknown response shapes are an intentional, appropriate limit, not a defect.

Reviewed `AGENTS.md`, `evidence/research/admin-shop.json`, and the local `admin-shop.hasm` and `admin-shop-index.json` under `/data/data/com.termux/files/home/eliis-analysis/domain-source/`. Used the full `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` to independently verify the extracted instructions and all response callbacks. No network requests, login, writes to the API, or private-record access were performed. Only this review report was created; research and implementation files were not edited.

## Concrete mismatch

### AS-R1-01 — GetChildGoalsFile callback evidence incorrectly claims `.data`

- Location: `evidence/research/admin-shop.json:2078`, `GetChildGoalsFile.response.evidence`.
- Operation function: **#26848 `getChildGoalsFile`**, bytecode base `0x0060ddf6`.
- At relative offset **`0x4a`**, the operation creates callback **#26849**; at **`0x4f`**, it attaches that callback with `.then`.
- Callback **#26849**, base **`0x003351fd`**, has only `LoadParam r0, 1` at **`0x00`** and `Ret r0` at **`0x03`** (full disassembly lines 1039287–1039292). It returns the whole Axios response unchanged; it does not read `.data`.
- Current assertion: “The attached then callback returns response.data; completeness and shape are not established.”
- Correction: “The attached then callback returns the Axios response unchanged; the HTTP response body shape and completeness are not established.” Keep `response.kind: "unknown"`; do not invent a response schema.
- Severity: **nonblocking evidence-text error**, not an endpoint, request, or unknown-response-model defect.

No other concrete mismatches found.

## Independent validation counts

| Check | Result |
| --- | --- |
| Research records / unique operation IDs | 79 / 79 |
| Domain index operation functions / unique source IDs | 79 / 79 |
| Domain disassembly operation listings inspected | 79 / 79 |
| Missing indexed operations / extra source IDs / duplicate source IDs | 0 / 0 / 0 |
| Function ID, function name, and source-line metadata matched to index | 79 / 79 |
| Domain instruction sequences matched to full disassembly | 79 / 79 |
| HTTP methods, literal path fragments, and dynamic argument order checked | 79 / 79 |
| Path parameter entries checked | 100 / 100 |
| Named query field entries checked | 20 / 20 |
| Operations with unresolved query passthrough checked | 29 / 29 |
| Request bodies checked | 25 / 25: 18 forwarded unknown, 7 locally constructed complete objects |
| Locally constructed body field entries checked | 7 / 7 |
| Null body entries checked | 54 / 54 |
| DELETE operations checked for Axios config semantics | 4 / 4 |
| Response callbacks checked in full disassembly | 79 / 79: 78 return `.data`, 1 returns the response unchanged |
| Accurate callback evidence text | 78 / 79; AS-R1-01 above |
| Unknown response models retained appropriately | 79 / 79 |

Method distribution: **50 GET, 16 POST, 9 PUT, 4 DELETE**. Domain distribution: **48 Shop, 9 WorkSchedules, 8 Plans, 7 ChildDevelopment, 3 Reports, 2 CourseAccessCodes, 1 Polls, 1 OrganizationOfficials**.

All 100 path entries use transport `string`, not asserted server domain types. All 20 named query entries and all 7 body field entries use `unknown`; there are no invented primitive types, constants, enums, response statuses, pagination/error wrappers, or complete response schemas in this research file.

## Review checklist

- [x] Traced actual Axios method lookup and call argument registers, rather than relying on the string index.
- [x] Reconstructed all literal URL segments and dynamic values in concatenation order, including generic `Call` register-stack arguments.
- [x] Matched every path placeholder to its source parameter or extracted property.
- [x] Followed both supplier price/filter URL branches and all search serialization branches.
- [x] Distinguished direct caller params passthrough, locally constructed params objects, and request data.
- [x] Checked named query/body fields for unsupported extras and omitted fields in complete local object construction.
- [x] Checked field types, conditional behavior, constants, and body completeness against actual construction.
- [x] Checked DELETE config semantics: only work-schedule deletion passes `{params: p2}`; no DELETE here passes request data.
- [x] Verified shop cart/order/wishlist forwarded payloads and locally wrapped rating/comment/reason payloads.
- [x] Verified organization/official path ordering and third-argument PUT data.
- [x] Verified the literal `course-children/access-code` segment, GET params, and POST data.
- [x] Verified plans `type`/`year` filters and report params without inferring server validation or caller-object fields.
- [x] Checked all 79 callback bodies while retaining honest unknown response shapes.
- [x] Preserved main-client cookie authentication; did not substitute Bearer authentication or assert public access from endpoint names. The shared client exports the request-intercepted default instance (#5603 `0x153`–`0x189`, `0x1e0`); its request interceptor #5612 joins saved cookie/language components and assigns `headers.cookie` at `0x9e`.
- [x] Kept the review restricted to evidence discrepancies, not preferences or refactors.

## Detailed branch and payload checks

### Supplier lists: #26711, #26713, #26715, #26717

For #26711/#26715, `p1` is the supplier and `p2` the options object. `p2.price` is tested at `0x17`/`0x2a`; the false branch stringifies `p2.filters` at `0x33` and builds `?filters=` at `0x47`–`0x4b`. The true branch stringifies price at `0x5a` and filters at `0x70`, then concatenates `?price=…&filters=…` at `0x80`–`0x8f`. `p2.query` becomes `config.params` at `0x95`–`0x9b`, passed to GET at `0x9f`.

For #26713/#26717, `p1` is kindergarten, `p2` supplier, `p3` options. The price truthiness branch is at `0x2d`; the false branch stringifies filters at `0x36`, then builds the URL at `0x46`–`0x58`. The true branch stringifies price at `0x64` and filters at `0x7a`, then builds the URL at `0x8a`–`0xa0`. The generic concat `Call` uses kindergarten before supplier in both branches. `p3.query` is assigned to `config.params` at `0xa6`–`0xac`; GET is at `0xb0`.

The records correctly describe filters in both branches, optional price only in the truthy-price branch, `JSON.stringify` encoding, and additional unresolved `query` passthrough. These branches change only the query string, not the operation path, so separate operation records are unnecessary.

### Search: #26739, #26741, #26743, #26745

Options are `p1` for unscoped searches and `p2` for kindergarten searches. All four functions test filters at `0x09` and price at `0x30`, stringify their respective truthy values at `0x1f`/`0x46`, and write back at `0x24`/`0x4b`. The entire mutated caller object becomes `config.params`. Falsy properties are not deleted or forcibly serialized. The evidence and notes correctly limit serialization to truthy values, and leave the rest of the params shape unresolved.

### Shop request objects and forwarded payloads

- #26747/#26749: one complete local body `{rating: p2}`, created at `0x30`, property written at `0x35`, POST at `0x3a`.
- #26751/#26759: one complete local body `{comment: p2}`, created at `0x30`, property written at `0x35`, POST at `0x3a`.
- #26753/#26761: one complete local body `{comment: p3}`, created at `0x35`, property written at `0x3a`, POST at `0x3f`.
- #26789: one complete local body `{reason: p3}`, created at `0x34`, property written at `0x39`, PUT at `0x3e`.
- #26767/#26775 forward `p1` unchanged as POST data; #26771/#26777 forward `p2` unchanged as PUT data; #26787/#26791 forward `p2` unchanged as POST data; #26797 forwards `p3` unchanged as PUT data. No named request fields are constructed by those operation functions. Their unknown/incomplete bodies are correct, not omitted complete local schemas.

There are no extra fields or omitted locally constructed body fields in these operations. Unconstrained argument values do not prove string/numeric rating/comment/reason types or server requiredness.

### DELETE and work-schedule special cases

#26551 reads `p2.id` at `0x15`, inserts that value after `/work-schedule/`, and passes the original `p2` as PUT data at `0x39`. #26553 reads `p2.id` at `0x14`, constructs the URL at `0x31`, places the original `p2` in `{params: p2}` at `0x38`–`0x3a`, and calls DELETE with URL/config at `0x3e`. The DELETE body is correctly null; passthrough query shape is correctly unresolved. #26773, #26795, and #26856 call DELETE with URL only, at `0x2f`, `0x34`, and `0x34` respectively.

### Plans, reports, officials, and access code

- #26938: path uses `p1`, then `p2`; only `{type: p3}` is locally constructed under params (`0x35`–`0x3e`), GET `0x42`.
- #26940: path uses `p1`, then `p2`; params are exactly `{type: p3, year: p4}` (`0x35`–`0x46`), GET `0x4a`.
- #26946: path uses `p1`, then `p2`, then `/overview`; params are exactly `{type: p3}` (`0x36`–`0x3f`), GET `0x43`.
- #26942/#26944: `p2` is the unchanged params object, not a locally constructed filter schema. #26948/#26950/#26952 pass URL only.
- #26908/#26910/#26912: `p1` is kindergarten; the literal report suffixes are `employee-meals`, `todaysmeals`, and `todaysmeals-per-course`. Each puts unchanged `p2` in config.params at `0x34`, GET `0x38`. No filter fields are locally constructed.
- #41029: `/api/organizations/` + `p1` + `/officials/` + `p2` + `/settings` is built at `0x1f`–`0x31`; `p3` is PUT data (`0x35`–`0x38`), not query or an inferred settings-field model.
- #43832/#43834: kindergarten is `p1`; the suffix is exactly `/course-children/access-code`. #43832 wraps unchanged `p2` in config.params at `0x34`, GET `0x38`. #43834 forwards unchanged `p2` as POST data at `0x33`. There is no course-ID path segment or reversed `children-course` segment.
- #26846 defaults omitted or explicitly undefined third argument to a new empty params object (`0x04`–`0x1a`), otherwise forwards it. The existing evidence documents the omitted-argument case correctly; no additional named query fields are constructed.

## Per-operation validation ledger

Each row means method, complete literal path, ordered dynamic arguments, query/body construction, types/conditionality, and Axios call semantics were checked against instructions. Offsets are **relative to the operation function**. `pN` means parameter N excluding `this`; “path args” lists values in URL order. `params pN` means Axios config `{params: pN}`, not a request body. A dash means no data/config argument. All rows pass request validation; the response-evidence exception is marked separately.

| Function | Operation | Method / call offset | Path args | Data/config |
| --- | --- | --- | --- | --- |
| 26547 | InsertWorkSchedule | POST `0x33` | p1 | data p2 |
| 26549 | GetWorkSchedule | GET `0x38` | p1 | params p2 |
| 26551 | UpdateWorkSchedule | PUT `0x39` | p1, p2.id | data p2 |
| 26553 | DeleteWorkSchedule | DELETE `0x3e` | p1, p2.id | params p2 |
| 26555 | GetWorkScheduleTypes | GET `0x2f` | p1 | — |
| 26557 | AddWorkScheduleType | POST `0x33` | p1 | data p2 |
| 26559 | UpdateWorkScheduleType | PUT `0x37` | p1, p2 | data p3 |
| 26561 | GetWorkScheduleSettings | GET `0x2f` | p1 | — |
| 26563 | UpdateWorkScheduleSettings | POST `0x33` | p1 | data p2 |
| 26703 | Filters | GET `0x15` | — | — |
| 26705 | Categories | GET `0x15` | — | — |
| 26707 | GetSuppliers | GET `0x15` | — | — |
| 26709 | GetSupplierInfo | GET `0x2a` | p1 | — |
| 26711 | GetSupplierProducts | GET `0x9f` | p1 | URL filters/price; params p2.query |
| 26713 | KindergartenGetSupplierProducts | GET `0xb0` | p1, p2 | URL filters/price; params p3.query |
| 26715 | GetSupplierServices | GET `0x9f` | p1 | URL filters/price; params p2.query |
| 26717 | KindergartenGetSupplierServices | GET `0xb0` | p1, p2 | URL filters/price; params p3.query |
| 26719 | PopularShopItems | GET `0x15` | — | — |
| 26721 | PopularKindergartenShopItems | GET `0x2f` | p1 | — |
| 26723 | CategoryProducts | GET `0x38` | p1 | params p2 |
| 26725 | CategoryServices | GET `0x38` | p1 | params p2 |
| 26727 | KindergartenCategoryProducts | GET `0x3d` | p1, p2 | params p3 |
| 26729 | KindergartenCategoryServices | GET `0x3d` | p1, p2 | params p3 |
| 26731 | Product | GET `0x2f` | p1 | — |
| 26733 | KindergartenProduct | GET `0x34` | p1, p2 | — |
| 26735 | Service | GET `0x2f` | p1 | — |
| 26737 | KindergartenService | GET `0x34` | p1, p2 | — |
| 26739 | ProductSearch | GET `0x6c` | — | mutated params p1 |
| 26741 | KindergartenProductSearch | GET `0x86` | p1 | mutated params p2 |
| 26743 | ServiceSearch | GET `0x6c` | — | mutated params p1 |
| 26745 | KindergartenServiceSearch | GET `0x86` | p1 | mutated params p2 |
| 26747 | RateProduct | POST `0x3a` | p1 | data {rating: p2} |
| 26749 | RateService | POST `0x3a` | p1 | data {rating: p2} |
| 26751 | AddProductComment | POST `0x3a` | p1 | data {comment: p2} |
| 26753 | AddKindergartenProductComment | POST `0x3f` | p1, p2 | data {comment: p3} |
| 26755 | GetProductComments | GET `0x38` | p1 | params p2 |
| 26757 | GetKindergartenProductComments | GET `0x3d` | p1, p2 | params p3 |
| 26759 | AddServiceComment | POST `0x3a` | p1 | data {comment: p2} |
| 26761 | AddKindergartenServiceComment | POST `0x3f` | p1, p2 | data {comment: p3} |
| 26763 | GetServiceComments | GET `0x38` | p1 | params p2 |
| 26765 | GetKindergartenServiceComments | GET `0x3d` | p1, p2 | params p3 |
| 26767 | AddToCart | POST `0x19` | — | data p1 |
| 26769 | UserCart | GET `0x15` | — | — |
| 26771 | EditCartItem | PUT `0x33` | p1 | data p2 |
| 26773 | RemoveFromCart | DELETE `0x2f` | p1 | — |
| 26775 | StoreUserOrder | POST `0x19` | — | data p1 |
| 26777 | CancelUserOrder | PUT `0x2e` | p1 | data p2 |
| 26779 | UserOrders | GET `0x1e` | — | params p1 |
| 26781 | GetUserOrder | GET `0x2a` | p1 | — |
| 26783 | KindergartenOrders | GET `0x38` | p1 | params p2 |
| 26785 | GetKindergartenOrder | GET `0x33` | p1, p2 | — |
| 26787 | StoreKindergartenOrder | POST `0x33` | p1 | data p2 |
| 26789 | CancelKindergartenOrder | PUT `0x3e` | p1, p2 | data {reason: p3} |
| 26791 | AddToKindergartenWishlist | POST `0x33` | p1 | data p2 |
| 26793 | Wishlist | GET `0x38` | p1 | params p2 |
| 26795 | RemoveFromWishlist | DELETE `0x34` | p1, p2 | — |
| 26797 | EditWishlistItem | PUT `0x38` | p1, p2 | data p3 |
| 26844 | CdmSettings | GET `0x2f` | p1 | — |
| 26846 | CategoriesForChild | GET `0x58` | p1, p2 | params third argument, defaults {} |
| 26848 | GetChildGoalsFile | GET `0x3d` | p1, p2 | params p3; response text AS-R1-01 |
| 26850 | Evaluate | PUT `0x38` | p1, p2 | data p3 |
| 26852 | StoreComment | POST `0x38` | p1, p2 | data p3 |
| 26854 | UpdateComment | PUT `0x38` | p1, p2 | data p3 |
| 26856 | DestroyComment | DELETE `0x34` | p1, p2 | — |
| 26886 | SubmitDashboardPoll | POST `0x38` | p1, p2 | data p3 |
| 26908 | GetEmployeeMeals | GET `0x38` | p1 | params p2 |
| 26910 | Meals | GET `0x38` | p1 | params p2 |
| 26912 | MealsPerCourse | GET `0x38` | p1 | params p2 |
| 26938 | GetCoursePlanTypes | GET `0x42` | p1, p2 | params {type: p3} |
| 26940 | GetCoursePlans | GET `0x4a` | p1, p2 | params {type: p3, year: p4} |
| 26942 | GetPlanSettings | GET `0x38` | p1 | params p2 |
| 26944 | GetPlan | GET `0x38` | p1 | params p2 |
| 26946 | GetCoursePlansOverView | GET `0x43` | p1, p2 | params {type: p3} |
| 26948 | GetProjectPlans | GET `0x33` | p1, p2 | — |
| 26950 | GetProjectPlan | GET `0x34` | p1, p2 | — |
| 26952 | GetYearPlan | GET `0x34` | p1, p2 | — |
| 41029 | UpdateSettings | PUT `0x38` | p1, p2 | data p3 |
| 43832 | GetCourseAccessCode | GET `0x38` | p1 | params p2 |
| 43834 | GenerateCourseAccessCode | POST `0x33` | p1 | data p2 |

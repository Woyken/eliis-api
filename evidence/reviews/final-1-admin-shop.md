# Final review run 1 — admin/shop

**Result: CLEAN — 0 concrete findings. Complete 79/79-record pass.**

This is the admin/shop portion of run 1, not a claim that the repository has already met the two-consecutive-complete-clean-review gate. No specification, research, generated output, or other review file was edited. No generate/build/test-fixture compilation, Git operation, HTTP request, login, or private/write request was performed.

## Frozen inputs and independent evidence

- Read `AGENTS.md` and `evidence/reviews/final-input-snapshot.json`. `/tmp/opencode/eliis-review-snapshot.py` reported the requested digest `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`, with **0 changed input files**, at the beginning and end of the review.
- Primary authority: `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. Original SHA-256: `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.
- Compared all 79 indexed helper instruction sequences against `domain-source/admin-shop.hasm`: **79 exact instruction-sequence matches** to the original, not merely matching string-index entries. Domain block SHA-256: `7a75aa6772c2e31f5c835088d26f5ccdee4717eaa5818fb596781d4874e26cdd`.
- Compared `evidence/research/admin-shop.json` with `scripts/operation-catalog.json`, `models/generated.tsp`, `routes/generated.tsp`, `main.tsp`, and the existing normalized `tsp-output/@typespec/openapi3/openapi.json`. Compiled JSON SHA-256, unchanged across the compiled-output checks: `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`.
- Used the original constructors/action thunks/module registration and method installation for added cart/order fields. Existing research/enrichment notes were locators, not substitutes for original register/call/branch evidence.
- Read the query-rendering/normalization logic and encoding/canonical-path fixtures; did not execute their build-producing fixture test.

## Counted coverage

Counts are field occurrences, not unique field spellings. Recursive counts include parent fields. Unknown forwarded data has zero *named* fields, not a claim that it has no actual properties.

| Checked surface | Direct | Recursive |
| --- | ---: | ---: |
| Operation records / source helpers | 79 | 79 |
| Path parameters | 100 | 100 |
| Named query fields | 20 | 20 |
| Body fields in research / published request models | 39 | 39 |
| Extra branch-scoped variant `fields` metadata | 1 | 6 |

- **10 request models, 39 API model properties**, all checked against traced construction; no extra or missing proved properties. All 39 field value types are `unknown`; emitted schema properties impose no guessed type, enum, default, const, or nullability. Open `Record<unknown>` remainder and optional schema properties preserve unknown server validation.
- **4 client-request variants**, with **51 `provenFieldPaths` occurrences**: cart 4; non-wishlist order 14; mapped wishlist order 19; falsy-collection wishlist order 14. Of these, **5 leaf paths** occur only in the mapped wishlist variant. The extra metadata tree is `items` plus its 5 leaves (1 direct / 6 recursive); it is not an additional unconditional request schema.
- Cart/order enrichment accounts for **32 direct/recursive body-field occurrences** across 3 operations. The remaining 7 fields are the 2 rating wrappers, 4 comment wrappers, and kindergarten cancellation reason wrapper.
- All **79 response callbacks** checked in original bytecode: 78 return `.data`; `#26849` returns the original Axios response unchanged. All 79 published operations retain only `default` / `*/*` / unconstrained `{}` response schema.
- All 79 original records are preserved in compiled `x-evidence`, and original operation names in `x-operation-aliases`; all query/body/variant metadata is retained. Every emitted parameter was checked in order, including its evidence and transport type.

## Complete operation ledger

All rows passed checks of verb, complete URL, ordered dynamic arguments, Axios data/config placement, named fields/types, client presence, response evidence, and TSP/normalized OpenAPI projection. `pN` means explicit helper parameter N (excluding `this`), not a wire key. URL shorthand: `K=/api/kindergartens/p1`, `S=/api/shop`; these replace only those exact prefixes. `Q=pN` means Axios second argument `{params:pN}`; `B=pN` means data argument pN; `—` means neither data nor params supplied. `QF` and `QS` are the fully checked supplier-list and search branches described below. `B/Q` column counts are body/query named fields; body direct and recursive counts are equal in every row.

| Operation | Original helper | Verb / URL | Axios body or params | B/Q |
| --- | ---: | --- | --- | ---: |
| InsertWorkSchedule | 26547 | POST `K/work-schedule` | B=p2 | 0/0 |
| GetWorkSchedule | 26549 | GET `K/work-schedule` | Q=p2 | 0/0 |
| UpdateWorkSchedule | 26551 | PUT `K/work-schedule/p2.id` | B=p2 | 0/0 |
| DeleteWorkSchedule | 26553 | DELETE `K/work-schedule/p2.id` | Q=p2; no body | 0/0 |
| GetWorkScheduleTypes | 26555 | GET `K/work-schedule/types` | — | 0/0 |
| AddWorkScheduleType | 26557 | POST `K/work-schedule/types` | B=p2 | 0/0 |
| UpdateWorkScheduleType | 26559 | PUT `K/work-schedule/types/p2` | B=p3 | 0/0 |
| GetWorkScheduleSettings | 26561 | GET `K/work-schedule/settings` | — | 0/0 |
| UpdateWorkScheduleSettings | 26563 | POST `K/work-schedule/settings` | B=p2 | 0/0 |
| Filters | 26703 | GET `S/filters` | — | 0/0 |
| Categories | 26705 | GET `S/categories` | — | 0/0 |
| GetSuppliers | 26707 | GET `S/suppliers` | — | 0/0 |
| GetSupplierInfo | 26709 | GET `S/suppliers/p1` | — | 0/0 |
| GetSupplierProducts | 26711 | GET `S/suppliers/p1/products` | QF=p2; Q=p2.query | 0/2 |
| KindergartenGetSupplierProducts | 26713 | GET `K/shop/suppliers/p2/products` | QF=p3; Q=p3.query | 0/2 |
| GetSupplierServices | 26715 | GET `S/suppliers/p1/services` | QF=p2; Q=p2.query | 0/2 |
| KindergartenGetSupplierServices | 26717 | GET `K/shop/suppliers/p2/services` | QF=p3; Q=p3.query | 0/2 |
| PopularShopItems | 26719 | GET `S/popular` | — | 0/0 |
| PopularKindergartenShopItems | 26721 | GET `K/shop/popular` | — | 0/0 |
| CategoryProducts | 26723 | GET `S/categories/p1/products` | Q=p2 | 0/0 |
| CategoryServices | 26725 | GET `S/categories/p1/services` | Q=p2 | 0/0 |
| KindergartenCategoryProducts | 26727 | GET `K/shop/categories/p2/products` | Q=p3 | 0/0 |
| KindergartenCategoryServices | 26729 | GET `K/shop/categories/p2/services` | Q=p3 | 0/0 |
| Product | 26731 | GET `S/products/p1/show` | — | 0/0 |
| KindergartenProduct | 26733 | GET `K/shop/products/p2/show` | — | 0/0 |
| Service | 26735 | GET `S/services/p1/show` | — | 0/0 |
| KindergartenService | 26737 | GET `K/shop/services/p2/show` | — | 0/0 |
| ProductSearch | 26739 | GET `S/products/search` | QS=p1; Q=p1 | 0/2 |
| KindergartenProductSearch | 26741 | GET `K/shop/products/search` | QS=p2; Q=p2 | 0/2 |
| ServiceSearch | 26743 | GET `S/services/search` | QS=p1; Q=p1 | 0/2 |
| KindergartenServiceSearch | 26745 | GET `K/shop/services/search` | QS=p2; Q=p2 | 0/2 |
| RateProduct | 26747 | POST `S/products/p1/rate` | B={rating:p2} | 1/0 |
| RateService | 26749 | POST `S/services/p1/rate` | B={rating:p2} | 1/0 |
| AddProductComment | 26751 | POST `S/products/p1/comment` | B={comment:p2} | 1/0 |
| AddKindergartenProductComment | 26753 | POST `K/shop/products/p2/comment` | B={comment:p3} | 1/0 |
| GetProductComments | 26755 | GET `S/products/p1/comments` | Q=p2 | 0/0 |
| GetKindergartenProductComments | 26757 | GET `K/shop/products/p2/comments` | Q=p3 | 0/0 |
| AddServiceComment | 26759 | POST `S/services/p1/comment` | B={comment:p2} | 1/0 |
| AddKindergartenServiceComment | 26761 | POST `K/shop/services/p2/comment` | B={comment:p3} | 1/0 |
| GetServiceComments | 26763 | GET `S/services/p1/comments` | Q=p2 | 0/0 |
| GetKindergartenServiceComments | 26765 | GET `K/shop/services/p2/comments` | Q=p3 | 0/0 |
| AddToCart | 26767 | POST `S/cart` | B=p1; verified caller variant | 4/0 |
| UserCart | 26769 | GET `S/cart` | — | 0/0 |
| EditCartItem | 26771 | PUT `S/cart/p1/update` | B=p2 | 0/0 |
| RemoveFromCart | 26773 | DELETE `S/cart/p1/delete` | — | 0/0 |
| StoreUserOrder | 26775 | POST `S/orders` | B=p1; non-wishlist variant | 14/0 |
| CancelUserOrder | 26777 | PUT `S/orders/p1` | B=p2; no invented reason wrapper | 0/0 |
| UserOrders | 26779 | GET `S/orders` | Q=p1 | 0/0 |
| GetUserOrder | 26781 | GET `S/orders/p1` | — | 0/0 |
| KindergartenOrders | 26783 | GET `K/shop/orders` | Q=p2 | 0/0 |
| GetKindergartenOrder | 26785 | GET `K/shop/orders/p2` | — | 0/0 |
| StoreKindergartenOrder | 26787 | POST `K/shop/orders` | B=p2; two wishlist variants | 14/0 |
| CancelKindergartenOrder | 26789 | PUT `K/shop/orders/p2` | B={reason:p3} | 1/0 |
| AddToKindergartenWishlist | 26791 | POST `K/shop/kindergarten-wishlist` | B=p2 | 0/0 |
| Wishlist | 26793 | GET `K/shop/wishlist` | Q=p2 | 0/0 |
| RemoveFromWishlist | 26795 | DELETE `K/shop/wishlist/p2/delete` | — | 0/0 |
| EditWishlistItem | 26797 | PUT `K/shop/wishlist/p2/update` | B=p3 | 0/0 |
| CdmSettings | 26844 | GET `K/child-dev/settings` | — | 0/0 |
| CategoriesForChild | 26846 | GET `K/child-dev/p2/categories` | Q=argument 3; absent/undefined → {} | 0/0 |
| GetChildGoalsFile | 26848 | GET `K/child-dev/p2/print` | Q=p3; whole AxiosResponse callback | 0/0 |
| Evaluate | 26850 | PUT `K/child-dev/p2/evaluate` | B=p3 | 0/0 |
| StoreComment | 26852 | POST `K/child-dev/p2/comments/store` | B=p3 | 0/0 |
| UpdateComment | 26854 | PUT `K/child-dev/comments/p2/update` | B=p3 | 0/0 |
| DestroyComment | 26856 | DELETE `K/child-dev/comments/p2/destroy` | — | 0/0 |
| SubmitDashboardPoll | 26886 | POST `K/polls/p2/dashboard` | B=p3 | 0/0 |
| GetEmployeeMeals | 26908 | GET `K/reports/employee-meals` | Q=p2 | 0/0 |
| Meals | 26910 | GET `K/reports/todaysmeals` | Q=p2 | 0/0 |
| MealsPerCourse | 26912 | GET `K/reports/todaysmeals-per-course` | Q=p2 | 0/0 |
| GetCoursePlanTypes | 26938 | GET `K/plans/types/p2` | Q={type:p3} | 0/1 |
| GetCoursePlans | 26940 | GET `K/plans/course/p2` | Q={type:p3,year:p4} | 0/2 |
| GetPlanSettings | 26942 | GET `K/plans/settings` | Q=p2 | 0/0 |
| GetPlan | 26944 | GET `K/plans/show` | Q=p2 | 0/0 |
| GetCoursePlansOverView | 26946 | GET `K/plans/course/p2/overview` | Q={type:p3} | 0/1 |
| GetProjectPlans | 26948 | GET `K/plans/project/p2` | — | 0/0 |
| GetProjectPlan | 26950 | GET `K/plans/project/p2/show` | — | 0/0 |
| GetYearPlan | 26952 | GET `K/plans/year/p2/show` | — | 0/0 |
| UpdateSettings | 41029 | PUT `/api/organizations/p1/officials/p2/settings` | B=p3 | 0/0 |
| GetCourseAccessCode | 43832 | GET `K/course-children/access-code` | Q=p2 | 0/0 |
| GenerateCourseAccessCode | 43834 | POST `K/course-children/access-code` | B=p2 | 0/0 |

## Added-field and nested-variant trace ledger

### Cart: 4 model fields, one variant

Original `#40014` at full-source line 1613825 builds fresh r3. Module `#0 +0x1fb99–0x1fbac` registers M4149, dependency 26=M2293. `#40014 +0x55–0x69` imports that dependency and calls `addItemToCart(r3)`. `#0 +0x1171d–0x11730` registers M2293 with dependency 1=M2294; `#26601 +0x1b8–0x1c9` stores it in slot 0, and `+0x3c6–0x3cb` exports `#26652`. `#26652/#26653` preserve data into installed `#26767` (`#26701 +0x2fd–0x30a`); final Axios POST data is p1 at `#26767 +0x19`.

| Field | Original construction | Checked type/presence/value |
| --- | --- | --- |
| qty | `#40014 +0x05–0x09`, captured slot 24 → r3.qty | unknown; assigned |
| course_period_id | `+0x0e–0x10`, null → r3.course_period_id | unknown; observed final null, not nullability/default |
| product_id | `+0x22` strict equality to `product` jumps to `+0x37`; item.id → r3.product_id at `+0x3b–0x40` | unknown; conditional |
| service_id | inequality falls through; item.id → r3.service_id at `+0x2a–0x2f`; jump to join `+0x46` | unknown; conditional |

Exactly one identifier is built per local branch. All four fields remain optional in the open server-unknown schema. Local construction completeness does not close other endpoint callsites.

### Orders: 14 outer fields per target; 5 mapped-only leaves

Original `#40448`, line 1635833, creates r4 at `+0x3a`; all 14 own fields are traced below. `#0 +0x1fff1–0x20006` registers M4183 with dependency 22=M2293. `#40448 +0x136–0x13d` imports it. Falsy `isWishlist` calls `myCartOrder(r4)` at `+0x14b`; `#26601 +0x3fd–0x402` exports `#26666`, whose `#26667 +0x22` passes captured data to M2294 `storeUserOrder`, installed as `#26775` at `#26701 +0x359–0x366`. Truthy `isWishlist` calls `storeKindergartenOrder(r4)` at `+0x17b`; `#26601 +0x44a–0x44f` exports `#26687`, whose `#26688 +0x29–0x35` supplies selectedKindergartenId separately from the same captured data to installed `#26787` (`#26701 +0x3e3–0x3f0`). Final Axios data placement is `#26775 +0x19` / `#26787 +0x33`.

Every field below retains unknown value type; assignments with fallback values are not generalized into type/default/enum constraints. All are present in the traced local outer object, not asserted server-required.

| Field, both targets | Original assignment / guard |
| --- | --- |
| supplier_id | `+0x3c–0x45`: captured supplier.id |
| reg_number | `+0x4a–0x50`: submitted reg_number |
| email | `+0x55–0x5b`: submitted e_mail, renamed |
| phone | `+0x60–0x66`: submitted phone |
| address | `+0x6b–0x71`: submitted address unchanged; no fabricated nested model |
| delivery_contacts | `+0x76–0x7c`: submitted delivery_contacts, no boolean conversion |
| delivery_customer_name | `+0x81–0x97`: customer_name itself truthy → submitted customer_name, else empty string; independent of delivery_contacts |
| delivery_reg_number | `+0x9c–0xae`: delivery_contacts truthy → submitted delivery_reg_number, else empty string |
| delivery_email | `+0xb3–0xc5`: delivery_contacts truthy → delivery_e_mail renamed, else empty string |
| delivery_phone | `+0xca–0xdc`: delivery_contacts truthy → submitted delivery_phone, else empty string |
| delivery_address | `+0xe1–0xf0`: delivery_contacts truthy → submitted delivery_address, else empty string |
| notes | `+0xf5–0xfb`: submitted order_notes, renamed |
| conditions_accept | `+0x100–0x106`: submitted conditions_accept; no boolean conversion |
| items | `+0x0c–0x3a` branch result → r4.items at `+0x10b`; unknown in both endpoint models |

Three order variants were checked independently:

1. **Non-wishlist**: `#40448 +0x16–0x1c` passes slot 10 unchanged; `#40449` is not called. Only 14 outer paths; no claimed item-array type or leaves.
2. **Wishlist + truthy collection**: `+0x21–0x32` invokes collection.map with `#40449`. The variant alone retains array/element construction metadata. It has 14 outer paths plus the 5 below.
3. **Wishlist + falsy collection**: `+0x21` jumps to `+0x37`, preserving the falsy collection. Only 14 outer paths; no mapper, array element schema, or final constant.

| Mapped-only item leaf | Original `#40449` assignment | Checked presence/type |
| --- | --- | --- |
| items[].id | `+0x05–0x0a`: item.id | assigned; unknown |
| items[].qty | `+0x0e–0x14`: item.qty | assigned; unknown |
| items[].product_id | `+0x19–0x28`: only source product_id truthy | conditional; unknown |
| items[].service_id | `+0x2e–0x3d`: only source service_id truthy | conditional; unknown |
| items[].comment | `+0x43–0x59`: course == null → undefined; otherwise course.name; property assigned at join | assigned but JSON can omit undefined; unknown |

Both endpoint schemas have precisely 14 outer fields and opaque `items`, not a closed schema combining these mutually different callsite branches. All four variant objects and their full field paths/guards survive in normalized `x-client-request-variants` and original `x-evidence`.

### Seven helper-built properties

`RateProduct`/`RateService`: fresh `{rating:p2}` at `#26747/#26749 +0x30–0x35`, POST data at `+0x3a`. Product/service comments: fresh `{comment:p2}` at `#26751/#26759 +0x30–0x35`, data `+0x3a`; kindergarten variants `{comment:p3}` at `#26753/#26761 +0x35–0x3a`, data `+0x3f`. `CancelKindergartenOrder`: `{reason:p3}` at `#26789 +0x34–0x39`, PUT data `+0x3e`. Each locally complete wrapper has exactly one unknown-valued property; all corresponding TSP/OpenAPI models have exactly that property and open unknown remainder. `CancelUserOrder` does not construct this wrapper and remains unknown.

## Query, response, and publication boundary checks

- **Supplier list branches (QF, 8 query occurrences):** `#26711/#26715` p2 and `#26713/#26717` p3. Truthy price produces literal URL `?price=JSON.stringify(price)&filters=JSON.stringify(filters)`; falsy price produces `?filters=JSON.stringify(filters)`. Both branches were traced, including generic Hermes concat argument registers and kindergarten-before-supplier order. Separate `.query` remains Axios config.params and unresolved. Only price is conditionally included in the URL. No invented deep filter/price structure or additional params.
- **Search branches (QS, 8 query occurrences):** `#26739/#26743` p1 and `#26741/#26745` p2. Independently truthy filters/price are JSON-stringified and written back to the same caller object before it is assigned to config.params. Both fields have conditional serialization evidence, not a guarantee of omission of existing falsy values or a closed query contract. No extra named field is inferred from the arbitrary remainder.
- **Plan queries (4 occurrences):** `#26938 +0x37–0x42` constructs params.type=p3; `#26940 +0x37–0x4a` constructs type=p3 then year=p4; `#26946 +0x38–0x43` constructs type=p3. All values unknown. List/show/overview route suffixes and their argument order match the original; no UI-derived IDs, years, defaults, or type enums were introduced.
- All 20 named query values emit strings as explicitly documented transport serialization, not invented original-value types. JSON serialization/manual URL interpolation is retained as evidence, not turned into `deepObject` or fabricated nested parameters. Encoding fixtures explicitly keep JSON-encoded nested evidence as string parameters; canonical-family fixtures retain original name/evidence separately from generic URI slots. Those fixtures were read, not run.
- `CategoriesForChild #26846 +0x00–0x1e` distinguishes omitted/undefined third argument from a supplied value; only omitted/undefined creates `{}`. This does not establish a server default or named query shape.
- Work-schedule update/delete derive the last segment from p2.id; delete puts **the entire p2 object in config.params**, not a body. Reports use p2 params. Child-development update/destroy use comment routing distinct from child routing; organization settings route p1 organization then p2 official; course access-code GET uses params and POST uses body, not interchangeable placements.
- Disambiguated published IDs `UpdateComment_put_api_kindergartens_kindergartenId_child_dev_comments_commentId_update` and `GetEmployeeMeals_get_api_kindergartens_kindergartenId_reports_employee_meals` retain the admin/shop original aliases and exact records. URI variable/family names are documentary placeholders, never renamed JSON/query wire keys.
- `GetChildGoalsFile #26848` attaches `#26849`: original `LoadParam` at +0x00 followed by `Ret` at +0x03. Research/TSP/OpenAPI metadata accurately says whole AxiosResponse unchanged, not `.data`, PDF schema, binary media type, or guessed success status.
- Root `main.tsp` uses `@defaultResponse`, wildcard content type, and unknown body. Every scoped compiled response is exactly `default` with `*/*` schema `{}`; no guessed 200, response enum, or media/status contract. Cookie annotations are observed `eliis_csrf` client authentication, not bearer or asserted server-required authorization.

## Findings and gate disposition

**0 findings.** No concrete bytecode contradiction, extra/missing proved request field, incorrect branch/guard, Axios placement error, or publication narrowing was found in this complete scoped run. Unknown values, arbitrary forwarded data, partial callsite coverage, and intentionally unresolved responses are preserved uncertainties, not defects. A second complete clean sweep on the same frozen input digest is still required by the overall gate.

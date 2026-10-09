# Final review run 2 — admin/shop

**CLEAN: 0 findings; 79/79 operations independently rechecked.**

This certifies only the assigned admin/shop portion of run 2. It does not certify other domains, build execution, or the repository-wide publication gate. Only this report was written. No generation, build, compilation, Git operation, HTTP request, login, private-record access, or API write was performed.

## Frozen inputs and fresh source check

- Read `AGENTS.md`, `evidence/reviews/REVIEW-GATE.md`, and `evidence/reviews/final-input-snapshot.json`. Read run 1 as audit history, then independently reopened the original instructions and compared the current published artifacts; run 1's conclusion was not used as source evidence.
- Beginning/end read-only snapshot checks: **0 changed inputs**, digest `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`.
- Original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`: SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.
- `domain-source/admin-shop.hasm`: SHA-256 `7a75aa6772c2e31f5c835088d26f5ccdee4717eaa5818fb596781d4874e26cdd`. **All 79 helper instruction sequences exactly match the original**. Original helper arguments, registers, concat calls, branches, body/config construction, and attached callbacks were freshly examined, not just string-index matches.
- Reopened original cart/order constructors, action thunks, dependency registration, exports, and installed methods: `#40014`, `#40448`, `#40449`, `#26601`, `#26652/#26653`, `#26666/#26667`, `#26687/#26688`, `#26701`, and relevant `#0` registration instructions.
- Compared `evidence/research/admin-shop.json`, `scripts/operation-catalog.json`, `routes/generated.tsp`, `models/generated.tsp`, `main.tsp`, and existing normalized OpenAPI JSON/YAML. Every scoped original record is preserved exactly in catalog records and published `x-evidence`; original aliases and branch metadata survive.
- Existing `tsp-output/@typespec/openapi3/openapi.json`: SHA-256 `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`.
- Existing `tsp-output/@typespec/openapi3/openapi.yaml`: SHA-256 `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0`. Parsed YAML equals JSON structurally. Both hashes were checked again at completion.
- Read relevant rendering/canonical-route and request-media normalization code without invoking generation or normalization.

## Counts

Field counts are occurrences, not distinct spellings. Recursive counts include parent fields. An opaque forwarded body has zero *named evidenced* fields, not necessarily zero actual fields.

| Surface | Direct | Recursive |
| --- | ---: | ---: |
| Operations / original helpers | 79 | 79 |
| Path parameters | 100 | 100 |
| Named query fields | 20 | 20 |
| Research body fields / API model properties | 39 | 39 |
| Additional mapped-variant metadata fields | 1 | 6 |

- **10 request models**, exactly **39 optional unknown-valued properties**, with an open unknown remainder. No extra or missing locally proved root properties; no normative enums, defaults, const constraints, or fabricated nested schemas.
- **4 client-request variants**, **51 proven field-path occurrences**: cart 4; non-wishlist order 14; mapped wishlist order 19; falsy-collection wishlist order 14. The extra metadata tree is `items` plus five leaf fields, not six additional unconditional API properties.
- Cart and the two order targets account for 32 root-property occurrences; seven helper-built wrappers account for the other seven.
- **79 callback checks**: 78 return `.data`; `#26849` returns the whole Axios response. All 79 published responses remain only `default`, wildcard `*/*`, unconstrained `{}`.

## Complete operation ledger

Every row passed method, full source URL, ordered dynamic arguments, Axios data/config placement, named field/variant metadata, uncertainty, and generated/published projection checks. `pN` excludes `this`; `K=/api/kindergartens/p1`, `S=/api/shop`. `B` means Axios data, `Q` means config.params, `—` means neither. Supplier-list `F` and search `J` are the separately traced serialization branches below. `P/Q/B` counts named path/query/body fields; direct and recursive body counts coincide in every row.

| Operation | Helper | Verb / source URL | Data/config | P/Q/B |
| --- | ---: | --- | --- | ---: |
| InsertWorkSchedule | 26547 | POST `K/work-schedule` | B=p2 | 1/0/0 |
| GetWorkSchedule | 26549 | GET `K/work-schedule` | Q=p2 | 1/0/0 |
| UpdateWorkSchedule | 26551 | PUT `K/work-schedule/p2.id` | B=p2 | 2/0/0 |
| DeleteWorkSchedule | 26553 | DELETE `K/work-schedule/p2.id` | Q=p2, no body | 2/0/0 |
| GetWorkScheduleTypes | 26555 | GET `K/work-schedule/types` | — | 1/0/0 |
| AddWorkScheduleType | 26557 | POST `K/work-schedule/types` | B=p2 | 1/0/0 |
| UpdateWorkScheduleType | 26559 | PUT `K/work-schedule/types/p2` | B=p3 | 2/0/0 |
| GetWorkScheduleSettings | 26561 | GET `K/work-schedule/settings` | — | 1/0/0 |
| UpdateWorkScheduleSettings | 26563 | POST `K/work-schedule/settings` | B=p2 | 1/0/0 |
| Filters | 26703 | GET `S/filters` | — | 0/0/0 |
| Categories | 26705 | GET `S/categories` | — | 0/0/0 |
| GetSuppliers | 26707 | GET `S/suppliers` | — | 0/0/0 |
| GetSupplierInfo | 26709 | GET `S/suppliers/p1` | — | 1/0/0 |
| GetSupplierProducts | 26711 | GET `S/suppliers/p1/products` | F=p2, Q=p2.query | 1/2/0 |
| KindergartenGetSupplierProducts | 26713 | GET `K/shop/suppliers/p2/products` | F=p3, Q=p3.query | 2/2/0 |
| GetSupplierServices | 26715 | GET `S/suppliers/p1/services` | F=p2, Q=p2.query | 1/2/0 |
| KindergartenGetSupplierServices | 26717 | GET `K/shop/suppliers/p2/services` | F=p3, Q=p3.query | 2/2/0 |
| PopularShopItems | 26719 | GET `S/popular` | — | 0/0/0 |
| PopularKindergartenShopItems | 26721 | GET `K/shop/popular` | — | 1/0/0 |
| CategoryProducts | 26723 | GET `S/categories/p1/products` | Q=p2 | 1/0/0 |
| CategoryServices | 26725 | GET `S/categories/p1/services` | Q=p2 | 1/0/0 |
| KindergartenCategoryProducts | 26727 | GET `K/shop/categories/p2/products` | Q=p3 | 2/0/0 |
| KindergartenCategoryServices | 26729 | GET `K/shop/categories/p2/services` | Q=p3 | 2/0/0 |
| Product | 26731 | GET `S/products/p1/show` | — | 1/0/0 |
| KindergartenProduct | 26733 | GET `K/shop/products/p2/show` | — | 2/0/0 |
| Service | 26735 | GET `S/services/p1/show` | — | 1/0/0 |
| KindergartenService | 26737 | GET `K/shop/services/p2/show` | — | 2/0/0 |
| ProductSearch | 26739 | GET `S/products/search` | J=p1, Q=p1 | 0/2/0 |
| KindergartenProductSearch | 26741 | GET `K/shop/products/search` | J=p2, Q=p2 | 1/2/0 |
| ServiceSearch | 26743 | GET `S/services/search` | J=p1, Q=p1 | 0/2/0 |
| KindergartenServiceSearch | 26745 | GET `K/shop/services/search` | J=p2, Q=p2 | 1/2/0 |
| RateProduct | 26747 | POST `S/products/p1/rate` | B={rating:p2} | 1/0/1 |
| RateService | 26749 | POST `S/services/p1/rate` | B={rating:p2} | 1/0/1 |
| AddProductComment | 26751 | POST `S/products/p1/comment` | B={comment:p2} | 1/0/1 |
| AddKindergartenProductComment | 26753 | POST `K/shop/products/p2/comment` | B={comment:p3} | 2/0/1 |
| GetProductComments | 26755 | GET `S/products/p1/comments` | Q=p2 | 1/0/0 |
| GetKindergartenProductComments | 26757 | GET `K/shop/products/p2/comments` | Q=p3 | 2/0/0 |
| AddServiceComment | 26759 | POST `S/services/p1/comment` | B={comment:p2} | 1/0/1 |
| AddKindergartenServiceComment | 26761 | POST `K/shop/services/p2/comment` | B={comment:p3} | 2/0/1 |
| GetServiceComments | 26763 | GET `S/services/p1/comments` | Q=p2 | 1/0/0 |
| GetKindergartenServiceComments | 26765 | GET `K/shop/services/p2/comments` | Q=p3 | 2/0/0 |
| AddToCart | 26767 | POST `S/cart` | B=p1; cart caller | 0/0/4 |
| UserCart | 26769 | GET `S/cart` | — | 0/0/0 |
| EditCartItem | 26771 | PUT `S/cart/p1/update` | B=p2 | 1/0/0 |
| RemoveFromCart | 26773 | DELETE `S/cart/p1/delete` | — | 1/0/0 |
| StoreUserOrder | 26775 | POST `S/orders` | B=p1; non-wishlist | 0/0/14 |
| CancelUserOrder | 26777 | PUT `S/orders/p1` | B=p2, opaque | 1/0/0 |
| UserOrders | 26779 | GET `S/orders` | Q=p1 | 0/0/0 |
| GetUserOrder | 26781 | GET `S/orders/p1` | — | 1/0/0 |
| KindergartenOrders | 26783 | GET `K/shop/orders` | Q=p2 | 1/0/0 |
| GetKindergartenOrder | 26785 | GET `K/shop/orders/p2` | — | 2/0/0 |
| StoreKindergartenOrder | 26787 | POST `K/shop/orders` | B=p2; two wishlist branches | 1/0/14 |
| CancelKindergartenOrder | 26789 | PUT `K/shop/orders/p2` | B={reason:p3} | 2/0/1 |
| AddToKindergartenWishlist | 26791 | POST `K/shop/kindergarten-wishlist` | B=p2 | 1/0/0 |
| Wishlist | 26793 | GET `K/shop/wishlist` | Q=p2 | 1/0/0 |
| RemoveFromWishlist | 26795 | DELETE `K/shop/wishlist/p2/delete` | — | 2/0/0 |
| EditWishlistItem | 26797 | PUT `K/shop/wishlist/p2/update` | B=p3 | 2/0/0 |
| CdmSettings | 26844 | GET `K/child-dev/settings` | — | 1/0/0 |
| CategoriesForChild | 26846 | GET `K/child-dev/p2/categories` | Q=third argument; omitted/undefined → {} | 2/0/0 |
| GetChildGoalsFile | 26848 | GET `K/child-dev/p2/print` | Q=p3; whole Axios callback | 2/0/0 |
| Evaluate | 26850 | PUT `K/child-dev/p2/evaluate` | B=p3 | 2/0/0 |
| StoreComment | 26852 | POST `K/child-dev/p2/comments/store` | B=p3 | 2/0/0 |
| UpdateComment | 26854 | PUT `K/child-dev/comments/p2/update` | B=p3 | 2/0/0 |
| DestroyComment | 26856 | DELETE `K/child-dev/comments/p2/destroy` | — | 2/0/0 |
| SubmitDashboardPoll | 26886 | POST `K/polls/p2/dashboard` | B=p3 | 2/0/0 |
| GetEmployeeMeals | 26908 | GET `K/reports/employee-meals` | Q=p2 | 1/0/0 |
| Meals | 26910 | GET `K/reports/todaysmeals` | Q=p2 | 1/0/0 |
| MealsPerCourse | 26912 | GET `K/reports/todaysmeals-per-course` | Q=p2 | 1/0/0 |
| GetCoursePlanTypes | 26938 | GET `K/plans/types/p2` | Q={type:p3} | 2/1/0 |
| GetCoursePlans | 26940 | GET `K/plans/course/p2` | Q={type:p3,year:p4} | 2/2/0 |
| GetPlanSettings | 26942 | GET `K/plans/settings` | Q=p2 | 1/0/0 |
| GetPlan | 26944 | GET `K/plans/show` | Q=p2 | 1/0/0 |
| GetCoursePlansOverView | 26946 | GET `K/plans/course/p2/overview` | Q={type:p3} | 2/1/0 |
| GetProjectPlans | 26948 | GET `K/plans/project/p2` | — | 2/0/0 |
| GetProjectPlan | 26950 | GET `K/plans/project/p2/show` | — | 2/0/0 |
| GetYearPlan | 26952 | GET `K/plans/year/p2/show` | — | 2/0/0 |
| UpdateSettings | 41029 | PUT `/api/organizations/p1/officials/p2/settings` | B=p3 | 2/0/0 |
| GetCourseAccessCode | 43832 | GET `K/course-children/access-code` | Q=p2 | 1/0/0 |
| GenerateCourseAccessCode | 43834 | POST `K/course-children/access-code` | B=p2 | 1/0/0 |

## Every constructed field and variant

### Cart

Fresh r3 in `#40014`: `qty` at +0x05–0x09; `course_period_id=null` at +0x0e–0x10; strict `type === 'product'` test at +0x22 jumps to the product assignment +0x3b–0x40, otherwise service assignment +0x2a–0x2f. Exactly one identifier is locally added. The four optional API properties are unknown; final null is retained only as `x-client-observed-value`, not a server enum/default/nullability assertion.

Routing was rechecked: `#0` M4149 dependency 26=M2293; `#40014 +0x69` calls `addItemToCart(r3)`; M2293 dependency 1=M2294 is stored in `#26601` slot 0; exported `#26652/#26653` forward the same data to `addToCart`; `#26701 +0x2fd–0x30a` installs `#26767`, whose POST data is p1. Variant construction completeness does not close the endpoint schema or claim complete callsite coverage.

### Order outer object: 14 fields for each target

`#40448 +0x3a` creates a fresh r4; every own property was checked separately. All values remain unknown and all API properties optional.

| Property | Original source construction |
| --- | --- |
| supplier_id | +0x3c–0x45: captured supplier.id |
| reg_number | +0x4a–0x50: submitted reg_number |
| email | +0x55–0x5b: submitted e_mail renamed |
| phone | +0x60–0x66: submitted phone |
| address | +0x6b–0x71: submitted address unchanged, nested shape unknown |
| delivery_contacts | +0x76–0x7c: submitted value, no boolean conversion |
| delivery_customer_name | +0x81–0x97: tests customer_name itself, copies it or assigns empty string; independent of delivery_contacts |
| delivery_reg_number | +0x9c–0xae: delivery_contacts truthy → corresponding submitted field, otherwise empty string |
| delivery_email | +0xb3–0xc5: delivery_contacts truthy → delivery_e_mail renamed, otherwise empty string |
| delivery_phone | +0xca–0xdc: delivery_contacts truthy → corresponding submitted field, otherwise empty string |
| delivery_address | +0xe1–0xf0: delivery_contacts truthy → corresponding submitted field, otherwise empty string |
| notes | +0xf5–0xfb: submitted order_notes renamed |
| conditions_accept | +0x100–0x106: submitted value, no boolean conversion |
| items | +0x10b: assigns earlier branch result, opaque in both API models |

`#0` M4183 dependency 22=M2293 and `#40448 +0x136–0x13d` import that module. Non-wishlist `myCartOrder(r4)` at +0x14b reaches exported `#26666/#26667`, then installed `#26775`, preserving POST p1. Wishlist call at +0x17b reaches exported `#26687/#26688`, then installed `#26787`; selectedKindergartenId is supplied separately before the unchanged body p2. Module exports and installation offsets +0x359–0x366 / +0x3e3–0x3f0 were reopened.

Three independent order branches remain separate:

1. Non-wishlist: +0x16–0x1c forwards captured slot 10 unchanged. No mapper or universal item-array element model.
2. Wishlist with truthy collection: +0x21–0x32 invokes `.map(#40449)`. Only this variant retains array/element construction metadata and five nested leaves.
3. Wishlist with falsy collection: +0x21 jumps to +0x37, preserving the falsy value. No mapper, item-element schema, or fixed final items value.

| Mapped-only leaf | Original mapper `#40449` |
| --- | --- |
| items[].id | +0x05–0x0a: copies item.id |
| items[].qty | +0x0e–0x14: copies item.qty |
| items[].product_id | +0x19–0x28: copied only when its source value is truthy |
| items[].service_id | +0x2e–0x3d: copied only when its source value is truthy; independent of product_id |
| items[].comment | +0x43–0x59: loose course == null test covers null/undefined, assigning undefined then, otherwise course.name; JSON may omit undefined |

All five leaves have unknown values; product/service fields retain conditional metadata. All four variant objects, including guards, field paths, nested metadata, construction completeness, and partial callsite coverage, match published `x-client-request-variants`. Neither endpoint's root `items` property is narrowed to an array or nested schema.

### Seven complete helper-built wrappers

- `#26747/#26749`: only `rating:p2`, fresh object +0x30–0x35, POST data +0x3a.
- `#26751/#26759`: only `comment:p2`, +0x30–0x35, POST data +0x3a.
- `#26753/#26761`: only `comment:p3`, +0x35–0x3a, POST data +0x3f.
- `#26789`: only `reason:p3`, +0x34–0x39, PUT data +0x3e.

These seven wrappers have precisely seven published optional unknown properties in open models. `CancelUserOrder` merely forwards p2 and has no fabricated reason wrapper. Every other untraced forwarded body remains unconstrained with wildcard request media, not an invented JSON-only shape.

## Query, response, routing, and publication boundaries

- Supplier lists `#26711/#26713/#26715/#26717`: eight named query occurrences. Truthy price constructs literal native URL bytes `?price=` + JSON.stringify(price) + `&filters=` + JSON.stringify(filters); falsy price constructs `?filters=` + JSON.stringify(filters). No percent-encoding call is invented. Generic Hermes Call register order and kindergarten-before-supplier placement were checked in both branches. Only price inclusion is conditional; `.query` is separately forwarded in Axios config.params and remains unresolved.
- Search `#26739/#26741/#26743/#26745`: eight query occurrences. Independently truthy filters and price are JSON-stringified and written back onto the same forwarded params object. This is conditional serialization, not proof that preexisting falsy values are deleted. Evidence retains JSON encoding rather than inventing deepObject/filter schemas, enum values, or server defaults.
- Plan queries: `#26938` type=p3; `#26940` type=p3 and year=p4; `#26946` type=p3. Four occurrences, all original values unknown. Generated query strings are documentary transport serialization, not asserted original scalar domain types. All 20 query parameters are optional, retain exact observation metadata, and impose no server enum/default/constant.
- `#26846 +0x00–0x1e` distinguishes omitted/undefined third argument from supplied values. Only omitted/undefined creates `{}`; no server default or named query property follows.
- Work schedule PUT uses p2.id in the URL and p2 as body; DELETE uses p2.id and **the entire p2 in config.params**, not request data. Reports use p2 params; child-dev comment update/destroy route through `/child-dev/comments/`, not the child route. Organization/official URL order and access-code GET params versus POST data match source exactly.
- All source paths and parameter observations survive canonical-route processing unchanged within original records. Published URI names remain transport placeholders, not renamed query/body wire fields. Duplicate operation-name disambiguation preserves original aliases for admin/shop UpdateComment and GetEmployeeMeals.
- `#26848` attaches `#26849`, whose complete callback is LoadParam then Ret. Whole Axios response preservation is explicit in metadata; no universal `.data` transformation, PDF/binary schema, media type, or success status is inferred.
- `main.tsp` supplies default response with unknown body and wildcard media. Every scoped JSON/YAML operation has exactly that unconstrained response, without guessed success/error wrappers.
- Common-client imports were reopened for work schedules, shop, child-dev, reports, plans, official settings, and course access: dependency 3=M525 is stored in the parent environment slot 2. `#5603` exports the normal configured client separately from auth; `#5612` assembles optional language plus stored credential in the cookie header, and `#5617` preserves the eliis_csrf cookie credential. Published annotations use EliisCookieAuth and explicitly retain unknown server authentication requirements, not Bearer auth.
- Original-response/body/query uncertainty is intentional. Complete local wrapper construction, observed empty strings/null, and branch-scoped mapper knowledge are not generalized into complete server contracts.

## Disposition

**0 concrete findings.** This fresh complete scoped pass found no source contradiction, missing/extra proved property, incorrect guard, body/config placement error, canonical-path evidence loss, or published narrowing. The scoped clean result is on the same unchanged frozen digest as run 1. No correction/reset is required by this domain review; repository-wide gate certification remains the coordinating review's responsibility.

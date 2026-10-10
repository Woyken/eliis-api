# Response final review run 2 — children and admin/shop

**Verdict: NOT CLEAN — 2 source/trace findings in the assigned 174 response analyses.** All four findings from run 1 are substantively corrected, and the compiled response shapes match the current analyses except for the intentional folder-route alias suppression. Two remaining evidence/trace defects are detailed below; neither calls for adding or tightening a response field or type. This run must not count as clean.

## Frozen scope and method

- The frozen input snapshot `evidence/reviews/response-input-snapshot.json` declares digest **`775c44ed5193f525bc997195950e44f26fb81abfcb063a3abbd9a6b43ae87c35`**. All **43/43** listed hashes matched before review and were rechecked after this report was written. The snapshot JSON's own SHA-256 is `515031a9ad36f8d65b6ad1490e1c264481c5cfcdfb8233e6a2b684f12b0307b7`.
- Primary source: `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.
- Compared all 95 children/diary/files and 79 admin/shop response records to their assigned research records and the original full disassembly. All **174/174** operation IDs and source function IDs match; all source lines match their service-function headers; the 174 source function IDs are unique. All **829/829** trace entries refer to an existing source function and a line within that function; each trace begins at its assigned service function.
- Recursively reviewed all **251** current named response-field paths and their evidence against the original code. The two findings below are a false consumer-function attribution and omitted direct consumer functions from trace arrays—not unsupported schema fields or types.
- The existing compiled artifacts were read, not rebuilt: `tsp-output/@typespec/openapi3/openapi.json` (SHA-256 `3cd3c67bcbd3d6e051ec1e13a45151a437a214ff93bfd6dba2a9596827d32526`) and `openapi.yaml` (SHA-256 `cc55d10f22b87b3f54e780c4d6d1863bf5d5ee6a5d133756d51c39e4d1657fb7`). JSON and YAML parse to equal documents. The compiled document has **296 operations** and dispositions of **87 modeled / 194 unknown / 15 binary**; its static evidence extensions contain all **298/298** research observations exactly once.
- For this scope, compiled OpenAPI extensions preserve the current response analyses exactly for **174/174** identity pairs. Recursive field-path, type, and field-evidence comparison found **0 differences** for emitted models. **50/51** typed source observations have modeled projections; `GetFolderData #26143` is deliberately suppressed to an unconstrained body because its canonical route aliases `GetDocumentsFolderData #26270`, whose response remains unknown. The compiled alias retains both observations and does not transfer fields or emit a union.
- Across compiled responses, no numeric status, non-wildcard media type, `required`, enum, default, nullability, or other checked value/collection constraint was found. Object models remain open. All response properties remain optional; primitive/value leaves stay `unknown`.
- No generation, build, test, HTTP, login, or write request was run. All workspace input hashes matched before and after. An initial **read-only** `git status --short --branch` was inadvertently run before isolating the task's no-Git constraint; no Git write was performed and no further Git command was run. Only this report was written.

## Coverage and field counts

Recursive field paths include nested object properties and array-item properties; container fields are included. All counts describe client-observed partial analyses, not guaranteed server fields.

| Domain | Research / response records | Root dispositions (object / array / unknown) | Direct `fields` / recursive paths | Recursive field-node types | Trace entries |
|---|---:|---:|---:|---|---:|
| Children, diary, files | 95 / 95 | 22 / 2 / 71 | 43 / 46 | 45 `unknown`, 1 `array` | 444 |
| Admin, shop | 79 / 79 | 24 / 3 / 52 | 104 / 205 | 166 `unknown`, 17 `array`, 22 `object` | 385 |
| **Total** | **174 / 174** | **46 / 5 / 123** | **147 / 251** | **211 `unknown`, 18 `array`, 22 `object`** | **829** |

There are **51 typed root observations** (24 children and 27 admin/shop) and 123 explicit unknown dispositions. The array/object annotations are supported by direct client operations such as iteration, `.map`, and `FlatList.data`; they are not server validation. No primitive leaf is assigned a string, Boolean, integer, or number type.

## Typed response-path inventory

Each row lists the source operation ID and source function ID. Grouped operations have the same listed field-path set. Unless an array/object container is named in the path set below, values remain `unknown`. Nested observations explicitly described as evidence-only are not included as schema paths.

### Children, diary, files — 24 typed root dispositions

| Operation / source function ID | Root kind | Modeled paths / conservative disposition |
|---|---|---|
| `PublishMap #25617` | object | `published` |
| `GetChildProfile #25634` | object | `active_courses` |
| `GetMaps #25638` | object | `cards` |
| `GetChildCalendar #25644` | object | `access` |
| `SaveChildCalendarDays #25646` | array | Root array observed; items unknown |
| `GetAbsenceModalData #25652` | object | `min_date` |
| `UploadChildProfilePicture #25654` | object | `profile_picture` |
| `GetGuardians #25658` | object | `door_card_enabled`, `guardians` |
| `GetGuardianInvoices #25671` | object | `invoices`, `settings`, `services`; `invoices.current_page` / `.data` remain evidence-only |
| `GetEmployeeCourses #25725` | array | `[].id` |
| `GetDiaryData #25935` | object | `diary`, `entries`, `feedback_type_options`, `leave_type_option`, `statuses` (array), `statuses[].used_in_course`, `statuses[].type`, `settings`, `meals`, `images`, `documents`, `daily_comments`, `analysis_comments`, `daily_notes`, `holidays`, `likes`, `integrations` |
| `CreateDiary #25937` | object | `diary` |
| `UpdateComment #25939` | object | `type` |
| `UploadMedia #25941` | object | `file` |
| `UploadDocument #25943` | object | `file` |
| `UpdateEntryStatuses #25957` | object | `map` |
| `UpdateEntryLeaveTypes #25979` | object | `map` |
| `GetEmployeeMeals #26011` | object | `employees` is unknown; comparator read `employees[*].user_id` stays evidence-only |
| `GalleryGetIndexFolders #26134` | object | `folders`, `settings` |
| `GetFolderData #26143` | object | `subfolders`, `files` are unknown; `subfolders.data/current_page/last_page` remain evidence-only; canonical route suppressed by alias conflict |
| `GetSubfolders #26145` | object | `data` |
| `UpdateFolder #26149` | object | `data` |
| `DocumentsGetIndexFolders #26268` | object | `folders`, root `data`, `settings` |
| `GetSharedDocuments #26278` | object | `data` |

### Admin, shop — 27 typed root dispositions

| Operation / source function ID(s) | Root kind | Modeled paths |
|---|---|---|
| `GetWorkSchedule #26549` | object | `employees` (array), `employees[].work_schedules` (array), `employees[].work_schedules[].full_day`, `roles`, `lock_date`, `types`, `holidays` |
| `Categories #26705` | array | `[].type`, `[].slug`, `[].subcategories` (array), `[].subcategories[].type` |
| `GetSupplierProducts #26711`; `KindergartenGetSupplierProducts #26713`; `GetSupplierServices #26715`; `KindergartenGetSupplierServices #26717` | object | `data` per operation |
| `CategoryProducts #26723`; `CategoryServices #26725`; `KindergartenCategoryProducts #26727`; `KindergartenCategoryServices #26729` | object | `data` per operation |
| `Product #26731`; `KindergartenProduct #26733`; `Service #26735`; `KindergartenService #26737` | object | Each: `images` (array), `images[].thumbs` (object), `images[].thumbs.small` (object), `images[].thumbs.small.url`, `name`, `code`, `supplier` (object), `supplier.name`, `description`, `links` (array), `links[].name`, `links[].url`, `original_price`, `sales_price_gross`, `kindergarten_sales_price_gross`, `rating`, `my_rating`, `id` |
| `ProductSearch #26739`; `KindergartenProductSearch #26741`; `ServiceSearch #26743`; `KindergartenServiceSearch #26745` | object | `data` per operation |
| `UserCart #26769` | array | `[].id`, `[].name`, `[].free_delivery_from`, `[].delivery_fee`, `[].delivery_vatrate`, `[].sum`, `[].items` (array), `[].items[].product` (object), `[].items[].product.sales_price_gross`, `[].items[].product.small_thumb`, `[].items[].product.name`, `[].items[].product.category` (open object), `[].items[].product.category.name`, `[].items[].product.category.slug`, `[].items[].product.type`, `[].items[].product.slug`, `[].items[].product.category_slug`, `[].items[].product.subcategory_slug`, `[].items[].product.subcategories` (unknown), `[].items[].service` (object), `[].items[].service.sales_price_gross`, `[].items[].service.small_thumb`, `[].items[].service.name`, `[].items[].service.category` (open object), `[].items[].service.category.name`, `[].items[].service.category.slug`, `[].items[].service.type`, `[].items[].service.slug`, `[].items[].service.category_slug`, `[].items[].service.subcategory_slug`, `[].items[].service.subcategories` (unknown), and `[].items[].qty` |
| `UserOrders #26779` | object | `last_page`, `data` (array), `data[].id`, `data[].doc_number`, `data[].status`, `data[].doc_date`, `data[].total_gross`, `data[].supplier` (open object), `data[].supplier.name` |
| `GetUserOrder #26781`; `GetKindergartenOrder #26785` | object | Each: `doc_number`, `doc_date`, `status`, `status_reason`, `notes`, `supplier` (open object), `supplier.name`, `supplier.logo`, `rows` (array), `rows[].product_id`, `rows[].service_id`, `rows[].row_gross`, `rows[].qty`, `rows[].name`, `rows[].code`, `total_net`, `total_vat`, `total_gross`, `customer_name`, `email`, `phone`, `address`, `delivery` (open object), `delivery.customer_name`, `delivery.email`, `delivery.phone`, `delivery.address` |
| `KindergartenOrders #26783` | object | `data` (array), `data[].id`, `data[].doc_number`, `data[].status`, `data[].doc_date`, `data[].total_gross`, `data[].supplier` (open object), `data[].supplier.name`, `last_page` |
| `Wishlist #26793` | object | `wishlists`, `contacts` |
| `CategoriesForChild #26846` | object | `age_groups`, `categories` |
| `GetEmployeeMeals #26908` | object | `employees` (client-observed array use); employee item shape unknown |
| `Meals #26910` | array | `[].name` |

The remaining **71 children** and **52 admin/shop** records retain explicit unknown dispositions; this review did not expand unrelated opaque operations.

## Run-1 corrections verified

- **UserCart `#26769`:** the response body is returned as `response.data`, dispatched unchanged, stored unchanged by the shop reducer, and selected as the `MyCartScreen` `FlatList.data`. The root array and provider/item paths therefore retain the correct body identity. Provider fields and the selected product/service detail paths are present. `category` is an open partial object; `subcategories` stays `unknown` despite the indexed `.slug` read. No locally initialized cart state, quantity-derived total, or other local value was promoted to a body field.
- **Product/detail operations `#26731/#26733/#26735/#26737`:** all four carry the shared response-derived `images[].thumbs.small.url` and `links[].name` / `links[].url` paths. Leaves are unknown; the directly observed array/object containers remain open.
- **Categories `#26705`:** root-array item `type`, `slug`, `subcategories`, and `subcategories[].type` are represented. `subcategories` is only the client-observed `FlatList.data` array expectation; leaves remain unknown.
- **Employee meals:** Foodmenu `#26011` and Reports `#26908` are no longer conflated. The Foodmenu comparator's `employees[*].user_id` read remains evidence only under an unknown `employees` field; it is not transferred to Reports. Reports traces the actual `#26894` → `#26895` → reducer `#26889` → screen `#40663/#40664` path; `employees` is used as `FlatList.data`, while row fields remain unknown.
- **Folder alias:** `GetFolderData #26143` keeps `subfolders` and `files` unknown, with reducer-only nested observations in evidence; `GetDocumentsFolderData #26270` remains unknown. The compiled same-path operation remains unconstrained.
- **Order details:** `GetUserOrder #26781` and `GetKindergartenOrder #26785` retain body-root/nested response fields read by the order screen. Their fulfillment callbacks set screen-local React state; those detail fields are not attributed to a Redux reducer. No request, optimistic, or locally composed detail values were added as response fields.

## Findings

### F1 — Categories `slug` cites the closure creator, not its property-reading callback

In `evidence/responses/admin-shop.json`, `Categories #26705` records `[].slug` as a direct read by `#39931` at `1610103–1610129`, and the trace contains `#39931` but not `#39932`. The original bytecode shows that `#39931` loads `productCategories`, obtains `.find`, creates closure `#39932`, and returns (`eliis.hasm:1610103–1610114`). The closure `#39932` begins at `1610119` and directly reads the category item's `slug` at `1610124` before comparing it with `category_slug` (`1610123–1610128`).

The root-array `[].slug: unknown` field is supported, and its type is conservative; the cited consumer ID and trace are not. **Minimal correction:** attribute the direct read to `#39932` and add `#39932` to the Categories trace, retaining the root array and unknown leaf type.

### F2 — Direct consumer functions cited by fields are missing from trace arrays

The following field evidence names exact original consumers that are absent from the corresponding operation trace:

| Operation | Field path(s) | Consumer(s) cited by field evidence but absent from trace | Original source location |
|---|---|---|---|
| `UserCart #26769` | `[].id` | `#40168` | `1620468–1620475` |
| `UserCart #26769` | `[].delivery_fee`, `[].delivery_vatrate` | `#40173` | `1621070–1621088` |
| `UserCart #26769` | `[].sum` | `#40174` | `1621097–1621107` |
| `UserCart #26769` | supporting reads for `[].free_delivery_from` and `[].delivery_fee` | `#40175` | `1621138–1621203` |
| `UserOrders #26779` | `last_page` | `#40214` | `1623306–1623334` |

For these paths, the current field entries do cite the correct original source lines, and the schemas/types are appropriately conservative. However, the trace stops short of those consumers: `#40167` forwards the cart row but does not read its `id`; `#40172` creates the delivery/total helpers but is not the body-property reader in `#40173/#40174/#40175`; and `#40204` is the orders screen while the `last_page` continuation is `#40214`. **Minimal correction:** add the cited consumers to those trace arrays (or remove only redundant secondary references where the same direct read is already traced). Do not change field paths or types.

## Disposition

This run is **not clean** and does not increment the consecutive-clean count. The Round-1 schema/path corrections are present and compile consistently, but the Categories callback attribution and the listed consumer-trace omissions need evidence-only corrections. Keep every object open, every property optional, and every unproved value/container unknown; do not expand unrelated opaque responses.

# Corrected review: shop response enrichment

**Candidate:** `evidence/responses-shop-enrichment.json` (merged by `(operationId, sourceFunctionId)` into `evidence/responses/admin-shop.json`)  
**Source checked:** `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`  
**Verdict: Accepted after corrections.** The ten records now provide evidence-backed, open, partial client-observed views. All 117 originally submitted property paths are supported; the eight omitted detail paths and nine kindergarten-order paths are now included. The corrected total is **134 field paths** across these ten operations. All leaf values remain `unknown`; no presence, requiredness, enum, default, nullability, status, media, or complete-response claim is made.

## Identity and handoff verification

The Metro IDs were verified from the registrations in `eliis.hasm` (11585–11598): **2294 is the shop service module**, **2293 is the shop actions module** (it imports 2294), and **2292 is the shop reducer module**. These are not inferred from function names.

| Operation(s) | Service response and actual consumer path |
|---|---|
| `Product`, `KindergartenProduct`, `Service`, `KindergartenService` | Service methods `#26731/#26733/#26735/#26737` return `response.data`; the selected shop action dispatches the value unchanged, reducer `#26581` stores it as `selectedShopItem`, and shared ItemScreen module **4149** (`#39983`) selects the proper action through `#39999` and reads the body-root fields in `#39986`. |
| `UserCart` | Service `#26769` → action `#26655/#26656` → reducer `#26581` stores the body unchanged; Cart screen `#40160` supplies it directly as `FlatList.data`, and provider/item consumers read the modeled paths. |
| `UserOrders` | Service `#26779` → action `#26676/#26677` → reducer `#26581`; page-one SET preserves the response object, while the later-page ADD branch merges the nested `data` collection. Orders screen `#40204/#40214/#40219` consumes the root pagination field, data list, and row fields. |
| `GetUserOrder`, `GetKindergartenOrder` | Services `#26781/#26785` return the body unchanged. OrderDetailsScreen module **4170** (`#40224`) routes through `#40230`; `#40233/#40231` assign the result to **local screen state**, which `#40227/#40244/#40245/#40246` read. There is **no Redux reducer** on this detail-body path. |
| `KindergartenOrders` | Service `#26783` → action `#26679/#26680`; for `current_page === 1`, the action dispatches `SET_KINDERGARTEN_ORDERS` with the body unchanged. Reducer `#26581` SET stores `action.data` directly; Orders screen consumers then read that body-root shape. |
| `Wishlist` | Service `#26793` → action `#26670/#26671`; the action reads body-root `wishlists` and `contacts` and dispatches them separately. Status buckets and contact state are downstream projections, not response fields. |

## Corrected property-path ledger

Counts include intermediate object/array paths as well as leaves. “Unknown leaf” means the client reads the property but does not establish its runtime value type or presence.

| Operation | Field paths | Direct consumer evidence |
|---|---:|---|
| `Product` | 13 | `#39986`: images, name, code, supplier/name, description, links, three price paths, rating, my_rating, id. |
| `KindergartenProduct` | 13 | Same shared detail reads, after the kindergarten service/action branch. |
| `Service` | 13 | Same shared detail reads, including the previously omitted body-root `code`. |
| `KindergartenService` | 13 | Same shared detail reads, including the previously omitted body-root `code`. |
| `UserCart` | 8 | `#40168` row id; `#40172` provider name and `items.map`; `#40177` product/service sales-price and qty reads. Root array use is the unchanged response value passed as `FlatList.data` by `#40160`. |
| `UserOrders` | 9 | `#40214` root `last_page`; `#40204` passes `data` to `FlatList`; `#40219` reads item id/doc_number/status/doc_date/total_gross/supplier.name. |
| `GetUserOrder` | 27 | `#40227/#40244/#40245/#40246`: detail-root values, nested supplier, `rows.map` row values, and delivery paths; added `supplier.logo`, `rows[].name`, and `rows[].code`. |
| `KindergartenOrders` | 9 | Page-one body root: `data` array and `last_page`; `#40219` reads item id/doc_number/status/doc_date/total_gross/supplier.name. |
| `GetKindergartenOrder` | 27 | Same shared detail reads on unchanged local screen-state value; added `supplier.logo`, `rows[].name`, and `rows[].code`. |
| `Wishlist` | 2 | `#26671` directly reads body-root `wishlists` and `contacts`; both remain unknown. |
| **Total** | **134** | **117 accepted existing paths + 8 omitted detail paths + 9 `KindergartenOrders` paths.** |

The corrected path sets are:

- `Product`, `KindergartenProduct` (13 each): `images`, `name`, `code`, `supplier`, `supplier.name`, `description`, `links`, `original_price`, `sales_price_gross`, `kindergarten_sales_price_gross`, `rating`, `my_rating`, `id`.
- `Service`, `KindergartenService` (13 each): same 13 paths; the original `code` omission is fixed for both.
- `UserCart` (8): `[].id`, `[].name`, `[].items`, `[].items[].product`, `[].items[].product.sales_price_gross`, `[].items[].service`, `[].items[].service.sales_price_gross`, `[].items[].qty`.
- `UserOrders` (9): `last_page`, `data`, `data[].id`, `data[].doc_number`, `data[].status`, `data[].doc_date`, `data[].total_gross`, `data[].supplier`, `data[].supplier.name`.
- `GetUserOrder` and `GetKindergartenOrder` (27 each): `doc_number`, `doc_date`, `status`, `status_reason`, `notes`, `supplier`, `supplier.name`, `supplier.logo`, `rows`, `rows[].product_id`, `rows[].service_id`, `rows[].row_gross`, `rows[].qty`, `rows[].name`, `rows[].code`, `total_net`, `total_vat`, `total_gross`, `customer_name`, `email`, `phone`, `address`, `delivery`, `delivery.customer_name`, `delivery.email`, `delivery.phone`, `delivery.address`.
- `KindergartenOrders` (9): `data`, `data[].id`, `data[].doc_number`, `data[].status`, `data[].doc_date`, `data[].total_gross`, `data[].supplier`, `data[].supplier.name`, `last_page`.
- `Wishlist` (2): `wishlists`, `contacts`.

## Corrections and evidence scope

1. **Kindergarten orders:** the earlier opaque disposition confused reducer cases. In `#26680` (1034954–4974), `current_page === 1` dispatches **SET**, and `#26581` stores `action.data` directly in the `SET_KINDERGARTEN_ORDERS` case (1032243–2251). `UPDATE_KINDERGARTEN_ORDERS` is the separate optimistic map/`Object.entries`/`fromEntries` branch (1032193–2216); it is not the GET/set path. The later-page `ADD_KINDERGARTEN_ORDERS` merge remains a separate limitation. Therefore page-one supports a partial root object with `data` (array as used by FlatList), `last_page` (unknown), and the directly read order-row properties above (all leaves unknown).
2. **Missing detail reads:** shared ItemScreen `#39986` reads `item.code` at 1612635–1658 for service variants as well as product variants. Order detail `#40227` reads `order.supplier.logo` at 1624173–4187; row renderer `#40245` reads `row.name` at 1625517–5518 and `row.code` at 1625538–5539. These six paths are now present across the two order-detail operations and the two service operations (eight added paths total).
3. **Image array proof:** each of the four detail `images` fields now cites the unchanged prop handoff from `#39986` (1612582–2608) and `ImageThumbnails #40054`, which reads `images` at 1615171 and calls `.map` at 1615236–5241. This establishes only the observed array use; image members remain unmodeled. `links` and detail `rows` retain their direct `.map` evidence.
4. **Cart/list arrays:** cart root array use is the response passed directly as `FlatList.data`; provider `items` has its own `.map` proof at `#40172`. `UserOrders.data` and page-one `KindergartenOrders.data` are the values supplied to FlatList. No `Object.entries` on a Redux wrapper or page `.concat` alone is used to claim an HTTP-root/field array shape.
5. **Open schema boundary:** all ten records remain `complete:false`. Container object/array types record client-observed use, not server guarantees. All primitive leaves remain `unknown`, all properties are optional, and no unobserved fields are closed off. Local fallback values, optimistic updates, translated/formatted values, and request payloads are excluded.

The existing 69 non-target records and their dispositions are unchanged. The merged shop records retain existing trace entries, including parallel callback-trace additions; all ten operation/source identities match their research operations.

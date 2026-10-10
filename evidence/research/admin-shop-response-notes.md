# Admin/shop static response analysis

## Coverage and dispositions

- All 79 `admin-shop.json` research operations have a matching response-analysis record keyed by `operationId` and `sourceFunctionId`.
- Dispositions: 24 `object` (the 12 catalog listing/search results plus `GetWorkSchedule`, `Product`, `KindergartenProduct`, `Service`, `KindergartenService`, `UserOrders`, `GetUserOrder`, `KindergartenOrders`, `GetKindergartenOrder`, `Wishlist`, `CategoriesForChild`, `GetEmployeeMeals`), 3 `array` (`Categories`, `Meals`, `UserCart`), 52 `unknown`.
- No response is marked complete. No status, media type, requiredness, nullability, enum, default, pagination envelope, or error wrapper is inferred.
- Every response-data callback trace is anchored to its in-function `response.data` read; `GetChildGoalsFile` is the exception: callback `#26849` returns the Axios response argument unchanged.
- No network calls, login requests, or private-record access were performed.

## Unknown disposition reasons

- Unknown results are not typed from their names, request parameters, or state property names. Catalog listing/search operations with a proven HTTP-body `data` property are now objects with that nested value kept unknown; other results remain unknown where there is no body projection or the response mixes with local/request state.
- Mutation responses remain unknown: request payloads, locally composed state, optimistic updates, and reducer operations are not treated as server fields. No ignored response is represented as an empty success object.
- `GetChildGoalsFile` is unknown rather than binary because callback `#26849` returns the Axios response wrapper without a `.data` projection, and no later unwrapping/body consumer is established; local print/download intent is not MIME/body evidence.
- Plan response actions `#26924`, `#26927`, `#26930`, and `#26933` forward resolved values as action data without reading body properties. That pass-through alone does not prove object, array, or scalar shape.
- `GetCourseAccessCode` and `GenerateCourseAccessCode` remain unknown because the access-code operation name does not prove the body is scalar or structured.

## Positive model findings

- `Categories`: service `#26705` → response-data callback `#26706` → Metro action `#26603/#26604` → shop reducer `#26581`. The action applies `filter` to the returned body and the predicates read item `.type`; the body is therefore observed as an array. `type` remains `unknown` (literal equality is not treated as a runtime type assertion). The locally filtered `productCategories` / `serviceCategories` and their ten-item slices are not modeled as HTTP-body fields.
- Catalog listing/search paths: product screen `#40118` calls category product/service and product search APIs; service screen `#40128` calls category service/service-search APIs; supplier screens `#40391/#40397` call supplier product/service APIs. Their response handlers (`#40120/#40122/#40124/#40126/#40130/#40133/#40136/#40139/#40393/#40395/#40399/#40401`) directly read HTTP-body `.data`, then append/replace local page state. The body root is modeled as object with `data: unknown`; page state does not establish array/item/scalar types.
- `Product`, `KindergartenProduct`, `Service`, and `KindergartenService`: Metro service/action/reducer modules are 2294/2293/2292; shared ItemScreen module 4149 selects the product/service action and reads the unchanged detail body. The partial root models include the directly read fields (including service `code`); `images` array evidence follows the same value to `ImageThumbnails #40054.map`. Later locally merged comments/ratings and UI fallbacks are excluded.
- `UserCart`: screen `#40165` calls `#26654`; action `#26655/#26656` forwards the resolved body as `SET_USER_CART.data`, reducer `#26581` stores it directly, and Cart screen supplies that value to `FlatList.data` (observed root array). Provider `items` is separately read and mapped by `#40172`; update/edit paths that mix local/request values are not used as response evidence.
- `UserOrders`: action `#26675/#26676/#26677` forwards the body; the reducer preserves the page-one object and merges its `data` collection on the later-page branch. The Orders screen supplies `data` to FlatList and reads root `last_page`; this is client handling, not a claim about a universal pagination wrapper.
- `KindergartenOrders`: action `#26679/#26680` dispatches `SET_KINDERGARTEN_ORDERS` for `current_page === 1`; reducer `#26581` stores `action.data` unchanged in that SET case. The body-root `data` is used as FlatList data and `last_page` is read by pagination UI. Later-page `ADD` and optimistic `UPDATE_KINDERGARTEN_ORDERS` (`map`/`Object.entries`/`fromEntries`) are separate branches and are not used to infer the page-one body shape.
- `GetUserOrder` and `GetKindergartenOrder`: OrderDetailsScreen module 4170 routes through `#40230`, then assigns each returned body unchanged to local screen state (`#40233/#40231`); there is no Redux reducer on this path. Shared detail consumers read the modeled root, supplier, rows, and delivery paths; all leaf values remain unknown.
- `Wishlist`: action `#26670/#26671` reads response-root `wishlists` and `contacts`, dispatching them separately. Both remain unknown. Root object nesting is preserved; status is a request/UI branch, not a server enum.
- `GetWorkSchedule`: service `#26549` → response-data callback `#26550` → Metro action `#26518/#26519` → work-schedule reducer `#26501`. The action reads `employees`, `roles`, `lock_date`, `types`, and `holidays`; only `employees` is iterated. Its entries are used by `#26520` to iterate `work_schedules`, where `full_day` is read. Only these directly supported paths are represented; scalar/collection types without direct evidence stay unknown.
- `CategoriesForChild`: handler `#26819` reads HTTP-body `age_groups` and `categories` and dispatches these separately to the child-development reducer; field value types remain unknown.
- `GetEmployeeMeals`: report action `#25999` reads and sorts `body.employees`; comparator `#26000` reads item `user_id`. The body root/array use is modeled; scalar type is unknown.
- `Meals`: report action `#26898` sorts the HTTP body, and comparator `#26899` reads item `name`; its local `{data: sorted}` action wrapper is excluded from response nesting.
- `MealsPerCourse`: handler `#26902` indexes `[0]` and reads `children` and `meal`, but does not establish an array runtime type. Its locally composed report object is excluded.
- Plan action handlers `#26924`, `#26927`, `#26930`, and `#26933` forward resolved values without reading response fields. Their body types remain unknown.

## Limitations / follow-up

This is explicit disposition coverage, not proof that every downstream component chain is exhausted. Fifty-two operations remain unknown where the response is passed through or downstream state mixes server values with local/request mutations. Continue tracing only where body provenance survives reducers; do not promote request fields, optimistic state, or locally composed values by name alone.

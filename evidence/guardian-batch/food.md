# Food-menu static findings

Scope: `GetDayMenu` (#26007), `GetWeekMenu` (#26009), and `DownloadFoodmenuFile` (#37318). Evidence is from the Eliis 2.69 Hermes disassembly and the bundled RNFS native implementation. No login, private-record access, write request, or live call was made.

## Capability summary

| Operation | What the client establishes | Important unresolved points |
| --- | --- | --- |
| `GetDayMenu` | GET path ends in `/foodmenu/day?date={arg}`; the body is returned unchanged, dispatched as `SET_DAY_MENU`, and stored at `state.foodmenu.day_menu`. | No consumer of that stored value was found. Do not assume its shape from the `DayMenu` component: that component receives entries from the weekly response. Date format/window and all response fields remain unknown. |
| `GetWeekMenu` | GET path ends in `/foodmenu/week?date={arg}`; body is stored unchanged at `state.foodmenu.week_menu`. The guardian screen reads root `id`, `info`, and `uploaded_files`, and maps `response.days`; day items expose client reads of `id`, `date`, `breakfast`, `lunch`, `supper`, and `dinner`. Root file entries expose reads of `id`, `filename`, and `name`. | Values are partial client observations, not a complete response contract. Root `id` is an unknown-valued client read, not evidence of type, requiredness, identity meaning, or publication status. Meal/dish/group/variant/course/substitution shapes, last-update/origin/applicability metadata and server date-window semantics are not established. |
| `DownloadFoodmenuFile` | The file `id` is in the URL path. The file `filename` is sanitized for the local destination only. The client downloads opaque bytes using RNFS and a saved cookie, then attempts to open the local file. | Actual MIME type, status, headers/body structure, server-side effects and file-specific role authorization are unknown. Native job/status/byte counts are not HTTP-body fields. |

## Query and date handling

Both menu services build the query into the URL with Hermes string concatenation: `?date=` followed directly by argument 2. Each invokes Axios `get` with only the URL, not a params object. The bundled Axios `buildURL` helper (#5683, `eliis.hasm:257758-257766`) returns the original URL immediately when `params` is falsy, so its query-params serializer does not encode/rebuild these already-present characters. Any later platform/network URL normalization is not established. The main API uses cookie authentication; these handlers add no per-request `Authorization` header/config. The file-download flow, by contrast, explicitly puts the saved access-cookie in RNFS request headers.

The existing research records already contain the `date` query parameter for both operations, so this batch adds no duplicate query-field candidate; the additional serialization/date evidence is recorded in the capability dispositions above and below.

The guardian weekly screen initializes its local date using `.format('Y-MM-DD')` (exactly `Y`, not `YYYY`) and configures its date picker with `dateRange: 'weeks'`. Its effect sends the current date as one argument to `getWeekMenu`. The UI does not compute or send a start/end pair. The picker-updated value is not shown being formatted again, so the initial pattern should not be generalized to every request. Server interpretation, timezone, week boundaries, and interval inclusivity remain unproved. No date-formatting caller for `GetDayMenu` was established.

## Body observations and limits

The weekly success path is body-preserving: Axios `.data` → `SET_WEEK_MENU.data` → reducer `week_menu` → selector `#35898` (which returns `state.foodmenu.week_menu` unchanged) → guardian screen. The screen reads root `id` (only for a truthiness branch), `info` and `uploaded_files`, calls `.map` on root `days`, and passes each original day item to the `DayMenu` component. Root uploaded-file items are mapped separately into a file component. For this reason, the partial observations retain their exact HTTP-body nesting; they are not renamed to speculative `menu`, `menuFiles`, or Redux wrappers.

Every nested value remains `unknown` unless the client proves its primitive/container type. Root `week_menu.id` is likewise `unknown`; its truthiness use does not establish an ID type, requiredness, identity meaning, or publication state. The screen passes each meal property through for display without reading dish/group/variant/course subfields. No substitution or staff-meal-report consumer is connected to the guardian weekly screen. The text “The menu has not been published yet” is local fallback copy rendered when `week_menu` is falsy, its root `id` is falsy, or the screen's local loading state is truthy; it is not a proven server field/status. No timestamp, true origin, or course/filter applicability read was found.

`GetDayMenu` remains explicitly unknown: its response is passed into a distinct `day_menu` reducer property, and no read of that property was found. The separate weekly `DayMenu` component's reads cannot be attributed to this endpoint based on the name alone.

## Access and side effects

The app's navigation checks `user_menu` for an entry with `root_name: 'foodmenu'` before rendering the food-menu item. This establishes a client-side menu gate, not which parent/guardian roles receive it or the server's authorization policy. The weekly screen selects `user.selectedKindergartenId` for its request. No role matrix or role-specific permission rule was established for these three operations.

The weekly menu read stores data locally. Tapping a file constructs a local destination from `filename`, fetches the URL based on file `id`, and opens the downloaded local file. No follow-up API write is traced from the guardian food-menu screen. A separate employee-meal service/action exists elsewhere, but it is not called from this UI path and is not included as a food-menu capability. Server-side logging or other effects of the GETs remain unknown.

Pagination parameters/UI were not found in these flows; that does not establish that the server never paginates. Download response bytes remain opaque, and RNFS `jobId`, `statusCode`, `bytesWritten`, `contentLength`, and response-header event metadata are native download result/event data rather than JSON body properties.

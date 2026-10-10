# Initial xhigh candidate review — guardian food

**Disposition: Hold for one proven response-view omission.** The remaining food-menu response and capability claims are appropriately bounded as static client observations; no other critical unsupported server-contract claim was found.

Scope: `evidence/guardian-batch/food.json`, `evidence/guardian-batch/food.md`, the corresponding research operations, repository evidence rules, and read-only original Hermes source. No live request, private-record access, build, or code/candidate-file edit was made.

## Finding

### P2 — Include root `week_menu.id` in `GetWeekMenu`

The weekly `FoodMenuScreen` reads the selected body’s root `id` at `eliis.hasm:1432605–1432608` (`#35897`) and uses its truthiness to choose between the menu-content and fallback render branches. The selector returns `state.foodmenu.week_menu` unchanged (`#35898`, `1432657–1432664`); the service returns Axios `response.data` unchanged (`#26010`, `1014632–1014638`), the success continuation forwards that body (`#25996`, `1014297–1014309`), and the reducer stores `action.data` directly as `week_menu` (`#25989`, `1014109–1014117`). This is therefore a client-observed **root response-body** property, not a UI-composed value.

The `GetWeekMenu` response candidate currently lists only root `info`, `uploaded_files`, and `days` (`food.json`, `responseCandidates[1].fields`); its capability `establishedFields` likewise omits `id`. Add root `id` as `type: "unknown"`, with evidence pointing to the read and body-preserving chain above. Do not infer a type, requiredness, identity meaning, or publication status from its truthiness. Include selector `#35898` in the trace when recording this root-field path.

For precision, update the unpublished-menu note to say the screen’s local fallback branch is reached when `week_menu` is falsy, its `id` is falsy, or the screen’s local loading state is truthy (`useState(false)` at `1432490–1432495`; render branch/text at `1432605–1432648`). The message remains UI text, not a server publication field or status.

## Coverage and ledger counts

- **Response candidates:** 3/3 — `GetDayMenu` (`unknown`, 0 fields), `GetWeekMenu` (partial `object`, currently 12 observed field entries across root and nested items), and `DownloadFoodmenuFile` (`binary`, 0 fields). The week view should have 13 entries after adding root `id`; no complete schema is implied.
- **Request candidates:** 0.
- **Capability dispositions:** 3 operation ledgers, 37 total entries: 22 established and 15 unresolved. Per operation: `GetDayMenu` 12 (6/6), `GetWeekMenu` 15 (9/6), `DownloadFoodmenuFile` 10 (7/3), shown as established/unresolved.
- **All capability categories:** field dispositions 7 (4/3); query semantics 6 (4/2); permissions 8 (5/3); date/time semantics 5 (3/2); pagination 5 (3/2); read side effects 6 (3/3). Totals: 37 (22/15).

## Claims verified

- **URL construction/serialization:** `#26007` and `#26009` concatenate their second argument immediately after the literal `?date=` and call the shared Axios `get` with the URL only (`1014569–1014585`, `1014606–1014622`). The shared client setup supplies base URL and headers, not default `params` (`#5603`, `254019–254103`); its request interceptor changes cookie headers, not the URL/query (`#5612`, `254346–254392`). Bundled Axios `buildURL` returns its input when `params` is falsy (`#5683`, `257762–257766`). Thus the app does not send these date values as an Axios `params` object and Axios’s params serializer does not encode/rebuild the query. Later platform/network URL normalization remains unknown, as the candidate says.
- **Date handling:** the weekly screen’s initial value uses exactly `.format('Y-MM-DD')` and configures `dateRange: 'weeks'` (`#35897`, `1432471–1432478`, `1432595–1432602`). Its effect sends one current value to `getWeekMenu` (`#35901`, `1432712–1432720`, with call at `1432683–1432688`); it does not construct start/end query values. The candidate correctly leaves picker-change formatting, timezone, interval boundaries, and inclusivity unresolved. No corresponding formatting caller was found for `GetDayMenu`.
- **Body provenance and meal/file nesting:** weekly response body passthrough through service, action, and reducer is established. The screen reads root `info`, `uploaded_files`, and `days`; each original `days` item is passed to `#37310`, which reads `id`, `date`, `breakfast`, `lunch`, `supper`, and `dinner` (`1432524–1432531`, `#35903` at `1432742–1432757`, `#37310` at `1489047–1489296`). The meal values are passed to display content without a proved nested dish/food shape. File items are passed through to `#37314`; `name` is for display, `id` builds the download URL, and `filename` is used for the local destination (`1489553–1489653`, `#37318` at `1489765–1489795`). Hard-coded meal headings/PDF UI properties are not response fields. The candidate correctly avoids inventing dish, group, variant, card-title, course, substitution, timestamp, origin, or applicability fields.
- **Day endpoint separation:** `GetDayMenu` returns `response.data` and stores it at `state.foodmenu.day_menu`, but no read of `day_menu` was found. The similarly named `#37310 DayMenu` receives items from weekly `response.days`; not transferring those item reads to `GetDayMenu` is correct.
- **Fallback and permissions:** the published-message literal is rendered by local UI branching, not read from a response property (`#35897`, `1432605–1432648`). The `user_menu`/`root_name: 'foodmenu'` gate establishes client-side menu visibility, not a guardian-role matrix or backend authorization. The candidate appropriately leaves role policy and server authorization unresolved.
- **Staff flow separation:** the weekly `FoodMenuScreen` calls `getWeekMenu`; `EmployeeFoodMenuScreen` is a separate component (`#37328`, `1490217 onward`) selecting `foodmenu.employee_meals` (`#37329`, `1490546–1490553`) and contains the distinct employee-meal flow, including `saveEmployeeMeal` (`1491749`). No staff meal-report fields or write are attributable to the weekly response. The candidate’s separation is correct.
- **Download response:** the file operation streams downloaded bytes to a local path using RNFS with a saved cookie (`#37318–#37320`, `1489745–1489861`; RNFS native trace in the candidate). The UI PDF label/local filename do not establish server MIME type. Native download metadata is not the HTTP body; keeping the response opaque/binary is correct.

After adding the root `id` observation and clarifying the local fallback branch, the candidate is suitable for integration as an open, partial client-observed response view. Preserve unknown nested meal/file values and all current limits on server semantics.

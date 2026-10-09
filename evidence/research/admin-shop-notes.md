# Admin/shop research notes

Coverage: all 79 functions listed in `/data/data/com.termux/files/home/eliis-analysis/domain-source/admin-shop-index.json` are represented in `admin-shop.json`. Evidence comes from each indexed function in `domain-source/admin-shop.hasm`; Axios `default.<verb>` calls and URL construction were traced from those functions. The callback's `response.data` forwarding supports no complete response model, so all responses are recorded as unknown.

## Query and serialization behavior

- Supplier product/service list functions `26711`, `26713`, `26715`, and `26717` branch on the truthiness of `price`. With a truthy `price`, the URL embeds `JSON.stringify(price)` followed by `JSON.stringify(filters)` in `?price=...&filters=...`; otherwise it embeds `JSON.stringify(filters)` in `?filters=...`. The kindergarten variants place kindergarten ID before supplier ID in the URL. Their supplied `.query` value is separately forwarded as Axios `config.params`; the object shape is not established.
- Shop product/service search functions `26739`, `26741`, `26743`, and `26745` conditionally JSON-stringify truthy `filters` and `price`, mutate those properties on the caller's params object, and pass that object as Axios `config.params`. No deeper shape or value types are asserted.
- Other caller-provided params passed through Axios config are marked `queryPassthrough: true`, with unresolved fields intentionally not invented. Locally assembled query objects in plan functions preserve only the bytecode-proven `type` and `year` keys.
- `categoriesForChild` (`26846`) accepts an optional third argument: when absent it constructs an empty object for `config.params`; when present it forwards that argument unchanged.

## Uncertainties and scope

- Body arguments forwarded by the client are represented as unknown. The locally constructed rating/comment/reason objects list only the proven properties, whose values remain unknown. No server validation, requiredness, enum, response status, or response schema is inferred.
- Path parameter names are descriptive transport placeholders; their domain types are not claimed. The work-schedule update/delete functions derive the schedule URL segment from parameter 2's `.id`; delete also passes parameter 2 as Axios `config.params`.
- Supplier filters and price are interpolated directly into URL text after JSON serialization. This records observed client construction, not server parsing or validation behavior.
- No requests were made; this is static client-bytecode research only.

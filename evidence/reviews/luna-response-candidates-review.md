# Review: Luna response candidates

**Result: PASS — 0 findings.**

Reviewed `evidence/luna-response-candidates.json` and `.md` against the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` and `evidence/public-languages-observation.json`.

- The endpoint IDs, function names, source header lines, paths, and GET calls match: `GetLanguages` #12709 at 509969, `GetUserProfile` #16346 at 649508, `GetUserSettings` #16367 at 649839, and `GetCountries` #26289 at 1022267. Their fulfillment handlers (#12710, #16347, #16368, #26290) each return Axios `response.data` unchanged; none establishes an HTTP-body member.
- `GetLanguages`: #12696 forwards the service fulfillment value to #12697. The latter reads `langs` and `country` directly from that value before dispatching separate Redux actions; combined with #12710, those reads are correctly tied to the projected response body, not inferred from Redux state. The candidate does not claim universal presence or types for either path.
- `GetUserProfile`: #40867 calls `getUserProfile` and its fulfillment callback #40868 only clears loading. #40867 is created by the `UserProfileScreen` component #40854 (1656695, 1656817–1656822); no response-body member is read.
- `GetUserSettings`: #16214 passes the fulfillment value to #16215, which dispatches it as action `data`. Reducer #25102 stores that value at its application-state `user_settings` slot; selector #41035 reads the slot, not a member of the HTTP body.
- `GetCountries`: #26284 passes the fulfillment value to #26285 as action `data`. Reducer #26281 stores it under application-state `countries` and separately derives `lastFetch`; selector #40856 reads the state slot, not a member of the HTTP body. The reducer's initial empty array does not establish the response type.
- The public sample matches `evidence/public-languages-observation.json`: observed `langs`, `lang`, `country`, `domain`, and `countryLanguages` values/shapes are transcribed accurately. Its single-sample limits are preserved; no closed enums, universal fields, or complete response model are inferred. The record states no credentials were used and contains no private-record data.

The candidates keep the normative responses `unknown` and distinguish the Axios projection, app-state forwarding, and observed sample. No corrections recommended.

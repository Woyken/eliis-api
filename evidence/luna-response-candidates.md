# Luna: bounded response observations

The reviewed `GetLanguages` client reads are integrated in `evidence/research/auth-common.json` as non-normative `clientResponseObservations`; its response and the other three candidate responses remain `unknown`. See [`luna-response-candidates.json`](luna-response-candidates.json) for the trace and citations.

## Findings

- **GetLanguages (#12709):** bytecode returns Axios `response.data`. The traced consumer (#12697) reads only `langs` and `country`, then forwards those values in separate Redux actions. The client-accessed body paths are observations, not guarantees of server presence or types. A separately recorded unauthenticated public sample (`public-languages-observation.json`, 2026-10-09) contains `langs`, `lang`, `country`, `domain`, and `countryLanguages`; only `langs` and `country` are read in this consumer chain. The sample is not a universal shape or a closed enum.
- **GetUserSettings (#16367):** bytecode returns `response.data`; the traced action and reducer forward/store that value unchanged. A selector reads the Redux `user_settings` slot but no HTTP-body member. `user_settings` here is an application-state name, not evidence of a body property.
- **GetCountries (#26289):** bytecode returns `response.data`; the traced action and reducer forward/store that value unchanged. The reducer also derives `lastFetch` locally. The selector reads the state slot, not an item property; its initial empty-array state does not establish the endpoint response type.
- **GetUserProfile (#16346):** bytecode returns `response.data`. In the traced UserProfileScreen path, the fulfillment callback only clears loading and does not inspect the result. Fields read from other Redux state were not attributed to this response.

## Boundaries

`response.data` is an Axios-wrapper projection. `action.data` and Redux state are downstream app values, not HTTP envelopes. No response object was modeled as closed; no unproven field types, requiredness, nullability, statuses, defaults, or content types were added to the contract. Work was limited to these four endpoints and existing local bytecode/public-observation evidence; no live requests or app interaction were performed.

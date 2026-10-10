# Guardian discovery candidate review

**Review outcome:** request focused corrections before integrating the discovery response rows. The finalized candidate correctly adds the init-derived child picker fields and the course-list `id`/`name` observations, and it preserves the guardian-ownership, course-enrollment, and server-authorization boundaries. The main blocker is the `GetChildProfile` caller/state attribution: the cited MyChild screen call passes a false thunk-context flag, so it does not write the response remainder to the `myChild.child` slice whose `name` and `profile_picture` the candidate cites.

## Reviewed snapshot

| Input | SHA-256 |
|---|---|
| `evidence/guardian-batch/discovery.json` | `ef0445a47eb58760a60d09190b66896fbdb7d276f74a6596e9c9412a1df66fe8` |
| `evidence/guardian-batch/discovery.md` | `07be126cab69cd72c02d1be353af648ec61e8026804750a3c2645040bfcd6497` |
| `evidence/guardian-batch/CONTRACT.md` | `884faeda402763a21b1c64df8ff8f4ee66a3a5a33b57d2c1dcf49d73639293ab` |
| `AGENTS.md` | `2bd289f6bc7dcb19473a921778945abed72553adb5f170ae557766c3ede2532d` |
| Original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| `scripts/check-guardian-batch.mjs` | `91d8b320ae2e743991cdc167652e55f565b5143d41ab143d86437890199ebb1e` |
| `scripts/generate.mjs` | `80b238d27230aa8ef3993523e77bf00ed114c92a6d2dc2370478edeb5429b2e9` |

Static review only. No private API access, writes, or app actions.

## Findings

### 1. Blocker — `GetChildProfile` fields are attributed to the wrong thunk branch

The response candidate and capability prose connect the name/profile-picture reads to `MyChildInfoScreen #44120` and `myChildReducer #25496`, but the cited callsite does not take that reducer branch:

- `MyChildInfoScreen #44120` stores the result of selector `#44122` in local environment slot 5 and selector `#44123` in slot 6 (`eliis.hasm` 1800128–1800139). `#44122` returns `state.myChild.child` (1800699–1800711); `#44123` returns `state.myChild.child.kindergarten_id` (1800716–1800728).
- In `#44124`, the call loads slot **5**, route `childId` from slot **7**, then literal `false` before invoking imported `getChildProfile` (1800742–1800754). It does **not** load slot 6 for the first argument. Thus the evidence currently says the kindergarten path value is `myChild.child.kindergarten_id`, while this call appears to pass the whole `myChild.child` value as argument 1. Recheck this register flow and correct the caller-provenance claim.
- The action identity is traceable through Metro: MyChild screen module `M4522` (`#44117`) has dependency index 26 = `M2239` (loader table 22735–22738); `M2239` factory `#25509` exports `getChildProfile` as `#25517` (1000251–1000252), and its child-service dependency is `M2241`, whose `ChildServices #25620` registers `getChildProfile` as `#25634` (1002896–1002947). `#25517` stores its third explicit argument in its thunk context (1000513–1000519).
- In `#25519`, a truthy context selects `SET_MY_CHILD_COURSES` and `SET_MY_CHILD`; a false context selects `SET_CHILD_COURSES` and `SET_CHILD` (1000558–1000561, 1000587–1000595). Therefore this `#44124` call takes the `SET_CHILD` branch handled by `childReducer #25684`, not `SET_MY_CHILD` handled by `myChildReducer #25496`.
- `#44120` does read `myChild.child.name` and `profile_picture` (1800250–1800253), but the selector returning that state is `#44122` (1800699), **not `#44121`**; `#44121` returns `state.user` (1800687–1800694). The current candidate trace names the wrong selector and does not bridge the cited false-flag response to the state it reads.

**Minimal fix:** keep the fields only if an exact response → true-context `#25519` branch → `SET_MY_CHILD` → `#25496` → `myChild.child` consumer chain is documented (there is a separate `ChildInfoScreen #44673/#44679` caller to investigate, which passes `true`). Otherwise remove `name` and `profile_picture` from the `GetChildProfile` response fields and retain them as unresolved/local-state reads. Correct the selector ID and the #44124 first-argument evidence either way. Do not infer the route `childId` came from the init picker: the candidate's explicit missing-handoff boundary is supported.

### 2. Major — `active_courses` is deleted from the callback's response object before the local merge

The response-callback narrative says a copy is made and `active_courses` is deleted from that copy. In `#25519`, `r4` is the callback's parameter 1 (`eliis.hasm` 1000552); `DelById` targets `r4.active_courses` at 1000578. The `Object.assign` sequence that creates the state wrapper follows at 1000581–1000586. There is no preceding copy in this callback. The later wrapper is local and must not become an HTTP `course` property, but the mutation boundary in `readSideEffects`/`discovery.md` is currently misstated.

**Minimal fix:** say that the callback reads and dispatches `active_courses`, deletes it from the response object passed to the callback, then constructs a separate merged object for the selected child state. Keep the response model open and do not model the local `course` wrapper.

### 3. Coverage gap — init-derived `guardians` has a proven nested kindergarten read

The candidate correctly leaves guardian-to-child identity and authorization unresolved, but `guardians` need not remain wholly unknown. `#16202` dispatches the init body's `guardians` as `SET_USER_GUARDIANS.data` (646219–646229); `userReducer #25102` stores that action data under `user.guardians` (986152–986157, branch 986521–986529). Selector `#34583` applies `.find` to `state.user.guardians` (1356546–1356557), and predicate `#34584` reads each candidate's `kindergarten_id` and compares it to selected-kindergarten state (1356562–1356571).

**Minimal fix:** model the client-used `guardians` collection and `guardians[*].kindergarten_id` with unknown leaf type, each with its own evidence. This proves a client-side kindergarten match only; it does not supply guardian IDs, a guardian-to-child join, or a stable-ID guarantee. The candidate's ownership/authorization blocker remains correct.

### 4. Coverage gap — `GetChildCourses` has a second direct item-ID use in the same screen effect

The candidate's array/item `id` and `name` fields are supported by the response → `#25523` → `#25496.plansCourses` → `#44259` → `#44274` chain. The exact Metro action import is also confirmed: `ChildPlansScreens` module `M4526` (`#44255`) has dependency index 16 = `M2239` (loader table 22755–22758); `M2239/#25509` exports `getChildCourses` as action `#25521`, and that thunk calls the child service from `M2241` (`#25522/#25523`, 1000614–1000665; service `#25624`, 1003154–1003176).

The same effect `#44264` also tests the resolved body for null/`length` and, when nonempty, reads `body[0].id` and passes it to `getChildCoursePlanTypes` (1806702–1806732). The corresponding service `#25626` puts its third argument into `params.course_id` (1003209–1014). This is a proven client ID-to-follow-up-query use, not proof that course items are enrollments or that their IDs are stable. Mention the follow-up read in the capability/read-side-effects trace; no write or seen request is established.

### 5. Non-blocking coverage note — permissions claims are careful but not a complete gate inventory

The three listed reads (`diary_access_course`, `diary_access_manager`, `applications_access_manage`) are correctly described as truthiness-only client gates, with no Boolean-wire-type or server-authorization claim. The candidate explicitly says the list is partial. For the requested guardian feature-gate view, more concrete selectors are available: DashboardScreen `#34546–#34548` reads `surveys_access_index`, `surveys_access_questionnaires`, and `surveys_access_polls` (1355239–1355303); `#34550` reads `workschedule_access_index` (1355331–1355349); ChildInfoScreen selector `#44676` reads `child_access_managerfields` (1827991–1828006). They are still unknown-typed client conditions, not server authorization. Add the relevant ones or preserve the current three-key boundary explicitly; do not call them roles or server policy.

## Row checks

- **`GetUserData`:** request/query and date/page claims are supported by `#16344` (649457–649487). The finalized `children` partial model is supported end-to-end: `#16202` → `#25102` → `#34531/#34536` → mapped row `#34568` reads `id`, `name`, and `profile_picture` (1354747–1354749; 1355093–1355100; 1355924–1356043). Those values are client-visible in the child picker, but no trace joins them to an init guardian or proves that the picker ID becomes `MyChildStack.route.params.childId`.
- **`GetUserPermissions`:** path/no-query/date/page and the three documented truthiness semantics are supported; the non-authorization caveats are accurate.
- **`GetChildProfile`:** URL/response projection, `active_courses` read, and unknown nested `.type` are supported. The MyChild branch and caller argument provenance are not supported by the cited `#44124` path, as detailed above.
- **`GetChildCourses`:** request shape, passthrough, reducer target `myChild.plansCourses`, array/item view, and unknown ID/name types are supported. No enrollment/active semantics or match to `active_courses` is proven.

## Validation

- `validateResponseAnalysis` passed all four finalized response candidates.
- Read-only `node scripts/check-guardian-batch.mjs` passed: 17 response candidates and 17 capability rows. These validators check structure/scope, not the source-attribution findings above.
- No build, Git operation, HTTP request, or repository-file change outside this review report.

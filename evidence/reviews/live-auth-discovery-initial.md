# Initial review — live auth/discovery candidates

**Outcome:** The six endpoint body/root inventories agree with the redacted observed-shapes file and the published partial static models. No static TypeSpec/OpenAPI field change is warranted from these samples. Before calling the candidate complete for relationship observations, add two generic, sample-only equality outcomes noted below. Keep all live types and relationships non-normative and context-specific.

## Review scope and method

Reviewed `evidence/live-audit/auth-discovery-candidates.json` and `.md`, `evidence/live-audit/observed-shapes.json`, the six response models in `models/responses.tsp` and generated OpenAPI, and the cited regions of the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. Static bytecode evidence was checked at the service → projection/caller → consumer boundary. Only redacted field names/types and generic equality outcomes are discussed here. No raw private capture was opened, no HTTP request or app action was made, and no request, write, credential, cookie, session, identity value, personal scalar, or sampled status/code literal is reproduced.

The redacted shape inventories match exactly by flattened body-property/type path, including object/array item-shape nodes:

| Operation | Candidate paths | Redacted shape paths | Root shape |
|---|---:|---:|---|
| `Login` | 3 | 3 | object |
| `Login2FA` | 2 | 2 | object |
| `GetUserData` | 73 | 73 | object |
| `GetUserPermissions` | 32 | 32 | object |
| `GetChildProfile` | 48 | 48 | object |
| `GetChildCourses` | 4 | 4 | array of observed object items |

These are sample-shape counts, not schema field counts. The current partial static models contain 32 named property occurrences across the six operations (3, 2, 14, 8, 3, and 2 respectively). The generated OpenAPI property sets mirror those partial models; all six generated responses remain `default` with `*/*`, so the observed transport status/media labels must not be generalized into response status or media contracts.

## Endpoint comparison

| Operation | Static / bytecode comparison | Sample-only boundary |
|---|---|---|
| `Login` | The optional unknown fields `type`, `identifier`, and `locked_out` in the static model match the body paths. `#16308` returns the Axios promise; `#13510` reads `response.data.type` and forwards `response.data`, while `#27139/#27140` read `identifier` and `locked_out` from that challenge value. Axios `response.status` is not a body field. | One captured challenge observed `type:string`, `identifier:string`, and `locked_out:null`. Keep all three static fields unknown/optional; the null is not a nullability/default claim. No challenge value is published.
| `Login2FA` | Static `status` and `locked_at` match the body paths. `#16310` projects `response.data`; `#27143` reads `status` and reads `locked_at` only on the branch where status differs from the client literal. | One capture observed `status:string` and `locked_at:null`. Keep the status value private: the client comparison literal is not a server enum, and no real response code/status literal belongs in the candidate. Keep both static fields unknown/optional; do not infer nullability or lockout behavior.
| `GetUserData` | Static roots are `kindergartens`, `organizations`, `employees`, `guardians`, `children`, `officials`, and `user`; the partial nested view covers institution IDs, guardian `kindergarten_id`, child-row `id`/`name`/`profile_picture`, and `user.privacy_confirmed`. `#16344/#16345` project the init body; `#16202` reads/dispatches the roots and reads `user.privacy_confirmed`; `#34584` reads guardian `kindergarten_id`; `#34568` reads the init child-row fields. The model is not a full init payload. | The sample adds root `login`, `suppliers`, `supplier_reps`, `unreadAnnouncementCount`, and `cartData`, plus many nested user/institution/guardian/child observations. `user.phone`, `user.country`, and `user.language` are observed nested structures; `kindergartens[]`, `guardians[]`, and `children[]` have sampled object items. Empty arrays—including `organizations`, `employees`, `officials`, `suppliers`, `supplier_reps`, and `cartData.items`—reveal no item shape. In particular, the static `organizations[].id` read remains valid although no organization item appeared in this sample. `user.is_admin` is a sample-only path here, not a new static role/authorization claim. Preserve unknown static types.
| `GetUserPermissions` | The existing eight optional unknown fields match the selector-backed partial model: the runtime sample intersects `surveys_access_index`, `surveys_access_polls`, and `surveys_access_questionnaires`; selectors `#34544–#34550` and `#44676` account for the eight bytecode-backed names. These are truthiness reads, not proof of Boolean wire types or server enforcement. | The sample has 32 integer-valued property paths: 3 overlap and 29 are sample-only; 5 of the 8 static fields are absent from this one sample. Keep all eight static fields, including absent ones, and do not narrow sample values to an integer/Boolean permission domain. Sample absence must not erase separately bytecode-backed user/role fields either.
| `GetChildProfile` | Static body fields `active_courses`, `name`, and `profile_picture` agree with observed root paths. `#25634/#25635` return the body; `#25519` reads root `active_courses`, reads candidate `.type` in `#25520`, and locally deletes `active_courses` before building the Redux value. `name`/`profile_picture` are supported through the separate true-context caller path, not by treating the local wrapper as HTTP data. | The sample adds root paths including `course_dates`, `all_dietary_options`, and `data`, and shows `course_dates[]` metadata (`course_child_id`, `course_id`, names/type, and date-range fields) and `active_courses[]` (`id`, `name`, `type`, `active`). These shapes and observed primitive labels remain sample-only. No date semantics, enum, nullable contract, or local reducer wrapper should be added to the static model.
| `GetChildCourses` | Root array and static item fields `id`/`name` match. `#25624/#25625` project the array and the consumer `#44274` reads `id`/`name`; no active-field consumer or stable/global ID contract is shown. | The sampled item additionally has `active:boolean`; record it only as a one-sample type observation. Keep this response array distinct from `GetChildProfile.active_courses` and `course_dates`; do not promote active/enrollment semantics or a universal ID join.

## Finding — add two redacted, sample-only equality outcomes

**Minor completeness issue; not a static-model blocker.** The candidate already records that a sampled guardian `user_id` matches root `user.id`, and that guardian/child institution keys match returned institution data. It does not record two other generic comparisons available from the sampled paths:

1. The `GetUserData` child institution key matches the `GetChildProfile` institution key for the sampled child.
2. The sampled `GetChildProfile.active_courses[].id` values match the corresponding `course_dates[].course_id` values.

**Minimal fix:** add only generic equality outcomes (no compared values or identities) to the candidate's redacted relationship checks. Label each as this captured account/context only. This helps explain that the bounded child/institution reads were internally consistent for this sample; it does **not** establish a general guardian-ownership rule, a server authorization policy, or an explicit guardian-to-child join. Do not assert a causal or universal relationship between `GetChildCourses` items and either profile collection from these comparisons.

## Integration guidance

- The current partial static models are evidence-backed client views, not incorrect schemas merely because a runtime sample is wider. Candidate-only names/types should remain separately provenance-labeled sample metadata unless independently traced to original code or a permitted public response.
- Keep null observations as observations; all static field values remain unknown/optional. Do not publish real 2FA status/code values, enums, defaults, dates, or identity/scalar values.
- Preserve the known permission fields that are absent from this sample. The one sampled `user.is_admin` path likewise does not establish a universal role model.
- Course/profile property-name overlap and generic sample ID equality do not prove server enrollment semantics, stable IDs, or a cross-endpoint contract.

No change to research, response analysis, TypeSpec, generated OpenAPI, or candidate JSON is requested by this review; the integration owner can decide whether to capture the two equality outcomes in the candidate metadata.

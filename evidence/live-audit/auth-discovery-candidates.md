# Live auth/discovery model-audit candidates

This is a redacted, context-specific audit of `Login`, `Login2FA`, `GetUserData`, `GetUserPermissions`, `GetChildProfile`, and `GetChildCourses`. It compares the local private samples' **body shapes and JSON types** with existing static response analysis and compiled OpenAPI schemas. The JSON companion records the per-property inventory. Neither file is a server-complete contract or an instruction to tighten schema types from one sample.

## Privacy and evidence boundary

- Source captures remain in the local private config directory; no raw response, credential, cookie, request identifier, or scalar value is copied here.
- Only body-property names, observed type labels, source-function/line references, and generic equality outcomes are recorded. Personal values (including identity, name, address, birth and ID-code values) are not recorded.
- Top-level capture transport metadata is not included as a body field. In particular, Axios/HTTP status is not confused with a body property.
- `observedTypes` means “the JSON type in this capture.” `null` is not a claim of universal nullability, and a non-null sample is not a claim of non-nullability. No requiredness, defaults, enums, or server authorization behavior are inferred.

## Six-operation discrepancy summary

| Operation | Body/root comparison | Static omission cause | Candidate treatment |
| --- | --- | --- | --- |
| `Login` | Object root agrees; `type`, `identifier`, and `locked_out` all match existing model paths. Sample types: string, string, null. | Names are backed by `#13510`, `#27139`, and `#27140`; static consumers did not establish wire types. | Keep fields optional/unknown in static schema; optionally attach sample-only type annotations. Do not generalize the null observation. |
| `Login2FA` | Object root agrees; `status` and `locked_at` match the model. Sample types: string and null. | `#27143` reads `locked_at` on the non-success client branch, while this sample has null; that is a branch/sample difference, not proof of a static error. | Keep both optional/unknown. Do not emit the sampled status literal or create an enum. |
| `GetUserData` | Existing seven static roots are present, plus `login`, `suppliers`, `supplier_reps`, `unreadAnnouncementCount`, and `cartData`. Numerous extra properties occur under `user`, `kindergartens[]`, `guardians[]`, and `children[]`. | `#16202` and its traced consumers inspect only a partial view: selected roots, `user.privacy_confirmed`, selected institution IDs, selected guardian kindergarten ID, and selected child-row fields. Empty sampled arrays provide no item evidence for those arrays. | Keep the partial bytecode-backed model. Preserve new names and observed types only in sample annotations until independently source-traced; do not infer a complete init response. |
| `GetUserPermissions` | Object root agrees. Current model has 8 fields; sample has 32 integer-valued keys, 3 overlapping, 29 sample-only. Five static fields are absent from this sample. | Static evidence explicitly follows a small selector set (`#34544`–`#34550`, `#44676`), not every permission key. Truthiness reads do not prove Boolean wire types or server enforcement. | Retain the existing five unobserved static names and unknown types. Candidate additions are sample-only names/types; do not treat integers as a permission domain or complete inventory. |
| `GetChildProfile` | Object root agrees, but sample contains many additional fields, including nested `course_dates`, `all_dietary_options`, `data`, and populated `active_courses` item properties. | `#25519` traces root `active_courses` and a local deletion/wrapper; `#25520` reads only candidate `type`. The separate `#44679` true-context UI path reads `name`/`profile_picture`. Wider payload is not individually traced by these consumers. | Preserve root `active_courses` and existing partial fields. Record other paths/types as sample-only; do not model the reducer wrapper or claim complete profile shape. |
| `GetChildCourses` | Root array and object items agree. Existing static item fields `id`/`name` match; captured item also contains `active`. | `#44274` reads only `id` and `name`; no active consumer is traced. | Keep the partial array/item model. Add `active` only to sample metadata absent further source evidence. |

## Corrections and boundaries

### Authentication

Both auth body root models already name every property seen in these samples, so there is no justified root-field correction. Their remaining discrepancy is evidence depth: the captures show types, while static code analysis left those types unknown. These values should be represented, if integrated, as non-normative sample type observations—not required fields, universal nullability, status enumerations, or lockout rules. `Login2FA.status` is recorded as a string type only; no sampled status value is published. The rejection-only `message` reads remain distinct from successful response bodies.

### Init/discovery

The sample-backed extra root names are `login`, `suppliers`, `supplier_reps`, `unreadAnnouncementCount`, and `cartData`. Additional observed nested paths/types are enumerated in the JSON companion. They were missed by the static model because its bytecode trace follows the init handler and a specific subset of Redux/UI consumers, not because a complete response was proven to lack them. Existing unknowns should not be tightened from these samples.

The locally evaluated generic equality checks found, in this captured init payload, a guardian `user_id` equal to the root user `id`; guardian and child `kindergarten_id` values each matched a returned kindergarten `id`; and a guardian/child kindergarten-key match. Two further checks are true for this captured context: the init child `kindergarten_id` matches the `GetChildProfile` `kindergarten_id`, and the observed `GetChildProfile.active_courses[].id` set equals its `course_dates[].course_id` set. Only Boolean outcomes are published; no compared identifiers or counts are included. These sample-only equalities are consistent with this account/institution/child context, but the init comparison is **not** an explicit guardian-to-child ownership join and does not establish cross-institution authorization or server access policy. The separate `guardians` and `children` collections remain unjoined by the evidence. The profile ID-set equality does not prove course or enrollment semantics, a stable/global ID contract, or a join to `GetChildCourses`; even a single distinct matching ID in this sample would not establish those claims.

The permissions capture has a broader set of keys than the eight selector-backed fields in the partial static model. All 32 happened to be integers in this sample. The correct cause is partial static consumer coverage; neither the sample nor JavaScript truthiness establishes Boolean/0-or-1 semantics, accepted server fields, or access-control enforcement. Five static fields absent from this capture remain bytecode-backed and must not be removed.

### Child payloads

`GetChildProfile` most clearly demonstrates the difference between a partial consumer model and a sampled payload: static evidence accurately preserves `active_courses` at body root despite its local removal before Redux storage, and records `name`/`profile_picture` through the separate true-context path. It does not attribute a complete object to that consumer. The sample-only paths include fields and nested records not traced by that static consumer. Their names and observed types are preserved only as candidate annotations. In particular, the existence of both `GetChildProfile.active_courses` and `GetChildCourses` does not identify their entries as the same enrollments or provide a causal ID join.

For `GetChildCourses`, the actual current discrepancy is one unconsumed sample field (`active`); root array shape and the two statically observed names align. Its observed Boolean type is not enough to assert the field's accepted type or meaning universally.

## Source references

- `evidence/responses/auth-common.json`: `Login`, `Login2FA`, `GetUserData`, `GetUserPermissions`.
- `evidence/responses/children-diary-files.json`: `GetChildProfile`, `GetChildCourses`.
- `models/responses.tsp` and `tsp-output/@typespec/openapi3/openapi.json`: current partial response models/OpenAPI representation. The OpenAPI property sets mirror the partial static views; they do not purport to include all fields visible in the live samples.
- Local original source: `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, using the function IDs and offsets cited in the static evidence records above.

No request was issued during this audit. No shared response analysis, research record, generated schema, or source model was edited.

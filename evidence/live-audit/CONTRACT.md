# Runtime model-audit evidence

Raw response bodies are private and untracked. The local capture directory is outside the project. Investigators may read those files through scripts that emit **only** structure, field names, types, counts and generic equality checks. Do not use the file read tool to dump private bodies, and do not print passwords, cookies, identifiers, names, descriptions, dates of birth, addresses, event details, diary content or menu text.

Candidate fixes must cover the 17 guardian-scope observations as sampled, safe pending reads, skipped with an access/side-effect reason, or unavailable authentication branches. Candidate-only files are not generator inputs until reviewed and integrated. Existing static evidence is retained where it represents a legitimate unobserved branch; sample absence alone is not a reason to remove a field.

## Provenance

- `static-source`: body attribution/type supported by original service → caller → reducer/consumer tracing.
- `authenticated-sample`: observed shape/field/type in this account/context. This does not prove requiredness, accepted values, server nullability, completeness, stable IDs or every role/date variant.
- `public-sample`: separately recorded language-list result; not part of authenticated model claims.

Each candidate correction must identify the endpoint/source function, before/observed model paths, cause, original-code proof where possible, and the proposed partial model. Observed primitive types can be retained as sample metadata; do not universally narrow a field merely because one sample had one type. Null observations are not constant-null schemas. Native download bodies remain opaque rather than becoming JSON metadata.

Response root-kind mistakes require source investigation of the Axios/Redux boundary. For example, `action.data.items = HTTP_body` does not prove that `items` is an HTTP body key. Similarly, fallback `{}` and empty arrays need explicit sample-only descriptions, not fabricated closed response schemas or absence/publication rules.

All current shared-file edits will be performed by a single integration owner after xhigh candidate reviews. Post-integration review/fix rounds are capped at four, seeking two consecutive clean whole-audit rounds. Earlier static certifications do not cover new authenticated observations. No explicit feature writes, seen/read requests, logout, staff-roster substitution or unproved secondary staff diary reads are authorized.

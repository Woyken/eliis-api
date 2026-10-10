# Authorized read-only model audit

This audit follows the user's authorization to authenticate and issue read-only requests against their account's discovered institution and child. It is separate from the prior static-only certifications.

## Boundaries

- Credentials, session cookies and raw private responses stay under the local private config directory, outside Git.
- Only account-discovered identifiers may be used; no staff rosters, enumeration of unrelated records, or cross-child reads.
- No explicit write, seen/read, logout, or state-changing feature requests. GETs may still create server access logs or unobservable server effects.
- Login/2FA already completed. Do not repeat or probe failing credentials.
- Secondary `/api/kindergartens/{kindergartenId}/diary` remains unproved for guardians; do not request it as a substitute.
- Live samples establish observed shapes and field types for this account/context, not universal server-requiredness, nullability, enum domains, or completeness.
- A live/static discrepancy must be traced to its cause. Do not silently overwrite evidence of another legitimate branch or model all possible branches from one sample.

## Agent workflow

Only Luna medium investigation/implementation and Luna xhigh review subagents. Investigators produce candidate corrections without shared-file edits; one integration owner applies reviewed changes. At most four post-integration review/fix rounds, seeking two consecutive clean reviews. Real evidence/model/compiler problems only, no cosmetic rewrites.

The scoped audit covers the 17 guardian-batch endpoints: sampled, safely requestable, skipped for access/side-effect uncertainty, or unavailable challenge-only cases. Each path must get an explicit discrepancy/disposition record. Raw private data must never appear in tool summaries or tracked evidence; only field names, shapes, types, generic equality relations and redacted query patterns may be published.

Final phase: completed and stopped at the four-round review cap.

The bounded sampling phase is finished: 15 captures cover 14 of the 17 requested endpoints, including two status-log dates. The unused guardian-diary helper, employee/course diary endpoint, and unnecessary file-only menu download are skipped with explicit reasons. No explicit feature writes, seen/read requests, staff rosters, logout, or retries were made. Login/2FA are the authorized session-creation exceptions.

The event-list discrepancy was traced to its actual cause: a locally constructed Redux action `items` field was incorrectly modeled as an HTTP response wrapper. The static root model is corrected to an array, preserving all valid item fields. Wider live discovery/calendar/menu payloads are omissions from partial static views, not proof all unobserved static fields are wrong. Separate, explicitly sample-qualified model artifacts capture observed shapes without replacing universal contracts or asserting requiredness/nullability/enums.

Only redacted structural observations are tracked. Explicit child-ID mismatches in the one guardian-feed read were checked before exporting its shape; zero mismatches does not establish ownership of unlabelled/group content or other-child feedback visibility.

Initial candidate and code reviews are complete and corrections integrated. The exact approved 15-label/14-operation set is bound to source identities; catalog-known skipped operations are rejected. Final validation: all 38 tests, production TypeSpec compilation, canonical JSON/YAML checks, guardian coverage, live structural validation and a zero-vulnerability dependency audit pass.

The structural validator is not a general PII detector. Numeric/UUID keys and value-bearing shape fields are rejected, but identifier-like dynamic keys could still be personal data; field-name export therefore also requires manual/xhigh review. Current artifacts include schema property names and types only. No sampled private scalar values are published.

Post-integration round 1 was not clean: scope admission, static/sample evidence separation and current-facing documentation were corrected. Round 2 was clean. Round 3 failed because namespace-qualified sample schemas were included as unreferenced canonical OpenAPI components and the checker missed their names.

The sample TypeSpec import was removed from canonical compilation, and regression guards now reject qualified `Observed_*` names and sample-view component markers. Both canonical OpenAPI formats contain zero sample components. Standalone sample TypeSpec and JSON schema artifacts remain available separately.

Round 4 reviewed frozen input digest `110f6f8331b3792998668d55ce66563aed9c7b7fcf144a403c758ab118db8b3c` (80 files) and was clean with no remaining actionable findings. **The two-consecutive-clean goal was not achieved** because round 3 failed. Work stopped at the four-round cap, without claiming final certification. No more API requests or review cycles are part of this completion.

The supplementary public-source REA assessment was added to the final frozen inputs. REA has no evidenced Hermes HBC decoder; no REA installation, configuration, target execution, or private data transfer was performed.

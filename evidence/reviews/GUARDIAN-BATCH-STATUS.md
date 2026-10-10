# Guardian-facing endpoint batch

User-defined scope: 17 endpoint observations covering authentication, signed-in guardian/child discovery, events, attendance/absence, guardian diary/feed, and food menus.

Deliverables: evidence-backed partial models, exact source/consumer traces, a capability table, and remaining blockers for HA setup and features. Only static analysis; no authenticated/private API reads or writes.

Six Luna medium researchers own separate candidate files. Luna xhigh reviewers validate field attribution and semantic claims before one integration owner updates shared request/response evidence. Post-integration review/fix loop is capped at four rounds, seeking two consecutive clean reviews.

Safety boundaries: no staff-roster substitution for parent discovery; missing arrival logs do not establish absence; group content does not establish guardian visibility of other children's feedback; secondary diary endpoint use requires a proved guardian access path. Format strings and client conditional behavior do not establish server date inclusivity, permissions or status meaning by themselves.

Current phase: focused tracing and initial candidate reviews. Auth continuation links, weekly menu `id`/fallback conditions, event detail/export reads, and candidate/schema merge issues have been corrected. Diary item-renderer and MyChild-branch enrichment is in progress; downstream discovery fields await the final candidate review. All 17 response candidates and capability rows pass structural checks, and all 25 tests pass. These checks do not certify semantic claims.

Shared integration is complete for the 17 scoped observations and four query records. The generated capability table and HA blocker document cover all 17 endpoints. Overall response coverage is now 92 partial models, 189 unresolved schemas and 15 opaque downloads across the unchanged 296 operations.

The original discovery review's selector mapping was contradicted by the disassembly; the verified correction and function/environment-slot evidence are recorded in `guardian-discovery-selector-resolution.md`. Source evidence takes precedence over a mistaken review assertion. The false/true context branch and guardian-authorization boundaries remain separate.

All 28 tests, the real guardian-batch checker, TypeSpec compilation and exact JSON/YAML response/request checks pass. The batch is not yet finally certified: its post-integration review loop begins after freezing, with at most four rounds and two consecutive clean rounds as the target. Existing publication/response expansion reviews remain historical and do not certify this batch. No unproved guardian/server semantic is promoted to an integration guarantee.

Round 1 completed and was not clean: auth rejection-only messages were folded into fulfillment models; three enriched response records retained stale opaque descriptions; diary `texts` overclaimed a record-only shape. These were corrected while preserving source evidence: auth rejection messages are non-normative observations, enriched summaries are current, and `texts` stays unknown because the client check also admits arrays.

Round 2 completed and was not clean: feed date-branch evidence was reversed and a calendar summary retained stale no-field wording. Original register/branch tracing confirmed that a truthy stored cursor is copied when page is not 1; otherwise the no-argument formatter result is used. The result's server meaning remains unknown. Both findings were corrected and regenerated.

Rounds 3 and 4 reviewed the whole corrected 17-operation batch at frozen input digest `cfa1ca933d6f73c539f6f02efe866a657c1afffde4a3064ad696c3acfbbbe457` (60 files). Both returned zero findings; all frozen inputs remained unchanged. Read-only guardian coverage and compiled JSON/YAML checks passed, while the coordinator had already run all 28 tests and TypeSpec compilation.

**Completed and stopped at four rounds: two consecutive clean batch-wide reviews.** The evidence-backed partial models, endpoint capability table, and HA blocker list are certified for this bounded static scope—not complete server schemas or guardian authorization. Missing arrival logs remain unknown, secondary diary access remains unproved, and enrollment/ownership, date inclusivity/timezone, status meanings, pagination completeness and feedback visibility remain blocked wherever the source does not prove them.

No further review/search loop, live login, private-record access, API mutation, or Home Assistant implementation is part of this completion.

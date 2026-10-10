# Static response-model expansion

Requested scope: every documented API operation, using static analysis only. This is separate from the earlier bounded request-field additions.

## Method

Five Luna medium agents trace response projections, callers, actions, reducers and consumers across all five domains. A sixth medium agent implements the TypeSpec/OpenAPI response pipeline. Luna xhigh reviewers will validate original-source attribution and generated model projection.

- All 298 research observations / 296 canonical operations must have an explicit response-analysis disposition.
- Typed response models are partial client-observed views. Unproved properties/types remain unknown; objects remain open and properties optional.
- Opaque or ignored responses remain explicitly analyzed unknowns, not empty guessed DTOs.
- Native downloads are opaque transport bodies, not JSON objects containing RNFS job metadata.
- HTTP body nesting must be preserved through service projections; optimistic state updates and request fields are not response fields.
- No server-requiredness, response status, content type, enum, default or nullability is inferred without separate proof.

## Review limit

At most four post-integration review/fix rounds, seeking two consecutive clean reviews of the full response expansion. No cosmetic fixes or unlimited loops. Static completeness limits must be reported even if reviews pass.

Domain tracing, initial xhigh reviews and medium corrections are integrated. Production generation/checks pass with all 298 research observations accounted for: 87 partial models, 194 unresolved schemas and 15 opaque download bodies across 296 operations. The unresolved count includes incomplete consumer coverage; it is not proof that those endpoints return no modeled fields.

Post-integration round 1 is complete and **not clean**. Tooling/downloads passed, while the two source-model scopes identified trace-label/callback omissions, additional cart/image/category reads, and an employee-meals service misattribution. Medium agents applied those exact corrections; no exploratory scope was added. No clean response-model rounds are certified yet.

Round 2 completed and was **not clean**. It found one unsupported response field (`UpdateMessage.recipient_read` was a local reducer destination), two omitted questionnaire body reads, and several reader/citation trace issues. These were corrected against the original bytecode; request contracts stayed unchanged.

Rounds 3 and 4 independently reviewed the full corrected expansion at frozen input digest `b37c7606e0df696c6c2559f00ef357644c940af24251cf4011ce80a2d2c1b5b6` (43 files). Both returned **zero concrete findings**, covering all 298 analyses, 296 canonical operations, 1,392 trace coordinates, 87 partial model projections and both OpenAPI formats. All frozen inputs remained unchanged.

**Stopped after four rounds. Two consecutive complete-scope clean reviews certify this static response expansion and its evidence/projection, not complete response models for every server operation.** 194 schemas remain unresolved and 15 download bodies remain opaque. Some consumer coverage is incomplete, and static analysis cannot establish all possible server fields or runtime branches. The user's requested fully modeled response coverage remains only partially achieved; no fields were invented to hide that gap.

Production TypeSpec compilation, normalized JSON/YAML checks, all 16 tests and a zero-vulnerability dependency audit passed. The final reports disclose accidental read-only Git discovery commands in some reviewer sessions; no reviewer Git writes or private/API requests occurred.

The round-1 children/shop report found its two unrelated auth/communications input hashes changed during review because the coordinator started those scoped fixes before every reviewer completed. The report's pre-change findings are retained; this round is not counted as clean. Its compiled-artifact comparison was unavailable in that review session; the coordinator confirmed JSON and YAML files exist at `tsp-output/@typespec/openapi3/` and will require compiled projection checks on the next frozen rounds.

No login, mutation or private-record requests were authorized or performed for this expansion. Earlier request-model and bounded-addition review certifications do not cover this new response expansion.

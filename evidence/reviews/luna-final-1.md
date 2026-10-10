# Luna bounded expansion — final review round 1

## Outcome

**One evidence-chain correction is needed (F1); no other findings.** The 34 body-property occurrences, 12 query-parameter occurrences, and two non-normative response-property reads are otherwise conservative and consistent with the client evidence. No API request was made.

## Frozen inputs and preservation

- Frozen snapshot declares digest `62a2b5d664092cee041230ab5761e183b91bdbd12938773324e2cf1fe23dc9fe` and lists 36 inputs. Every listed file matched its recorded SHA-256 before and after this review; this report is not one of those inputs.
- Compared with `9defebf`, the operation catalog retains all **296 operations**, aliases, methods, paths, sources, auth, and existing response records. Exactly **17 catalog entries** changed: 16 request-enriched entries and `GetLanguages` for response observations. All **53 prior request variants** remain; the update adds 17, for 70 total. The research record count remains 298.
- `node scripts/check.mjs` passed: 296 OpenAPI operations, 283 inventory functions covered, zero explicitly excluded. It checked the exact named request fields/parameters, open schemas with no unproven required fields, unknown/default responses, exact response-observation metadata, and JSON/YAML equality.
- Generator/test/docs review: the new `clientResponseObservations` validator and projection are bounded; `check.mjs` requires the extension exactly where catalog evidence exists and forbids extra extensions; `tests/luna-observations.test.mjs` tests the extension and unchanged unknown responses. README/addition counts agree. I did not run tests or generation/build commands.

## Addition ledger

Types below are client-observed only. Except for the stated integer literals, field values remain `unknown`; no server-requiredness, validation, enum, default, nullability, or complete schema is inferred.

| Record(s) | Added fields and evidence chain |
|---|---|
| `GetReceivedMessages`, `GetSentMessages`, `GetDeletedMessages`, `GetMessageDrafts` | Each has `page: unknown`, `perPage: integer = 50`, `term: unknown` (**12 query occurrences**). Constructors #25154/#25158/#25161/#25182 pass to services #25218/#25223/#25225/#25237. The constructor writes all three own keys; Axios #5675 omits nullish values and #5676/#5677 can serialize unknown arrays/objects to nested bracket keys. Thus page/term are logical construction names, not guaranteed scalar wire keys. `perPage=50` is a client constant, not an API default. Query transport remains explicitly unresolved. |
| `CreateEvent`, `UpdateEvent` | Each has `start_time`, `end_time` (`unknown`, optional; **4 occurrences**). Sagas #25377/#25380 pass opaque event data through #25369 `convertTimesToUtc`, then to #25405/#25407. The helper copies the input and conditionally UTC-formats truthy time values as `HH:mm:ss`; other copied fields remain unknown. |
| `FillPollQuestion` | Six `unknown` fields: `question_id`, `survey_id`, `option_id`, `type`, `value`, `other_id`. #38981 constructs them and the fill branch forwards through #26444 to #26457. `other_id` is always assigned as an own key, but can be `undefined`; Axios JSON serialization omits it then. It is correctly not marked as a conditional own-property write. `skip` belongs to the alternate branch. |
| `FillQuestionnaireQuestion` | Six `unknown` fields: `question_id`, `survey_id`, `required`, `type`, `value`, `option_id`. #39490 writes all six (including `option_id`, whose branch value may be null) and the action/saga #26475 forwards to #26494. #39489 writes the five-key text-answer object; see F1 for its missing documented route bridge. `required` is a copied request key, not a server-requiredness assertion. The body remains open/incomplete. |
| `CreateDiary` | `course_id: unknown`, `date: unknown`, `published: integer = 0` (#25765 → #25937). Course/date have nullish fallbacks to diary state; zero is only a client value. |
| `SaveEmployeeMeal` | `date: unknown`, `employee_id: unknown`, plus one unresolved computed key from `context.meal` (#37349 → #26002 → #26015). The computed key is always assigned; its value is copied when non-nullish or set to null otherwise. No static meal field is fabricated. |
| `AddTimeLog` | `child_id`, `started_at` (`unknown`); `ended_at` (`unknown`, optional) (#43884 → #25897 → #25971). Times are formatted as `YYYY-MM-DD HH:mm:ss`; #25897 merges caller data after constructing `child_id`, so arbitrary caller data can overwrite/add keys. The open body does not claim a fixed child-id value across callers. |
| `MoveFolders`, `MoveFiles` | `folder_ids: unknown`, `file_ids: unknown` (#43269 → #26219/#26223 → #26157/#26159). `routeParams.items` is forwarded unchanged; no array/element type or ID mapping is inferred. Destination `folderId` is route-only. |
| `UpdateDiaryFile`, `UpdateGalleryFile` | Each has `name`, `description` (`unknown`; **4 occurrences**). #43639/#38003 create inner forms; wrappers #25833/#26129 separate route filename from body; services #25947/#26138 send only the form. |
| `UpdateDocumentFile` | `name`, `filename`, `view` (`unknown`); `edit` (`unknown`, optional). #39657's same form supplies URL filename and body; #26261 forwards to #26274. `edit` is gated by the `!Array.isArray` ACL-response-shape branch in #39655, not a proved permission decision. |
| `GetLanguages` | One operation gains two non-normative reads: `langs: unknown`, `country: unknown`. #12709 → #12710 returns `response.data`; consumer #12697 reads those two paths. No guaranteed presence/type or normative response model is added; all 296 response schemas remain unknown/default. |

## Finding

### F1 — `QuestionnaireTextAnswer` has a target but its caller evidence stops at a callback

In `evidence/research/communications.json`, variant `QuestionnaireTextAnswer` names `targetSourceFunctionId: 26494`, and the operation-level body evidence/`option_id.optional` depend on the distinction between #39489's five keys and #39490's six. But its variant evidence says that callback-to-HTTP attribution is not fully traced and cites only #39489's constructor. That leaves the target and the basis for the five-versus-six request key sets internally inconsistent.

The original `eliis.hasm` contains a bridge that should be resolved in the evidence: `QuestionItem` #39484 creates/stores #39491 `fillQuestionHandler` at line 1591777 (`+0x161–+0x166`); #39489 (line 1592085) reads that captured handler at `+0x41` and calls it with its constructed object at `+0x49`. #39491 (line 1592199, `+0x0a–+0x2e`) resolves dependency-array slot 15, reads `fillQuestionnaireQuestion`, and calls it with its first argument; #39490 uses the same dependency/member pattern at line 1592114 (`+0xd0–+0xe2`). The relevant action/service route is #26475 at lines 1028347–1028371 and endpoint #26494 at 1028788–1028815 (service registration at 1028630–1028634).

**Minimal correction:** either add the #39489 → #39491 → imported `fillQuestionnaireQuestion` → #26475/#26494 chain and its anchors to this variant (keeping `callsiteCoverage: partial` only for unsearched endpoint callers), or remove the #39489 endpoint variant/target claim if the import binding cannot be established. Keep `option_id.optional` only if the five-key text-answer route is proven; do not infer server requiredness either way. The #39490 six-key request chain itself is supported.

## Scope and safety

Review was limited to the frozen bounded additions, generator/check changes, related test/docs, and cited original Hermes blocks. No regeneration, build, dependency install/audit, network call, login, write request, or private-record access was performed. Only this review report was created.

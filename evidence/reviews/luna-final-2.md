# Luna bounded expansion — final review round 2

## Outcome

**One evidence-chain citation gap remains; do not count this as a clean round.** I independently verified the corrected questionnaire route against the original full `eliis.hasm`. The runtime route is correct, including the actual Metro module IDs and service binding, but the research evidence still joins the component dependency to the action module by the matching export name without documenting the module-ID registration that proves they are the same dependency. The other bounded additions, generated projection, and preservation checks passed.

## Finding

### F1 — Questionnaire variants omit the ID-bearing Metro registration bridge

The corrected text-answer record now traces #39484 storing #39491, #39489 passing its five-key object to that handler, and #39491 resolving dependency-array slot 15 and calling `fillQuestionnaireQuestion`. I verified the missing identity bridge directly in the original disassembly:

- The component factory #39481 is registered as Metro module **4125**, with dependency list `[1,45,2,9,11,1172,783,1168,1274,2584,4098,4099,242,638,1189,2286,3502]`; zero-based slot 15 is module **2286** (`eliis.hasm` lines 20750–20753).
- Module 2286 is factory #26464, and its dependency list is `[1,2287]` (`11555–11558`). #26464 exports `fillQuestionnaireQuestion` as action creator #26474, which returns thunk #26475 (`1028044–1028110`, `1028334–1028342`).
- #26475 invokes `user.default.fillQuestionnaireQuestion` with the original body (`1028347–8371`). The service module is Metro module **2287**, factory #26485 (`11560–11563`). Its `QuestionnaireService` registration builds the `fillQuestionnaireQuestion` key with closure #26494 (`1028600–8649`, especially `1028629–8634`); #26494 sends the body in the POST (`1028788–8815`).
- Separately, #39484 creates/stores #39491 at `+0x161–+0x166` (`1591773–1778`); #39489 loads it at `+0x41` and calls it with the five-key object at `+0x49` (`1592085–2109`). #39491 loads dependency-array slot 15 and invokes its export with that object (`1592199–2215`). The option-answer constructor #39490 also constructs six own keys (`1592114–2194`).

Thus the cited endpoint attribution is **substantively true**, not a wrong-target finding. However, `QuestionnaireTextAnswer` currently says the dependency slot is “identified through its accessed export name” and does not cite the module-4125 registration, slot-15 value 2286, or the action module’s service dependency 2287. The operation-level union evidence has the same gap. An export name alone does not establish that #39491’s dependency is the #26464 action module. Please add the ID-bearing registration anchors (and make the shared/action route explicit for both constructor variants) to the research evidence before treating this chain as closed.

**Minimal correction:** cite `20750–20753` for module 4125 / slot 15 → 2286, `11555–11563` for module 2286 / slot 1 → 2287 and factory bindings, and `1028600–8649` for the service registration, alongside the existing callback/action/service lines. Keep all field values unknown, preserve the five-key versus six-key variants, and make no server-requiredness or nullability claims.

## Bounded addition ledger

All new fields below were checked against the recorded construction evidence. Types are `unknown` except the proven integer literals. All bodies remain open/incomplete.

| Operations | Client-observed additions |
|---|---|
| `GetReceivedMessages`, `GetSentMessages`, `GetDeletedMessages`, `GetMessageDrafts` | `page: unknown`, `perPage: integer = 50`, `term: unknown` each (**12 query occurrences**). Own-property writes are unconditional; Axios can omit nullish values and serialize arrays/objects as nested bracket keys. The params shape remains unresolved; 50 is a client value, not a server default. |
| `CreateEvent`, `UpdateEvent` | `start_time`, `end_time` (`unknown`, conditionally projected only when truthy; UTC-formatted by the copied-object helper). Other copied event properties remain opaque. |
| `FillPollQuestion` | `question_id`, `survey_id`, `option_id`, `type`, `value`, `other_id` (`unknown`). `other_id` is assigned even when undefined, then omitted by JSON serialization in that branch; `skip` is on the alternate endpoint branch. |
| `FillQuestionnaireQuestion` | Union: `question_id`, `survey_id`, `required`, `type`, `value`, `option_id` (`unknown`). #39489 constructs five keys without `option_id`; #39490 constructs six. `option_id` is optional only across client constructions. `required` is not server-requiredness. **F1 above is limited to documenting the endpoint bridge.** |
| `CreateDiary` | `course_id`, `date` (`unknown`); `published: integer = 0` (client literal only). |
| `UpdateDiaryFile`, `UpdateGalleryFile` | Each: `name`, `description` (`unknown`); wrapper filename remains routing data, not part of these form bodies. |
| `AddTimeLog` | `child_id`, `started_at`, `ended_at?` (`unknown`). The caller can overwrite/add keys after the action’s `child_id` construction; `ended_at` is only set on a truthy branch. |
| `SaveEmployeeMeal` | `date`, `employee_id` (`unknown`), plus the unresolved computed `context.meal` key. No static meal key was added. |
| `MoveFolders`, `MoveFiles` | `folder_ids`, `file_ids` (`unknown`) receive `routeParams.items` unchanged; no array shape or ID mapping was inferred. |
| `UpdateDocumentFile` | `name`, `filename`, `view`, `edit?` (`unknown`). `edit` follows the `!Array.isArray` ACL-response-shape branch, not a permission decision; unlike the other file forms, `filename` is included in this body. |
| `GetLanguages` | Two non-normative reads, `langs: unknown` and `country: unknown`, from `response.data` via consumer #12697. No response DTO fields or guaranteed presence were introduced. |

The body ledger totals **34 field occurrences across 12 operations**; together with the 12 query occurrences this is **16 request-enriched operations**. The added variants total 17 (including the two questionnaire caller variants); the pre-existing 53 variants remain.

## Projection, preservation, and validation

- The frozen snapshot digest `014d629d1a4be95b49933793f14aba0069f206a9d0b0173209ac5ccb05ccad02` lists 36 files; every listed hash matched before review. The full source disassembly SHA-256 was `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`.
- Compared with `9defebf`, the research count is still **298**, the operation count **296**, and all original **53** request variants remain; **17** are added (70 total). The 17 changed catalog entries are the 16 request-enriched operations plus `GetLanguages`. Existing changed entries retain method, path, auth, and response records; every response remains `unknown`.
- The response-observation generator/validator only projects the nonempty, evidence-bearing metadata extension. The checker requires exact presence/content where research evidence exists, rejects it elsewhere, and still requires the response schema to remain `{}` with only the `default` response and `*/*` media. The dedicated test covers validation, exact emission, no normative response change, and missing/extra/changed metadata; it was inspected but not executed.
- `evidence/LUNA-ADDITIONS-2026-10-10.md` reports the 34/12/two-read additions correctly. The main README preserves its broader prior counts and links to this separate expansion.
- Ran read-only `node scripts/check.mjs`: **validated 296 OpenAPI operations; 283 covered and 0 explicitly excluded inventory functions.** This also checked exact named request projection, unknown/default response preservation, and JSON/YAML equality.

## Scope

No generation, build, test run, dependency install, HTTP request, login, mutation, or private-record access was performed. The only file created by this review is this report. No code or evidence source files were edited.

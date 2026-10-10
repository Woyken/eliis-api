# Guardian-facing static research batch

Scope is the 17 endpoint observations specified by the user: authentication (2), account/child discovery (4), institution events (2), child attendance/absence (3), guardian diary/feed plus secondary diary (3), and food menus/download (3). The existing operation name for the absence modal is `GetAbsenceModalData`.

Only Luna medium search/implementation and Luna xhigh review agents are authorized. Static analysis only: no account login, live private records, mutations, or app entry creation. Maximum four post-integration review rounds; target two consecutive clean reviews.

## Deliverables

- Evidence-backed partial response models and exact service → consumer traces.
- Proven request/query additions where the currently documented endpoint omits them.
- Endpoint capability records and a readable capability table covering established/unresolved fields, permissions, date/time and query semantics, pagination, and read side effects.
- Remaining blockers for HA setup, events, attendance/absence, diary summaries, and food menus.

## Safety and meaning

- Discovery must be tied to the signed-in guardian's init/profile/courses relationships. Staff-wide child lists/rosters are not a substitute.
- Missing arrival logs do not prove absence. Preserve distinctions between planned attendance, recorded transitions and unresolved/missing records.
- Group diary content is not proof other children's private feedback is guardian-visible. Secondary `/diary` usage must remain blocked/unproven until a guardian access path is established in the app.
- A read may be followed by a separate seen/read request; trace the complete app flow and distinguish endpoint behavior from UI-triggered mutations. Do not perform them.
- Date range inclusivity, timezone or status meanings require code evidence. Format strings, enum-like client values and UI labels alone do not prove server contracts.
- Existing schema contract cannot express every branch/container uncertainty. Preserve exact nested observations in evidence rather than inventing schema types to fit the emitter.

## Candidate format and ownership

Each explorer owns `evidence/guardian-batch/<domain>.json` and optional `<domain>.md`, not shared response/request files. JSON object fields:

```
{
  "domain": "auth",
  "responseCandidates": [<complete response-analysis record per AGENTS.md>],
  "requestCandidates": [
    {"operationId":"...", "sourceFunctionId":123, "placement":"query|body", "fields":[<existing request field contract>], "evidence":"...", "trace":[...], "limitations":[...]}
  ],
  "capabilities": [
    {"operationId":"...", "sourceFunctionId":123,
     "establishedFields":[...], "unresolvedFields":[...],
     "querySemantics":[{"claim":"...","evidence":"...","established":true}],
     "permissions":[...], "dateTimeSemantics":[...], "pagination":[...], "readSideEffects":[...],
     "trace":[{"functionId":123,"line":456,"evidence":"..."}], "blockers":[...]}
  ]
}
```

Semantic arrays use the same `{claim,evidence,established}` structure. Unestablished claims need explicit reason/evidence boundary, not a guessed answer. Blockers are concise statements of what remains unproved. Every endpoint needs a capability disposition, including native binary downloads. Record operation/source identity and caller imports/Metro module IDs where ambiguity matters.

All response properties remain optional/open, primitive types unknown unless proved. No retrospective claim that an earlier clean review certified new findings. Shared integration happens only after xhigh candidate reviews; one integration owner handles shared files to avoid overwriting work.

# Communications research notes

`communications.json` records all 68 functions assigned in
`/data/data/com.termux/files/home/eliis-analysis/domain-source/communications-index.json`.
Each operation's `source.line` points to the full disassembly line listed by that
index; its `evidence` points to the corresponding function block in
`communications.hasm`.

## Evidence boundaries and notable call semantics

- List/filter functions that pass an argument through Axios `config.params` are
  marked `queryPassthrough: true`. Four traced message-list saga variants
  construct own `page`, `perPage=50`, and `term` keys; local own writes do not
  guarantee literal wire keys because Axios omits null/undefined values and can
  serialize array/object values as nested bracketed keys. `getEvents`
  shallow-copies its optional second argument to a new params object, or uses
  an empty object when it is absent/undefined. The `perPage=50` value is a
  client construction constant, not an API default.
- Dynamic `/api/{scope}/...` paths in `sendMessageDraft` and
  `uploadDraftAttachment` use an arbitrary scope argument; no fixed scope set
  was inferred.
- DELETE calls were distinguished by their actual Axios config arguments:
  most pass only a URL; `deleteDraft` passes `{data: argument}`;
  `deleteDraftAttachment` passes `{data: {filename: argument}}`; and
  `deleteEvent` passes `{params: {change_mode, date}}`. Those config values are
  not treated as query or body fields beyond the traced construction.
- Event update/delete URLs read `kindergarten_id` and `id` from the first
  argument object. Their path parameter labels reflect those source properties,
  not claims about server identifier semantics. Event create/update caller
  traces additionally establish only conditional `start_time`/`end_time`
  projections through `convertTimesToUtc` (#25369); the helper copies the
  opaque incoming object, so other body keys remain unknown. Its UTC
  `HH:mm:ss` formatting is client behavior, not a server constraint.
- Poll-answer construction traces six local keys. `other_id` is unconditionally
  assigned but is `undefined` when no option matches; Axios JSON serialization
  omits that property in that case. Questionnaire answer constructors remain
  distinct five-key and six-key variants; `required` is a copied body key, not
  server-requiredness evidence.
- Multipart services explicitly set Content-Type and forward their data.
  Later bounded caller traces now prove partial literal-part models for
  SendMessage, UploadDraftAttachment, UpdateSentMessage, SendAnnouncement,
  StoreIdea, and UpdateIdea. Exact named variants and source chains are in
  `clientRequestVariants` and `evidence/multipart-field-enrichment.json`.
  Dynamic `files[index]`, `forwardedFiles[index]`, `removedFiles[index]`, and
  `targetGroups[index][key]` families remain metadata, never fixed properties.
  Forwarded message values are `item.id`, not file descriptors. Idea
  `categories[]`, `age_groups[]`, and `files[]` are actual repeated literal
  part names; array typing describes repeated occurrences, not JSON bodies.
  Idea count >10 skips file appends/submission; total size >200000000 rejects
  submission after all appends. These are client request gates, not server
  limits. `_method=put` does not change UpdateSentMessage's HTTP POST.
  Native file descriptors are transport metadata, not API properties; every
  endpoint model stays partial. `sendMessageDraft` and
  `deleteDraftAttachment` have locally constructed wrapper objects whose
  property names are bytecode-evidenced; their value types and server
  requiredness remain unknown.
- Responses are recorded as unknown throughout: continuations return
  `response.data`, but complete response shapes were not established.
- No requests were sent. Authentication is recorded as cookie-based for the
  main API client; no Bearer token is inferred.

# Communications research notes

`communications.json` records all 68 functions assigned in
`/data/data/com.termux/files/home/eliis-analysis/domain-source/communications-index.json`.
Each operation's `source.line` points to the full disassembly line listed by that
index; its `evidence` points to the corresponding function block in
`communications.hasm`.

## Evidence boundaries and notable call semantics

- List/filter functions that pass an argument through Axios `config.params` are
  marked `queryPassthrough: true`; their key sets and value types remain
  unresolved. `getEvents` shallow-copies its optional second argument to a new
  params object, or uses an empty object when it is absent/undefined.
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
  not claims about server identifier semantics.
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

# Communications static-response review — initial

**Disposition: revise before integration.** The 68 records are keyed to the right 68 research operations, but the current models omit body properties proven by traced fulfillment consumers, and several trace arrays stop before the actual success callback/reducer. Two array types are also inferred from a local `concat` conversion that does not establish the HTTP property's type.

## Coverage ledger

| Check | Current result |
|---|---:|
| Research operations / response dispositions | 68 / 68 |
| Matching `operationId` + `sourceFunctionId` | 68 / 68 |
| Research service source IDs and source lines match the original function headers | 68 / 68 |
| Existing trace steps with a line outside their named function | 0 |
| Current response kinds | 15 `object`, 53 `unknown`, 0 other |
| Current directly modeled body-root fields | 29 |
| Current nested observed property leaves | 2 (`courses[].id`, `data[].id`) |
| Current total observed field nodes | 31 |

All 68 records are open (`complete:false`); none adds response status/media, requiredness, nullability, enum, or defaults. Existing root pagination paths are correctly rooted after the service fulfillment handler's Axios `response.data` projection. For example, the `current_page` and `data` reads in the kindergarten-applications, poll-list, and questionnaire-question flows are HTTP-body-root properties; the latter `data` is not the Axios envelope. The issue there is missing trace/model coverage below, not an extra `.data` wrapper in the current field paths.

## Proven model corrections

These are concrete consumer reads, not endpoint-name guesses. All proposed field value types remain `unknown`; no server guarantees are inferred.

| Operation | Add to partial HTTP-body model | Original-bytecode path and evidence |
|---|---|---|
| `UpdateMessage` (`#25227`) | `recipient_read` | Service handler `#25228` returns Axios `response.data`; caller continuation `#25165` forwards that body as `UPDATE_MESSAGE_SEEN.data` (lines 988995–989001); reducer `#25141` reads `action.data.recipient_read` (988065–988066). This is a root body property. Do **not** add `unread_messages_count`: `#25165` reads that from its captured Redux/user state, not from the response. |
| `SendMessageDraft` (`#25235`) | `error` | Handler `#25236` returns Axios `response.data`; final fulfillment callback `#25177` reads its parameter's `error` at 989227–989229 and branches on it. This proves only a root body read and a truthiness branch—not a Boolean type, HTTP failure status, or universal error wrapper. |
| `GetDraftById` (`#25241`) | `id`, `subject`, `files`, `created_at` | Handler `#25242` returns the body; callback `#25189` reads those body-root properties at 989479, 989481, 989483, and 989491. `files.length` is used to build a local `files_count` (989483–989490); `files_count` is **not** read from the body and must not be modeled as an HTTP field. `files` remains `unknown`, not a proved array. |
| `CreateDraft` (`#25243`) | `id`, `subject`, `files`, `created_at` | Handler `#25244` returns the body; callback `#25195` reads the four body-root properties at 989601, 989603, 989605, and 989613. It likewise derives local `files_count` from `files.length` (989605–989612); do not model `files_count`. |
| `SaveDraft` (`#25245`) | `id`, `subject`, `files`, `created_at` | Handler `#25246` returns the body; callback `#25198` reads the four body-root properties at 989672, 989674, 989676, and 989684. Its `files_count` is locally derived at 989676–989683, not a body member. |
| `MarkAnnouncementRead` (`#25334`) | `seen` | Handler `#25335` returns the body; callback `#25326` reads `param0.seen` at 992811 and places that value in a local update action. The update `id` is captured request/state data at 992808–992810, not another response field. |
| `DeleteIdeaComment` (`#26365`) | `deleted` | Handler `#26366` returns the body; fulfillment callback `#26359` reads `param0.deleted` at 1024501 and branches on it. The `commentId` used in the resulting actions is local captured state (1024509–1024520), not a body field. No type/semantics for `deleted` are established. |
| `GetIdeas` (`#26371`) | `current_page`, `data` | Handler `#26372` returns the body; `#26331` dispatches it unchanged as `SET_IDEAS.data`; reducer `#26292` reads body-root `current_page` and `data` at 1022803–1022815 and enumerates that `data` value at 1022821–1022825. `data` stays `unknown`: `Object.entries` plus local concatenation does not establish a server array/object/item schema. |
| `GetIdeaComments` (`#26377`) | `current_page`, `data` | Handler `#26378` returns the body; `#26344` dispatches it as `SET_IDEA_COMMENTS.data`; reducer `#26292` reads body-root `current_page`/`data` at 1022724–1022737 and enumerates the data value at 1022741–1022750. Keep `data` unknown; the entry-mapping helper `#26294` returns key/value pairs without reading a nested comment property. |

This is **9 additional object dispositions and 20 additional body-root fields**. After the above changes, before the type downgrades below, the expected ledger is **24 objects, 44 unknowns, 49 root fields, and the same 2 nested property leaves (51 total field nodes)**.

## Type corrections and nested-field audit

Two current `array` fields are not supported by the traced source value:

| Operation / field | Why the current type overstates evidence | Minimal correction |
|---|---|---|
| `GetNotifications.notifications` | Reducer `#26050` creates an empty local array then calls `.concat(action.data.notifications)` (1015814–1015828). `concat` accepts a scalar or object as well as an array, so it proves the reducer's output is an array, not the HTTP body's `notifications` type. | Keep the body-root field, change its type to `unknown`, and do not add item fields. |
| `GetQuestionnaireQuestions.data` | Reducer `#26460` uses local-array concatenation with `action.data.data` (1027866–1027876 and the equivalent category branches). The conversion does not prove the incoming body property is an array. | Keep the body-root field, change its type to `unknown`; no item schema is proved. |

The other two current array observations have direct client array-style traversal: `GetKindergartenContacts.courses` uses `.length`, index zero, and `.id` (`#26023`, 1015159–1015169); `GetPolls.data` loops over `.length`/indices and reads each element's `.id` (`#26442`, 1027192–1027214). They may remain **client-expected** arrays with the existing no-validation limitations. The two nested `id` leaves are separately evidenced and remain unknown-typed. Do not promote response item fields from state transformations or `Object.entries` key/value mapping.

## Trace-chain gaps to fix in this pass

The source coordinates already present are valid, but a number of trace arrays end at the caller/continuation that invokes the service rather than the actual fulfillment callback. The callback is not hypothetical: its `CreateClosure` is present in the named caller, and its original function header line is listed below. Add that callback (and the actual reducer where noted) to `trace`; it is the shortest way to substantiate either a direct body read or an intentionally opaque/ignored result.

### Final success callbacks missing from current traces

- **Messages/drafts:** `DeleteMessage` `#25171` @989106; `GetMessageTargetGroups` `#25180` @989281; `SendMessage` `#25174` @989156; `SendMessageDraft` `#25177` @989223; `GetMessageDraftById` `#25186` @989423; `GetDraftById` `#25189` @989468; `DeleteDraft` `#25192` @989535; `CreateDraft` `#25195` @989590; `SaveDraft` `#25198` @989661; `UploadDraftAttachment` `#25201` @989742; `DeleteDraftAttachment` `#25204` @989805; `UpdateSentMessage` `#25208` @989882; `DeleteSentMessage` `#25211` @989935; `RecallSentMessage` `#25214` @989989. The attachment callbacks update a local files-count action using a captured draft ID; this is not response shape. The delete/recall callbacks likewise use local IDs. Preserve `unknown` where these callbacks forward the whole body or do not inspect it.
- **Applications:** `GetUserApplications` `#25268` @991382; `StoreApplication` `#25286` @991737; `GetApplication` `#25274` @991498; `RejectApplication` `#25277` @991560; `ConfirmApplication` `#25280` @991624; `AddOrRemoveApplicationChild` `#25283` @991686. Where a callback puts the response body in an action, trace the reducer `#25260` @990995 to show whether it is projected or stored opaquely. Existing `GetKindergartenApplications` trace must insert success continuation `#25271` @991444 between caller `#25270` and reducer `#25260`.
- **Announcements:** `GetReceivedAnnouncements` success reader `#25313` @992544 and `GetSentAnnouncements` reader `#25317` @992620 are absent from their object-record traces; they are the functions that prove the already-modeled reads. For the currently unknown operations, add `GetAnnouncementTargetGroups` `#25320` @992681, `SendAnnouncement` `#25323` @992739, and `MarkAnnouncementRead` `#25326` @992797. `DeleteAnnouncement` remains explicitly unknown: only registry `#25328` was located, with no downstream callsite in this slice.
- **Events:** `GetRecentEvents` reader `#25372` @994630 is absent from its object trace. Unknown `UpdateEvent` and `DeleteEvent` traces stop before callbacks `#25381` @994860 and `#25387` @994986. In particular, `#25387` performs state changes from captured `change_mode`/IDs and does not read the HTTP body; retain unknown rather than modeling those local values.
- **Ideas:** add missing final callbacks `DeleteIdea` `#26323` @1023794; `GetIdea` `#26347` @1024241; `GetIdeaAgeGroups` `#26338` @1024064; `GetIdeaCategories` `#26341` @1024122; `SaveIdeaComment` `#26356` @1024435; `AddIdeaToFavorites` `#26353` @1024368; `LikeIdea` `#26350` @1024301; `StoreIdea` `#26317` @1023675; and `UpdateIdea` `#26320` @1023736. `GetIdeas` already traces callback `#26331`, but must add reducer `#26292` @1022393; `GetIdeaComments` already traces callback `#26344`, but must add that same reducer. `DeleteIdeaComment` must add its body-reading callback `#26359` @1024496.
- **Questionnaires/polls:** add callback `#26023` @1015139 to `GetKindergartenContacts`; `#26470` @1028249 to `GetQuestionnaire`; and `#26473` @1028313 to `GetQuestionnaireQuestions` (the latter currently skips from caller `#26472` to reducer `#26460`). Trace reducer `#26460` @1027661 for `GetQuestionnaires`, `SubmitQuestionnaire`, and `UnsubmitQuestionnaire` to record that those actions consume/store response values as whole values or use a local `null`, not as fields. Trace reducer `#26430` @1026676 for `GetPollById`; it stores the body as `poll` without reading body members. `GetRecentNotifications` has only the service registry path `#26067` in this feature slice; its explicit no-consumer/unknown disposition is appropriate unless a callsite is actually found.

### Existing body-root object traces with a skipped continuation

In addition to the gaps above, insert the exact fulfillment continuation in these already-modeled records: `GetReceivedAnnouncements` `#25313` @992544; `GetSentAnnouncements` `#25317` @992620; `GetRecentEvents` `#25372` @994630; `GetKindergartenContacts` `#26023` @1015139; and `GetQuestionnaire` `#26470` @1028249. `GetKindergartenApplications` needs `#25271` @991444, and `GetQuestionnaireQuestions` needs `#26473` @1028313. Their current field paths are body-root; only the trace arrays are incomplete.

## Keep unknowns that are genuinely opaque

After the corrections above, `unknown` remains the right disposition when a fulfillment callback forwards the entire `response.data`, stores it as one state value, uses it only as an opaque `items`/`poll`/`idea` value, or ignores it. Do not turn action-envelope keys, locally composed event records, selected `view`, optimistic IDs, captured request fields, or reducer-derived `files_count` into HTTP fields. `DeleteAnnouncement` and `GetRecentNotifications` also remain unknown based on their explicitly limited registry-only evidence. No generic response envelope or status/error contract is warranted.

## Minimal fix ledger

1. Add the nine object dispositions and 20 root body fields in the table above, with one trace step per actual service/callback/reducer hop.
2. Change the two `concat`-derived array field types to `unknown`; keep the two directly traversed array expectations and their nested `id` fields open/optional with limitations.
3. Complete the listed continuation/reducer paths. Do not expand endpoint research or infer response fields beyond those direct reads.

This review changed only this report; pre-existing workspace changes were left untouched.

# Luna communications candidates — independent review

## Outcome

Reviewed all **8 `candidateOperations` records**, the **3 unresolved draft-write targets**, and all constructor variants in `evidence/luna-communications-candidates.json` and `.md` against the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`.

Found **3 substantive candidate-evidence omissions** affecting the four message-list queries, `FillPollQuestion`, `CreateEvent`, and `UpdateEvent`. The candidate constructor traces otherwise match the source. No evidence supports closing the corresponding open endpoint/body/query shapes. No response schema was reviewed or inferred.

Only this review report was added. No research/spec files or the existing communications additions were changed; no HTTP requests were made.

## Findings

### F1 — Message-list candidates stop before Axios query serialization

Affected: `GetReceivedMessages` (#25218), `GetSentMessages` (#25223), `GetDeletedMessages` (#25225), and `GetMessageDrafts` (#25237), including the `.md` summary and the four JSON traces.

The constructor evidence is right: #25154/#25158/#25161/#25182 make fresh objects with own `page`, `perPage`, and `term` properties, unconditionally assign the two captured values, and set numeric `perPage` to **50** (full-source blocks 988641–988667, 988773–988796, 988864–988887, and 989314–989337). Each corresponding service endpoint places its argument in Axios `config.params` (#25218 at 990212–990225; #25223 at 990288–990300; #25225 at 990321–990333; #25237 at 990541–990553).

But `eliis.hasm` also contains the default Axios `buildURL`/`AxiosURLSearchParams` path (#5683, 257758 onward); the parameter visitor skips `undefined` and `null` values (#5675, 257487–257532). Thus `page` and `term` are unconditional **own properties of the local params object**, not guaranteed literal query keys on the wire: either can be absent when its unknown captured value is nullish. Because their value types are not established, array/object values can also be serialized into nested/bracketed query keys. `perPage=50` is a scalar and is emitted.

**Minimal correction:** preserve `complete: true` as “complete local object construction,” the three field names, `unknown` types, and `perPage`’s integer/value metadata. Replace “No later query-object transformation is observed” / “no optional flag is inferred” with evidence distinguishing the local own-key set from Axios’s wire serialization. If `optional` describes wire-field inclusion, record the nullish omission for `page` and `term`; do not claim that the source conditionally skips their own-property writes. Leave the normative query shape open.

### F2 — Poll `other_id` can be absent from the serialized body

Affected: `FillPollQuestion` (#26457), candidate field `other_id` and its Markdown note.

The six-key local constructor is correctly identified. In #38981 (header 1567429; local offsets `0x14`–`0x93`), `other_id` is always written at `0x8e`, but the `options.find(...)` result is nullish-tested and the assigned value is explicitly `undefined` when no option is found (`0x74`–`0x8e`). The fill branch forwards this body through #26444 to #26457; the endpoint calls Axios `post(url, body)` (#26444 at 1027271–1027287; #26457 at 1027566–1027583). Axios’s default `transformRequest` JSON-stringifies plain-object data (#5842, 263038–263183), which omits an object property whose value is `undefined`.

**Minimal correction:** keep the unconditional own-assignment and the six-key local-construction completeness claim, but explicitly state that `other_id` is not guaranteed to be a wire key: it is omitted when the assigned value is `undefined`. If candidate `optional` metadata denotes wire inclusion, mark this field conditional with that serialization evidence. Keep its type `unknown`; do not infer a server schema. The `skip` property remains correctly excluded because it belongs to the alternate `submitDashboardPoll` branch, not the call to #26457.

### F3 — Event request bodies pass through a known time projection

Affected: unresolved `CreateEvent` (#25405) and `UpdateEvent` (#25407) candidate records, plus the Markdown unresolved summary.

The endpoint-level body argument evidence is correct (#25405 POST data at 995394–995415; #25407 PUT body at 995431–995448), and the complete incoming event construction remains unknown. However, both traced sagas call the captured `convertTimesToUtc` helper before forwarding the result: #25377 loads and calls the helper before `createEvent` (994757–994808), and #25380 calls it on `selectedEvent` before `updateEvent` (994826–994850). The helper is #25369 (header 994508, offset `0x005ef388`), installed in the shared event-module environment at 994404–994405. It starts with `Object.assign({}, input)` (994515–994519); for truthy `start_time` and `end_time` it computes timezone-normalized `.utc().format("HH:mm:ss")` values and writes those named properties (994555–994571 and 994572–994588). It returns the copied object, whose remaining keys are open because the input is opaque.

**Minimal correction:** add partial `start_time` and `end_time` field candidates for both operations, with conservative `unknown` value types, evidence for the conditional time conversion/copy-through behavior, and conditional/optional inclusion evidence. Do not assign a constant `value`; these are transformed dynamic values. Keep each body open and incomplete (`complete: false`) because `Object.assign` copies an unestablished set of caller fields. Do not infer body keys such as `id`, `kindergarten_id`, or other properties merely from URL reads or helper reads.

## Checks that passed

- All **7 constructor-variant headers, source line ranges, and listed local offsets** match their original function blocks: the four message-list continuations, #38981, #39489, and #39490. Target endpoint headers/call operands and the #26444/#26475 action-to-service chains also match the referenced function IDs; the `fillPollQuestion` and `fillQuestionnaireQuestion` properties are registered to #26457 and #26494 in their respective service modules (1027418–1027422 and 1028630–1028634), not merely matched by a nearby string.
- Message-list fields are exactly `page` (unknown), `perPage` (integer `50`), and `term` (unknown); no fallback or source-level conditional own-property write was found. The local query object is complete while upstream argument types remain unresolved.
- Poll fields `question_id`, `survey_id`, `option_id`, `type`, `value`, and `other_id` match the six writes in #38981. All are local own-property writes; the selected source for `option_id` is branch-dependent, while `other_id` has the explicit undefined case described in F2.
- Questionnaire variants correctly remain separate: #39489 writes `question_id`, `survey_id`, `required`, `type`, and `value` (1592085–1592109); #39490 adds `option_id` and writes `value` using its conditional/null fallback (1592114–1592194). The `required` body key is not a server-requiredness assertion. #39489’s callback-to-HTTP coverage is correctly marked partial; #39490’s body-to-#26494 route is traced. Local own writes are unconditional; explicit `null` fallbacks remain values, not omitted keys.
- The three draft-write targets remain appropriately unresolved. #25243 and #25245 forward arbitrary data arguments; #25247 places its second argument in Axios delete `config.data` (990711–990728), not in query parameters. The inspected draft callers do not construct a complete request body, so no body fields should be added from Redux response/action objects.
- No UI labels or routing identifiers were treated as request fields. The existing research/spec records, including the recent communications additions, remain untouched.

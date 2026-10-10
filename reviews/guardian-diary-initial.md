# Guardian diary candidate 3 — source review

## Result

**Changes requested: three findings (one high, two medium).** Reviewed `evidence/guardian-batch/CONTRACT.md`, `evidence/guardian-batch/diary.json`, `evidence/guardian-batch/diary.md`, the existing `GetGuardianFeed` request record, and the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` disassembly. No HTTP requests were made. This review report is the only file changed.

## Findings

### F1 — High: `GetGuardianFeed` stops before the diary-item display consumer

**Where:** `evidence/guardian-batch/diary.json`, `GetGuardianFeed` response candidate and capability; `evidence/guardian-batch/diary.md`, lines 9 and 15–19.

The candidate correctly traces the service response through the raw-body success callback and identifies the nested group fields. Its conclusion that diary-entry item properties are unobserved is too broad: the feed renderer dispatches `displayType == "diary"` entries to a diary-item component which reads fields from the same item.

Evidence chain in `eliis.hasm`:

- Service #25632 passes its third argument as Axios `config.params`; continuation #25633 returns `response.data` unchanged (lines 1003318–1003354). Thunk #25515 calls that service, and callback #25516 forwards the body unchanged as action `data`, keeping `page` separately in the action (1000422–1000503).
- Dashboard reducer #26868 reads HTTP-body `data.data` and `data.next_date`; #26865 maps group `date`, `diaries`, and `evaluations` (1039789–1040004). #26866 adds `displayType: "diary"` to each entry locally (1040009–1040021). That synthetic property is **not** a server field.
- GuardianFeed #34923 supplies the list to FlatList; renderer #34944 reads `item.displayType` and passes the item onward (1391460–1391503, 1391968–1391969, 1392374–1392385). For the `diary` branch, #34941 passes that item as the child component's `data` prop (1392217–1392264). `ChildDiaryEntryItem` #34949 then reads, among others, `data.texts`, `course`, `status`, `meals`, `total_time`, `summaries`, `images`, `documents`, `feedback`, `likes`, and `id` (1392765–1393371).
- The nested consumer evidence further proves `texts` is used as an object (`typeof` and `Object.keys`, 1392814–1392827); `feedback` is traversed by length/map (1393035–1393053), with feedback-item `comment` and `owner` reads in #34958 (1393537, 1393717); `summaries` is mapped and summary `comment` is read (#34952/#34953, 1393124–1393172). Item `status` is read through `color`, `icon`, and `name` (1392848–1392898). `images` and `documents` are handed to child renderers which map those collections (#35160 at 1402829–1402832; #35406 at 1413316–1413318).

**Correction:** Add the proven reads beneath the HTTP path `data.data[].diaries[]`, preserving every parent `data` level. In particular, the intermediate body `data` container has direct child reads of `data` and `next_date`, so it can be modeled as an open `object` rather than left `unknown`; the outer response remains partial/open. Keep every modeled property optional. Use `object`/`array` only for containers directly established by these reads; leave unproved primitive and nested item shapes `unknown`. Do not include local `displayType`, local date/evaluation summary rows, or Redux/action wrapper fields. The group-level `data.data[].date` is an actual body read; it is not evidence for an entry `content_date`. The display chain proves the client reads a diary item's `feedback`, but it does **not** prove that feedback from other children is guardian-authorized or visible under all server policies. Likewise, the source uses `images` and `documents`, not a generic `media` response field. No publication field or server publication guarantee follows from the empty-state copy.

### F2 — Medium: date formatting is conditional on the captured page

**Where:** `evidence/guardian-batch/diary.json`, `GetGuardianFeed` request candidate and its `querySemantics`/`dateTimeSemantics`; `evidence/guardian-batch/diary.md`, line 17.

The candidate says any truthy selected `diaryNextDate` is formatted as `YYYY-MM-DD`. In #25515, the truthy-date branch next compares its second captured input to `1` at lines 1000447–1000449: the formatter at 1000450–1000456 runs only when that input is not `1`; the `== 1` branch retains the selected value. Callback #25516 separately puts that captured input into the action's `page` field (1000491–1000502). The candidate should record the page-conditional formatter instead of generalizing it to every truthy date.

The useful request facts remain: #25515 unconditionally constructs a one-key `{date: value}` params object (1000457–1000465); the value may be `undefined`; the service forwards that params object unchanged; no `page` or `perPage` is built into this helper's query. Keep `date` as `unknown` and do not infer serialization, server date interpretation, timezone, or range inclusivity.

The existing `GetGuardianFeed` request record has `query: []` and `queryPassthrough: true` because helper #25632 accepts arbitrary params. The candidate's one caller-observed `date` is a valid addition, not a duplicate of an existing named query field. Integration should preserve the unresolved passthrough shape and add at most one named `date` observation; it must not close the endpoint-wide query contract.

### F3 — Medium: record the MyChild client path without treating it as server authorization

**Where:** `evidence/guardian-batch/diary.json`, `GetGuardianFeed` trace/capability; `evidence/guardian-batch/diary.md`, lines 9 and 29.

The capability correctly leaves guardian authorization and server visibility unresolved, but the source also establishes a distinct **client-side MyChild view path** not present in the candidate trace. `ChildDiaryScreen` #44110 reads route `childId` and `employeeView`; selectors #44111–#44114 select `state.myChild.child`, `diaryCurrentPage`, `diaryNextDate`, and `diary` when `employeeView` is false, and the corresponding `state.child` values in the employee-view branch (1799541–1799672). Its fetch closure #44115 invokes an imported `getGuardianFeed` action (#44115/#44116, 1799677–1799712). The same action success callback #25516 can dispatch `SET_MY_CHILD_GUARDIAN_DIARY_FEED`; child reducer #25496 handles that type and maps the raw `data.data` group collection through #25497/#25498 (999311–999324, 999670–999705).

Add this as an established **UI/state branch**, with the import/action linkage identified in the trace. Do not promote `myChild` naming, route arguments, or the employee-view switch into a claim about the signed-in user's server-verified guardian relationship, authorization, class aggregation, or other-child visibility. The candidate's separation of employee `GetDiaryData` fields from guardian operations is correct. The `diary_access_course` selector (#34544, 1355193–1355211) is a client permission gate in the employee/course diary path; it does not establish a guardian role or authorize either guardian endpoint. `GetGuardianDiary` remains blocked/opaque: #25620 registers it at 1002932–1002936, and the original-disassembly member-reference search locates no downstream caller/body consumer.

## Accepted dispositions

- All three scoped operation IDs and source function IDs are present. `GetGuardianDiary` remains `unknown` with no invented fields, and `GetDiaryData`'s body observations remain explicitly employee-facing rather than being transferred to either guardian operation.
- The `GetGuardianFeed` service's arbitrary `params` passthrough and the caller-specific `date` observation are appropriately distinguished; page state is not a proven query parameter.
- For `GetGuardianFeed`, the traced success callback dispatches body/page state; no mark-seen/read HTTP request is attached to that GET success path. Keep that conclusion bounded to the traced flow, not global. `GetGuardianDiary` has no caller flow to assess. The separate `#43846` employee caller invokes `flushDiaryAutoSaves` before `GetDiaryData`; do not conflate possible autosave writes with GET behavior or perform them.

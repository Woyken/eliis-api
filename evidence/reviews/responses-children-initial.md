# Initial response-model review: children, diary, and files

**Result: needs fixes.** Reviewed `evidence/responses/children-diary-files.json` at SHA-256 `a7dd8d7244992a621464f04f44e141c44bc09b7cc7a5bbc53f10acf5d68e8381` against `AGENTS.md`, the assigned research JSON, and the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. This report applies to that exact candidate snapshot; it is not a certification of later changes.

## Coverage and sound choices

- All 95 response records match the 95 research operation IDs and source function IDs. All 436 trace function IDs exist in the disassembly. Of the trace line references, 435 identify the stated function header; one is off by two lines (below).
- All dispositions remain open (`complete: false`); I found no required/status/media claims or Axios-wrapper/native-job metadata modeled as HTTP fields.
- The `GetFiles` boundary is handled correctly: service #25660 returns Axios, then action callback #25567 unwraps `.data` at line 1001610 before passing the body through. No wrapper or download-job fields are attributed.
- `GetChildProfile`'s field boundary is correctly preserved: service #25634/#25635 returns the body; callback #25519 reads body `active_courses`, locally removes it from the copied remainder, then dispatches the remainder as `SET_CHILD`; childReducer #25684 consumes that action. Do not model callback-created/reducer state as additional named HTTP fields.
- Keep `GetEmployeeCourses` as a client-observed array with only the unknown item `id`; the caller uses length/find/index and the find callback reads `id`. `GetDiaryData.statuses` is explicitly traversed with `forEach`, and its two item reads remain unknown-typed.
- Keep `GetDocumentAcl` root kind unknown and do not union `view`/`edit` into an object schema: #39655 has an `Array.isArray` branch, and those property reads occur only in the non-array branch. Likewise, keep `GetDocumentsFolderData` unknown, separate from `GetFolderData`; both helpers use `/api/kindergartens/{kindergartenId}/folders/{folderId}`. The former's screen caller #39598 only attaches `finally` (#39599), while the latter has a consumer that reads `subfolders`. Call out this exact-path alias/caller conflict; do not transfer or union the field into the unconsumed helper's record.

## Confirmed response reads missing from the model

In each row the service path resolves `response.data`, and the listed success callback is attached to that service call. These are reads of the callback's resolved HTTP-body parameter—not request payloads or local action envelopes. Add only open/optional client-observed fields, keeping types unknown unless stronger evidence exists. For the calendar callback, model the body as an observed array with unknown items; do not invent an item schema.

| Operation | Original bytecode evidence |
| --- | --- |
| `PublishMap` | #25617 → #25618, then #25563 → #25564; #25564 reads body `published` at 1001544 and dispatches `SET_MAP_PUBLISHED`. Add top-level `published: unknown`. |
| `SaveChildCalendarDays` | #25646 → #25647, then #26407 → #26408; #26408 invokes body `forEach` at 1026105 and #26409 dispatches each item as `SET_CHILD_CALENDAR_DAY_ABSENCE`. This is direct array traversal; items remain unknown. |
| `UploadChildProfilePicture` | #25654 → #25655, then #25540 → #25541; #25541 reads body `profile_picture` at 1001046 and 1001057. Add top-level `profile_picture: unknown`. |
| `CreateDiary` | #25937 → #25938, then #25765 → #25766; #25766 reads body `diary` at 1008179 and dispatches it as `SET_DIARY.data`. Add top-level `diary: unknown`. |
| `UpdateComment` | #25939 → #25940, then #25778 → #25779; #25779 reads body `type` at 1008493, 1008518, and 1008541. Add top-level `type: unknown`; the comparisons do not prove an enum. |
| `UploadMedia` | #25941 → #25942, then #25803 → #25804; #25804 reads body `file` at 1009333, 1009354, and 1009366. Add top-level `file: unknown`. |
| `UploadDocument` | #25943 → #25944, then #25815 → #25816; #25816 reads body `file` at 1009712, 1009733, and 1009745. Add top-level `file: unknown`. |
| `UpdateEntryStatuses` | #25957 → #25958, then #25851 → #25854; #25854 reads body `map` at 1010658. Add top-level `map: unknown`; this does **not** prove an array response. |
| `UpdateEntryLeaveTypes` | #25979 → #25980, then #25920 → #25922; #25922 reads body `map` at 1012428. Add top-level `map: unknown`; do not infer an array from the `map` method/property name. |
| `GetEmployeeMeals` | #26011 → #26012, then #25998 → #25999; #25999 reads body `employees` at 1014367 and sorts that value. Add top-level `employees: unknown`; the use does not establish item shape. |
| `UpdateFolder` | #26149 → #26150, then #26176 → #26177; #26177 reads body `data` at 1019604 and 1019614 in its documents/gallery branches. Add top-level `data: unknown`. |

`DocumentsGetIndexFolders` has one more omitted body read: #26237 reads `p1.data` at 1021057 when `p1.folders` is falsy. The current limitation calls this a separate fallback and declines to model it, but it is a property of the already-unwrapped HTTP body, not a locally constructed fallback. Record `data: unknown` as a separate observed top-level field; retain `folders` and `settings` independently and do not infer an alias or shape from the fallback.

## Consumer-trace and evidence corrections

1. **`GetFolderData`:** the second success callback is not a field-free immediate consumer. #26252 reads body `subfolders` at 1021396 and dispatches `SET_DOCUMENTS_PAGES.data` (as well as whole-body document actions). Add this second read to the existing `subfolders` evidence and trace the documents reducer #26566. The current field evidence cites only #26112, and the limitation that says no further response fields are inferred is misleading for #26252.
2. **`GetSubfolders`:** likewise, #26240 reads body `data` at 1021151 in its `ADD_DOCUMENTS_DATA` branch. The field is already present from #26116, but its evidence omits this second caller. Include the branch-specific read and documents reducer #26566; keep `data` unknown and document both consumer branches.
3. **`GetGuardianInvoices`:** the field and trace evidence cite the wrong read for body `settings`. In #25591, line 1002202 reads `settings` from a captured environment value, not from the response parameter. The actual response-body `p1.settings` read is at 1002221. `p1.services` is read at 1002211 as a top-level body property; it is not nested under `p1.settings`. Correct the field evidence and callback summary while retaining all three root fields as unknown.
4. **`GetDocumentAcl`:** trace entry #26258 points to line 1021510, but its function header is at 1021512. Correct that header reference. The branch-specific `view`/`edit` evidence at #39655 lines 1598277/1598290 and the unknown root disposition are otherwise appropriately conservative.

The remaining unknown dispositions and partial/open root models reviewed here should stay conservative. Do not treat `Object.entries`, concatenation, request/optimistic data, Axios `.data` unwrapping, or UI fallback values as proof of response fields or collection types.

**Review-only:** no source, response JSON, research JSON, generated API, build, or test files were changed; only this report is owned by this review.

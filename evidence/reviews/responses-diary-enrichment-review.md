# Pre-integration review: diary response enrichment

**Verdict: not ready to integrate unchanged.** This is a read-only review of `evidence/responses-diary-enrichment.json` against the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` and the existing `evidence/responses/children-diary-files.json`. No candidate JSON, implementation, or other file was changed.

## Counts

- 8 candidate operation records; all 8 `operationId` / `sourceFunctionId` pairs match the corresponding research operations.
- 13 recursive candidate field nodes: 10 top-level entries plus 3 nested entries. Two field nodes are typed `object`; the remaining 11 are `unknown`.
- 4 additional unique response-body paths are proved for `GetFolderData` (`#26143`) by its gallery and documents reducer consumers; the documents chain is currently misattributed to `GetDocumentsFolderData` (`#26270`). Removing that unsupported `subfolders` claim and adding the four paths yields 16 recursive candidate nodes.
- All 13 candidate field-level evidence strings point to function-header lines rather than the instructions that read the named property.
- 3 diary-operation overlaps checked against the existing response file; preserve its stronger GetDiaryData record.

## Findings

### 1. Folder GET consumer chains prove four omitted paths, but one chain is linked to the wrong Metro service

The gallery and documents reducers both read response properties from the same `FolderService.getFolderData` helper, `#26143`. Those properties are missing from the candidate's `GetFolderData` record. The documents chain is **not** evidence for `GetDocumentsFolderData` (`#26270`): the matching action label hides a different Metro dependency.

**Gallery consumer of `GetFolderData` (`#26143`).** Metro module 2265 has dependency array `[1,8,2266,2267,2268]` (`eliis.hasm:11450-11453`), including FolderService module 2267. Thunk `#26111` calls `getFolderData` and attaches `#26112` (`1018011-1018019`). `#26112` sends `response.subfolders` to `SET_GALLERY_PAGES` and the whole body to both `SET_GALLERY_FOLDER` and `SET_GALLERY_DATA` (`1018029-1049`). `galleryReducer #26094` consumes the `SET_GALLERY_DATA` body and reads `subfolders.data`, `subfolders.current_page`, `subfolders.last_page`, and root `files` (`1017426-1017468`).

**Documents consumer of the same `GetFolderData` (`#26143`).** Metro module 2269 is initialized by `#26234` with dependency array `[1,8,2270,2267,2268]` (`11470-11473`). `#26234` loads dependency index 3 into environment slot 4 (`1020910-1020914`); action thunk `#26251` reads that slot and calls `.getFolderData` (`1021369-1021377`). Dependency module 2267 is the `FolderService` wrapper `#26140`; its `#26141` export table registers `getFolderData` as `#26143` (`module registration 11460-11463`; service table `1018668-1018682`). The resulting callback `#26252` sends `response.subfolders` to `SET_DOCUMENTS_PAGES` and the whole body to `SET_DOCUMENTS_FOLDER` and `SET_DOCUMENTS_DATA` (`1021394-1021409`). `documentsReducer #26566` reads the paths under `subfolders` and root `files` from the `SET_DOCUMENTS_DATA` body (`1031404-1031446`); its `SET_DOCUMENTS_PAGES` branch independently reads `subfolders.data/current_page/last_page` (`1031234-1031246`).

**Different operation: `GetDocumentsFolderData` (`#26270`).** It is exported by `DocumentsService` through Metro module 2270 (`#26265`, registration `11475-11478`; `#26266` registers `getDocumentsFolderData` -> `#26270` at `1021694-1021715`). The document-mode branch in `#26228` calls that named API method (`1020704-1020723`; the related catch branch is `#26229`, `1020748-1020767`). This is distinct from `#26251` calling FolderService `getFolderData`. The cited `#26252` callback is reached from the latter `#26143` promise, not from `#26270`. No response-property read from the `#26270` result is established by the candidate's trace; any further callback consumer needs an exact link. Remove `GetDocumentsFolderData.subfolders` and retain `kind: "unknown"`, `fields: []` absent separate proof.

Add these four fields once under `GetFolderData` (`#26143`), all with type `unknown`: `subfolders.data`, `subfolders.current_page`, `subfolders.last_page`, and root `files`.

The current statements that the folder callbacks themselves do not read `files` are true narrowly, but do not cover the body-to-reducer chain. `#26252` forwards the `#26143` result to `SET_DOCUMENTS_DATA`, and `#26566` reads `body.files`; this proves the field on `GetFolderData`, not on `#26270`.

Keep these shapes partial and open. The reducers call `.map` on truthy collection values, but this does not prove JSON array/item types. The map callbacks `#26096/#26097` and `#26569/#26570` construct local `{type, data}` wrappers without reading item properties. Do **not** model wrapper keys such as `folder`, `media`, `images`, `folderData`, or `folderFilesLoaded`, or infer file/folder item IDs or fields from the UI.

### 2. Complete the exact caller trace and use property-access line links

For `GetFolderData` (`#26143`), add both directly invoking thunk frames (`#26111` and `#26251`) and reducers `#26094` / `#26566` so the gallery and documents consumer paths are explicit. For `GetDocumentsFolderData` (`#26270`), trace the documents-mode callsite `#26228` separately; do not attach `#26252` to it. For the index-folder callback records, include the call/`.then` frames `#26108` (`1017904-1017913`) and `#26236` (`1021030-1039`); each invokes its service method and attaches the callback represented by `#26109` / `#26237`.

The 13 field-level evidence strings currently cite only callback/reducer function headers. Replace those property-read locators with the original instruction lines:

- `GalleryGetIndexFolders`: `folders` at `#26109`, `1017929-1017933`; `settings`, `1017950-1017951`.
- `GetFolderData`: `subfolders` at `#26112`, `1018035-1018036` (plus reducer locations in finding 1 for added paths).
- `DocumentsGetIndexFolders`: `folders`, fallback root `data`, and `folders.data` at `#26237`, `1021055-1021061`; `settings`, `1021078-1021079`.
- `GetDocumentsFolderData`: the candidate's `subfolders` evidence at `#26252` (`1021396-1021397`) is linked to the wrong source operation; that thunk calls FolderService `getFolderData` (`#26143`, via Metro dependency 2267), not `#26270`. Remove the field unless an exact `#26270` body consumer is separately proved.
- `GetGuardianInvoices`: root `invoices`, `settings`, and `services` at `#25591`, `1002197-1002198`, `1002202`, and `1002211-1002213`; nested `invoices.current_page` and `invoices.data` at `#25684`, `1004697-1004707`.

The trace `line` entries may continue to identify function starts; the correction is to field-level evidence that currently says a property is read “at” a header line (for example `1017919`, `1002183`, or `1004424`).

### 3. Keep all response field types unknown as instructed

Change `DocumentsGetIndexFolders.folders.type` and `GetGuardianInvoices.invoices.type` from `object` to `unknown`. Retain the proven nested paths (`folders.data` and `invoices.current_page/data`) as partial client observations, but do not promote a property-access branch to a server field-type guarantee. The root response `kind: "object"` can remain: the consumers directly read named properties from the body. No candidate response status, media type, enum, requiredness, or generic pagination wrapper is asserted.

The invoice paths themselves are correctly nested: the exact consumers establish root `invoices`, `settings`, and `services`, then `invoices.current_page` and `invoices.data`. `Object.entries(invoices.data)` does not establish an array or item shape. No `last_page` read is established for this exact invoice response chain, so do not add one or flatten these fields into a presumed Laravel wrapper.

### 4. Reconcile, rather than overwrite, the three diary overlaps

- `GetDiaryData` (`#25935`): the candidate's empty `unknown` view only describes the `#43846` caller, whose continuation `#43847` does not inspect the resolved body. The existing response record already proves a different exact consumer chain: `#25782` calls the same `getDiaryData` service and attaches `#25783` (`eliis.hasm:1008672-1008676`); `#25783` reads 15 body-level properties (`1008696-1008846`), and `#25784` reads `statuses` item properties `used_in_course` and `type` (`1008866-1008875`). Preserve the existing model's 15 root observations and 2 statuses-item reads; do not replace it with this candidate's empty unknown record.
- `GetGuardianFeed` (`#25632`): the empty unknown schema is appropriate, but the candidate's “no downstream callsite” rationale is false. `#25515` calls the exact `getGuardianFeed` method and attaches `#25516` (`1000462-1000468`); `#25516` forwards the body unchanged as action `data` and takes `page` from captured client state (`1000478-1000494`). Keep the response shape unknown and page excluded from body fields, while retaining this passthrough trace.
- `GetGuardianDiary` (`#25630`): empty unknown remains appropriate. `#25620` registers the exact service export (`1002932-1002935`), and no downstream body consumer was established in the inspected source.

The operation/source-function IDs were cross-checked against their original service exports (including ChildServices `#25620`, DiaryService `#25934`, FolderService `#26142/#26143`, and DocumentsService `#26267/#26270`). The numeric source IDs match their research entries, but the candidate incorrectly attaches the documents reducer callback to the different DocumentsService helper. The defects above are trace coverage, a Metro dependency/consumer mislink, omissions, evidence locators, and two over-specific field types—not incorrect `sourceFunctionId` keys.

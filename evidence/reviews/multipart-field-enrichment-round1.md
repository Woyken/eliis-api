# Multipart field enrichment — independent round-1 evidence review

## Outcome / gate

**Not clean: correct the evidence before integration.** All **12 target service IDs**, **47 declared field occurrences**, and the referenced announcement constructor/callbacks were checked against the full local `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. There are **7 concrete correction groups** below. None requires server probing or guessed fields.

Reviewed multipart JSON SHA-256: `059da98457252fa002e8a981eb749952a9da1aaaa16f596cc8ae9f86a55fb75f`.

Inventory: 12 distinct targets; 17 listed constructor/source occurrences, 16 distinct listed IDs; 47 fields (42 literal-name occurrences and 5 generated-name pattern occurrences); 11 `optional:true`; types: 31 `unknown`, 10 `unknown[]`, 5 `string`, 1 `string[]`. There are **no duplicate field names within a record or duplicate target records**. The two idea records deliberately share the same constructor and ten-field list. The announcement has zero fields here because it references a separate record, not because its FormData is empty. Its three fixed names plus one dynamic family bring the reviewed field-family occurrence count to **51**; the recovered child-picture variant adds one currently unmodeled occurrence.

Read `AGENTS.md`. Temporary function extracts under `/tmp/opencode/multipart-review/` came from the full disassembly, not the string index. Module registrations in `#0`, literal dependency arrays, environment slots, exported closures, and argument registers were checked. All 12 target header lines match. The listed `#25575` header line is wrong (F2); folder append provenance is wrong despite its outer worker header line being correct (F3).

Only this report is authored. No research, TypeSpec, implementation, or other review files were edited. **No HTTP requests, login, private-record access, or remote writes were made. This is a failing pre-integration review, not either of the two final clean full sweeps.**

## Concrete corrections

### F1 — Child picture is recoverable through the shared component, not wholly unresolved

Affected: `uploadChildProfilePicture #25654`, JSON coverage/constructor/fields, Markdown row and interpretation limit.

The wrappers really do forward their arguments, so unknown forwarding is not itself an error. However, their actual component caller supplies the already-traced FormData constructor:

- Global registration binds **M4522** to `#44117`, with dependency **8 = M4227**. `#44117 +0xdd–0xee` imports that dependency into module environment slot 8. **`#44120 MyChildInfoScreen`**, header **1800078**, loads its default component at `+0x2d0–0x2d4`, inserts closure **`#44137` as `updateService`** at `+0x2ef–0x2f4`, and renders that component with those props at `+0x303`.
- **M4547 / `#44670`** also has dependency **8 = M4227**, installed into slot 8 at the same `+0xdd–0xee` offsets. **`#44673 ChildInfoScreen`**, header **1826294**, loads that component at `+0x5ef–0x5f3`, inserts **`#44697`** at `+0x60e–0x613`, and renders it at `+0x622`.
- **M4227 / `#40891 +0x298–0x29d` exports `#40894 EditProfileImage`** as default. `#40894 +0x10–0x16` stores the supplied updateService in component environment slot 0; `+0xab` creates **`#40898 uploadImage`** in that environment.
- **`#40898 +0x4b–0x4f` appends literal `profile_picture`** to freshly constructed FormData. `+0x6a–0x6e` invokes precisely that captured updateService with the FormData; the dispatch at `+0x73` executes its returned thunk.
- `#44137/#44697 +0x2a–0x2d` pass their input as the third argument to **M2239's `#25539 uploadChildProfilePicture`** (`#25509 +0x4b9–0x4be`). Its thunk **`#25540 +0x0c`** loads module slot 2 = dependency 3 / **M2241** (`#25509 +0x23c–0x24d`), forwarding kindergarten, child, and FormData at `+0x2a`.
- **`#25620 +0x18d–0x19a` installs `#25654`**; its parameter 3 is POST data at `+0x46–0x49`, URL `/api/kindergartens/{kindergartenId}/children/{childId}/profile-picture`.

**Fix:** record this named shared-component variant with `profile_picture:unknown`, constructor `#40898`, and both concrete prop/action chains. Its local append set is complete. Preserve open endpoint/caller coverage; do not assert all callers use this variant. This is **actual component identity and register-flow evidence**, not transfer by name similarity. `{name,type,uri}` remains file metadata, not three nested wire-body properties.

### F2 — Child-file branches are reversed in the descriptor explanation, and document omits `type`

Affected: `uploadFile #25661` fields `file`, `type`, branch coverage, source anchor.

`#25571 +0xa3 JStrictEqual` jumps to **`+0x11f` when captured upload type equals literal `document`**. Thus:

- **Non-document:** `+0xa7–0xda` constructs the descriptor `name = filename || name || "image"`, `type = item.mime`, `uri = item.path`, and appends it as `file`; `+0xe0–0xea` appends captured upload type as `type`; `+0xf0–0x117` appends UTC-format result as `uploaded_at`.
- **Document:** `+0x11f–0x125` appends the original item as `file`; **`+0x12b–0x152` appends only `uploaded_at`**. Its name register is r8, loaded with `uploaded_at` at `+0x60`. There is **no `type` append in this branch**.
- Items with `status === "size_too_big"` skip submission at `+0x158–0x15d`; this is a request gate, not another body field.

**Fix:** make `type` branch-conditional (`optional:true` across this combined constructor), state the exact `uploadType !== "document"` applicability, and correct file descriptor branch provenance. Retain unknown values and the locally complete *branch-aware* append set. The metadata header **1001832 belongs to `#25574 uploadChildFile`**; **`#25575` starts at 1001845**. Record both action factory/thunk IDs or fix the thunk anchor. Actual chain is `#25571 → #25574 → #25575 → #25661`; no guessed file properties are justified for the forwarded document item.

### F3 — Folder appends are in `#26195`, with captured upload type and different argument order

Affected: `uploadFiles #26153`, all three field proofs, constructor/dependency chain, Markdown row.

`#26193` is an outer delegated-generator loop, not the FormData constructor. `+0x49` creates `#26194 _loop`; **`#26194 +0x02` creates generator `#26195`**, header **1019990**. Actual append evidence:

| Part | Exact constructor evidence |
|---|---|
| `file` | `#26195 +0x41–0x4b`: original selected item r3, literal name `file`, FormData r9. |
| `type` | `#26195 +0x51–0x62`: **captured uploadFolderFiles argument 2**, loaded from environment depth 4 / slot 1 at `+0x57–0x5a`; **not item.type**. `#26190 +0x09–0x0c` captures this argument. |
| `uploaded_at` | `#26195 +0x68–0x9a`: `.utc().format("YYYY-MM-DD HH:mm:ss.SSS")`, literal name loaded at `+0x96`, append at `+0x9a`. |

`#26195 +0xb1` loads M2268 slot 8, installed as **`#26187 uploadFolderFile`** by `#26171 +0x252–0x25d`; `+0xb5–0xb9` calls it with **(FormData, captured folder argument)**. Factory `#26187` captures those as slots 0/1. Thunk **`#26188 +0x11`** loads M2268 slot 3 = dependency 2 / **M2267** (`#26171 +0x139–0x14a`), then calls service **(selectedKindergartenId, FormData, folderId)** at `+0x30`. Installer **`#26141 +0x90–0x9d`** binds `#26153`, which uses **parameter 3 in the folder URL and parameter 2 as POST data** at `+0x2a` / `+0x46–0x49`.

**Fix:** add the actual nested constructor ID/header, replace every append offset, correct `type` provenance, and correct action/service argument ordering and action name. The three part names themselves are real; local completeness remains supportable for `#26195`. `status === "size_too_big"` at `+0xa0–0xa9` skips submission; it does not append `status`.

### F4 — Forwarded message part value is `item.id`, not an ID-bearing file descriptor

Affected: `sendMessage #25233`, `forwardedFiles[{index}]` evidence.

`#32555 +0x131–0x135` loads the indexed forwarded item into r6. **`+0x150 GetByIdShort r6,r6,id` replaces it with item.id**. **`+0x155 Call3` appends that r6 value**, generated name r11, to FormData r4. No object is constructed for this append; there is no name/type/uri metadata copied or serialized here.

**Fix:** describe each generated part's value as **`forwardedFiles[index].id:unknown`**, not “each value”/“value metadata includes an id.” Do not turn it into a file part, invent nested `id`, or assert numeric/string server ID typing. The one-level indexed name and empty-collection omission are correct. The active `files[{index}]` branch separately does construct a file descriptor at `+0xd6–0xf0`.

### F5 — Idea total-size check rejects submission after appending, not a loop stop

Affected: both idea records, `files[]` evidence and guard description.

The count guard **`#38749 +0x17b`** jumps to a no-submit error path at `+0x312` when list length exceeds captured slot 41. Otherwise the `+0x1ad–0x210` loop appends **every entry**, accumulating size in r8/r4; the only loop-continuation test is index < length at `+0x210`. **Total-size comparison is after the loop**, `+0x214–0x218`; excessive total jumps to a no-submit error path at `+0x2b1`, **after files were appended**. The slots are proven constants: `#38738 +0x46e–0x471` stores 10 in slot 41; `+0x475–0x47b` stores 200000000 in slot 42.

**Fix:** remove “local size/count guard stops [the loop]” and “loop is skipped” because of size. State that count > 10 bypasses file appends and submission; allowed count appends all entries; accumulated size > 200000000 rejects submission afterward. Empty list emits no `files[]` parts. These are client request gates, **not server maximums or schema constraints**. The same correction applies to both intentional constructor copies. All ten literal part names, including actual repeated `categories[]`, `age_groups[]`, and `files[]`, are supported; no extra appends occur after these gates.

### F6 — Draft helper filename provenance adds an unobserved fallback

Affected: `uploadDraftAttachment #25249`, `file` evidence only.

**`#32720 +0x3b–0x40` reads input.name directly** and stores it as descriptor.name. It does not read `filename` or implement `filename || name`. Descriptor.type comes from input.mime (`+0x46–0x4c`), uri from input.path (`+0x52–0x57`). Appends are **file `+0x67`, type `+0x7d`, uploaded_at `+0xb5`**. The other variant **`#32712`** appends its original pending item at `+0x9e`, item.type at `+0xb3`, and uploaded_at at `+0xeb`; it mutates original path/id/status before constructing the form but does not append those as additional fields.

**Fix:** remove the nonexistent filename fallback from `#32720` evidence. Keep the three actual literal part names and conservative types. `#32712`'s pending check is correct; no property model is justified for its forwarded item. A selected item > 200000000 gets `size_too_big` rather than pending and does not reach this request; this is not server validation evidence.

### F7 — Diary workers call the service directly and supply a diary reference object

Affected: `uploadMedia #25941` and `uploadDocument #25943` dependencyChain wording; field lists themselves are correct.

Both workers load **M2248 module slot 4**, imported from dependency 3 / **M2249** at **`#25752 +0x22c–0x23d`**. **`#25803 +0xed–0x105`** calls default service.uploadMedia directly; **`#25815 +0x100–0x118`** calls default service.uploadDocument directly. There is **no intervening uploadMedia/uploadDocument Redux action**. Outer action factories are instead **`#25799 uploadDiaryImage`** and **`#25811 uploadDiaryDocument`**, with their wrapper/generator chains `#25800/#25801/#25802/#25803` and `#25812/#25813/#25814/#25815`.

Argument 2 to either service is captured outer action argument 3, **not an extracted diary ID**: workers load it from depth 3 / slot 2 at `#25803 +0x101` and `#25815 +0x114`. Both services **read argument2.id at `+0x12–0x15`** before constructing the route. FormData is argument 3 and actual POST data at **service `+0x4b–0x4e`**. **`#25933 +0x62–0x6f` and `+0x79–0x86`** install `#25941` and `#25943` respectively.

**Fix:** state the real action-factory → worker → direct service chain and diary-reference `.id` extraction. Do not add diary/id/routing properties as multipart parts. No endpoint or field-name reassignment is needed.

## Verified target-chain ledger

`M` denotes Metro module ID proved by `#0` registration. Service installer functions create the named method closures and their modules export the instantiated default service. No reviewed service or action adds/spreads further FormData parts.

| Target | Concrete constructor → import/action/service chain and final data placement |
|---|---|
| `#16361 uploadUserPicture` | `#40854` dependency 25 of M4226 = M1574; `+0x3cd–0x3d3` supplies updateUserImage to M4227's `#40894`; constructor `#40898` → export `#16229` / thunk `#16230`. M1574 slot 5 = dependency 4 / M1577 (`#16186 +0x1f0–0x201`); `#16342 +0xbe–0xcb` binds `#16361`. FormData parameter 1 is data at `+0x27–0x2a`, POST `/api/common/settings/upload`. **Correct.** |
| `#25233 sendMessage` | `#32555` dependency 28 of M3401 = M2217; `#25148 +0x356–0x35b` exports `#25172` → `#25173`. M2217 slot 2 = dependency 3 / M2218 (`+0x1b3–0x1c4`); installer `#25216 +0xbe–0xcb`. FormData parameter 2 goes into config.data at `#25233 +0x39–0x3c`, POST `/api/kindergartens/{kindergartenId}/messages`. **F4 value correction.** |
| `#25249 uploadDraftAttachment` | `#32712/#32720` dependency 17 of M3411 = M2217; `#25148 +0x3b9–0x3be` exports `#25199` → `#25200`; thunk builds `kindergartens/` + selected kindergarten as route-scope argument, forwards wrapper.id and wrapper.data; M2218 installer `#25216 +0x176–0x183`. Parameter 3 is POST data at service `+0x46–0x49`, `/api/{scope}/messages/{messageId}/upload`. **F6 provenance only.** |
| `#25253 updateSentMessage` | `#34032` dependency 34 of M3513 = M2217; `#25148 +0x3da–0x3df` exports `#25206` → `#25207`, forwarding `{id,data}` components to M2218; installer `#25216 +0x1a4–0x1b1`. Parameter 2 is POST data at `+0x3c–0x3f`, `/api/common/messages/sent/{messageId}`; `_method=put` is an actual part, not transport PUT. **Correct.** |
| `#25338 sendAnnouncement` | `#42237` dependency 16 of M4335 = M2223; `#25321` → `#25322`; M2223 slot 0 = dependency 1 / M2224 (`#25309 +0x9e–0xaf`), installer `#25328 +0x79–0x86`; parameter 2 becomes config.data at service `+0x3b–0x3e`, POST `/api/kindergartens/{kindergartenId}/announcements`. **Referenced dynamic evidence verified below.** |
| `#25654 uploadChildProfilePicture` | Shared M4227 constructor `#40898` → props `#44137/#44697` → M2239 `#25539/#25540` → M2241 installer `#25620 +0x18d–0x19a`; data parameter 3 at `+0x46–0x49`. **F1 missing actual constructor.** |
| `#25661 uploadFile` | M2239 action `#25568` captures type; `#25569/#25570/#25571` constructs FormData; module slot 6 is action `#25574`, exported/stored at `#25509 +0x532–0x53d`; `#25575` loads service slot 2 / M2241 and forwards selected kindergarten, childId, formData at `+0x38`; installer `#25620 +0x1e9–0x1f6`; data parameter 3 at service `+0x46–0x49`, POST `/api/kindergartens/{kindergartenId}/children/{childId}/files`. **F2.** |
| `#25941 uploadMedia` | M2248 `#25799 → #25800/#25801/#25802/#25803` → M2249 direct service; installer `#25933 +0x62–0x6f`; data parameter 3, diary-reference argument 2 `.id`; POST `/api/kindergartens/{kindergartenId}/diary/{diaryId}/media`. **F7.** |
| `#25943 uploadDocument` | M2248 `#25811 → #25812/#25813/#25814/#25815` → M2249 direct service; installer `#25933 +0x79–0x86`; same data/reference placement; POST `/api/kindergartens/{kindergartenId}/diary/{diaryId}/document`. **F7.** |
| `#26153 uploadFiles` | M2268 `#26190 → #26191/#26192/#26193/#26194/#26195` → module slot 8 / `#26187/#26188` → slot 3 / dependency 2 / M2267; installer `#26141 +0x90–0x9d`. POST `/api/kindergartens/{kindergartenId}/folders/{folderId}/upload`, **data parameter 2, folder parameter 3**. **F3.** |
| `#26385 storeIdea` | `#38749` dependency 30 of M4085 = M2275; store branch `+0x249–0x252`; `#26314 +0x17d–0x182` exports `#26315` → `#26316`; M2275 slot 0 = dependency 1 / M2276 (`#26314 +0xe6–0xf7`); installer `#26361 +0x11a–0x127`; parameter 2 is data at `+0x41–0x44`, POST `/api/kindergartens/{kindergartenId}/idea`. **F5 guard correction.** |
| `#26387 updateIdea` | Same constructor/module import, update branch `#38749 +0x27c–0x286`; export `#26318` → `#26319`, installer `#26361 +0x131–0x13e`; separate idea path ID and FormData parameter 3 at `+0x45–0x48`, POST `/api/kindergartens/{kindergartenId}/idea/{ideaId}`. **F5; deliberate shared variant.** |

## Exhaustive append/value ledger

Offsets below are actual `append` calls, not nearby identifier appearances. All declared occurrences were checked, including both idea copies.

| Record | Count | Every field occurrence / disposition |
|---|---:|---|
| User picture | 1 | `profile_picture #40898 +0x4f`; descriptor name literal `profile-image`, type `input.type || input.mime`, uri input.path. Unknown file value accepted. |
| Send message | 6 | `subject +0x3f`; converted `body +0x77`; string `type="message" +0x8b`; dynamic `files[index] +0xf5`; dynamic `forwardedFiles[index] +0x155` (F4); two-level `targetGroups[index][key] #32557 +0x3f`. |
| Draft attachment | 3 | `#32712 file +0x9e / type +0xb3 / uploaded_at +0xeb`; independently `#32720 file +0x67 / type +0x7d / uploaded_at +0xb5` (F6). Both fresh FormData append sets complete within their named branches. |
| Sent-message edit | 4 | `_method="put" #34032 +0x57`; converted `body +0x8f`; dynamic `files[index] #34033 +0x4d`; dynamic `removedFiles[index] #34034 +0x3b`, explicit **String(item)** at `+0x36`. Optional generated parts are supported by potentially empty `.forEach` collections. |
| Announcement reference | 0 here / 4 families referenced | `subject #42237 +0x35`; converted `body +0x6f`; `type="announcement" +0x83`; two-level dynamic append `#42239 +0x3f`. `#42237 +0xbc–0xc2` is the **action invocation**, not another append. |
| Child picture | 0 declared / 1 recovered | Actual shared constructor `profile_picture #40898 +0x4f` through both child-screen prop chains (F1). Arbitrary other service inputs remain unknown. |
| Child file | 3 | Non-document: `file #25571 +0xda`, `type +0xea`, `uploaded_at +0x117`; document: `file +0x125`, `uploaded_at +0x152`, **no type** (F2). |
| Diary media | 3 | `file #25803 +0x7f`, `type +0x93`, `uploaded_at +0xcb`. All names/values/descriptor filename fallback in evidence supported. F7 concerns routing wording only. |
| Diary document | 4 | `file #25815 +0x7e`, `type +0x92`, literal string `fileType="document" +0xa6`, `uploaded_at +0xde`. All field evidence supported. F7 concerns routing wording only. |
| Folder file | 3 | `file #26195 +0x4b`, captured `type +0x62`, `uploaded_at +0x9a` (F3). No other appends in nested loop. |
| Store idea | 10 | `header #38749 +0x35`; `contents +0x4b`; `keywords +0x61`; `youtube +0x77`; `google_drive` from submitted googleDrive `+0x8d`; string `vimeo="" +0xa1`; captured `is_public +0xb8`; repeated literal `categories[] +0xf5`, `age_groups[] +0x14a`, `files[] +0x1f8`. F5 only guard semantics. |
| Update idea | 10 | Independently checked all same ten append occurrences and update-action body forwarding. Same F5; no extra `_method`, removed-file, route ID, or update-specific append exists in this constructor. |
| **Total** | **47 declared** | **47/47 occurrences; 12/12 service targets; all referenced announcement callbacks; one newly proved child-picture occurrence.** |

### Generated names versus genuine literal bracket names

- **Message receivers:** `#32555 +0x16b–0x181` nullish-checks receivers and calls its `.forEach(#32556)`. `#32556 +0x02–0x0c` captures **outer element/index**; `+0x12–0x2c` enumerates **Object.keys(element)** with inner callback `#32557`. Inner parameter 1 is the key, environment slot 1 at `+0x13` is outer index; concat `+0x24–0x33` produces **`targetGroups[{index}][{key}]`**; `+0x37–0x3f` appends **element[key]**, with no JSON.stringify or app-level String conversion. The pattern spelling is correct. Add those exact callback offsets when correcting provenance; key domains remain unknown.
- **Announcement:** independently read `#42237/#42238/#42239`. The same outer-index/inner-key algorithm is proven at corresponding callback offsets. Current referenced `evidence/request-model-enrichment.json` has **`dynamicParts.namePattern="targetGroups[{index}][{key}]", type:unknown`** and no phantom fixed `targetGroups[]`; earlier request-review F4 is correctly addressed in that referenced record. Do not restore a phantom fixed property. Empty outer collection or empty key set can generate zero parts; no nullish guard is present on the announcement's outer targetGroups call.
- Indexed `files`, `forwardedFiles`, and `removedFiles` likewise have **generated names**, not literal properties containing `{index}`. Their array-type metadata can describe a collection of generated occurrences, but **must not become an array-valued individual part or fixed schema name**. Per-part values are unknown for active files, forwarded IDs, and target-group properties; removed values are explicitly strings. Keep dynamic patterns in extensions/notes or an explicitly dynamic-part representation.
- **`categories[]`, `age_groups[]`, and `files[]` in the idea constructor are actual literal append names**, reused for each item. They are not unproved dynamic placeholders. Do not drop them because a TypeSpec identifier regex rejects brackets. Repetition describes multiple parts, not a guessed JSON nested body or app-side JSON.stringify encoding.

## Native FormData value encoding and open remainders

The bundled React Native JavaScript implementation is available in the full Hermes source and was read directly:

- **`#2131 FormData`**, header 107767, `+0x1e–0x22` initializes an empty `_parts` array.
- **`#2132 append`**, header 107786, `+0x0d–0x1f` pushes exactly `[name,value]`. It does **not** enumerate descriptor keys into additional parts.
- **`#2136 getParts`**, header 107864, maps `_parts` through `#2137`.
- **`#2137`**, header 107879, `+0x27–0x39` builds Content-Disposition's **name from the appended name**. Its truthy non-array object branch `+0x6a–0xc4` uses string descriptor.name as **filename** (with captured local `#2129 encodeFilename`, installed by `#2128 +0x0b–0x10`) and descriptor.type as **Content-Type**. `+0xc4–0xdc` spreads the descriptor into a **native transport descriptor** with headers/fieldName; it does not append descriptor properties as wire fields. The scalar/null/array branch `+0xe5–0xfc` uses **String(value)** as the transport string value, not JSON.stringify.
- **`#2127 convertRequestBody`**, header 107606, `+0xa4–0xb0` sends FormData's getParts result as native bridge `formData`. That transport/config key is not an app-created multipart part.

Consequently, all `{uri,name,type}` and `{name,size,type,uri}` commentary is correctly treated as client file metadata, not nested HTTP-body properties. Conservative unknown file-value types are accepted. Plain forwarded scalar values may stringify in the native layer, but unknown object-capable input does not establish a universal scalar/file domain; do not narrow these bodies by guessing. No native Java completeness claim is needed for these bounded append/JavaScript encoding conclusions.

There is no app-side whole-body Object.assign/spread or action-added append in the traced FormData flows. The SDK's descriptor Object.assign above preserves potentially unknown descriptor members as **transport metadata**, not an open set of additional multipart names. Unknown original file objects in `#32712`, the child document branch, and folder upload remain unresolved **values**, not a source of invented nested fields. All service arguments outside named variants and all unaudited callers remain open/unknown.

The current 11 `constructionComplete:true` claims mean only complete named local append sets. They must not close endpoint models or infer server requiredness, defaults, enums, accepted types, or limits. Retain completeness after correcting F2/F3/F5 and incorporating callbacks; F1 supports an additional complete named child variant, not universal child endpoint closure. No other appended names were missing from the reviewed constructors.

## Follow-up

Correct only the evidenced JSON/Markdown claims in F1–F7; carry literal names and dynamic patterns into integration without descriptor-property inflation, phantom fixed names, or endpoint closure. Recompute counts after adding the child variant and correcting branch metadata. Then run the requested two independent clean full reviews against corrected evidence and integrated output. This report does not certify either future sweep.

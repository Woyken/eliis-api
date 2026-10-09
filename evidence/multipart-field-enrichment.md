# Multipart request-field enrichment

This bounded pass traces app-created `FormData` in the local Hermes disassembly (`/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`) into the 12 requested multipart service targets. The companion [JSON evidence](multipart-field-enrichment.json) gives normalized field records, source function IDs/offsets, and the action/service routing evidence.

## Coverage summary

| Target | App-side constructor / result |
| --- | --- |
| `uploadUserPicture` #16361 | `uploadImage` #40898 appends literal `profile_picture`; traced through `updateUserImage` #16229/#16230 to UserService. |
| `sendMessage` #25233 | `sendOldMessageHandler` #32555 appends `subject`, converted `body`, `type=message`, indexed `files[...]`, indexed `forwardedFiles[...]`, and dynamic receiver/target-group parts. |
| `uploadDraftAttachment` #25249 | #32712 and #32720 both append `file`, `type`, and `uploaded_at`. |
| `updateSentMessage` #25253 | #34032 appends `_method=put`, converted `body`, indexed `files[...]`, and indexed `removedFiles[...]`. |
| `sendAnnouncement` #25338 | Preserved/deduplicated existing `subject`, converted `body`, `type=announcement`, and dynamic `targetGroups[index][key]` evidence; #42237 +0xc2 invokes the action, not append. |
| `uploadChildProfilePicture` #25654 | Recovered actual shared component #40894/#40898 through #44120/#44137 and #44673/#44697 → #25539/#25540 → #25654; literal `profile_picture`, not transfer by field-name similarity. |
| `uploadFile` #25661 | #25571 appends `file`/`uploaded_at` in both branches; `type` only when captured uploadType is not `document`. Routes through factory #25574 (line 1001832) / thunk #25575 (line 1001845). |
| `uploadMedia` #25941 | #25799 uploadDiaryImage → #25803 directly calls service; appends `file`, `type`, `uploaded_at`. Service extracts reference.id for routing only. |
| `uploadDocument` #25943 | #25811 uploadDiaryDocument → #25815 directly calls service; appends `file`, `type`, client constant `fileType=document`, `uploaded_at`. Reference.id is routing only. |
| `uploadFiles` #26153 | Outer #26193 → #26194 → actual constructor #26195 appends `file`, captured uploadFolderFiles argument 2 as `type`, `uploaded_at`; #26187/#26188 call service(kindergarten,FormData,folderId). |
| `storeIdea` #26385 | Idea form #38749 appends metadata fields, repeated `categories[]`/`age_groups[]`, and literal `files[]`. |
| `updateIdea` #26387 | Same #38749 FormData constructor as `storeIdea`; the action branch selects the update service and separately passes the idea ID. |

## Interpretation limits

- `fields` lists only literal names proved by `FormData.append`; `dynamicParts` separately records generated name patterns and individual member-value types. A service's multipart header, URL, action name, and SDK/config properties are not wire-body keys. Actual repeated literal `categories[]`, `age_groups[]`, `files[]` names stay in `fields`; their `unknown[]` typing describes repeated unknown-valued parts, not a JSON part or whole-body array.
- File parts are represented as `type: unknown`. Where source constructs React Native `{name,type,uri}` (or `{name,size,type,uri}`) values, those properties are file-part client metadata, not separate fields or nested HTTP-body properties.
- `constructionComplete` applies only to the named local form constructor. It does not close the endpoint model or assert server requiredness, accepted types, or coverage of other callsites.
- Child-picture screen imports, rendered component identity, captured updateService, and action/service data registers establish the shared constructor. Arbitrary other service inputs and unaudited callers remain unknown, not the proved child-screen part name.
- No network requests were made.

## Corrected bounded integration (not a clean-review sweep)

All seven findings in `evidence/reviews/multipart-field-enrichment-round1.md` were rechecked against original bytecode and corrected: shared child component (F1), child-file branch/type omission and action anchor (F2), nested folder constructor/type provenance/argument order (F3), forwarded `item.id` (F4), post-loop idea request gates (F5), draft helper direct `input.name` without filename fallback (F6), and direct diary-service/reference.id chains (F7).

Idea count >10 bypasses file appends and submission; otherwise every selected file is appended before total size >200000000 rejects submission. Constants are #38738 +0x46e–0x47b; branches/loop are #38749 +0x17b, +0x1ad–0x210, +0x214–0x218. These are client request gates, not server maximums or loop size guards.

The bundled JavaScript FormData implementation #2132 +0x0d–0x1f stores `[name,value]`; #2137 +0x27–0x39 uses the appended name for Content-Disposition. Its object branch +0x6a–0xdc treats descriptor name/type as filename/Content-Type and passes native metadata, never additional API fields. Its scalar branch +0xe5–0xfc uses String(value), not JSON.stringify. #2127 +0xa4–0xb0 forwards getParts to the native bridge; no universal server/native completeness is claimed.

All 12 baseline targets now have `body.kind: multipart`, `complete:false`, literal-only fields, and source-backed named `clientRequestVariants`. Announcement's existing three fields and dynamic family were preserved without duplicate variants. All baseline service function IDs and HTTP POST verbs are unchanged; `_method=put` is only a client part. No admin-shop target belongs to these 12, so that baseline file was left untouched.

| Operation ID | Literal names | Dynamic families |
| --- | ---: | ---: |
| UploadUserPicture | 1 | 0 |
| SendMessage | 3 | 3 |
| UploadDraftAttachment | 3 | 0 |
| UpdateSentMessage | 2 | 2 |
| SendAnnouncement | 3 | 1 |
| UploadChildProfilePicture | 1 | 0 |
| UploadFile | 3 | 0 |
| UploadMedia | 3 | 0 |
| UploadDocument | 4 | 0 |
| UploadFiles | 3 | 0 |
| StoreIdea | 10 | 0 |
| UpdateIdea | 10 | 0 |
| **Total target occurrences** | **46** | **6** |

The 52 total field-family occurrences count repeated literal names once per target, not concrete emitted part counts. All 12 named local append sets are established (with two child-file branches and two draft constructors); all endpoint/caller coverage remains partial. The initial round-1 inventory of 47 declarations excluded the referenced announcement and the newly recovered child part; it is historical, not the final integrated total. No additional concrete issue remains from F1–F7. Unknown file/ID/value domains, arbitrary other inputs, and unaudited caller coverage are genuine open boundaries. Regeneration and two consecutive full clean reviews remain the parent's next gate; this correction phase does not certify either review.

Validation: all five JSON inputs (companion enrichment plus four baseline domains) parsed successfully. Exact 12 target field sets, literal-only variant field trees, variant-union field coverage, unique names/variant IDs, all target/constructor header lines, and the original-bytecode literal-name/exact-append-call ledger were checked. There are 14 named integrated variants (two draft constructors, two child-file branches); all retain partial caller coverage. Logout's `AxiosURLSearchParams brackets` encoding is preserved. `git diff --check` passed. No generated files were changed or regeneration attempted in this owned evidence phase.

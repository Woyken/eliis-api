# Bounded child / diary / file request-body candidates

Scope: a targeted, non-exhaustive pass over the requested missing-body candidates. This file covers eight operations with useful caller evidence. It does not claim coverage of every caller or endpoint schema. The eight canonical research records now include the same partial body fields and caller variants; unrelated record data is preserved.

## Source and method

- Request helper evidence and all cited line numbers are from `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` (Hermes v96 disassembly).
- `+0xNN` in the JSON is a function-relative bytecode offset.
- I traced the request helper's Axios data position plus the cited action/thunk/caller forwarding chain. `function-strings.json` was not used as request-field proof.
- No network/write request was made.

## Candidate payloads

| Operation | Caller-observed fields | Key limitation |
|---|---|---|
| `CreateDiary` | `course_id`, `date`, `published` (`integer`, observed value `0`) | Action has nullish fallback branches for course/date; zero is a client literal only, not a server default/status. |
| `SaveEmployeeMeal` | `date`, `employee_id` | A further computed property uses dynamic `context.meal`; its value is copied when non-nullish and otherwise set to `null`. No static meal field is inferred. |
| `AddTimeLog` | `child_id`, `started_at`, conditional `ended_at` | The action uses `Object.assign` with a caller object; this editor's fields do not close other callers. |
| `MoveFolders` | `folder_ids` | `routeParams.items` is forwarded unchanged; the destination `folderId` is separate. No ID mapping or array type is inferred. |
| `MoveFiles` | `file_ids` | `routeParams.items` is forwarded unchanged; the destination `folderId` is separate. No ID mapping or array type is inferred. |
| `UpdateDiaryFile` | `name`, `description` | Proven for the diary-image metadata editor; route/envelope IDs are not in the inner form. |
| `UpdateGalleryFile` | `name`, `description` | Proven for the gallery metadata editor; route/envelope IDs are not in the inner form. |
| `UpdateDocumentFile` | `name`, `filename`, `view`, conditional `edit` | The same form object is forwarded as body and supplies the URL filename. `edit` inclusion follows an ACL-response-shape client branch, not an authorization decision. |

The JSON records preserve field types as `unknown` where the traced construction does not establish a transport primitive. The body models are marked `complete: false` because caller/endpoint coverage remains partial, while each variant records whether its named constructor is traced completely. No server-required fields, enums, nullability, defaults, or validation rules are inferred. The eight variants carry constructor function IDs/header lines, local bytecode offsets, and the routing/forwarding chain to the target service.

## Chain notes

- Diary creation: #25764 → #25765 constructs the body and calls the installed diary action; #25937 POSTs action data directly. The kindergarten ID is route state, not body data.
- Employee meal: #37349 constructs date/employee ID and a dynamic `context.meal` property; it copies non-nullish `event.value` or assigns `null` otherwise. #26002 forwards its object to #26015. The dynamic key is intentionally absent from the static normalized field list.
- Time log: #43884 creates start/end timestamps; #25897 merges the supplied object with `child_id`; #25971 POSTs that merged data. `ended_at` is assigned only on the truthy end-time branch.
- Bulk moves: #43269 builds `{folder_ids: routeParams.items}` and `{file_ids: routeParams.items}` unchanged. Thunks #26219/#26223 supply selectedKindergartenId and route folderId separately, and #26157/#26159 send the body argument as Axios data.
- Diary/gallery file metadata: #43639/#38003 build inner `{name, description}` forms inside action envelopes. The matching wrappers unwrap the envelope and send only `form`; filename and kindergarten ID are route arguments.
- Document metadata: #39657 builds `{name, filename, view}` and conditionally `edit`; #39650/#39655 show the branch is keyed to `!Array.isArray(getDocumentAclResponse)`, not a permission decision. #26260/#26261 route using the caller's `filename` value but pass the original object unchanged to #26274. This supports filename in both route and body for this observed caller without changing the canonical URI placeholder or asserting a filename domain type.

## Reviewed corrections and counts

- The eight operations have **18 statically named body fields** and **8 caller variants**. `SaveEmployeeMeal` also has one unresolved computed key, which is documented in evidence rather than guessed as a static field.
- All eight research body objects remain partial (`complete: false`); each variant separately states whether the local constructor itself is completely traced.
- Canonical URI templates, operation/source IDs, auth, response observations, and unrelated research additions are left intact.

## Not modeled in this bounded pass

Start/stop time-tracking, update-time-log, add-folder/update-folder, and delete-files were not promoted to candidate operations here. This is a deliberate eight-operation bound, not evidence that their request bodies are empty or uninteresting. File-metadata variants beyond the named editor constructors remain unresolved.

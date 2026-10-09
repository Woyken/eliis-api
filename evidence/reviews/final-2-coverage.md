# FINALREVIEWRUN2 — independent coverage review

**Result: 0 findings.** All 15 operations in `evidence/research/coverage-extra.json`, all 27 path-parameter observations and all 40 query observations pass this independent, read-only review of the fixed coverage scope. No concrete bytecode/native-backed defect was found. This is not a server-completeness claim or a renewed whole-APK endpoint-discovery audit.

## Independence, scope and input integrity

- Read `AGENTS.md` and inspected the original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, not just the function-string index, extracted domain snippets or prior review conclusions. Prior run-1 reports were not read or accepted as authority. `coverage-notes.md` was treated as a set of claims to check against the original instructions.
- Independently traced the 15 additions' URL/register construction, module-to-consumer linkage where applicable, source branches, parameter inclusion, cookie continuations, RNFS JS wrapper and native Android transport.
- Compared research with `scripts/operation-catalog.json`, `routes/generated.tsp`, and both already-normalized outputs: `tsp-output/@typespec/openapi3/openapi.json` and `openapi.yaml`. Parsing the two OpenAPI formats produced deeply equal documents.
- Independently recomputed baseline coverage, method/path equivalence, aliases, source retention and additional representative function IDs. All 298 research source ID/name/header-line triples also match original disassembly headers. This header/reconciliation check is not a field-by-field certification of every baseline operation.
- No input/specification/generated-output edits, generation, compilation, builds, project tests, Git commands, HTTP calls, login or private-record access were performed. The only authored file is this report. Inline scripts only read, parse, compare, hash and print existing inputs.
- The supplied snapshot was checked with the read-only branch of `/tmp/opencode/eliis-review-snapshot.py` before review, again before report creation, and after report creation. Every check returned the same SHA-256 and **0 changed input files**:

  `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`

  That snapshot covers specification/evidence/publication inputs, excluding reviews and emitted OpenAPI. A separate before/after hash check also covers the emitted files and original inspected sources; those remained unchanged.

### Independently read input hashes

| Input | SHA-256 |
| --- | --- |
| Original `eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| Original `decompiled/sources/com/rnfs/RNFSManager.java` | `89181c13740431ca796f364b1a5379deeaf592a6c79ffb726ce37d8b7463036b` |
| Original `decompiled/sources/com/rnfs/Downloader.java` | `2eb4e79b523e7a0411b38c272f456bd8d29784fcdff14a4a3d4a0885a17e70bf` |
| `evidence/research/coverage-extra.json` | `32328a6a4deeb36b180cf32494c172de1621ed959f372cf53bd6493fbe45b5e4` |
| `scripts/coverage.json` | `508214c2d61dd832dc9b6b359757b88fdfd4ed20c8fd92bc29dd31601140387b` |
| `scripts/operation-catalog.json` | `ce98501c06ea84bf57d9ddcbf35b880f1aa8dff0dc744583593cd7d175a9baa7` |
| `routes/generated.tsp` | `bb7a2948e4b0b4704448153659b085d1c29f92a1b8754e666468938c1acd36cf` |
| Normalized `openapi.json` | `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb` |
| Normalized `openapi.yaml` | `33453e849f3132271e58c4cbc870b9cee2135a890bad16ef2bd74ba8f12133c0` |

## Native GET and saved-cookie proof

The following common transport was checked from original source rather than inferred from names such as image, PDF or download:

1. Module 3486 maps to Hermes #33113 (`eliis.hasm:17555-17558`). #33113 reads `NativeModules.RNFSManager` into environment slot 2 (1298692-1298694). The JS `downloadFile` wrapper #33171 forwards `fromUrl` and the supplied `headers` (1300381-1300390), then loads slot 2 and calls native `downloadFile` with those options (1300430-1300432).
2. `RNFSManager.java:779-792` constructs the source URL and destination file and transfers URL/headers to `DownloadParams`; **842-844 constructs and executes `Downloader`**. These manager lines do not themselves connect the HTTP URL.
3. `Downloader.java:64-74` opens `HttpURLConnection`, copies request headers, sets timeouts and connects. Inspection/search of the complete downloader found no `setRequestMethod`, `setDoOutput` or `getOutputStream`. Thus the platform default **GET** is left in effect, with no constructed request body. The destination `FileOutputStream` at 133/184/195 is a local-file output, not an HTTP output body.
4. The separate redirect connection at `Downloader.java:79-82` also has no method override. Its code does not copy the initial headers, so initial cookie evidence is not a guarantee of cookie propagation across that connection.
5. `RNFSManager.java:801-805` builds local completion metadata `jobId`, `statusCode`, `bytesWritten`; 819-825 and 833-838 build progress/event metadata. These are not server JSON fields. Neither these names nor the native status handling establish a complete server response or universal success/error status.

The saved-cookie chain was also reread: module 595 maps to #6556 (3100-3103); #6563/#6564/#6565 lead to #6566, which reads keychain service `accessToken` and returns the stored `password` or null (288819-288898). #6562 stores its argument as the password for the same service (288790-288804). #5617 extracts and serializes `eliis_csrf` from `set-cookie`, then calls `saveAccessToken` with the serialized value (254472-254505). The storage label is not a Bearer token. Each representative downloader below replaces its initially empty `headers.cookie` before RNFS invocation; reports additionally append `; lang=` and selected language. This proves observed client header behavior, not server authorization requiredness.

## Complete 15-operation ledger

`K` abbreviates `/api/kindergartens/{kindergartenId}` **only in this report**. Every row is GET, has no constructed body, supplies the saved cookie, and preserves an unknown server response. Paths here use original research names; the neutral physical OpenAPI slots are detailed below. Counts are path observations / query observations.

| # | Operation and original path | Original URL/branch and parameter proof | Cookie → RNFS proof | Counts / result |
| --- | --- | --- | --- | --- |
| 1 | `DownloadMessageAttachment`: `/api/common/files/messages/{filename}` | #34104 reads attachment.filename and concatenates it at 1334809-1334819. #34108 captures downloadUrl at 1335078-1335079; #34111 prefixes ApiUrl and constructs options at 1335255-1335263. Filename is not an attachment ID. | #34111 getAccessToken/then 1335266-1335273 → #34112 overwrites cookie and passes those options to RNFS, 1335288-1335297. | 1 / 0; pass |
| 2 | `DownloadDiaryFile`: `K/files/diary/{filename}` | #37887 tests diary_documents at 1515736-1515738, loads closure kindergarten and file.filename and concatenates at 1515739-1515746; common ApiUrl/options at 1515747-1515757. | getAccessToken/then 1515761-1515770 → #37888, 1515785-1515794. | 2 / 0; pass |
| 3 | `DownloadDocumentFile`: `K/files/documents/{filename}` | #37887 documents comparison and branch at 1515708-1515711; closure kindergarten/file.filename and URL at 1515712-1515719; same common options. | #37888, 1515785-1515794. | 2 / 0; pass |
| 4 | `DownloadChildFile`: `K/children/{childId}/files/{filename}` | #37887 child_files OR child_documents branch at 1515720-1515725; closure kindergarten/child, file.filename, concat arguments and call at 1515726-1515735; same common options. | #37888, 1515785-1515794. | 3 / 0; pass |
| 5 | `DownloadFoodmenuFile`: `K/foodmenu/{foodmenuId}/download` | #37318 loads closure kindergarten and selected object's **id** at 1489781-1489782; concat through /download and fromUrl at 1489785-1489790. The filename read at 1489768 is only local destination construction. | getAccessToken/then 1489799-1489806 → #37319, 1489821-1489830. | 2 / 0; pass |
| 6 | `DownloadPlanPdf`: `K/plans/{planId}/pdf` | #41207 loads argument 1 at 1674204, closure kindergarten at 1674275 and builds /plans/ + that argument + /pdf at 1674278-1674284. .pdf at 1674234/1674268 is local-file handling, not an added URL extension. No query at this RNFS site. | getAccessToken/then 1674290-1674299 → #41208, 1674318-1674327. | 2 / 0; pass |
| 7 | `DownloadChildMapPdf`: `K/children/{childId}/maps/{mapId}/pdf` | #44191 uses argument.kindergarten_id, child from environment depth 2 slot 3, argument.id, and literal PDF/query suffix at 1803155-1803167. The child slot is not a child-object id property read. | getAccessToken/then 1803176-1803183 → #44192, 1803198-1803207. | 3 / 3; pass |
| 8 | `DownloadChildPlanPdf`: `K/children/{childId}/plans/{planId}/pdf` | #44291 uses environment kindergarten slot 2/child slot 3 and argument.id at 1807648-1807651, then literal /pdf?landscape=false at 1807654-1807660. Again child is a closure value, not a child-object id read. | getAccessToken/then 1807669-1807676 → #44292, 1807691-1807700. | 3 / 1; pass |
| 9 | `GetIdeaImage`: `K/files/idea/{filename}` | #38711 reads props.kindergartenId at 1554406 and passes **only the imageUrl prefix** plus images at 1554530-1554543. Linked ImagesModal #35178/#35186/#35187 → #35188 selects props.images[index] at 1404356-1404361. Only the falsy selectedMedia.url branch prefixes ApiUrl/imageUrl and appends selectedMedia.filename at 1404427-1404437; options at 1404440-1404447. #38716's id at 1554768-1554769 is a JSX key, not a filename. | getAccessToken/then 1404448-1404457 → #35189, 1404487-1404496. | 2 / 0; pass |
| 10 | `DownloadEmployeeMealsXls`: `K/reports/employee-meals/xls` | #40663 selector r23 supplies kindergarten at 1645562-1645564. Actual URL uses **/xls**, start_date=r22 and end_date=r21 at 1645663-1645672; .xlsx at 1645658 is local fileName. Linked FileDownload #40702 captures downloadUrl at 1648132-1648133; #40704 prefixes ApiUrl at 1648216-1648224. | getAccessToken/then 1648228-1648235 → #40705 appends language, overwrites cookie and calls RNFS at 1648247-1648260. | 1 / 2; pass |
| 11 | `DownloadTodaysMealsPdf`: `K/reports/todaysmeals/pdf` | #40805 selects todaysmeals only for type === allClasses at 1653794-1653798. Kindergarten selector r17 at 1653777-1653779; constructed query below; exact /reports/ + selected literal + **/pdf** URL at 1653888-1653897. Linked FileDownload #40702/#40704. | #40705, 1648247-1648260, saved cookie plus language. | 1 / 8; pass |
| 12 | `DownloadTodaysMealsXls`: `K/reports/todaysmeals/xls` | Same allClasses selection and query; XLS reuses prefix/registers but replaces suffix with **/xls** at 1653940-1653949. .xlsx at 1653937 goes to local fileName, not downloadUrl. | #40705, 1648247-1648260. | 1 / 8; pass |
| 13 | `DownloadTodaysMealsPerCoursePdf`: `K/reports/todaysmeals-per-course/pdf` | #40805's default selected literal is todaysmeals-per-course for **every non-allClasses value**, 1653794-1653798. The distinct perClass query guard is not the route-selection condition. Exact PDF URL at 1653888-1653897. | #40705, 1648247-1648260. | 1 / 9; pass |
| 14 | `DownloadTodaysMealsPerCourseXls`: `K/reports/todaysmeals-per-course/xls` | Same non-allClasses route selection and perClass-only query guard; exact XLS URL at 1653940-1653949. No diet query or guessed report-type enum. | #40705, 1648247-1648260. | 1 / 9; pass |
| 15 | `DownloadPlanFile`: `K/files/plans/{filename}` | #44303 reads closure kindergarten and argument.filename, concatenates the URL and sets downloadUrl at 1808290-1808299. argument.id at 1808303 is only a JSX key. Linked #34108 captures downloadUrl and #34111 builds full options. Not the plan ID of /plans/{planId}/pdf. | #34112, 1335288-1335297. | 2 / 0; pass |

### Shared-component links checked independently

- **Idea:** original module table 4079/#38708 dependency index 4 = 3683 (20520-20523); import slot 5 at 1554234-1554238; consumer reads slot 5 at 1554530. Module 3683/#35175 (18540-18543) exports ImagesModal #35178 at 1403473-1403475. #35178 stores props at 1403600-1403602 and creates #35186 at 1403699; generator linkage to #35188 at 1404319-1404333. This is actual prefix-to-filename-to-native transport proof, not a nearby renderer string.
- **Reports:** module 4200 dependency index 11 = 4207 (21125-21128), imported into slot 12 at 1645300-1645304 and consumed at 1645651. Module 4217 dependency index 5 = 4207 (21210-21213), imported into slot 6 at 1653580-1653584 and consumed at 1653875/1653929. Module 4207/#40701 (21160-21163) exports #40702 at 1648117-1648118. #40702 captures downloadUrl and creates handler #40704 at 1648163.
- **Plan attachments:** module 4528/#44301 dependency index 5 = 3519 (22765-22768), import slot 1 at 1808193-1808197, consumption at 1808283-1808284. Module 3519/#34105 (17720-17723) contains FileDownloadButton #34108, whose captured URL reaches #34111/#34112.

### Equivalent builders checked, not counted as new operations

The original functions confirm the same filename route/options/native mechanism: diary #35409/#35410 (URL 1413399-1413411; cookie/RNFS 1413438-1413447), #39736/#39737 (1601260-1601273; 1601299-1601308), #43644/#43645 (1780129-1780142; 1780168-1780177); documents #39561/#39562 (1594699-1594712; 1594738-1594747), #39615/#39616 (1596925-1596938; 1596964-1596973); child #39691/#39692 (1599587-1599602; 1599628-1599637). #44496 supplies the child filename URL, closure cookie and RNFS directly at 1817739-1817761. #41299/#41300 independently supplies the plan PDF URL/cookie/RNFS at 1677611-1677639 and 1677651-1677659. None creates a different method/path observation or establishes the separate #26954 helper's method.

## Every query observation and client-inclusion flag

Independent totals: **40 query observations, 15 distinct names, 36 unknown logical values, 4 literal string observations, 8 conditional observations and 32 present-in-builder observations**. There are no other constructed query fields in the reviewed representative sites.

| Operation(s) | Exact query names and value origin | Count and inclusion proof |
| --- | --- | --- |
| `DownloadChildMapPdf` | guardianFields = string `"false"`; landscape = string `"false"`; showApprovalsTable = string `"true"` | 3, all present. Original `LoadConstString` suffix at 1803164. |
| `DownloadChildPlanPdf` | landscape = string `"false"` | 1, present. Original `LoadConstString` suffix at 1807657. |
| `DownloadEmployeeMealsXls` | start_date=r22; end_date=r21 | 2, both present, 1645666-1645671. Days branch forwards selected-date state; other branch formats startOf/endOf month at 1645573-1645597. Logical type remains unknown; no server date format/domain inferred. |
| `DownloadTodaysMealsPdf` and `DownloadTodaysMealsXls` | date=props.selectedDate; breakfast=filterSettings.breakfast; lunch=filterSettings.lunch; supper=filterSettings.supper; dinner=filterSettings.dinner; calendar_days=filterSettings.calendarDays; absent=filterSettings.absent; diets=filterSettings.diets | 8 each: first six always present; absent conditional; diets always present **within this allClasses route**. |
| `DownloadTodaysMealsPerCoursePdf` and `DownloadTodaysMealsPerCourseXls` | Same first six and absent; child_name=filterSettings.childName; course_id=selector result r14 | 9 each: first six always present; absent conditional; child_name/course_id conditional on **type === perClass**. No diets field. |
| Other 8 additions | No query construction at their traced RNFS representative sites | 0 each; no arbitrary query passthrough or synthetic unknown query name. |

Meal-query register/control-flow details:

- date uses selectedDate loaded at 1653733 and concatenated after ?date= at 1653802-1653803.
- breakfast/lunch/supper/dinner values are loaded into r32/r30/r28/r26 at 1653804-1653807; corresponding literal keys occupy r33/r31/r29/r27 at 1653810-1653813, and the concat result is added at 1653814-1653815. No swap or inference from labels is involved.
- calendarDays is loaded into r18 at 1653816; literal &calendar_days= and concatenation at 1653819-1653821.
- absent's truthiness `JmpFalse` at 1653824 skips its append at 1653825-1653830. This supplies four client-optional observations, not server optionality or a boolean domain.
- diets' `JmpFalse` at 1653832 tests **r1, the allClasses comparison**, not diets. Within the todaysmeals route, diets is appended regardless of value truthiness at 1653833-1653838. It is not appended in the per-course route.
- `JStrictNotEqual` at 1653842 compares original type r15 with literal perClass. Only that branch appends child_name at 1653843-1653848 and course_id from r14 at 1653849-1653853. r14 is the selector result at 1653763-1653765. These are four more client-optional observations; non-allClasses does not imply perClass.
- PDF and XLS both append the same constructed query r11 to their respective URL at 1653896/1653948. There is no invented type parameter or generalized report-path placeholder.

All 40 observations match catalog query metadata, the **individual operation's** TypeSpec query declarations/extensions, and both OpenAPI documents: `required: false` retains unknown server requiredness, `x-client-presence` distinguishes conditional from present-in-builder, and `x-evidence` retains the exact original observation. The 36 logical-unknown fields are emitted as transport strings with `x-transport-type`, not inferred booleans, dates, IDs or enums. Four false/true token observations remain strings with `x-client-observed-value`; none becomes a boolean schema, boolean default or enum.

## Physical path canonicalization and per-verb evidence

Global OpenAPI path equivalence is handled without claiming that a download filename equals an update/delete identifier. Original records remain intact in catalog `records` and operation `x-evidence`; every emitted path parameter preserves its original-name/evidence object. Independent checks covered all catalog path parameters, plus the original metadata methods below.

| Physical path in TypeSpec and both OpenAPI formats | GET original observation | Other verbs' original observation and original source proof |
| --- | --- | --- |
| `K/files/diary/{pathValue2}` | filename from #37887 | PUT fileId: #25947, URL/call 1013160-1013166; DELETE fileId: #25949, 1013198-1013203. |
| `K/files/documents/{pathValue2}` | filename from #37887 | PUT documentId: #26274, 1021892-1021898; DELETE documentId: #26272, 1021855-1021860. |
| `K/children/{childId}/files/{pathValue3}` | filename from #37887 | PUT fileId: #25665, 1004004-1004012; DELETE fileId: #25663, 1003965-1003972. |
| `K/files/idea/{pathValue2}` | selectedMedia.filename from #35188, linked #38711 prefix | DELETE fileId: #26367, 1024778-1024783. No PUT invented. |

There is one physical path per equivalent template shape, not two conflicting OpenAPI paths distinguished only by placeholder spelling. Required path parameters are transport strings; their original per-verb observations remain separate. Message and plan-attachment routes retain filename where no conflicting slot name exists. The adjacent diary DELETE route `K/files/diary/{fileId}/files` is a different physical path and is not merged away.

## Reconciliation and alias retention

Read-only recomputation from research arrays, inventory and actual serialized catalog/OpenAPI content gives:

| Quantity | Independently observed |
| --- | ---: |
| auth-common research records | 41 |
| communications research records | 68 |
| children-diary-files research records | 95 |
| admin-shop research records | 79 |
| coverage-extra research records | 15 |
| Total raw research records | **298** |
| Baseline inventory candidate IDs | **283**, all distinct |
| Missing baseline source IDs | **0** |
| Baseline unique method/path operations | **281** |
| Additional unique method/path operations | **15** |
| Total unique normalized method/path operations | **296** |
| Serialized catalog / TypeSpec / OpenAPI operation counts | **296 / 296 / 296** |
| Distinct research representative source IDs | **291** |
| Representative source IDs beyond baseline inventory | **8** |

The actual eight additional representative IDs are **34111, 35188, 37318, 37887, 40704, 41207, 44191, 44291**. Multiple branches and shared transport handlers explain why 15 operations do not mean 15 new source functions. URL-producing consumers and continuation/native helpers are additional evidence IDs, not silently counted as research source headers or unique operations.

Exactly two alias groups account for 298 → 296:

1. GET `K/folders/{folderId}`: #26143 `getFolderData` (header 1018787; URL/GET/params 1018791-1018806) and #26270 `getDocumentsFolderData` (header 1021804; URL/GET/params 1021808-1021823). Both forward argument 3 as `{params: argument3}`. Catalog aliases retain `GetFolderData` and `GetDocumentsFolderData`; both complete records/source headers remain in TypeSpec and OpenAPI `x-evidence`. The unresolved query extension retains **both sources** and invents no named fields.
2. GET `K/target-groups/available`: #16369 `getUserTargetGroups` (header 649869; URL/GET 649873-649884) and #26155 with the same resolved name (header 1019024; URL/GET 1019028-1019039). Both call get(url) without constructed query. Both source records survive even though both operationId values are `GetUserTargetGroups` and the alias-name list therefore contains one name.

All 298 raw records were independently compared with their normalized catalog groups and serialized operation evidence; none is discarded. `scripts/coverage.json` candidate ID/line entries match the inventory, with 283 covered and zero missing/excluded baseline candidates. Those baseline counters do not claim that the separate unresolved coverage candidates have become verified requests.

## Known exclusions and unresolved candidates

These dispositions were checked against original disassembly in the fixed scope, not converted into invented paths or method claims:

| Candidate | Independently verified disposition |
| --- | --- |
| #39844 → #39846 banner | #39844 constructs ApiUrl + /api/common/files/banners/ + filename in r0 at 1605778-1605786, then **unconditionally overwrites r0 with undefined and returns it** at 1605787-1605788. #39846 places that return into source.uri at 1605875-1605887 and 1605936-1605948; cookie does not restore the URL. No concrete `/api/common/files/banners/{filename}` GET is published. This does not discard the separate baseline banners API. |
| #38716 idea thumbnail | Fallback filename URL versus remote thumbnails.small.url branch at 1554717-1554748; URI/cookie/priority supplied to imported renderer at 1554749-1554764. The bundled ImageBackground source at 1554669-1554677 is distinct. Renderer/native method remains unresolved; no GetIdeaThumbnail/idea_thumbs GET published. |
| #38793 idea thumbnail | Same remote/fallback distinction and renderer source/cookie at 1558483-1558519. No verified renderer method, no new GET. |
| #26954 downloadPlanPdf | Actual URL and `{params: argument3}` call to `.download` at 1042319-1042335. Module 2307 dependency index 3 = 525 (11660-11663), imported slot 2 at 1041888-1041892; module 525 = #5603 (2750-2753), whose ApiUrl-based Axios client/export is traced at 254092-254129. This decompilation proves call/import/URL/forwarded params, **not a download implementation or GET**. #26954 is not included as an operation source. RNFS plan-PDF query [] is explicitly scoped to its separate proven sites. |
| #33103 arbitrary media URL | media.url goes directly to fromUrl with cookie and RNFS at 1298443-1298453. Native GET mechanism is known, concrete Eliis route is not; no invented wildcard path. |
| #35188 remote branch | Truthy selectedMedia.url is forwarded at 1404439. It is distinct from the proven idea-prefix filename fallback; arbitrary props.imageUrl is not itself a new concrete path. |
| #33171 generic wrapper | Actual fromUrl/header forwarding and native call at 1300381-1300390/1300430-1300432 do not construct an endpoint. |
| #35227 SwipeListImageItem | Remote image.url versus imageUrl + image.item.filename at 1405697-1405708; cookie passed at 1405727-1405729. These renderer props alone do not establish an HTTP method. |
| #35247 VideoPlayer | Remote url or ApiUrl + imageUrl + filename and source/cookie at 1406952-1406968. Component naming does not establish GET or a concrete additional route. |
| #35400 VideoThumbnail | Remote thumbnail.url alternative, dynamic props.path and fallback filename URL, source/cookie at 1412938-1412972. No guessed path segment, file ID or method. |
| #35160 diary / #44474 child media prefixes | Actual imageUrl prefixes at 1402859-1402864 and 1817225-1817233 overlap already-proven filename download routes; renderer transport is not separately certified. |
| #37940 gallery prefix | Kindergarten/files prefix plus images at 1518924-1518936 is explicitly documented as an incomplete transport linkage. No new gallery/file-ID GET or broad discovery claim is justified by that prefix alone. |

The published exclusions accurately separate Eliis REST coverage from third-party SDK/configuration/network plumbing, reachability probes, external links and generic helpers. They do **not** assert no SDK traffic, no Firebase database/storage use or absence of hidden routes. This fixed-scope review did not re-audit every third-party/native source. `/broadcasting/auth` remains an existing baseline Eliis request, not a duplicate addition or an exclusion based solely on websocket association.

## Response honesty and final disposition

Every reviewed addition retains research response kind `unknown`; TypeSpec returns `UnresolvedResponse`; both normalized OpenAPI formats use only `default` with wildcard `*/*` and unconstrained schema `{}`, plus `x-unresolved-response` marking status/media/body unknown. This is an honest unresolved server response, **not a missing-model defect**, inferred JSON schema, universal status, content-type guarantee or proof of a complete server contract. RNFS completion metadata remains local metadata.

All 15 have the observed `EliisCookieAuth` scheme (`apiKey`, cookie, name `eliis_csrf`) and `x-auth-evidence.serverRequirement: unknown`, no GET requestBody, and no unsupported unresolved-query fields. Exact path/query/source evidence and aliases survive research → catalog → TypeSpec → both OpenAPI formats.

**Final disposition: 0 findings; no correction requested within the assigned fixed coverage scope.** Explicit renderer, remote-URL, gallery and `.download` uncertainties remain limitations, not silently resolved omissions. Snapshot and inspected-file hashes remain unchanged before/after this review.

# Final review run 1 — coverage and native downloads

**Result: 0 findings. Clean for the complete assigned coverage scope.** This is one scope review in run 1, not certification that two consecutive full review runs have completed.

## Inputs and boundaries

- Read `AGENTS.md`. Reviewed all 15 records in `evidence/research/coverage-extra.json`, all of `evidence/research/coverage-notes.md`, the 283-candidate coverage accounting, both baseline alias pairs, and global route canonicalization against the current catalog and emitted OpenAPI.
- Snapshot: `evidence/reviews/final-input-snapshot.json`, declared aggregate SHA-256 `330bee5019e84c13a6c714f0f6b6918f479a7f0a67a6d68c642bb1b2dc962bed`. All **36 listed file hashes matched** at the beginning and at the closing input check. No reviewed input was edited.
- Original source: `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, SHA-256 `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06`. References below are original disassembly line numbers, not the string index or extracted domain-source files.
- Actual APK Java sources: `eliis-analysis/decompiled/sources/com/rnfs/Downloader.java` (SHA-256 `2eb4e79b523e7a0411b38c272f456bd8d29784fcdff14a4a3d4a0885a17e70bf`) and `RNFSManager.java` (SHA-256 `89181c13740431ca796f364b1a5379deeaf592a6c79ffb726ce37d8b7463036b`). Inspected the complete downloader and the native download method.
- Emitted artifact read, not rebuilt: `tsp-output/@typespec/openapi3/openapi.json`, SHA-256 `a964913a95cb50a3970cb71e331d0ba58ec96309eb5afcb88bd3387a0d4957fb`.
- No generation, build, project QA suite, HTTP request, private-record access, Git operation, or changes outside this report. Parent owns QA and full-run coordination. Baseline field-by-field reviews belong to the other assigned reviewers; this review checked their coverage/source identities and known aliases, not all core field interpretations. No broad new discovery sweep was performed.

## Native method and cookie proof

The download calls are linked to RNFS, not inferred from a component name. Module **3486 = #33113** (17555–17558). Its `NativeModules.RNFSManager` is captured in slot 2 at 1298692–1298694; JS `downloadFile` wrapper #33171 forwards `fromUrl` and `headers` at 1300381–1300390 and calls that native module's `downloadFile` at 1300430–1300432.

Representative builders' RNFS dependency imports were independently checked: #34111's module 3519 imports dependency 5 into slot 6 (1334873–1334877); #35188's module 3683 does likewise (1403284–1403288); #37318's module 3938 (1489355–1489359); #37887's module 4011 (1514591–1514595); #44191's module 4524 (1802110–1802114); #44291's module 4527 (1807062–1807066). #41207's module 4260 imports dependency 6 into slot 7 (1673134–1673138). Report builder #40704's module 4207 imports dependency 3 into slot 3 (1648093–1648097). All those dependency entries resolve to 3486; the ensuing environment loads agree with the downloader calls.

`RNFSManager.java:779–792` transfers the URL and headers into `DownloadParams`; **842–844 constructs and executes `Downloader`**, not the connection itself. `Downloader.java:64–74` opens `HttpURLConnection`, copies supplied headers using `setRequestProperty`, and connects. The complete class has no request-method override, `setDoOutput`, or request output stream: the platform's default **GET** remains in effect. The separate redirect connection at 79–82 also has no method override; this does **not** establish cookie copying to that redirect connection.

Each continuation in the ledger below overwrites the initially empty cookie before calling RNFS with the same options object. Report #40705 appends `'; lang='` and the selected language (1648249–1648255). This is saved-cookie transport, not Bearer auth or a claim of server-required authentication. The underlying saved-cookie chain is consistent: #5617 parses/serializes `eliis_csrf` and forwards the serialized value to `saveAccessToken` (254479–254505); #6562 stores the value as the Keychain password under service `accessToken` (288797–288804), and #6563–#6566 retrieve that service and return its password (288819–288894). No stored credential was accessed.

Native `jobId`, `statusCode`, and `bytesWritten` are assembled locally in `RNFSManager.java:801–805`. They are **not** a JSON response model. No GET request body is constructed.

## Complete 15-record ledger

`K` abbreviates `/api/kindergartens/{kindergartenId}`. Paths below preserve the original research parameter meanings; emitted neutral slots are addressed separately. P/Q/C = number of path fields / named query fields / client-conditional query fields. Every row passed the original-source, catalog-preservation, and emitted-operation checks.

| Operation | Original route | Builder and argument/register proof | Cookie overwrite → RNFS call | P/Q/C |
| --- | --- | --- | --- | --- |
| DownloadMessageAttachment | `/api/common/files/messages/{filename}` | #34104 reads attachment.filename and supplies downloadUrl, 1334809–1334819; #34108 captures it, 1335078–1335079; #34111 prefixes ApiUrl into fromUrl, 1335255–1335263 | #34112, 1335288–1335297 | 1/0/0 |
| DownloadDiaryFile | `K/files/diary/{filename}` | #37887 diary_documents branch: closure kindergarten then file.filename, 1515736–1515757 | #37888, 1515785–1515794 | 2/0/0 |
| DownloadDocumentFile | `K/files/documents/{filename}` | #37887 documents branch: closure kindergarten then file.filename, 1515708–1515719; common ApiUrl/options 1515747–1515757 | #37888, 1515785–1515794 | 2/0/0 |
| DownloadChildFile | `K/children/{childId}/files/{filename}` | #37887 child_files/child_documents branch: kindergarten/child closure values then filename, 1515720–1515735; descending outgoing registers r21/r20/r19/r18/r17/r16 preserve that order | #37888, 1515785–1515794 | 3/0/0 |
| DownloadFoodmenuFile | `K/foodmenu/{foodmenuId}/download` | #37318 uses closure kindergarten and selected object.id, 1489777–1489795; outgoing r21/r20/r19/r18/r17; filename at 1489768 is only local toFile input | #37319, 1489821–1489830 | 2/0/0 |
| DownloadPlanPdf | `K/plans/{planId}/pdf` | #41207 argument1 is loaded into r15 at 1674204, moved to outgoing r21 at 1674281; kindergarten r23 and /plans/ r22 precede it, /pdf r20 follows; 1674271–1674289 | #41208, 1674318–1674327 | 2/0/0 |
| DownloadChildMapPdf | `K/children/{childId}/maps/{mapId}/pdf` | #44191 uses argument.kindergarten_id (r24), environment depth 2 slot 3 (r22), argument.id (r20), with intervening literals and suffix, 1803151–1803172 | #44192, 1803198–1803207 | 3/3/0 |
| DownloadChildPlanPdf | `K/children/{childId}/plans/{planId}/pdf` | #44291 uses environment depth 2 slots 2/3 for kindergarten/child (r24/r22), argument.id for plan (r20), 1807644–1807665; no child-object id read | #44292, 1807691–1807700 | 3/1/0 |
| GetIdeaImage | `K/files/idea/{filename}` | #38711 passes imageUrl prefix and images, 1554406–1554407, 1554530–1554543; actual shared #35188 selects images[index], then only on falsy selectedMedia.url constructs ApiUrl + prefix + selectedMedia.filename, 1404356–1404361, 1404427–1404447 | #35189, 1404487–1404496 | 2/0/0 |
| DownloadEmployeeMealsXls | `K/reports/employee-meals/xls` | #40663 outgoing r33/r32/r31/r30/r29/r28 = path prefix/kindergarten/report+start_date/start/end_date/end; 1645663–1645672; #40702 captures downloadUrl and #40704 constructs fromUrl, 1648132–1648133, 1648216–1648224 | #40705, 1648247–1648260 | 1/2/0 |
| DownloadTodaysMealsPdf | `K/reports/todaysmeals/pdf` | #40805 selects todaysmeals only for allClasses, 1653794–1653798; outgoing r33/r32/r31/r30/r29 = prefix/kindergarten/reports/type/pdf, then appends constructed query r11, 1653888–1653897; shared #40704 | #40705, 1648247–1648260 | 1/8/1 |
| DownloadTodaysMealsXls | `K/reports/todaysmeals/xls` | Same allClasses selection; outgoing registers preserve prefix/kindergarten/reports/type/xls; same query r11, 1653940–1653949; shared #40704 | #40705, 1648247–1648260 | 1/8/1 |
| DownloadTodaysMealsPerCoursePdf | `K/reports/todaysmeals-per-course/pdf` | #40805 non-allClasses selection, 1653794–1653798; PDF construction 1653888–1653897; perClass-only query guards are distinct from route selection; shared #40704 | #40705, 1648247–1648260 | 1/9/3 |
| DownloadTodaysMealsPerCourseXls | `K/reports/todaysmeals-per-course/xls` | Same non-allClasses selection; XLS construction 1653940–1653949; same shared query and #40704 | #40705, 1648247–1648260 | 1/9/3 |
| DownloadPlanFile | `K/files/plans/{filename}` | #44303 closure kindergarten and argument.filename, 1808290–1808299; argument.id at 1808303 is a JSX key; linked #34108 captures downloadUrl and #34111 prefixes ApiUrl | #34112, 1335288–1335297 | 2/0/0 |

Totals: **27 path-field observations, 40 query-field observations, 8 client-conditional query observations**. Eight records have no constructed query; seven have named queries. The six additional report/plan-file records are the employee-meals XLS, four today's-meals variants, and plan attachment; all are present as distinct emitted GET operations, with no fabricated `.xlsx` request route or file-ID suffix.

### Shared-consumer identity and filename semantics

- Idea linkage checked through module 4079 dependency 4 = 3683 (20520–20523), import slot 5 (1554234–1554238), module 3683 = #35175 (18540–18543), export #35178 (1403473–1403475), captured props (1403600–1403602), and #35186 → #35187 → #35188 (1403699, 1404319–1404333). The confirmed GET is the real downloader fallback. #38716's id at 1554768–1554769 is a JSX key, not the URL suffix.
- Report linkage checked through module 4200 dependency 11 = 4207 (21125–21128), slot 12 import (1645300–1645304), consumer read 1645651; meal-button module 4217 dependency 5 = 4207 (21210–21213), slot 6 import (1653580–1653584), consumer reads 1653875/1653929. Module 4207 = #40701 exports #40702, which captures downloadUrl and creates #40704 (1648117–1648163). This proves transport beyond JSX construction.
- Plan attachment linkage checked through module 4528 dependency 5 = 3519 (22765–22768), import slot 1 (1808193–1808197), consumer read 1808283–1808284, and module 3519 = #34105 (17720–17723), whose #34108 captures downloadUrl (1335078–1335079). Filename and JSX id remain separate.
- PDF extensions and `.xlsx` are local filenames; the actual report request suffix is `/pdf` or `/xls`. Plan PDF's local suffix does not add `.pdf` to its URL.

### All query names, inclusion branches, and literal values

- Map PDF: `guardianFields`, `landscape`, `showApprovalsTable` come from the single **LoadConstString** suffix at 1803164. Observed values are respectively **string** `"false"`, `"false"`, `"true"`. Child-plan PDF's `landscape` is **string** `"false"` from 1807657. All four are present at those builders; neither booleans nor a server enum/default/requiredness is inferred. Emitted schemas are string and `x-client-observed-value` preserves string values, without enum/default constraints.
- Employee XLS: `start_date` and `end_date` always concatenate r22/r21 in that order (1645666–1645671). The days branch forwards selected-date state; other branches call startOf/endOf month and format (1645573–1645597). Research correctly retains unknown logical types, not a universal server date format.
- All four meal reports: `date` from selectedDate; `breakfast`, `lunch`, `supper`, `dinner` from identically named filterSettings fields; `calendar_days` from calendarDays. Source reads and the actual concat registers agree at 1653733, 1653802–1653821. These six fields always occur.
- `absent` is included only on truthy filterSettings.absent (`JmpFalse`, 1653822–1653830): conditional on all four routes.
- Only allClasses chooses `todaysmeals` and adds `diets` (1653794–1653798, 1653832–1653838). It is always added within that route branch, with no diets-truthiness guard. No `child_name` or `course_id` is appended there.
- Non-allClasses chooses `todaysmeals-per-course`, without diets. Only the narrower `type === 'perClass'` branch adds `child_name` from filterSettings.childName and `course_id` from selector result r14 (`JStrictNotEqual`, 1653839–1653853; selector call 1653763–1653765). Both are conditional on the per-course routes. Non-allClasses is not assumed equivalent to perClass.
- The PDF and XLS builders reuse the constructed query r11. All unknown logical values are emitted as documented transport strings. All query parameters are OpenAPI-optional because server requiredness is unknown; client presence/guards are retained separately, and no arbitrary forwarded query or synthetic query name is added.

## Aliases, exclusions, and unresolved dispositions

Original equivalent downloader construction checks agree with the notes: diary #35409 (1413399–1413423), #39736 (1601259–1601284), #43644 (1780128–1780153); documents #39561 (1594698–1594723), #39615 (1596924–1596949); child #39691 (1599587–1599613), #44496 (1817739–1817761, direct closure cookie); plan PDF #41299/#41300 (1677611–1677659). These are equivalent method/path constructions, not new operations. Nearby id reads used for UI state do not replace filename reads in fromUrl.

| Known candidate | Verified disposition |
| --- | --- |
| #39844 → #39846 banner | Excluded confirmed GET: #39844 computes URL in r0, **unconditionally overwrites r0 with undefined**, then returns it (1605771–1605788). #39846 supplies that return to source.uri (1605875–1605887, 1605936–1605948); it cannot recover the discarded URL. No banner-file GET is emitted. |
| #38716 / #38793 idea thumbnails | Unresolved renderer transport: filename fallback/remote branch and cookie/source construction are real (1554717–1554764, 1558483–1558519), but the imported renderer's native method has not been proved. No idea_thumbs GET or speculative id route is emitted. This does not undermine the separate RNFS idea-image proof. |
| #26954 downloadPlanPdf | Explicitly unresolved method **and forwarded query shape**: imported default.download receives `/api/kindergartens/` + argument1 + `/plans/` + argument2 + `/pdf`, then `{params: argument3}` (1042319–1042335). Dependency 3 = module 525, slot 2 import, and #5603 Axios client export checked (11660–11663, 1041888–1041892, 2750–2753, 254092–254129). This does not prove `.download` implementation or GET. It is not smuggled into DownloadPlanPdf's empty query observation or assigned fabricated named fields. |
| #33103 | RNFS transport known, concrete route unresolved: media.url → fromUrl with supplied cookie and downloadFile, 1298443–1298453. No invented Eliis wildcard endpoint. |
| #35188 remote branch | RNFS transport known, concrete route unresolved: truthy selectedMedia.url is forwarded at 1404439. Separate from the proved filename fallback; no arbitrary imageUrl prefix is treated as a new concrete route. |
| #33171 | Generic native wrapper, not an endpoint by itself: forward URL/headers and invoke native RNFS, 1300381–1300390, 1300430–1300432. |
| #35227 SwipeListImageItem | Renderer transport unresolved: URL/fallback URI and cookie forwarding verified at 1405697–1405729; no confirmed method inferred. |
| #35247 VideoPlayer | Renderer transport unresolved: remote URL or ApiUrl + imageUrl + filename, source/header cookie, 1406952–1406968. No method or concrete additional route inferred from the name. |
| #35400 VideoThumbnail | Dynamic fallback and renderer transport unresolved: `props.path` remains dynamic; thumbnail URL/fallback/filename and cookie/source checked at 1412938–1412972. No guessed thumbnail path or file-id suffix. |
| #35160 diary media prefix | Prefix and images passed at 1402859–1402865. Proven filename download route is already represented; independent rendering method remains unresolved. |
| #44474 child media prefix | Kindergarten/child/files prefix and images passed at 1817225–1817233. Existing filename RNFS GET covers the proved route; independent rendering method remains unresolved. |
| #37940 gallery prefix | Prefix/images passing is real (1518924–1518936); notes expressly retain uncompleted prefix-to-native linkage as a gap, not a confirmed gallery/file-id GET. This review does not silently upgrade it or claim complete discovery. |

The notes' non-Eliis exclusions are scope boundaries for Google reachability, Sentry, Firebase/Google SDK/configuration, Pusher/websocket plumbing, generic library helpers, development URLs, static assets, store/external links. They do not renew an exhaustive third-party traffic-absence claim, and this fixed review does not claim such an audit. `/broadcasting/auth` remains a represented baseline operation, not an out-of-scope exclusion or duplicate addition.

## Counts and global canonicalization

- Research file counts: auth-common **41**, communications **68**, children-diary-files **95**, admin-shop **79**, coverage-extra **15** = **298 raw records**.
- Inventory and coverage both contain **283 distinct baseline candidate function IDs**, each represented in research, with **0 missing**, **0 excluded** in that baseline inventory. All 283 inventory headers and all 298 record source headers match the original disassembly ID/name/line. Baseline research has 283 records, not 283 unique operations.
- Both baseline alias pairs were reread in original bytecode: #26143/#26270 explicitly GET the same folders URL with `{params: argument3}` (1018787–1018811, 1021804–1021828); #26155/#16369 explicitly GET target-groups/available (1019024–1019043, 649869–649888). Each pair remains two source observations on one canonical operation.
- **296 unique canonical method/path operations** = 281 baseline operations + 15 additions, emitted on **253 path items**. There are **291 distinct representative source IDs** total (283 baseline + 8 additional builder IDs). Multiple branch records/shared consumers can have the same source header. Source-to-record coverage is not a unique-operation counter; the two baseline alias pairs are the only same-method/path merged record pairs in this snapshot.
- Independently compared normalized method/path sets across all research and emitted operations: exact equality, no missing or extra operation. Catalog records retain an exact multiset of all original research records; emitted per-operation `x-evidence` equals those preserved records.
- Global path shapes are canonicalized across verbs, not per method. Four source filename/ID conflicts use neutral slots: diary/documents/idea terminal `{pathValue2}`, child-file terminal `{pathValue3}`. Diary/documents/child-file share GET/PUT/DELETE path items; idea shares GET/DELETE. There is no equivalent-template duplication or same-method collision.
- Original per-verb `filename`, `fileId`, and `documentId` names/evidence remain unchanged in research, catalog records, and emitted `x-evidence`. Every emitted path parameter's `x-evidence` was checked against that verb's original positional parameter observations. Neutral transport names do not equate filename and metadata identifiers or rewrite original fields.
- All 15 additions have exact emitted query names/counts, path strings with the proper slot mapping, cookie auth evidence, no request body, and unknown responses. Across **all 296** emitted operations, response statuses/media/body remain explicitly unknown with only `default` and wildcard `*/*` containing unconstrained schema `{}`. This is a valid unresolved representation, not a fake HTTP 200, JSON-only response, error wrapper, MIME claim, or native-job-metadata model.

## Closing assessment

**0 actionable evidence, coverage, count, or canonicalization findings.** The documented unresolved candidates remain explicit limitations, not invented operations and not a claim of complete server coverage. Snapshot-listed inputs remained unchanged; only `evidence/reviews/final-1-coverage.md` was created by this reviewer.

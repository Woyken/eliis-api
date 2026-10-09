# Coverage-extra independent review — round 1

**Outcome: changes required; initial review, not a clean final gate.** Reviewed all 11 operation records in `evidence/research/coverage-extra.json` and all of `coverage-notes.md`. Eight download records have a defensible native GET mechanism. The three image records do not stand as written. Six additional concrete download method/paths are missing, and an overlooked `.download(...)` helper needs an explicit unresolved disposition. No HTTP request, login, authenticated access, or write request was made. Only this review file was edited.

## Snapshot identity

SHA-256 of the exact reviewed inputs (changes invalidate the corresponding conclusions):

| File | SHA-256 |
| --- | --- |
| `evidence/research/coverage-extra.json` | `32a63d34e94c3f612b7fa1a7e8b2a8d51703a0cd42d037ba3c5bc8a2feeb0b27` |
| `evidence/research/coverage-notes.md` | `cba766a0d7dca701c31321f116e448de98e9af1a43c6ead9168c5642f1dfe992` |
| `evidence/inventory.json` | `d2fef8ffee35d65070e7aaafe68ea22538b48157518dd057b68792c8c1a84196` |
| `evidence/research/auth-common.json` | `45b7e0d3d413ee7ad3f2beb87d709938ecc16166cc0c66857de1b83bcefe58f4` |
| `evidence/research/children-diary-files.json` | `ca658c125c2fbfa2ae32e51ab3bb8fcca2fbfa7b7552ff19e72e6960ccca4cd4` |
| `evidence/research/communications.json` | `b00081b0918c06d7ac9f88cd9628dc464402384bc2467e18fcae265073f0420f` |
| `evidence/research/admin-shop.json` | `2e8183aed9f07fc4a664fd08bfb57ec09ad210618bd76e5a4c88c3ba505080ab` |
| `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` | `fd3a41e2615571006c39a3875b2b957d67a2302207067b5309365652356c0e06` |
| `/data/data/com.termux/files/home/eliis-analysis/function-strings.json` | `a13e2daa679825887a8553cb3f7cd8c7041fafb1903d1b9b4f917601db459ff2` |
| `/data/data/com.termux/files/home/eliis-analysis/decompiled/sources/com/rnfs/RNFSManager.java` | `89181c13740431ca796f364b1a5379deeaf592a6c79ffb726ce37d8b7463036b` |
| `/data/data/com.termux/files/home/eliis-analysis/decompiled/sources/com/rnfs/Downloader.java` | `2eb4e79b523e7a0411b38c272f456bd8d29784fcdff14a4a3d4a0885a17e70bf` |

`AGENTS.md` was read and applied. References below to line numbers are to the full `eliis.hasm`, not the string index. The index was used only for locating candidate functions. Domain JSON files were compared for method/path/source coverage, not independently certified field-by-field.

**Concurrent-change warning:** the completion hash check detected newer, unreviewed revisions: coverage-extra `9f95049164e776b06b8051549d2ace87c286bf93b7b4209e1ab3ec87f1d7d273`, coverage-notes `da6c12d9505bda08f192e82d624fae5b86b4b62e75e20fa25677a2240389d443`, and children-diary-files `1abb04056bc072349b85158d48b3734f7ea8c3ed67d215b5efa4f90cffe45821`. Findings and counts below apply to the reviewed hashes in the table, **not** these later revisions. This report deliberately preserves the initial-review findings; it does not claim the explorer's final files still contain every discrepancy.

## Findings

### COV-1 — High: banner formatter discards the URL; this is not a proven banner GET

`GetBannerImage`, JSON lines 321–348, claims #39844 returns a constructed URL that #39846 loads. The actual register trace is decisive:

- #39844, lines 1605778–1605786: reads `ApiUrl`, reads the argument's `filename`, concatenates the banner prefix, and computes the full URL into r0.
- **1605787 overwrites r0 with `undefined`; 1605788 returns r0.** There is no alternate return branch.
- #39846, 1605875–1605887 and 1605936–1605948: places the formatter return value in `source.uri` and supplies a cookie header. This does not rescue the discarded URL.

Thus the prefix is a constructed-but-discarded candidate, not a traceable HTTP endpoint invocation. In addition, the rendered component is an imported default with `priority`/`resizeMode`, not evidence of an explicit HTTP GET instruction. Remove it from confirmed operation accounting or record it in the unresolved/excluded ledger with this exact reason. Do not infer a server route from the unused concatenation. Correct coverage-notes lines 5, 13, 28 accordingly.

### COV-2 — High: idea image uses a filename, wrong source function, and unrelated image-source evidence

`GetIdeaImage`, JSON lines 384–417, has `/files/idea/{fileId}` and attributes its construction to #38716. Its evidence range `1554628-1554543` runs backwards. Actual construction is in **#38711 `IdeaThumbnails`**, 1554535–1554543: it builds only `/api/kindergartens/` + `kindergartenId` + `/files/idea/`, and passes that prefix as `imageUrl` together with `images` to the shared modal. It neither prefixes `ApiUrl` there nor appends an identifier.

The module linkage is independently traceable: global lines 20520–20523 register #38708 as module 4079 with dependency index 4 = module 3683; #38708 lines 1554234–1554238 store that imported default into environment slot 5, which #38711 reads at 1554530. Global 18540–18543 identify module 3683 as #35175, the module containing `ImagesModal` #35178 and its downloader #35188.

The shared consumer reads **`filename`**, not `id`:

- Renderer #35227, 1405697–1405708: fallback URI is `imageUrl + image.item.filename` (remote URL alternative retained).
- Downloader #35188, 1404427–1404447: when the selected media has no `url`, builds `ApiUrl + props.imageUrl + selectedMedia.filename`, stores that in `fromUrl`, and sets `headers.cookie`.
- Continuation #35189, 1404487–1404496: replaces the cookie with the saved cookie and calls RNFS `downloadFile` with those options.

This provides a defensible **GET `/api/kindergartens/{kindergartenId}/files/idea/{filename}` download**, through the native mechanism described below, without guessing the image renderer's HTTP method. Repair the source/evidence/path-parameter semantics and distinguish the RNFS download proof from renderer use. DELETE #26367 uses a file identifier; a shared route shape is not proof that its identifier is the download filename. The `id` read at the end of #38716, 1554768–1554769, is a JSX key, not a URL suffix. The claimed ImageBackground URI/cookie construction at 1554667–1554677 is actually the background's bundled source; it does not establish the full idea-image request.

### COV-3 — High: six proven RNFS GET method/paths absent from all research files

The missing-endpoint ledger below gives exact construction and transport evidence. `coverage-notes.md` lines 32 and 41 cannot substitute a generic limitation for locally traceable URLs passed to shared download components. In particular, neither reports nor `/files/plans/{filename}` is an arbitrary server-returned URI.

### COV-4 — Medium: idea thumbnail renderer does not establish GET; component/source description is inaccurate

`GetIdeaThumbnail`, JSON lines 350–381, correctly traces the fallback path and cookie, but declares GET without a concrete HTTP-method implementation trace. #38716 builds `ApiUrl + /api/kindergartens/ + kindergartenId + /files/idea_thumbs/ + thumbnails.small.filename` at 1554724–1554738; the alternate branch uses `thumbnails.small.url`. URI/cookie/priority are placed in an imported default image component's source at 1554749–1554764. **The ImageBackground source at 1554671–1554677 is a different, bundled asset**, not this fallback URI.

A renderer `source` object proves source construction and intended use, not by itself an HTTP method. Supply a bytecode/native transport trace establishing the exact component's GET behavior, or keep this as unresolved renderer-only URL evidence outside confirmed method/path records. The same standard applies to forwarded remote URLs consumed by image/blob/video renderers; do not invent a concrete path or GET solely from their component names. A later native implementation trace could resolve this; this review does not assert the renderer cannot issue GET.

### COV-5 — Medium: literal query bytes do not independently prove logical boolean types

The map/child-plan suffixes prove exact query strings, not a server boolean domain or JavaScript boolean serialization:

- #44191, 1803164: `/pdf?guardianFields=false&landscape=false&showApprovalsTable=true`.
- #44291, 1807657: `/pdf?landscape=false`.

All four query entries are currently `type: "boolean"` with Boolean-valued `value`. There is no boolean construction for those query fields in these builders; each is part of a `LoadConstString`. Use transport string constants (`"false"`/`"true"`) or explicitly separate observed literal encoding from an unresolved logical type. Do not turn these observations into server validation/requiredness/default claims. The query names, exact byte values, fixed inclusion, and extraction out of `path` are otherwise correct.

### COV-6 — Medium: `.download` helper omitted from coverage rationale; its query shape is unresolved, not empty

#26954 `downloadPlanPdf`, 1042319–1042335, builds the already represented plan-PDF path but calls an imported default's **`download(url, {params: argument3})`**, not a searched Axios verb. This function is absent from the 283 candidate manifest and the overlap/exclusion notes.

The imported object can be followed: module 2307 dependencies include module 525 (global 11660–11663); #26935 dependency index 3 is stored into environment slot 2 at 1041888–1041892; module 525 is #5603 (global 2750–2753). #5603 creates and exports the main Axios-based client with `baseURL: ApiUrl` and request/response interceptors (254092–254129). These traces do **not** establish what a `.download` property does, nor an explicit HTTP method for this call. Do not infer GET from the helper's name or automatically convert its arbitrary third argument into named query fields. Record this helper as an unresolved method/query-shape case sharing the plan-PDF candidate path, until its actual implementation is established. The RNFS `DownloadPlanPdf` record's empty query describes its own call site only; it cannot certify that every plan-PDF client path has no query.

### COV-7 — Medium: candidate count is not unique-operation count; alias merges need explicit accounting

The current manifest contains 283 distinct source-function candidates. All are represented as sources in the four baseline domain arrays. Those arrays contain 283 records, but only **281 unique normalized method/path pairs**. With the 11 coverage records, the current arrays contain **294 records / 292 unique normalized method/path pairs**. These are snapshot counts, not accepted-operation totals; they include the invalid/unresolved image records above.

Duplicate pairs (normalization replaces every `{parameterName}` with `{}`):

| Method/path | Records to reconcile as aliases |
| --- | --- |
| GET `/api/kindergartens/{kindergartenId}/folders/{folderId}` | `GetFolderData` #26143 and `GetDocumentsFolderData` #26270, both in `children-diary-files.json` |
| GET `/api/kindergartens/{kindergartenId}/target-groups/available` | `GetUserTargetGroups` #26155 in `children-diary-files.json` and #16369 in `auth-common.json` (also duplicate operationId) |

Coverage-extra currently has no normalized same-method/path collision with the baseline or itself. PUT/DELETE diary/document/idea metadata shapes and GET download shapes are not duplicate **operations** because methods differ; placeholder-name differences must not manufacture different OpenAPI paths either. Keep source-function coverage separate from merged method/path accounting and retain both alias sources. This is a merge-accounting finding, not a request for cosmetic domain rewrites.

## Native download mechanism and evidence precision

`RNFSManager.java:779–792` reads `fromUrl` into a URL and passes URL/header values into `DownloadParams`; 842–844 constructs and executes `Downloader`. **RNFSManager does not itself open/connect the URL**, contrary to the repeated JSON wording. `Downloader.java:64–74` opens `HttpURLConnection`, copies headers, sets timeouts, and calls `connect()` without a method override or output body. That leaves the platform's default GET in effect. The full downloader source was checked for method overrides. This is real transport proof, not extrapolation from attachment metadata or `downloadFile` naming.

For the representative builder functions in the eight accepted-route records, the initial `cookie` value is empty and is overwritten by the saved access-cookie in the continuation before `downloadFile`. Evidence ranges generally stop before those continuations; cite them explicitly rather than saying the builder alone invokes RNFS. `auth: "cookie"` is supported as client header construction, not a claim of server authorization requirements. The native result's `jobId`, `statusCode`, and `bytesWritten` are local download metadata, not a response JSON schema. Every `response.kind: "unknown"` is legitimate. Every added request `body: null` is defensible for the proven native GET routes; no locally constructed server request body/fields were found here.

## All-record review ledger (11/11)

| Operation | URL/path arguments and query | Transport/auth evidence and disposition |
| --- | --- | --- |
| `DownloadMessageAttachment` | #34104, 1334809–1334819: attachment `filename`, exact `/api/common/files/messages/` prefix. No constructed query. | #34111 1335255–1335263 sets `ApiUrl + downloadUrl`; #34112 1335288–1335297 sets saved cookie and calls RNFS. **Accept route/method/auth**, tighten native wording. |
| `DownloadDiaryFile` | #37887 diary_documents branch 1515736–1515746: kindergarten then `/files/diary/` then file `filename`. No query. Overlap builders #35409, #39736, #43644 read filename, not id. | Common options 1515747–1515757; #37888 1515785–1515794 saved cookie/RNFS. **Accept route/method/auth**, cite continuation. |
| `DownloadDocumentFile` | #37887 documents branch 1515708–1515719: kindergarten then `/files/documents/` then file `filename`. No query. #39561/#39615 agree. | Same #37888 native/cookie continuation. **Accept route/method/auth**, cite continuation. |
| `DownloadChildFile` | #37887 child_files/child_documents branches 1515720–1515735: kindergarten, `/children/`, child, `/files/`, `filename` in that order. #39691 1599587–1599602 agrees; #44496 1817739–1817749 agrees. No query. | #37888 saved cookie/RNFS; #44496 independently calls RNFS at 1817758–1817761 with closure cookie. **Accept route/method/auth**, cite continuation. |
| `DownloadFoodmenuFile` | #37318 1489781–1489790: kindergarten, `/foodmenu/`, selected object's `id`, `/download`. Its `filename` is only used for local destination, not URL. No query. | #37319 1489821–1489830 saved cookie/RNFS. **Accept route/method/auth**, cite continuation. |
| `DownloadPlanPdf` | #41207 1674275–1674284: kindergarten, `/plans/`, argument1 plan id, `/pdf`. #41299 same route. `.pdf` extension elsewhere is local destination. No query at these RNFS sites; #26954 forwarded params unresolved separately. | #41208 1674318–1674327; #41300 1677651–1677659: saved cookie/RNFS. **Accept RNFS route/method/auth**, add helper-gap disposition. |
| `DownloadChildMapPdf` | #44191 1803155–1803167: argument object's `kindergarten_id`, closure child identifier, argument object's `id` map identifier, suffix. Exact three literal query values above. | #44192 1803198–1803207 saved cookie/RNFS. **Accept route/method/auth; correct query type evidence**. Child value is loaded from environment, not a child-object `id` in this function. |
| `DownloadChildPlanPdf` | #44291 1807648–1807660: closure kindergarten, closure child, argument object's `id` plan, suffix with `landscape=false`. | #44292 1807691–1807700 saved cookie/RNFS. **Accept route/method/auth; correct query type evidence**. Child value is an environment load here. |
| `GetBannerImage` | Prefix/filename concatenation exists, but #39844 returns undefined. No traceable full URL to transport. | Renderer source.cookie is not enough; **reject as confirmed operation; COV-1**. |
| `GetIdeaThumbnail` | Correct fallback URI/filename/conditional remote URL trace; no query constructed. | Imported image renderer source.cookie proved, explicit HTTP-method implementation not cited/proved. **Unresolved renderer method; COV-4**. |
| `GetIdeaImage` | Wrong #38716 source/range; actual #38711 passes prefix, shared consumers append filename, not file id. | Renderer evidence alone unresolved; #35188/#35189 plus native downloader provides a different defensible filename GET proof. **Repair record and mechanism; COV-2**. |

## Missing proven endpoint ledger

These six normalized method/paths are absent from the current five research arrays. GET proof is the shared RNFS/native mechanism, not a guess based on PDF/XLS labels. Responses remain unknown and no request body is constructed.

| Missing method/path | Exact source/call evidence | Proven query construction |
| --- | --- | --- |
| GET `/api/kindergartens/{kindergartenId}/reports/employee-meals/xls` | #40663, 1645663–1645672 concatenates kindergarten, literal report prefix, start and end values into `downloadUrl`. Its imported component is FileDownload module 4207 (global 21125–21128 dependency index 11; #40663 component load 1645651). #40702 1648132–1648133 captures `downloadUrl`; #40704 1648216–1648224 makes `ApiUrl + downloadUrl` options; #40705 1648247–1648260 sets cookie plus `; lang=` + selected language and invokes RNFS. | `start_date` and `end_date` are concatenated values. No logical type/format established by this construction. `.xlsx` is a local filename extension, not a request-path suffix. |
| GET `/api/kindergartens/{kindergartenId}/reports/todaysmeals/pdf` | #40805 `allClasses` branch selects `todaysmeals` at 1653794–1653798; 1653888–1653897 constructs `/reports/` + selected literal + `/pdf` + query. Shared FileDownload/RNFS chain above. Module linkage: global 21210–21213 dependency index 5 = 4207; #40802 1653580–1653584 stores imported default in slot 6, read by #40805 at 1653875 and 1653929. | Always `date`, `breakfast`, `lunch`, `supper`, `dinner`, `calendar_days`; `absent` only when truthy; this branch adds `diets`. Values forwarded from selectedDate/filterSettings; logical types unresolved. |
| GET `/api/kindergartens/{kindergartenId}/reports/todaysmeals/xls` | Same branch/helper; XLS construction 1653940–1653949 uses literal `/xls` (not `.xlsx`). | Same query construction as corresponding PDF. |
| GET `/api/kindergartens/{kindergartenId}/reports/todaysmeals-per-course/pdf` | Non-allClasses selects `todaysmeals-per-course`; same PDF concatenation/helper. `perClass` comparison at 1653839–1653853 proves additional query branch. | Same always-included six query names and conditional `absent`; `perClass` additionally appends `child_name`, `course_id`; no `diets` in this branch. Do not invent an unrestricted report-type enum or assume every non-allClasses invocation is perClass. |
| GET `/api/kindergartens/{kindergartenId}/reports/todaysmeals-per-course/xls` | Same non-allClasses branch; same `/xls` concatenation/helper. | Same query construction as corresponding PDF. |
| GET `/api/kindergartens/{kindergartenId}/files/plans/{filename}` | #44303 1808291–1808299 concatenates kindergarten and argument.filename after `/files/plans/`, supplies `downloadUrl` to shared FileDownloadButton. Module #44301 dependency index 5 = module 3519 (global 22765–22768); module 3519 is #34105 (global 17720–17723), containing #34108/#34111/#34112. #34111/#34112 prefix ApiUrl, set saved cookie, and invoke RNFS as in message downloads. | No query constructed. Filename, not plan id/file id. |

For #40805, the query ledger comes from complete register/branch reads at 1653802–1653853, not nearby filter labels. `date`, breakfast/lunch/supper/dinner, and `calendar_days` are unconditionally appended; `absent` is explicitly truthiness-conditional; `diets` is route-branch conditional; child_name/course_id are perClass-conditional. These facts describe inclusion/encoding at the client call site, not server requiredness.

## Missing / unresolved / excluded endpoint scope

- **Represented RNFS aliases:** diary #35409/#37887/#39736/#43644, documents #39561/#39615/#37887, child files #39691/#44496/#37887, plan PDF #41207/#41299. Their URL builds were inspected; equivalent method/path builders should not add operations. The native media downloader #35188 can also use prefixes passed by diary #35160 or child-file #44474, overlapping existing filename GET shapes.
- **Repairable, not a distinct extra route:** idea-file filename GET through #38711 → shared modal → #35188/#35189, as COV-2. The current fileId record misrepresents this known suffix.
- **Unresolved helper:** #26954 `downloadPlanPdf` with forwarded `params`; COV-6. Do not ignore it merely because its member is not an Axios verb.
- **Forwarded URLs with known download mechanism but unknown path:** #33103 reads media.url directly into RNFS `fromUrl` at 1298443–1298453. #35188's remote `url` branch 1404439 and native fallback prefix branch are distinct. A generic RNFS wrapper such as #33171 is not itself a concrete Eliis API path. No wildcard route is warranted.
- **Renderer-only URI candidates:** idea thumbnails #38716/#38793; generic video thumbnail #35400; diary/gallery/child image prefixes #35160/#37940/#44474; image source consumer #35227 and VideoPlayer #35247. VideoPlayer 1406952–1406968 selects remote `url` or `ApiUrl + imageUrl + filename`, supplies cookie/header/source, but these instructions alone do not prove a particular HTTP method. Remote/blob/image/video source transport remains unresolved unless an actual implementation trace supplies method proof. Prefixes must not be promoted to guessed routes with `{fileId}`.
- **Constructed-but-unused candidate:** banner #39844, COV-1. Exclude as confirmed invocation, not as an arbitrary remote URL.
- **Non-Eliis traffic/config:** notes' NetInfo Google reachability probe, Sentry, Firebase configuration/SDK URLs, websocket/library plumbing, development URLs, static assets/store links are reasonable scope exclusions. No new Eliis REST path was proved from these during this review. The broad APK/Firebase/native-source absence claims in notes were not exhaustively re-performed here and are not certified by this report.
- **Already-baseline path:** `/broadcasting/auth` belongs in baseline accounting and must not be added again simply because websocket traffic is excluded. The 283-source reconciliation confirms manifest presence, not all baseline semantics.
- **Scan limitation:** this independent review used the full disassembly for every cited candidate/transport and searched non-baseline `/api` builders, `fromUrl`, `downloadFile`, and helper/media consumers. It is not an exhaustive dynamic trace or proof that no other configured-base/server-path helper exists. The six proven omissions show that the current coverage rationale is insufficient; add a per-candidate disposition ledger rather than claiming completeness from a token search.

## Required follow-up before a final gate

Correct the three image records/dispositions and query typing; add the six traced native GET paths; document #26954 separately as unresolved instead of asserting empty universal query coverage; cite each download continuation; and reconcile source candidates versus unique method/path aliases. Re-review the new hashes after the explorer finalizes the files. Keep unknown responses and avoid invented request fields, server statuses, requiredness, defaults, or authorization rules.

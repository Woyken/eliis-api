# Coverage expansion audit (Eliis Android 2.69)

## Scope and review snapshot

This is a targeted static correction of `coverage-extra-round1.md`, not a clean final review or a server-complete contract. Before editing, current `coverage-extra.json` SHA-256 was `9f95049164e776b06b8051549d2ace87c286bf93b7b4209e1ab3ec87f1d7d273` and this file's was `da6c12d9505bda08f192e82d624fae5b86b4b62e75e20fa25677a2240389d443`. Those are the review's **later, unreviewed revisions**, not its initial reviewed hashes. In particular, the idea record's source had already changed to #38711; that correction was not blindly repeated. Its full-URL/fileId/renderer explanation still required repair. Each applied finding was checked against current research and original `eliis.hasm` instructions, not just the report or `function-strings.json` search index.

Only `coverage-extra.json` and these notes are owned by this correction. Other research/enrichment, code and reviews are separate work. No HTTP calls, login, private-record access, write requests, commit or push were performed.

## Transport proof common to confirmed additions

All records here are **RNFS/native downloads**, not inferred image-renderer GETs. `RNFSManager.java:779-792` reads `fromUrl` and `headers` into a URL and `DownloadParams`; **842-844 constructs and executes `Downloader`, rather than opening/connecting the URL itself**. `Downloader.java:64-74` opens `HttpURLConnection`, copies the headers, sets timeouts and connects without a request-method override or an output body. Inspection of the complete downloader found no `setRequestMethod`, `setDoOutput` or `getOutputStream` call, so the platform default GET applies. Its separate redirect connection at 79-82 also has no method override; the initial cookie-header proof does not imply headers are copied to this redirect connection.

The RNFS module #33113 reads `NativeModules.RNFSManager` and stores it in environment slot 2 (`eliis.hasm:1298692-1298694`). Its JS wrapper #33171 forwards `fromUrl` and `headers` into native options at 1300381-1300390 and reads slot 2/calls native `downloadFile` at 1300430-1300432. Download metadata (`jobId`, `statusCode`, `bytesWritten`, `RNFSManager.java:801-805`) is not a server response schema. Every response remains `unknown`; no GET request body is constructed. `auth: cookie` means the client supplies its saved access-cookie, not proof of server authorization requirements or a Bearer scheme.

Most builders initialize `headers.cookie` to `''`; their explicit `getAccessToken().then(...)` continuations overwrite it before invoking RNFS. Report FileDownload also appends `; lang=` plus the selected language. The JSON cites the continuation for each route. Source headers identify an actual representative options/transport builder (#34111, #35188, #40704, etc.), with exact bytecode name and header line; names are not invented from UI labels. Path strings describe transport only, not server identifier domains.

## Confirmed per-candidate disposition ledger

All line references below are original `eliis.hasm` lines. `K` in this table abbreviates `/api/kindergartens/{kindergartenId}` only; the JSON contains full paths.

| Candidate / disposition | Full URL suffix or construction proof | Cookie overwrite and RNFS invocation |
| --- | --- | --- |
| #34104 → #34111, `DownloadMessageAttachment` | `/api/common/files/messages/` + attachment.filename, 1334809-1334819; ApiUrl prefix/options 1335255-1335263 | #34112, 1335288-1335297 |
| #37887 diary_documents, `DownloadDiaryFile` | `K/files/diary/{filename}`, explicit branch 1515736-1515746; ApiUrl/options 1515747-1515757 | #37888, 1515785-1515794 |
| #37887 documents, `DownloadDocumentFile` | `K/files/documents/{filename}`, explicit branch 1515708-1515719; same common options | #37888, 1515785-1515794 |
| #37887 child_files/child_documents, `DownloadChildFile` | `K/children/{childId}/files/{filename}`, explicit branch 1515720-1515735; same common options | #37888, 1515785-1515794 |
| #37318, `DownloadFoodmenuFile` | `K/foodmenu/{foodmenuId}/download`, object.id, 1489781-1489790; filename at 1489768 is only local destination | #37319, 1489821-1489830 |
| #41207, `DownloadPlanPdf` | `K/plans/{planId}/pdf`, argument1, 1674275-1674284; no query at this RNFS site | #41208, 1674318-1674327 |
| #44191, `DownloadChildMapPdf` | `K/children/{childId}/maps/{mapId}/pdf`, argument.kindergarten_id, environment child value, argument.id, 1803155-1803167 | #44192, 1803198-1803207 |
| #44291, `DownloadChildPlanPdf` | `K/children/{childId}/plans/{planId}/pdf`, environment kindergarten/child values, argument.id, 1807648-1807660 | #44292, 1807691-1807700 |
| #38711 → #35188, repaired `GetIdeaImage` | #38711 reads kindergartenId (1554406), passes only `K/files/idea/` prefix and images (1554530-1554543); #35188 uses selectedMedia.filename only if selectedMedia.url is falsy, ApiUrl/prefix/filename/options 1404427-1404447 | #35189, 1404487-1404496; this is download proof, not renderer proof |
| #40663 → #40704, added `DownloadEmployeeMealsXls` | `K/reports/employee-meals/xls`, start_date/end_date, 1645663-1645672; `.xlsx` is local fileName only | #40705, 1648247-1648260 |
| #40805 → #40704, added `DownloadTodaysMealsPdf` | `K/reports/todaysmeals/pdf`; allClasses selection 1653794-1653798, URL 1653888-1653897 | #40705, 1648247-1648260 |
| #40805 → #40704, added `DownloadTodaysMealsXls` | Same allClasses selection; `K/reports/todaysmeals/xls`, URL 1653940-1653949 | #40705, 1648247-1648260 |
| #40805 → #40704, added `DownloadTodaysMealsPerCoursePdf` | Non-allClasses selection; `K/reports/todaysmeals-per-course/pdf`, URL 1653888-1653897 | #40705, 1648247-1648260 |
| #40805 → #40704, added `DownloadTodaysMealsPerCourseXls` | Non-allClasses selection; `K/reports/todaysmeals-per-course/xls`, URL 1653940-1653949 | #40705, 1648247-1648260 |
| #44303 → #34111, added `DownloadPlanFile` | `K/files/plans/{filename}`, argument.filename, 1808290-1808299; argument.id at 1808303 is a JSX key | #34112, 1335288-1335297 |

### Shared-consumer linkage, not proximity to strings

- **Idea:** module 4079 = #38708, dependency index 4 = 3683 (20520-20523); #38708 imports it into slot 5 (1554234-1554238), read by #38711 at 1554530. Module 3683 = #35175 (18540-18543), exporting ImagesModal #35178 (1403473-1403475). #35178 stores props at 1403600-1403602 and creates the download wrapper #35186 at 1403699; #35186 → #35187 → generator #35188 is explicit at 1404319-1404333. #35188 reads props.images[selectedIndex] at 1404356-1404361. Its fallback uses filename, not #38716's JSX id (1554768-1554769). The bundled ImageBackground source at 1554671-1554677 is unrelated to this download.
- **Reports:** module 4200's dependency index 11 = 4207 (21125-21128), imported into slot 12 at 1645300-1645304 and read by #40663 at 1645651. Meal buttons module 4217 dependency index 5 = 4207 (21210-21213), imported into slot 6 at 1653580-1653584 and read by #40805 at 1653875/1653929. Module 4207 = #40701 (21160-21163), exporting FileDownload #40702 (1648117-1648118). #40702 captures downloadUrl at 1648132-1648133 and creates #40704 at 1648163; #40704 builds ApiUrl + downloadUrl at 1648216-1648224, retrieves saved cookie at 1648228-1648235, and #40705 appends language/calls RNFS at 1648247-1648260.
- **Plan attachments:** module 4528 = #44301, dependency index 5 = 3519 (22765-22768); imported into slot 1 at 1808193-1808197, read by #44303 at 1808283-1808284. Module 3519 = #34105 (17720-17723), containing FileDownloadButton #34108, which captures downloadUrl at 1335078-1335079. #34111/#34112 then supply the full URL/cookie/native call as above.

### Exact query inclusion and value semantics

- #44191's `LoadConstString` at 1803164 includes `guardianFields=false&landscape=false&showApprovalsTable=true`. #44291's at 1807657 includes `landscape=false`. These four observations are **type string, scalar values `"false"`/`"true"`**, always present at those builders. No JavaScript boolean construction, server boolean domain, default or server requiredness is inferred.
- #40663 always concatenates `start_date` and `end_date` (1645666-1645671). They remain `unknown`: the days branch forwards selected-date state, while other branches use startOf/endOf month and format calls (1645573-1645597). Observed formatting is not a universal server date contract.
- #40805 always appends `date` (selectedDate), `breakfast`, `lunch`, `supper`, `dinner`, `calendar_days` (filterSettings.calendarDays), at 1653802-1653821. These names are from the actual concatenation registers, not nearby filter labels; their logical types remain `unknown`.
- `absent` is appended **only when filterSettings.absent is truthy** (JmpFalse, 1653822-1653830), hence client-optional on all four meal downloads.
- The allClasses branch selects `todaysmeals` and always adds `diets` within that route branch (1653832-1653838). Other branches select `todaysmeals-per-course` and do not append diets. Only `type === 'perClass'` additionally appends `child_name` from filterSettings.childName and `course_id` from selector result r14 (1653839-1653853); both are client-optional on the per-course routes. Not every non-allClasses invocation is assumed perClass, and no unrestricted report-type enum is created.
- PDF and XLS reuse the constructed query, while `.pdf`/`.xlsx` local filenames are separate. Empty query arrays elsewhere describe only those inspected RNFS sites, not every possible caller of the same server path.

## Equivalent builders / aliases (no extra operations)

| Represented route | Other URL builder evidence | Disposition |
| --- | --- | --- |
| Diary filename GET | #35409 1413399-1413411; #39736 1601261-1601272; #43644 1780130-1780141 | Same filename/fromUrl/options shape, not additional method/path records |
| Document filename GET | #39561 1594700-1594711; #39615 1596926-1596937 | Same filename/fromUrl/options shape |
| Child filename GET | #39691 1599587-1599601; #44496 1817739-1817761 | Same shape; #44496 supplies closure cookie and directly invokes RNFS |
| Plan PDF GET | #41299 1677611-1677629, #41300 1677651-1677659 | Same RNFS URL/cookie/GET; not the unresolved .download helper below |
| Diary/child media prefix | #35160 1402859-1402862; #44474 1817225-1817231 | Filename download fallback can overlap the existing diary/child GET; renderer use alone is still unresolved |

PUT/DELETE metadata operations are not duplicate GET operations. Placeholder spelling does not establish different routes or equal server identifier semantics.

The existing generator already groups same method/path aliases and retains their records (`scripts/generate.mjs:96-135`). No domain-file or generator changes are needed here for the two reviewed baseline alias pairs:

- GET `K/folders/{folderId}`: #26143 (`eliis.hasm:1018791-1018806`) and #26270 (1021808-1021823), each explicitly calling get(url, {params: argument3}).
- GET `K/target-groups/available`: #26155 (1019028-1019039) and #16369 (649873-649884), each explicitly calling get(url).

**Count candidate functions, raw research records and unique normalized method/path operations separately.** A source header can serve several branch-specific records or shared builders, and two source candidates can be aliases. Rather than treating the review's concurrent snapshot counts as permanent, recompute against current files with this read-only command:

```sh
python - <<'PY'
import collections, glob, json, re
inventory = json.load(open('evidence/inventory.json'))
files = {p: json.load(open(p)) for p in glob.glob('evidence/research/*.json')}
records = [r for rows in files.values() for r in rows]
candidates = {c['functionId'] for c in inventory['candidateFunctions']}
represented = {r['source']['functionId'] for r in records}
pairs = collections.defaultdict(list)
for r in records:
    pairs[(r['method'], re.sub(r'\{[^}]+\}', '{}', r['path']))].append(r)
print('candidate functions:', len(candidates), 'missing:', sorted(candidates - represented))
print('records by file:', {p: len(rows) for p, rows in sorted(files.items())})
print('raw records:', len(records), 'unique normalized operations:', len(pairs))
print('aliases:', [[(r['operationId'], r['source']['functionId']) for r in rows]
                   for rows in pairs.values() if len(rows) > 1])
PY
```

This reconciliation is coverage accounting, not field-by-field certification of baseline records or proof of an exhaustive candidate manifest.

## Excluded and unresolved per-candidate ledger

| Candidate | Disposition and exact reason |
| --- | --- |
| #39844 formatImageUrl → #39846 banner | **Excluded confirmed invocation; removed GetBannerImage.** #39844 constructs ApiUrl + `/api/common/files/banners/` + filename in r0 (1605778-1605786), then **unconditionally overwrites r0 with undefined at 1605787 and returns r0 at 1605788**. No alternate return exists. #39846 puts that return into source.uri with cookie (1605875-1605887, 1605936-1605948); it cannot restore the discarded URL. This is not a confirmed banner route request. |
| #38716 idea thumbnail | **Unresolved renderer transport; removed GetIdeaThumbnail from confirmed GETs.** Fallback is ApiUrl + kindergarten + `/files/idea_thumbs/` + thumbnails.small.filename (1554724-1554738), alternate is thumbnails.small.url. URI/cookie/priority go to an imported default component (1554749-1554764), not the distinct bundled ImageBackground source (1554671-1554677). Exact native component method implementation has not been verified. |
| #38793 idea thumbnail | Same renderer-only candidate: fallback/remote branch 1558483-1558515, cookie/source 1558516-1558519. No native method proof; no extra operation. |
| #26954 downloadPlanPdf | **Unresolved method and forwarded query shape.** 1042319-1042335 calls imported default.download(`/api/kindergartens/` + argument1 + `/plans/` + argument2 + `/pdf`, {params: argument3}). Module 2307 dependency index 3 = 525 (11660-11663), imported by #26935 into slot 2 (1041888-1041892); module 525 = #5603 (2750-2753), which exports the ApiUrl-based Axios client (254092-254129). This does not prove a .download implementation or its method. Do not guess GET or invent named query fields; the RNFS plan-PDF record's query [] applies only to its own sites. |
| #33103 | **Known RNFS transport, unresolved concrete route.** Reads media.url directly into fromUrl and invokes RNFS with cookie (1298443-1298453). No constructed Eliis method/path record or wildcard is warranted. |
| #35188 remote branch | **Known RNFS transport, unresolved concrete route.** Truthy selectedMedia.url is forwarded at 1404439; separate from the proved idea filename fallback at 1404427-1404437. An arbitrary props.imageUrl fallback prefix is not itself a concrete additional route. |
| #33171 generic RNFS wrapper | **Not an endpoint candidate by itself.** Forwards fromUrl/headers to native (1300381-1300390, 1300430-1300432); no concrete Eliis URL constructed. |
| #35227 SwipeListImageItem | **Unresolved renderer transport.** Selects remote item.url or imageUrl + item.filename (1405697-1405708), and passes cookie (1405727-1405728); renderer use does not prove HTTP method. |
| #35247 VideoPlayer | **Unresolved renderer transport.** Selects remote url or ApiUrl + imageUrl + filename and sets source/header cookie (1406952-1406968). No particular method or complete route inferred from the component name. |
| #35400 VideoThumbnail | **Dynamic fallback plus unresolved renderer transport.** Remote thumbnail.url alternative and fallback ApiUrl + `/api/kindergartens/` + kindergarten + `/files/` + props.path + `/` + filename, source/cookie (1412938-1412972). props.path remains dynamic; no guessed thumbnail route/fileId. |
| #35160 diary image prefix | `/api/kindergartens/` + kindergarten + `/files/diary/` is passed as imageUrl (1402859-1402862). Only the traced RNFS filename download mechanism is represented; image/video rendering transport remains unresolved. |
| #44474 child-file image prefix | Kindergarten/child/files imageUrl prefix (1817225-1817231). Existing filename RNFS GET covers the proven download; independent renderer transport remains unresolved. |
| #37940 gallery prefix | Kindergarten + `/files/` prefix passed as imageUrl with images (1518924-1518936). This correction has not completed a separate prefix-to-native transport linkage for gallery; it remains an explicit follow-up gap, not a fabricated file-id or gallery GET. |

### Non-Eliis / configuration scope exclusions

The earlier audit recorded NetInfo's Google generate_204 reachability probe, Sentry ingestion, Firebase/Google SDK/configuration URLs, Pusher/websocket plumbing, library fetch helpers, development/localhost URLs, bundled static assets, store links and unrelated external links as out of this Eliis REST scope. These exclusions do **not** certify absence of SDK traffic, Firebase database/storage use, hidden routes or server-side storage behavior. This correction did not exhaustively re-audit those third-party/native sources, so the former broad absence claims are not renewed. A config URL/token string alone is not request evidence.

`/broadcasting/auth` is an Eliis baseline request already represented in the research, not discarded merely because websocket traffic is out of scope; it must not be added again.

## Remaining limits

Static candidate scans and this per-candidate ledger are not an exhaustive dynamic network trace. Forwarded remote/blob/image/video URLs, configured-base plus unresolved server fragments, generic helpers and the gallery linkage above remain gaps. Renderer component names do not establish GET. Unknown forwarded params stay unresolved rather than being silently declared empty. No server requiredness, enums, defaults, nullability, status codes, universal response wrappers or response completeness are inferred. Further independent clean sweeps belong after all corrections, not to this initial fix.

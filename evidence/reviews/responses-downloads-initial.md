# Static download-response review — initial

**Outcome: changes required.** Reviewed all 15 records in `evidence/responses/coverage-extra.json` against `evidence/research/coverage-extra.json`, the full `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`, and the original decompiled `com.rnfs.RNFSManager` and `com.rnfs.Downloader` classes. This is a candidate validation, not a post-integration review round.

## Finding — JavaScript RNFS call-site trace function IDs/offsets are inaccurate

All 15 `sourceFunctionId` values match the corresponding operation in `evidence/research/coverage-extra.json`. However, 14 response trace entries attribute a continuation's bytecode line to its parent/source function ID; the actual `downloadFile` call is in the continuation function. `GetIdeaImage` cites the right function for the fallback-branch line but describes that line as the RNFS call; the actual call is in the continuation. Correct the trace function IDs and cite the actual call offsets, keeping the research-matching `sourceFunctionId` values unchanged.

| Operation | Research / response `sourceFunctionId` (matches) | Response trace attribution | Correct JS call-site evidence |
| --- | ---: | --- | --- |
| `DownloadMessageAttachment` | 34111 | #34111 at 1335288 | #34112, `eliis.hasm:1335282-1335297`; RNFS `Call2` at 1335297 |
| `DownloadDiaryFile` | 37887 | #37887 at 1515785 | #37888, `eliis.hasm:1515779-1515794`; RNFS `Call2` at 1515794 |
| `DownloadDocumentFile` | 37887 | #37887 at 1515785 | #37888, `eliis.hasm:1515779-1515794`; RNFS `Call2` at 1515794 |
| `DownloadChildFile` | 37887 | #37887 at 1515785 | #37888, `eliis.hasm:1515779-1515794`; RNFS `Call2` at 1515794 |
| `DownloadFoodmenuFile` | 37318 | #37318 at 1489821 | #37319, `eliis.hasm:1489815-1489830`; RNFS `Call2` at 1489830 |
| `DownloadPlanPdf` | 41207 | #41207 at 1674318 | #41208, `eliis.hasm:1674312-1674327`; RNFS `Call2` at 1674327 |
| `DownloadChildMapPdf` | 44191 | #44191 at 1803198 | #44192, `eliis.hasm:1803192-1803207`; RNFS `Call2` at 1803207 |
| `DownloadChildPlanPdf` | 44291 | #44291 at 1807691 | #44292, `eliis.hasm:1807685-1807700`; RNFS `Call2` at 1807700 |
| `GetIdeaImage` | 35188 | #35188 at 1404427 is described as both fallback construction and the RNFS call | #35188 lines 1404427-1404447 establish the conditional fallback URL/options; #35189 lines 1404481-1404496 overwrite the cookie and invoke RNFS at 1404496 |
| `DownloadEmployeeMealsXls` | 40704 | #40704 at 1648247 | #40705, `eliis.hasm:1648241-1648260`; RNFS `Call2` at 1648260 |
| `DownloadTodaysMealsPdf` | 40704 | #40704 at 1648247 | #40705, `eliis.hasm:1648241-1648260`; RNFS `Call2` at 1648260 |
| `DownloadTodaysMealsXls` | 40704 | #40704 at 1648247 | #40705, `eliis.hasm:1648241-1648260`; RNFS `Call2` at 1648260 |
| `DownloadTodaysMealsPerCoursePdf` | 40704 | #40704 at 1648247 | #40705, `eliis.hasm:1648241-1648260`; RNFS `Call2` at 1648260 |
| `DownloadTodaysMealsPerCourseXls` | 40704 | #40704 at 1648247 | #40705, `eliis.hasm:1648241-1648260`; RNFS `Call2` at 1648260 |
| `DownloadPlanFile` | 34111 | #44303 URL-builder entry is correctly attributed; #34111 at 1335288 is not | #44303 builds `downloadUrl` at 1808290-1808299; shared #34111 creates download options at 1335255-1335263; #34112 invokes RNFS at 1335297 |

For `DownloadPlanPdf`, the research also documents the equivalent #41299 route/call; that continuation is #41300 at 1677651-1677659. The response evidence mentions this alias, but it does not alter the primary source/call-site mismatch above.

## Verified disposition and native boundary

- Coverage and identity: all 15 response `operationId`/`sourceFunctionId` pairs correspond to research records.
- Body disposition: all 15 use `kind: "binary"`, `fields: []`, `complete: false`, and nonempty `limitations`. This is an honest opaque downloaded transport body; no JSON/body members are asserted.
- Native path: `RNFSManager.java:779-792` maps `fromUrl`, destination and headers into `DownloadParams`; `:842-844` executes `Downloader`. `Downloader.java:64-74` opens/connects `HttpURLConnection`; `:131-135` opens the input stream and file destination, and `:141-203` reads/writes byte buffers. These descriptions support an opaque byte stream, not a structured HTTP DTO.
- Metadata separation: `RNFSManager.java:801-805` resolves the RNFS promise with `jobId`, `statusCode`, and `bytesWritten`. These are native download completion metadata, not HTTP-body fields; the response records correctly omit them. Runtime HTTP status, actual MIME type and response headers remain unknown. Route labels and local `.pdf`/`.xlsx` filenames are not MIME evidence.

No other response-disposition errors found. Review was static only; no HTTP/private-record access, build, or Git operation was performed.

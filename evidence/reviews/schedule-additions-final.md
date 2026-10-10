# Final bounded review: integrated schedule additions

**Verdict: 0 remaining findings.** All **12 query entries + 33 body entries** in the six requested operations were checked against the corrected candidates and original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. The seven previous findings are corrected. The one low-severity citation finding below has now been fixed with explicit authorization; no request behavior or field types changed.

Read `AGENTS.md`. Scope is exactly these additions, not a review of the other 296 routes. Initial review wrote only this report; the authorized follow-up changed only the reported citation string in `evidence/research/admin-shop.json` and amended this report. No HTTP, Git writes, regeneration, or compilation was performed; compilation remains with the parent.

## Finding

1. **Low — update end-time helper-call offset is one byte off.** `evidence/research/admin-shop.json:141`, `WorkScheduleFormUpdate.evidence`, says `helper calls 0x11e/0x174`. Original #26530 at **global line 1030192** has `0x173: Call4(reg2, reg5, reg7, reg6, reg3, reg2)` for the end-time conversion. The start-time helper call is correctly `0x11e` (1030175). Change only `0x174` to **`0x173`**. No instruction starts at `0x174`; it is inside that Call4. The end-time output write remains correctly cited as `0x180` (1030194). Corrected candidate JSON/Markdown do not repeat the erroneous helper-call offset.

## Exact bounded checks

**Resolution:** Applied the exact `helper calls 0x11e/0x174` → `helper calls 0x11e/0x173` replacement in `UpdateWorkSchedule` → `WorkScheduleFormUpdate.evidence`. Verified the original instruction at global line 1030192 and that the JSON change is confined to that single string, with no other file-content differences from the pre-fix snapshot. Finding history above is retained; **0 remaining findings**.

| Operation / final service source | Entries | Original constructor → action → Axios evidence |
|---|---:|---|
| GetEvents #25403 | 2 query | #42300/#42323 writes `dateFrom`/`dateTo` at 1715586/1715596 and 1716934/1716944 (`0x75/0xa4`), calls `0xa9`; #25373 captures explicit argument 1 at 994660 (`0x02`), #25374 forwards it at 994695 (`0x59`); #25403 shallow copy 995371 (`0x5c`), params `0x62`, GET `0x66`. |
| GetWorkSchedule #26549 | 4 query | #39154 writes `courses`, `roles`, `start_date`, `end_date` at 1576142/1576145/1576155/1576163 (`0x4a/0x59/0x89/0xb1`); #26517/#26518 captured query service call 1029813 (`0x39`); #26549 params 1030668 (`0x34`), GET `0x38`. |
| GetNotifications #26071 | 2 query | #39404/#39407/#39409 captured `page` writes 1587900/1587978/1588034; literal `perPage=15` writes 1587902/1587980/1588036; #26061/#26062/#26063/#26064 forwards query at 1016131 (`0x23`); #26071 params 1016323 (`0x16`), GET `0x1e`. |
| GetPolls #26455 | 4 query | #38968 buffer 1566406 (`0x31`) seeds page 1, term empty, view null, perPage 5; captured view overwrites at 1566408 (`0x3f`). #38970 writes page/term/view/perPage at 1566470/1566472/1566474/1566476 (`0x54/0x5d/0x66/0x6e`), page via generic Add. #26440/#26441 service call 1027165 (`0x3f`); #26455 params 1027544 (`0x34`), GET `0x38`. |
| InsertWorkSchedule #26547 | 14 body | #39305 sends base register 5 at 1582987 (`0x1e0`); #26525/#26526 shallow copy 1029996 (`0x31`), service call 1030038 (`0x103`); #26547 loads argument 2 at 1030629 (`0x30`), POST 1030630 (`0x33`). |
| UpdateWorkSchedule #26551 | 19 possible body keys | #39305 difference register 4 at 1583003 (`0x22b`), branch mutations, final id/employee_id writes, passes register 4 at 1583085 (`0x3d1`); #26529/#26530 copy 1030125 (`0x37`), service call 1030200 (`0x19d`); #26551 reads body.id 1030699 (`0x15`), URL `0x32`, PUT same body register 3 at 1030707 (`0x39`). |

The installed service bindings were checked in original factories #25398/#25399/class #25400, #26544/#26545/class #26546, #26066/#26067/class #26068, and #26448/#26449/class #26450. These bind the six actual service source IDs above, not similarly named UI/action functions. Module 4116 dependencies (20705–20708) resolve index 20 to 2289 and index 24 to 2228; module 2289 dependencies (11570–11573) resolve index 3 to 2228. #25411 exports **#25412** as convertTimesToUtc (995548–995549) and **#25432** as difference (995596–995597).

## Every body entry

All base writes below are in original #39305. Insert has all fourteen own keys before serialization; update has seventeen conditionally present entries plus always-post-filter `id` and `employee_id`.

| Entry | Base / additional original proof | Integrated conclusion |
|---|---|---|
| employee_id | 1582887–1582898; selected overwrite 1582971; final 1583074–1583075 | Unknown; insert own, update always assigned after filtering. |
| type_id | 1582899–1582900 | Unknown; insert own, update conditional. |
| start_date | 1582904–1582909; restorations 1583030/1583046; action writes 1030028/1030177 | SDK string; update conditional. |
| start_time | 1582912–1582917; null 1582976; restoration 1583062; action writes 1030030/1030179 | Unknown conservatively covers string/null; update conditional. |
| end_time | 1582920–1582924; null 1582977; restoration 1583064; action writes 1030032/1030194 | Unknown conservatively covers string/null; update conditional. |
| full_day | 1582925–1582926 | Unknown, not boolean inferred from truthiness; update conditional. |
| is_recurring | 1582927–1582928; single branch zero 1583034 | Unknown; update conditional, no enum. |
| repeat_end | 1582931–1582937; restoration 1583025 | Unknown; conservative string/null evidence, update conditional. |
| rrule | 1582938–1582939; restoration 1583021; null 1583035/1583049 | Unknown; update conditional. |
| lunch_time | parseInt radix 10 or zero 1582940–1582947; guard 1583065–1583069 | Integer when present; update conditional, no server default/minimum. |
| desc | 1582948–1582949 | Unknown; update conditional. |
| change_mode | 1582950–1582951; all write 1583048 | Unknown; update conditional, comparisons do not close server values. |
| range_end | undefined load 1582956, unconditional own write 1582959 | Unknown, not optional on insert; update conditional because of difference. |
| range_start | undefined load 1582963, unconditional own write 1582966 | Unknown, not optional on insert; update conditional because of difference. |
| duration | selectedData slot 8 read/write 1582969–1582973 | Update-only unknown, conditional after difference. Opposite edit-flag branch excludes it from insert. |
| id | selectedData read/write 1583072–1583073 | Update-only unknown, always post-filter; same value supplies URL scheduleId. |
| date | base formatted start_date copy 1583022–1583023 | Update-only conditional string; not helper-output/request-name inference. |
| end_date | 1583019/1583032/1583053/1583060; deletion 1583014 | Update-only conditional string copies; correct single write `0x2cc`. |
| exception_date | selectedData slot 8 start_date copy 1583039–1583041 | Update-only conditional unknown; not freshly formatted base start_date. |

Difference #25432/#25433/#25434 checks selectedData[key] (996255–996258), skips equal values at `0x71`, and writes unequal values (996276, `0x6d`); its object-valued branch and #25436 transform accumulator were read. The possible-key union is not a fixed nineteen-property object. Only id/employee_id are assigned on every executed update request path after filtering.

Full-day null register 8 is loaded at 1582954 and copied into both times at 1582976–1582977. Actions skip conversion on truthy copied full_day (#26526 `0x3d`, #26530 `0x43`); null survives. #26530 chooses date sources for all/from/other using repeat_start, is_recurring and selectedWorkSchedule fallbacks (1030128–1030162), then gates conversions on truthy times (`0xed/0x142`). It rewrites only start_date/start_time/end_time; date/end_date/exception_date retain their form-stage provenance. Helper #25412 (995603–995642) formats date/time with YYYY-MM-DD/HH:mm:ss and returns tz/date/time, but those helper names do not add body fields. SDK string seed/concatenation/return in #12754 (512830/512849/512854) and #12925's formatter/postformat path were checked; no validity or server format constraint follows.

## Seven prior corrections and metadata

All seven items in `evidence/reviews/schedule-additions-review.md` are resolved in corrected candidates and integration: insert own ranges, four unknown time types, actual #25412 helper binding, difference-body omission, unknown selected-data exception_date, selected-data duration, and prior exact-offset/argument fixes. Candidate Markdown agrees with corrected JSON on all 45 entries and the 14-own/19-possible distinction. The new citation finding is separate.

All four queries retain `queryPassthrough:true`; courses/roles/page/view remain unknown where runtime type is unproved. `perPage=15`, `perPage=5`, and empty term are client-observed values only. Both body models remain `complete:false` and open to untraced callers. Optionality/local completeness/constant metadata are client observations, never server requiredness, defaults, enums, nullability declarations or date constraints. Read-only rendering keeps all named query/body properties optional and bodies as `Record<unknown>` with evidence extensions, not literal-value restrictions.

## Preservation and read-only validation

- Compared `communications.json` and `admin-shop.json` against `git show HEAD:<path>` in memory: record counts/order unchanged (**68 + 79**); **141 unrelated records deeply identical**.
- For all six targets, methods, paths, source records, path parameters, operation evidence, auth, responses and queryPassthrough are deeply unchanged. Prior target field lists and variants were empty. Only requested fields/variants/body refinement and three stale unresolved-query notes change; no prior fields or variants are dropped.
- Every integrated field matches corrected candidate name/type/optional/value metadata exactly: **2+4+2+4 query entries**, **14+19 body entries**. Seven request variants survive: one per operation except two polls variants.
- Imported and invoked **makeCatalog/renderCatalog only**, without generate or file writes: validation/render passed against the reviewed research snapshot (**298 records → 296 operations**). This is a construction/render smoke check, not compilation or a broad API review. The single citation is now fixed; parent still needs to compile.

# Initial live-diary audit review

**Disposition:** accepted for candidate-only integration after two low-severity documentation corrections. The candidate model recommendation is sound; preserve the existing open, optional, partial static model and keep all sample-only types non-normative. This review covers `evidence/live-audit/diary-candidates.{json,md}`, `diary-read-plan.{json,md}`, the live-audit contract, the current diary response evidence/model, the global path-disposition ledger, redacted `observed-shapes.json`, and the cited original `eliis.hasm` source. No HTTP request, login/app action, build, or Git operation was performed, and no private capture was opened.

## Scope and counts

The diary candidate has all **3** operation dispositions: `GetGuardianFeed` (#25632) sampled once, `GetGuardianDiary` (#25630) skipped, and `GetDiaryData` (#25935) skipped. The global path ledger records **17** scoped operations: **14 sampled**, **3 skipped**, and **15** body-observation records. Those 15 records are 2 authentication observations plus 13 GET observations; the GET count includes two `GetStatusLogs` sample contexts for one operation. The global method split is 2 authentication POSTs and 15 GETs. These aggregate counts do not expand this review beyond the three diary operations.

The feed candidate records 2 body-root paths (`data`, `next_date`), 5 groups, 5 diary items total, 8 sample-only status paths, and 3 empty-array paths. The static-path comparison lists 13 paths observed in this sample and 9 static paths not observed. Counts and field names are structural metadata only; no scalar private values, child identifiers, dates, diary content, or names are reproduced here.

## Findings ledger

| ID | Operation | Severity | Required correction |
|---|---|---|---|
| LIVE-DIARY-01 | `GetGuardianFeed` (#25632) | Low | Correct the status-field type count in the Markdown. |
| LIVE-DIARY-02 | `GetGuardianFeed` (#25632) | Low | Support or soften the per-group diary-item count claim. |

### LIVE-DIARY-01 — status-field count in the Markdown is contradictory

`diary-candidates.md` line 18 says the “first eight” sample-only status fields have integer/string types, then says `updated_by` was null. The eight paths in the JSON include `updated_by`; only the first **seven** have integer/string observations, while `updated_by` was null in this sample. Change “first eight” to “first seven.” This is a sample-metadata correction only: retain the recommendation that `updated_by` and all canonical fields stay `unknown` where static evidence does not prove a type.

### LIVE-DIARY-02 — per-group item distribution is not in the published shape record

`diary-candidates.md` line 16 says each of the five groups has one diary item. The JSON records five groups and five diary items in total, but does not record diary-array counts by group; those totals alone do not establish a one-per-group distribution. Either add only the redacted per-group counts to the candidate shape record, or soften the prose to “five diary items across five groups.” This is an evidence-coverage gap, not a claim that the statement is false; no private capture was inspected to resolve it.

## Evidence and disposition assessment

- **Feed body boundary:** the source supports the candidate’s distinction between the HTTP body and the local action wrapper. Service #25632 constructs the child-scoped guardian-feed GET with a `params` config (HASM 1003318–1003338); #25633 returns Axios `response.data` (1003348–1003354); callback #25516 forwards that body unchanged (1000474–1000503). Reducer #26862 reads body-root `data` and sibling `next_date` (1039798–1039810); #26865 consumes group `date`, `diaries`, and `evaluations` (1039971–1040004). The five body-root/group/item shape claims otherwise match the redacted inventory. Do not insert a `data`-under-`action.data` wrapper into the HTTP schema.
- **Static/sample separation:** the existing response model’s field paths match the source-backed client reads, including paths absent from this one sample. The additional status paths remain sample-only; observed primitive types do not narrow canonical `unknown` fields. Empty `evaluations`, `texts`, and `feedback` arrays establish no item schema or visibility rule. In particular, the `texts` client check admits arrays, so keep its static type unknown. Preserve all listed static-only diary paths, including diary-entry `meals` separately from sampled `status.meals`.
- **Ownership and access limits:** the plan correctly confines the one read to the already account-discovered child/institution and avoids asserting an explicit guardian-to-child join. A zero mismatch count is only a generic equality observation; it does not label feed groups, establish group-content ownership, guarantee exclusively own-child content, or prove guardian feedback visibility. The empty feedback arrays do not establish feedback access. Keep any equality claim context-specific and do not publish identity values.
- **Request boundary:** the parent `Child diary` route in #44019/#44110 passes the route child ID into the feed callback #44115; the action/service trace supports the first-page date query and treats page bookkeeping as local state. The single-read budget and exclusion of refresh, resume, and pagination triggers are appropriate. Source review found no explicit seen/read/write service call in the inspected feed branch; this is not a guarantee against server logging or other unobservable GET effects.
- **Skipped helpers:** `GetGuardianDiary` is a separate registered child `/diary` GET (#25620/#25630) with no established consuming parent action/reducer/UI path in the cited full-disassembly search. Its opaque `unknown` response and no-probe/no-403 decision are appropriate. `GetDiaryData` is the separate kindergarten `/diary` GET (#25935) consumed through employee/course state in #25782; caller #43846 flushes diary auto-saves before that GET. The employee-scope and autosave exclusions are supported; do not substitute staff records or test denial behavior.

No request evidence, response JSON, TypeSpec model, or other shared artifact needs a change for these findings. Keep this pre-integration review within the existing four-round post-integration review cap.

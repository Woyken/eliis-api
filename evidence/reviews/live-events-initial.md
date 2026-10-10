# Initial live-events audit review

**Disposition:** two operation-level findings, both actionable before integration. This is a pre-integration review of `evidence/live-audit/events-candidates.{json,md}`, the current communications response analysis/TypeSpec models, original `eliis.hasm`, and the redacted observations. No HTTP request, build, or Git operation was performed; no private capture was read with the file reader.

The candidate JSON has two operation records, and `observed-shapes.json` has the two corresponding event observations. The `GetEvents` proposed array item retains the existing 17 direct static-read fields and 23 field nodes including nested paths. Candidate and observation records contain structural names, types, counts, and sample status/media metadata only; no example event values, identifiers, names, dates, or descriptions were found.

## Findings ledger

| ID | Operation | Severity | Disposition |
|---|---|---|---|
| LIVE-EVENTS-01 | `GetEvents` (#25403) | High | Current response model has a false HTTP-root `items` wrapper. Candidate root-array correction is supported by source and sample; integrate it without losing the partial item view. |
| LIVE-EVENTS-02 | `GetRecentEvents` (#25401) | Medium | Root object and property names are correct, but the candidate leaves the observed `events` array and integer `count` only in detached snapshot metadata. Carry these as explicitly sample-proven shape observations in the partial model; do not turn them into universal guarantees. |

### LIVE-EVENTS-01 — `GetEvents` body root is an array, not `{ items: [...] }`

The current `evidence/responses/communications.json` record and `models/responses.tsp` model the HTTP body as an object with `items`. That attribution confuses the response with a local Redux action envelope. The proposed root-array candidate is the correct correction.

The original register flow establishes the boundary (line numbers below refer to `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`):

1. Service `#25403` attaches fulfillment handler `#25404` (`995342–995378`); `#25404` loads its fulfilled Axios result and returns its `.data` (`995383–995389`). Thus its returned value is the HTTP body.
2. Caller `#25374` invokes the service and attaches `#25375` as the fulfillment continuation (`994668–994698`). In `#25375`, `LoadParam R0, 1` receives that fulfilled value (`994704–994710`). The function creates a fresh action object, sets its type to `SET_EVENTS`, creates a separate `action.data` object, writes local kindergarten/date context, writes **R0** to `action.data.items` at `994724`, writes the locally sourced timezone to `action.data.tz`, then dispatches the action (`994714–994729`).
3. Reducer `#25344` reads `action.data.items` and calls `forEach` (`993583–993589`). That is a read from the local action envelope. Since the slot was assigned the whole fulfillment value, this is evidence for iterating the HTTP body as a collection—not evidence for an HTTP-body property named `items`.
4. `#25345` passes each entry and the action’s local `tz` to `#25423` (`993640–993660`). `#25423` shallow-copies the entry and may rewrite date/time properties (`995958–995995`); these converted Redux values do not prove wire timestamps or server timezone semantics.

The authorized sample independently observes a successful `GetEvents` body as an array with one object item. Together with the traced successful client path, this supports the proposed root-array view; it is not a claim about error bodies, every role, or every server branch. The candidate’s JSON `items` member under `proposedResponseAnalysis` is the array-item descriptor, not a proposed root property.

**Minimal integration correction:** make the response kind an array and place the existing open event-item view under that array’s items. Remove the HTTP-root `items` property and rewrite stale evidence such as “body.items” to distinguish the body array elements from local `action.data.items`. Preserve all 17 direct fields and their 23 field nodes, including static-read fields absent from this one capture (`repeat_start`, `repeat_end`, and `acl_groups` paths). Keep snapshot-only field names (including the captured extra fields) out of the universal/static item list; one-sample primitive and null observations do not narrow those types or establish nullability. Keep item properties optional/open and the model incomplete.

The `dateFrom`/`dateTo` request evidence is unchanged. The one-month sample proves no range inclusivity rule. Local timezone conversion is not a UTC/server-storage rule; event IDs, dates, or display/use relationships do not prove stable identity or role/authorization semantics. The observed HTTP 200 and JSON content type remain sample metadata, not universal status or media documentation.

### LIVE-EVENTS-02 — retain the `GetRecentEvents` sample’s root property shapes with mixed provenance

The current static model and candidate correctly identify an HTTP-body-root object with `events` and `count`. In the source, `#25401` attaches `#25402` (`995306–995325`), and `#25402` returns Axios `.data` (`995331–995337`). Saga `#25371` calls the service and attaches `#25372` (`994605–994624`); `#25372` reads root `events` at `994640` and root `count` at `994647`, dispatching each as a separate action payload. Reducer `#25344` stores those payloads separately (`993545–993561`). This confirms the root paths, but the static flow does not inspect event entries or establish these two properties’ value types.

The redacted authenticated observation confirms `events` is an array (three object entries in this snapshot) and `count` is an integer in this snapshot. The candidate records these shapes, but its proposed fields remain `unknown` and its disposition says to keep them unknown until a future review. That is too restrictive for this live-model audit: preserve the static field evidence, while also carrying the observed `events: array` and `count: integer` with explicit authenticated-sample provenance in the partial model/observation. Keep the body open and incomplete and both properties optional; the sample does not prove requiredness, all-role/all-branch invariance, count meaning, or a relationship between count and array length. If the schema surface keeps a static baseline type separate, retain that baseline as unknown but expose these two sample-qualified observations alongside it rather than dropping them.

Do not add a nested `GetRecentEvents` event-item schema from this one capture: the source trace has no nested reads. Keep its observed item key/type inventory snapshot-only and distinct from the `GetEvents` static item view; do not import either endpoint’s extra fields into the other. Primitive, array, and null observations in event entries do not become universal constraints. The observed 200 and JSON content type are likewise sample-only. No nested event values, private identifiers, names, dates, or descriptions belong in the candidate or final model.

## Scope boundary

This review covers only `GetEvents` and `GetRecentEvents`. It does not revise request/query evidence, infer server date predicates, enumerate event records, or make claims about other operations or roles. These are the two required event-path dispositions; later shared-file integration should remain within the live-audit four-round post-integration cap.

# Events live-audit candidates

This is an audit overlay, not an integration into `evidence/responses/communications.json`.

**Resolution note (supersedes the disputed conclusions in historical review reports, including `evidence/reviews/live-events-initial.md` and earlier `evidence/reviews/guardian-final-*.md` summaries):** their `GetEvents` object/root-`items` descriptions are retained as historical text but superseded by this correction. The audit cause was conflating the HTTP body with locally composed `action.data.items` (#25375 writes the whole body there; #25344 iterates that local slot). The HTTP-root array correction is supported by the static register flow, not merely by the live sample. The static response record now uses a root array and retains the existing 17 direct event-item properties / 23 total item and nested field nodes. For `GetRecentEvents`, the historical review recommendation to carry runtime array/integer types into the partial schema is superseded: those remain separate one-snapshot observations; static `events` and `count` field types remain `unknown` because bytecode does not prove them. No request/query evidence changed.
The private capture was inspected only by a local Python summary that emitted JSON keys,
primitive/container types, and the array item count. No event values, personal names,
identifiers, dates, or descriptions were read out or recorded. No HTTP requests were made.

## `GetEvents` (#25403)

**Candidate correction: HTTP body root is an array of event objects, not an object with
an `items` property.** The private snapshot shape reports `body: array` with one object
item. The root correction is also consistent with the original client flow:

1. Service #25403 calls GET and fulfillment handler #25404 returns Axios `response.data`
   (`eliis.hasm` 995342-995389).
2. Continuation #25375 constructs a new `SET_EVENTS` action. Its locally created
   `action.data` receives `kindergartenId`, local `date`, the **whole returned body** as
   `items`, and local user `timezone` as `tz` (`994704-994729`).
3. Reducer #25344 iterates `action.data.items` (`993583-993589`); this `items` read is
   against that local action envelope, not a body-root property.
4. Reducer #25345 and helper #25423 convert/shallow-copy entries for Redux. Rewritten
   date/time values are client transformations and must not be treated as wire values.

Keep the existing source-backed event property reads and their nested paths as a
partial event-item view, relocated under the root array's item shape. Add no invented
fields based on labels. The JSON audit records the one-capture item key/type summary,
including keys not currently read by the traced client. For item scalars, the schema
type remains `unknown` unless static source proves it; snapshot types are explicitly
non-normative. Fields missing from the one item do not invalidate existing static
property-read candidates. Conversely, captured extra keys are observations, not
guaranteed or complete response fields.

The capture file contains an outer local envelope (`body`, `content_type`, `status`).
Only its `body` is treated as the captured response body. Its wrapper fields do not
prove HTTP body fields, response status, or media type.

The existing query candidate `dateFrom`/`dateTo` remains supported by traced client
construction and Axios `config.params`; neither date boundary inclusivity nor a closed
query schema is established.

## `GetRecentEvents` (#25401)

A private capture is now available and was inspected by the same keys/types-only
summary. Its `body` is an object with root keys `events` and `count`; `events` is an
array of three objects and `count` is an integer in this snapshot. The audit JSON
records the redacted event-item key/type shape separately; no nested event values or
identifiers are recorded.

The source trace is direct in original `eliis.hasm`: #25401 constructs the recent-events
GET and #25402 returns Axios `response.data` (995306-995337). Saga #25371 calls the
service with the selected kindergarten (994605-994624). Success continuation #25372
reads HTTP-body-root `events` and `count` independently and dispatches each value as
its own action payload (994630-994649); reducer #25344 stores those values separately
(993545-993561). This confirms the nesting; it does not trace nested item properties.

Keep the static response field types `unknown`: the runtime array and integer types
are recorded as context-specific observations, not static source-derived or universal
contract claims. Do not lift the observed event item keys into the `GetRecentEvents`
static model, because this flow has no traced nested item reads. As with the first
capture, the private file's local `body`/`content_type`/`status` envelope is not promoted
to HTTP-body fields or status/media guarantees.

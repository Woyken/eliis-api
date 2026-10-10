# Response models and evidence

## What these models mean

This project now permits **partial, static-derived response models** when the
Android client's source can be traced from the service response through its
callers/actions to the reducers or other consumers that read it. These models
describe a client-observed view of response data; they are not a complete
contract for the Eliis server and do not guarantee that any property will be
present in a particular response.

The models are open, and every property is optional. Include a property only
when its path from the HTTP response to an actual consumer is supported by
source evidence. Keep primitive types unknown unless the source proves the
type, and preserve nesting from the HTTP body (for example, a consumer reading
`response.data.left` supports a `left` property on the response body, not a
flattened value). Request payloads, UI-composed objects, optimistic updates,
local fallbacks, and Axios/Redux wrapper properties are not response fields.

An unresolved or opaque operation still needs an explicit analysis disposition;
it must not receive guessed fields merely to make the model look complete.
Downloads and native transfer results are opaque binary transport bodies, not
JSON models of native job IDs, status codes, or bytes written. Response status
codes and media types remain unknown unless independently evidenced. Unknown
or unresolved media uses the `*/*` documentation range; this is not a literal
header value to send.

## Evidence and artifacts

Request evidence remains in [`evidence/research/`](evidence/research/). Keep
response analysis separate in [`evidence/responses/`](evidence/responses/),
with a disposition for each operation and references to the source functions
and consumer-chain evidence. Do not replace or rewrite request records to add
response fields. The response-model definitions are maintained in
[`models/responses.tsp`](models/responses.tsp), separate from generated
operation definitions.

Use the generated [`scripts/response-coverage.json`](scripts/response-coverage.json)
to inspect operation dispositions and gaps. Read the
per-operation evidence as well: a coverage entry records analysis status, not
proof that a server schema is complete.

The current static pass covers all **298 research observations / 296 canonical
operations**: **92 partial response models**, **189 unresolved/opaque response
schemas**, and **15 native-download bodies**. Those 189 unknowns include ignored
results, incomplete consumer traces, and conflicting alias/branch evidence;
they are not 189 proven empty responses. This is not a fully modeled server API.

The focused [guardian capability table](docs/GUARDIAN-CAPABILITIES.md) and
[HA blockers](docs/GUARDIAN-HA-BLOCKERS.md) cover the requested 17-endpoint batch.
They distinguish client paths and observed fields from unproved server
authorization, date/transition semantics, and visibility/read-side-effect rules.

Some nested reads remain in evidence descriptions when the container's value
type is unresolved. A field converted or concatenated into a local value does
not acquire that local value's type in the response schema. Alias responses with
conflicting shape/evidence remain opaque, preserving both analyses rather than
silently choosing a schema.

## Keep evidence types distinct

- **Static-derived model:** a partial shape established by traced app source
  and a service-to-consumer chain. It remains open and non-normative.
- **Client response observation:** a non-normative record of properties the
  client reads. It does not establish guaranteed presence or change an unknown
  response schema by itself.
- **Public live sample:** the one recorded unauthenticated language-list GET.
  It is a narrow observation from that request and time, not a model of other
  operations, universal defaults, or closed enum values. Documentation builds
  do not repeat the request.

- **Authorized authenticated samples:** the subsequent read-only account audit
  exports field/type structure only. See [the audit report](docs/LIVE-MODEL-AUDIT.md),
  [standalone TypeSpec views](models/live-observations.tsp), and
  [sample JSON schema views](scripts/observed-response-models.json). These can
  contain fields missed by static consumer tracing, but their observed types
  apply only to the sampled context. They are not wired into the operation's
  universal response schema. No private scalar values are included.

The `GetEvents` static model was corrected from a supposed `items` wrapper to a
root array after the live audit exposed a source-attribution mistake: the
`items` field was on a locally constructed Redux action. Valid static item
properties remain preserved, including ones not present in the sampled event.

Do not infer requiredness, nullability, enums, defaults, validation rules,
success/error statuses, pagination, or universal error wrappers. These
restrictions apply even where the client uses a property or expects a value.

## Review boundary

Treat previous request-model reviews as historical evidence for the scope they
reviewed, not as certification of newly added response models. Response-model
changes require their own evidence review. The bounded post-integration review
process seeks two consecutive clean reviews and must not exceed four
review/fix rounds. Follow the repository's current agent and review
instructions; do not broaden review scope into cosmetic rewrites.

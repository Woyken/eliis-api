# Evidence-backed Eliis API specification

This is an unofficial TypeSpec/OpenAPI description of the Eliis 2.69 Android client's HTTP behavior, not a server-complete contract.

## Source of truth

- Local APK research: `/data/data/com.termux/files/home/eliis-analysis/`.
- `eliis.hasm`: full Hermes v96 disassembly (function IDs and resolved literals).
- `function-strings.json`: search index, NOT sufficient evidence alone.
- `input/com.eliis.apk`, `input/index.android.bundle.hbc`: original inputs, never commit these.
- Template reference: `/tmp/opencode/eliis-trafi-reference` (Trafi TypeSpec project).

## Rules

- Every operation/path/parameter/field needs bytecode evidence or a recorded read-only public response.
- Trace registers and Axios call arguments. A string appearing nearby is not proof of a request field.
- Do not infer server requiredness, response statuses, enums, nullability, defaults, or fields from UI labels or names.
- An arbitrary argument passed as request data remains `unknown` unless its construction can be traced. An arbitrary params object remains an explicitly documented unresolved query shape.
- Client-observed shapes are not necessarily the full server response. Use `unknown` where completeness cannot be established; never fake a complete response model.
- No invented universal pagination/error wrappers. Do not apply Bearer auth: the main API uses an `eliis_csrf` cookie.
- Do not make login/write requests, access private records, or commit credentials/APKs/full third-party decompiled sources.
- Keep code changes focused on real evidence, coverage, or compiler/test problems. Do not do cosmetic rewrites during reviews.
- Agents may be delegated as requested by the user. Current user override: **only Luna subagents**. Search and implementation use `github-copilot/gpt-6-luna#medium`; independent reviews use `github-copilot/gpt-6-luna#xhigh`. The earlier Sol implementation/review sessions are historical, not authorization to spawn more Sol agents.

## Research JSON contract

Each `evidence/research/<domain>.json` is an array of operation records. Fields:

```json
{
  "operationId": "UniqueMeaningfulName",
  "method": "get",
  "path": "/api/kindergartens/{kindergartenId}/children/{childId}",
  "tag": "Children",
  "summary": "Get a child",
  "source": {"functionId": 25622, "functionName": "getChild", "line": 1003117},
  "evidence": "Concatenates ...; Axios get(url, config).",
  "pathParams": [{"name": "kindergartenId", "type": "unknown", "evidence": "parameter 1 inserted into URL"}],
  "query": [{"name": "date", "type": "unknown", "evidence": "..."}],
  "queryPassthrough": false,
  "body": null,
  "response": {"kind": "unknown", "evidence": "Returns response.data; complete shape unestablished"},
  "auth": "cookie",
  "notes": []
}
```

- `method`: lowercase HTTP verb.
- `path`: all dynamic values expressed as `{camelCaseName}`; literal query strings must become query parameters, never part of path.
- Param `type`: `unknown`, `string`, `boolean`, `integer`, `number`, `string[]`, or `unknown[]`; prove non-unknown types, use string for transport path params without claiming server domain type.
- Query fields may have `optional` (only when conditional inclusion is proven), `value` (proven constant), and `encoding` (e.g. JSON.stringify).
- `body`: null (no body), or `{kind:"unknown"|"object"|"multipart", fields:[], evidence:"...", complete:false}`. Fields: `{name,type,evidence,optional?,value?,fields?}`. `complete:true` only for a locally constructed object whose whole construction is traced. Unknown forwarded objects must not have fabricated fields.
- Responses: the current task explicitly authorizes **partial static-derived response models**. Store response analysis separately in `evidence/responses/<domain>.json`, preserving the existing request evidence. Trace service projection → callers/actions → reducers/consumers before attributing a field to the HTTP response. Models remain open, all properties optional, status/media unknown unless independently proved. Opaque operations require explicit analyzed dispositions, not fabricated fields.
- `auth`: `cookie`, `none` (only when isolated login client / verified public call), or `unknown`.
- Optional `clientResponseObservations`: nonempty array of `{evidence, source?, propertyReads: [{path, type, evidence}], coverage}`. These are non-normative client reads; they must not alter the unknown/default response schema, claim guaranteed field presence, or conflate Axios/Redux wrapper properties with HTTP body fields.
- If a function supports multiple genuinely different URLs, create one operation for each with a suffix, same source function ID, and exact branch evidence.
- Distinguish parameter serialization/call evidence from assertions about server validation.

Agent ownership: explorers write only their assigned research JSON and optional domain notes. Implementers own their assigned code files. Reviewers produce review reports; do not edit unrelated files or fix preferences.

## Static response analysis contract

Each `evidence/responses/<domain>.json` is an array with one record for every assigned research operation, keyed by `operationId` and `sourceFunctionId`. Required fields: `operationId`, `sourceFunctionId`, `kind` (`object`, `array`, `scalar`, `unknown`, `binary`), `evidence` (nonempty), `trace` (array of `{functionId,line?,evidence}`), `fields` (array), `complete:false`, `limitations` (array). Optional `scalarType` and `items` describe proved scalar or array-item shapes; unknown is always allowed. Each field is `{name,type,evidence,fields?,items?}` with types `unknown`, `object`, `array`, `string`, `boolean`, `integer`, `number`. No required/enum/default/nullability claims. Every nested property must have its own original-code evidence. Binary/native downloads are opaque transport bodies, not the native jobId/statusCode/bytesWritten metadata. Scalars/array/object types require direct source evidence, not names or formatting applied after reading the field.

UI-composed objects, optimistic reducer updates, request payloads and local fallback values are not server fields. A response projected to `response.data.left` must retain the HTTP body's `left` nesting. Unresolved result/error branches and alias conflicts must remain documented; a partial model is a client-observed view, not a complete accepted server contract. All 298 research observations / 296 canonical operations must receive a response-analysis disposition. The response expansion has at most four post-integration review/fix rounds and seeks two consecutive clean reviews; do not expand the loop indefinitely.

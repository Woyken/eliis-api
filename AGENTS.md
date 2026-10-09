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
- Agents may be delegated as requested by the user. Exploration uses `github-copilot/gpt-6-luna`; implementation uses `github-copilot/gpt-6.1-sol`.

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
- Responses: unknown by default. Proven public samples may be modeled separately, labeled as observed samples, not assumed universal.
- `auth`: `cookie`, `none` (only when isolated login client / verified public call), or `unknown`.
- If a function supports multiple genuinely different URLs, create one operation for each with a suffix, same source function ID, and exact branch evidence.
- Distinguish parameter serialization/call evidence from assertions about server validation.

Agent ownership: explorers write only their assigned research JSON and optional domain notes. Implementers own their assigned code files. Reviewers produce review reports; do not edit unrelated files or fix preferences.

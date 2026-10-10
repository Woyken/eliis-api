# Eliis API — evidence-backed TypeSpec

An **unofficial, unaffiliated** description of HTTP behavior traced in the **Eliis Android app 2.69** (`com.eliis`, version code `33012366`), using **Hermes bytecode v96**. The observed production API host is **https://api.eliis.eu**.

This project is for education, research, and authorized personal integration. It is not endorsed by Eliis and is **not a complete or guaranteed server contract**. App behavior and server behavior may change independently.

## Read the specification

- [Documentation viewer](https://woyken.github.io/eliis-api/) — published by GitHub Pages after deployment; API submission is disabled.
- [OpenAPI JSON](https://woyken.github.io/eliis-api/openapi.json) · [OpenAPI YAML](https://woyken.github.io/eliis-api/openapi.yaml) — normalized artifacts from the same build.
- [Authentication](AUTH.md): the client sends an `eliis_csrf` cookie, not an assumed Bearer token.
- [Evidence and limitations](EVIDENCE.md): provenance, source identifiers, and the sole recorded live check.
- [Response models and evidence](RESPONSE-MODELS.md): how to interpret partial static-derived models, client observations, opaque operations, and coverage.
- [`evidence/research/`](evidence/research/): operation-level bytecode findings; [`evidence/inventory.json`](evidence/inventory.json): source hashes and candidate function inventory.
- [`scripts/coverage.json`](scripts/coverage.json) and [`scripts/operation-catalog.json`](scripts/operation-catalog.json): generated source-function coverage and canonical operation/alias accounting.
- [`evidence/reviews/`](evidence/reviews/): independent review findings, corrections, and the two-consecutive-clean-run publication gate.
- [2026-10-10 field additions](evidence/ADDITIONS-2026-10-10.md): bounded follow-up adding 51 body-property occurrences and 12 query-parameter occurrences across 13 existing operations, with separate source reviews. The original frozen publication reviews do not certify later changes.
- [Luna-only additions](evidence/LUNA-ADDITIONS-2026-10-10.md): further bounded message, poll, event, diary/file payload evidence and explicitly non-normative response observations, with separate medium search and xhigh review sessions.

**Unknown request and response shapes are deliberately unconstrained.** Forwarded objects are not filled with guessed fields. Partial static-derived response models are now permitted where the app's response-to-consumer chain is traced; they are open, all properties optional, and do not claim complete server schemas or guaranteed field presence. Client response observations and the one public live sample are distinct evidence types. Requiredness, status codes, enums, defaults, nullability, pagination, and error wrappers must not be invented. Transport path parameters do not establish server domain types. Field models remain subject to review; this project does not claim all models are fully verified. See [Response models and evidence](RESPONSE-MODELS.md).

Unknown response media and unresolved forwarded-request media use the `*/*` range, not a guessed JSON-only contract. Proven object and multipart constructions retain their observed serialization. The wildcard is a documentation range, not a literal header value to send; response statuses and media remain unknown unless independently evidenced. Equivalent file paths share neutral `pathValueN` slots across HTTP methods; their per-operation evidence retains whether the app supplies a filename or a record ID.

## Build locally

Use Node.js 24 and the committed npm lockfile:

```sh
npm ci
npm run check
npm test
npm run build
```

The build generates TypeSpec from research records and compiles OpenAPI under `tsp-output/@typespec/openapi3/`. Generated OpenAPI and Pages artifacts are not committed. CI checks the project; the Pages workflow publishes the static viewer and downloadable JSON/YAML without contacting the Eliis API.

## Scope and safety

Only the previously recorded unauthenticated `GET /api/lang/languages` was checked live (HTTP 200 on 2026-10-09). No login, write request, or private-record access was performed. Documented write/auth routes are bytecode observations, not instructions to exercise them. Respect account permissions, privacy, and service terms; never publish credentials or children's records.

The repository contains authored specifications, scripts, and minimal evidence records—not APKs, full disassembly, or full third-party decompiled sources. [MIT](LICENSE) applies to project-authored material, not to the Eliis application or other third-party material.

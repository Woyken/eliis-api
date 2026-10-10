# Evidence and limits

## Provenance

Research date: **2026-10-09**. Input application: `com.eliis`, version **2.69**, version code **33012366**. Networking is traced in the React Native **Hermes v96** bundle, disassembled using P1sec/hermes-dec; Android-layer decompilation alone does not establish the HTTP contract.

[`evidence/inventory.json`](evidence/inventory.json) records source SHA-256 hashes and candidate function IDs/locations. Its candidates are an exploration inventory, **not a count of verified endpoints**. Source hashes:

[`evidence/provenance.json`](evidence/provenance.json) also records the XAPK digest, Hermes disassembler revision, and analysis/publication boundaries. The original XAPK was supplied locally; it is not redistributed here.

| Local input (not distributed) | SHA-256 |
| --- | --- |
| `input/com.eliis.apk` | `9b583200327b13e61078f6b9880b24ace6b22b9680be5b0d6de748721ef73879` |
| `input/index.android.bundle.hbc` | `4a08cf83fd735df118f2874ad07748b0781fdf23de4afdae59bce6ac82c91c6d` |

The local research `FINDINGS.md` and `eliis.hasm` are provenance inputs, not bundled third-party source. The tracked [`evidence/research/`](evidence/research/) records retain minimal operation evidence: source function ID/name/disassembly line, method, URL construction, Axios arguments, individually supported parameters and payload fields, and unresolved shapes. Disassembly line numbers refer to this particular input/tool output and may change when regenerated.

To reproduce source inspection with your own matching APK:

1. Extract `com.eliis.apk` from the XAPK, then `assets/index.android.bundle` from that APK. Verify both digests above.
2. Obtain [P1sec/hermes-dec](https://github.com/P1sec/hermes-dec) at revision `a0f18f97ab661eb8ed659c8c683a0d21ea619e69`.
3. Run `PYTHONPATH=<checkout>/src python3 -m hermes_dec.disassembly.hbc_disassembler <bundle> eliis.hasm`.
4. Locate the function IDs and bytecode offsets cited in the records and reviews. Do not substitute a different app version and assume the same contract.

## Evidence standard

- Trace registers, object construction, serialization, URL branches, and Axios call arguments. Nearby strings or the `function-strings.json` search index are discovery aids, not sufficient proof of fields or operations.
- An arbitrary forwarded body remains `unknown`. Forwarded params remain an explicitly unresolved query shape. Only a wholly traced construction can establish a complete client-built object.
- Partial static-derived response models are permitted only when source tracing connects the service response to callers/actions and reducers or other consumers. They are client-observed views, not complete server schemas; models stay open and every property optional. Client observations do not guarantee presence, and unknown shapes remain unconstrained rather than omissions to fill with guesses. See [Response models and evidence](RESPONSE-MODELS.md).
- A named payload field establishes only the evidenced client behavior. It does not establish server requiredness, validation, nullability, enums, defaults, or accepted values beyond the observation.
- Do not fabricate success/error statuses, media types, or universal pagination/error wrappers. Unknown media uses the `*/*` documentation range, not a literal request header. Opaque downloads are binary transport bodies, not JSON models of native transfer metadata. A compile/test pass validates project consistency, not live server behavior or the correctness of every reverse-engineering interpretation. Field models remain subject to review.

## Response-model evidence

Response analysis is maintained separately from the operation/request records in
[`evidence/research/`](evidence/research/). The static-derived definitions are
in [`models/responses.tsp`](models/responses.tsp), and per-operation source
analysis is in [`evidence/responses/`](evidence/responses/). The generated
response-coverage report is expected at
[`scripts/response-coverage.json`](scripts/response-coverage.json); consult the
repository's current build output if its implementation uses a different
location. A coverage disposition indicates that an operation was analyzed,
not that its server response is fully modeled.

The public language-list response sample documented below is a separate,
read-only live observation. It is not evidence for static-derived models of
other operations or a universal shape. The static analysis relies on traced
client code; it does not make additional live requests.

Representative findings: #6017 exports the production host; #5603 configures Axios; #5612/#5617 and #6562/#6566 establish cookie handling; #12709 calls the language route. See [AUTH.md](AUTH.md) and individual research records for the relevant evidence.

## Recorded public check

The existing local findings record an unauthenticated request on 2026-10-09:

```http
GET https://api.eliis.eu/api/lang/languages
Accept: application/json
App-version: 2.69
```

Observed result: **HTTP 200**, `Content-Type: application/json`, a language listing. This confirms that host and route at that time, not a universal response schema or status guarantee. No credentials were used; no private records were accessed; no login or write requests were sent. Documentation/CI does not repeat this request or run live API tests.

The exact public sample and its context/limitations are retained in [`evidence/public-languages-observation.json`](evidence/public-languages-observation.json); sample values are not universal defaults or closed enums.

## Publication boundary

The later [authorized read-only audit](docs/LIVE-MODEL-AUDIT.md) is distinct from
the earlier public/static work. Login and 2FA created a session, then selected
GETs used only account-discovered institution/child identifiers. Raw private
responses, credentials and cookies remain outside the repo; the tracked audit
contains shapes/types and generic equality outcomes only. Authenticated sample
views are explicitly non-normative and are not substituted for unproved server
contracts. CI does not replay these requests.

Keep original APKs, Hermes bytecode, full disassembly, full third-party decompiled sources, credentials, and private responses local and untracked. Publish only authored specs/scripts and minimal evidence identifiers, hashes, and descriptions. The MIT license for this project grants no rights to third-party application material and no permission to access accounts or records.

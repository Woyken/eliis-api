# Publication and documentation independent review — round 1

## Outcome

**One blocking build/deployment finding.** The current TypeSpec build fails with 12 `@typespec/http/no-implicit-multipart` errors in generated routes. Both CI and the Pages workflow run `npm run check`, which invokes this build, so neither validation nor publication can currently complete. The reviewed publication/security claims otherwise match the checked sources and configuration; no credentials, private records, APK, or full disassembly were found in the repository file listing.

No live API requests were made. Review scope was README.md, AUTH.md, EVIDENCE.md, docs/index.html, both workflow YAML files, .gitignore, LICENSE, evidence/provenance.json, evidence/public-languages-observation.json, evidence/inventory.json, and the package/tsp configuration for build-path comparison. Only this review report was intentionally authored.

## Finding P1 — multipart TypeSpec prevents CI and Pages publication

- **Observed:** `npm run build` fails during `tsp compile .` with 12 errors at `routes/generated.tsp` lines 2547, 2562, 2665, 2746, 2812, 2875, 2906, 3016, 3032, 3049, 3109, and 3386. All are `@typespec/http/no-implicit-multipart`: a multipart payload is declared as `@body requestBody: unknown`; the compiler requires multipart-body/part modeling.
- **Impact:** `package.json` lines 7–11 define `check` as build followed by the check script. `.github/workflows/ci.yml` lines 20–23 and `.github/workflows/pages.yml` lines 24–27 both run `npm run check`; Pages cannot reach the artifact/deploy steps while this compiler failure remains.
- **Correction:** update the generated representation for evidence-classified multipart bodies so it compiles using TypeSpec's multipart-body/part form (`@multipartBody` and `HttpPart<T>`, or a compiler-supported opaque equivalent), without fabricating multipart fields. Keep the unresolved-body evidence and unknown shape intact. Then rerun `npm run check`, `npm test`, and the Pages YAML-emission step before publication.

## Checks and supporting evidence

| Check | Result / evidence |
| --- | --- |
| Documentation claims about app/config/auth | Consistent with `/data/data/com.termux/files/home/eliis-analysis/FINDINGS.md` lines 9, 19–21, 23–46, and the cited Hermes functions. Direct bytecode spot checks confirmed #6017's `ApiUrl` value `https://api.eliis.eu` and stale `appVersion: 2.63` (eliis.hasm line 269737); #5612 joins the cookie header with `; ` and conditionally appends `lang=` (lines 254346–254391); #16308 constructs username/password/platform and posts `/api/auth/login` (lines 648612–648638); #12709 contains `/api/lang/languages` (lines 509969–509977). The placeholder cookie and explicit “not tested” claims in AUTH.md/EVIDENCE.md do not imply a tested login or server contract. |
| Source hashes | Independently computed `sha256sum` for `/data/data/com.termux/files/home/eliis-analysis/input/com.eliis.apk` and `.../input/index.android.bundle.hbc`: respectively `9b583200327b13e61078f6b9880b24ace6b22b9680be5b0d6de748721ef73879` and `4a08cf83fd735df118f2874ad07748b0781fdf23de4afdae59bce6ac82c91c6d`. Both match evidence/inventory.json and EVIDENCE.md. The separate XAPK hash in evidence/provenance.json could not be independently checked: the XAPK artifact was not present in the reviewed project or analysis input location. |
| Public language observation | `evidence/public-languages-observation.json` reports the same date, unauthenticated GET URL, request headers, HTTP 200, and JSON content type summarized by FINDINGS.md lines 93–95 and EVIDENCE.md lines 26–36. The observation labels the response as one sample and does not claim a closed enum or complete schema. No live retest was performed. |
| Swagger/API safety | `docs/index.html` lines 6 and 36–40 set `connect-src 'self'`, `supportedSubmitMethods: []`, `tryItOutEnabled: false`, and `validatorUrl: null`; the spec is loaded from `./openapi.json` at line 33. The CSP does not authorize browser connections to `api.eliis.eu`; submissions and the external validator are disabled. |
| Build output paths | `tspconfig.yaml` selects `openapi.json` and the default emitter directory; `README.md` line 27 names `tsp-output/@typespec/openapi3/`. Pages workflow lines 28–40 requests `openapi.yaml` via the emitter override and copies both files from that same directory into `dist/`, alongside `docs/index.html`. These intended paths agree, but emission was blocked by P1. |
| Publication boundaries | `.gitignore` excludes APK/XAPK/HBC/disassembly inputs, local research directories, credential files, and key material. LICENSE is the standard MIT grant for project material; README.md line 33 explicitly limits it with respect to third-party Eliis material. The current repository file listing contained no APK, raw bytecode/disassembly, credential file, or private record. |

## Review limitations

At review time, `git ls-files` returned no indexed paths and `git status` showed the project files as untracked. Consequently this check can attest to the working-tree contents listed above, but cannot certify the eventual staged/committed publication set. The configured ignores provide safeguards, not proof of future staging choices. The XAPK digest noted above also remains unverified because its source artifact was unavailable.

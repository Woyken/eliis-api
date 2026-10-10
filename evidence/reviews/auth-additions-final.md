# Final bounded auth-additions verification

## Outcome

**0 findings.** The seven-target auth integration is supported by the original Hermes disassembly and implements the corrections in `evidence/reviews/auth-additions-review.md`. No corrective edit is required within this scope.

Scope: read-only comparison of `evidence/research/auth-common.json` against HEAD, the corrected `evidence/auth-additions-candidates.json` / `.md`, the earlier review, and relevant original `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm` constructor/action/module/service/request chains. This is not a repeat review of all 296 operations. Only this report was edited; no HTTP requests, Git writes, generator output writes, or compilation were performed.

## Verified additions

| Target | Constructor(s) | Endpoint body fields | Variant field occurrences |
| --- | --- | ---: | ---: |
| RegisterUser #16317 | #28149 | 10 | 10 |
| ResendEmailVerification #16319 | #13505 | 1 | 1 |
| RequestForgotPassword #16321 | #28196 | 1 | 1 |
| RecoverAccount #16337 | #27174 | 2 | 2 |
| UpdateUserName #16359 | #45083 | 2 | 2 |
| RequestEmailChange #16371 | #40927 | 1 | 1 |
| VerifyPassword #16381 | #41054, #45109 | 1 | 2 |
| **Total** | **8 named variants** | **18 distinct operation/body fields** | **19** |

All assignments and unchanged data handoffs match the earlier review's all-fields/request ledgers and the original instructions. Constructor header lines and absolute bytecode offsets match. Action exports, captured service environment slots, and final Axios argument order were checked; RequestEmailChange uses user ID as argument 1 and body as argument 2. No wrapper adds, deletes, overwrites, or projects the request fields.

- **Corrected M4575 binding:** original line 23002 has dependency index **6 = M1577**, index 5 = M601. #45099 +0xc0–+0xd1 imports dependency 6 into slot 7 (1847502–1847506); #45109 loads slot 7 and invokes `default.verifyPassword` (1848422–1848429).
- **Corrected service attribution:** M1575/#16303 creates #16306 (648377) and exports its instance as default (648384). M1577/#16341 creates #16342 (649301) and exports its instance as default (649308). #16342 binds updateUserName to #16359, requestEmailChange to #16371, and verifyPassword to #16381 (649362–649366, 649398–649402, 649428–649432).
- **Recovery:** #27174's nullish branch jumps to the own-key assignment at +0x5b, assigning undefined rather than omitting `login_identifier` (1049981–1049986). No field-level `optional` flag was copied. Possible JSON omission remains explicitly qualified; neither serializer behavior nor server acceptance is asserted.
- **Email change:** strict equality bypasses the entire request (1659961); when invoked, the fresh body always receives `email` (1659976–1659979). Conditional invocation is not optional field inclusion. #16292 → #16293 is explicit and preserves argument order.
- **Registration metadata:** `tz` is only `number`, from constructed Date's getTimezoneOffset result (1109028–1109035, 1109066). `method = "form"` and `company_name = ""` are observed client values, not enums/defaults. All other added values remain `unknown`.
- Resend's +0x4c handoff is described as dispatching the returned thunk. VerifyTwoFactorAuthKey #16335 remains unchanged and unresolved; no #16309 login-2fa or #16381 password fields were transferred to it.

## Preservation and read-only generator checks

Structural comparison confirms all **41 auth records** retain their ordering/identity. Exactly the seven listed records change, and only their body evidence/fields and added `clientRequestVariants` change. All other record properties—including paths, methods, sources, auth, queries, nested query metadata, responses, notes, and prior variants—are deeply equal to HEAD. Non-target auth records, prior request fields and nested fields are unchanged. Every new endpoint body remains open/partial (`complete:false`); variants retain complete local construction, partial caller coverage, and `bodyCompleteAtTarget:false`. No unsupported server constraints or field optional/value metadata were introduced.

The HEAD baseline's **38 global variants** are preserved exactly; the isolated auth integration adds eight, giving **46**. Concurrent edits to `admin-shop.json` and `communications.json` appeared during verification and are outside this ownership: the current tree has **53** variants, with all 46 auth-integrated variants still preserved exactly. These independent changes are not attributed to the auth diff or reviewed here.

Imported `makeCatalog` and `renderCatalog` from `scripts/generate.mjs` and executed them **in memory only**, both for HEAD research plus the auth diff and for the current research tree. Both passed (298 records / 296 operations). The seven rendered body models extend `Record<unknown>`; fields are optional in the server schema, constants remain observational extensions, and `tz` renders as `numeric`, not integer. Variant metadata is retained by the catalog/render path.

**Generated files were not rebuilt or compiled by this reviewer.** This is a zero-finding bounded evidence/in-memory gate only; the parent must regenerate and run its compiler/checks before publication or push.

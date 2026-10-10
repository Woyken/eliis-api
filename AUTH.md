# Authentication observations

These findings describe the Eliis 2.69 Android client, not a verified server authentication contract. Production API: `https://api.eliis.eu`. A later bounded, authorized audit performed password login and 2FA session creation, followed by scoped read-only GETs; see the [audit report](docs/LIVE-MODEL-AUDIT.md). Those context-specific observations do not establish universal authentication or authorization rules.

## Cookie flow

| Hermes function | Observed behavior |
| --- | --- |
| #5603 | Creates Axios clients with the configured API base URL and an `App-version` header from native `getVersion()`. |
| #5617 | Reads `response.headers['set-cookie'][0]`, parses `eliis_csrf`, serializes the cookie, clears the native cookie manager, and passes the cookie string to `saveAccessToken`. |
| #6562 | Persists the string with keychain `setGenericPassword('accessToken', cookieString, {service: 'accessToken'})`. |
| #6566 | Retrieves it with `getGenericPassword({service: 'accessToken'})`. |
| #5612 | Joins the saved cookie string and optional `lang=<language>` with `; ` in the request `cookie` header. |

The storage label `accessToken` does **not** mean an OAuth or Bearer token. Generic Bearer-auth code in the bundled Echo library is not evidence of Bearer authentication for the main HTTP API.

Placeholder header shape only:

```http
Cookie: lang=lt; eliis_csrf=<redacted>
App-version: 2.69
```

The APK metadata is 2.69; function #6017 contains a stale internal `appVersion` value of `2.63`. The header code uses the native version, not that stale string.

## Password and two-factor routes

- #16308 (`login`): `POST /api/auth/login`; traced body keys are `username`, `password`, and `platform`.
- #16309 (`login2FA`): `POST /api/auth/login-2fa`.

The request construction is documented from bytecode. The bounded runtime audit observed one password-login challenge and one valid-session 2FA branch; other success/error branches, cookie lifetime/refresh, and server-side authorization remain untested. See the operation research records for individually traced payload details; route names and one runtime context do not prove server-required fields or universal challenge semantics. This repository provides **no automated login scripts** and requires no account credentials for building or publishing documentation.

For any separately authorized integration, treat the serialized cookie as a secret and use secure credential storage rather than source files, logs, screenshots, or workflow secrets for this project. Do not copy real passwords, 2FA codes, session cookies, or private records into issues or examples. Swagger UI here is documentation-only, not an authentication client.

See [EVIDENCE.md](EVIDENCE.md) for provenance, the earlier unauthenticated language-list check, and the later authorized read-only audit.

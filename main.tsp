import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";
import "./models/generated.tsp";
import "./routes/generated.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Eliis Android client HTTP API (observed)" })
@info(#{ version: "2.69" })
@server("https://api.eliis.eu", "Production API configured by Hermes function #6017 in Eliis Android 2.69.")
@doc("Unofficial, evidence-backed client observations; not a complete server contract. The production base URL is configured by function #6017. Function #5603 sets the Axios App-version header from the native app version; this is observed client configuration, not a proven server requirement. Cookie security annotations describe the client's eliis_csrf credential mechanism, not proof that every route requires a session. Field presence describes client construction, not server validation. Unknown responses intentionally use the default response rather than an invented success status. See https://github.com/Woyken/eliis-api/blob/main/AUTH.md and EVIDENCE.md for scope and authentication evidence.")
namespace Eliis;

model EliisCookieAuth is ApiKeyAuth<ApiKeyLocation.cookie, "eliis_csrf">;

@defaultResponse
@doc("Response status, media type, and complete body shape are unresolved; the wildcard media range is not an inferred server Content-Type header or an error/success response.")
model UnresolvedResponse {
  @header contentType: "*/*";
  @body body: unknown;
}

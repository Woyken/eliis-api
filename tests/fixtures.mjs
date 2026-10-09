// Synthetic fixtures only: these are not production Eliis research.
export function record(overrides = {}) {
  return {
    operationId: "FixtureGet", method: "get", path: "/fixture/{itemId}",
    tag: "Fixtures", summary: "Synthetic fixture operation",
    source: { functionId: 1, functionName: "fixtureGet", line: 1 },
    evidence: "Synthetic register trace: itemId enters URL; Axios.get(url, config).",
    pathParams: [{ name: "itemId", type: "unknown", evidence: "Synthetic explicit argument enters URL." }],
    query: [], queryPassthrough: false, body: null,
    response: { kind: "unknown", evidence: "Synthetic response.data return; shape unresolved." },
    auth: "cookie", notes: [], ...overrides,
  };
}

export const field = (name, type = "unknown", extra = {}) => ({ name, type, evidence: `Synthetic traced property assignment: ${name}.`, ...extra });
export const body = (fields, complete = true) => ({ kind: "object", fields, complete, evidence: "Synthetic local object construction; not server validation." });

export function fixtures() {
  return [
    record({ operationId: "FixturePublic", path: "/fixture/public", pathParams: [], auth: "none", query: [field("platform", "unknown", { encoding: "AxiosURLSearchParams brackets", fields: [field("platform", "string"), field("browser", "string"), field("login", "string", { value: "password" }), field("details", "unknown", { fields: [field("nested", "string")] })] }), field("jsonPlatform", "string", { encoding: "JSON.stringify", fields: [field("platform", "string")] }), field("unencodedEvidence", "unknown", { fields: [field("known", "string")] })] }),
    record({ operationId: "FixtureUnknownAuth", path: "/fixture/unknown-auth", pathParams: [], auth: "unknown" }),
    record({ query: [field("date"), field("count", "integer"), field("active", "boolean", { optional: true }), field("filter", "string", { encoding: "JSON.stringify", fields: [field("nestedQueryEvidence", "string")] }), field("ids", "string[]"), field("dynamicIds", "unknown[]"), field("mode", "string", { value: "synthetic" }), field("guardianFields", "boolean", { value: false }), field("landscape", "boolean", { value: false }), field("showApprovalsTable", "boolean", { value: true })], queryPassthrough: true }),
    record({ operationId: "FixtureAlias", source: { functionId: 2, functionName: "fixtureAlias", line: 2 }, query: [field("date")], queryPassthrough: true }),
    record({ operationId: "FixtureDelete", method: "delete", body: body([field("filename")]), evidence: "Synthetic Axios.delete(url, {data: {filename: input}}); data is a body, not query." }),
    record({ operationId: "FixtureForwarded", method: "put", body: { kind: "unknown", fields: [], complete: false, evidence: "Synthetic Axios.put(url, arbitraryInput)." } }),
    record({ operationId: "FixtureIncomplete", method: "patch", body: body([field("known"), field("details", "unknown", { optional: true, fields: [field("nested", "number")] }), field("items", "unknown[]", { fields: [field("name", "string"), field("enabled", "boolean", { value: false })] })], false), clientRequestVariants: [{ evidence: "Synthetic callsite has a partial item construction.", fields: [field("items", "unknown[]", { fields: [field("name", "string")] })], complete: false }] }),
    record({ operationId: "FixtureMultipart", method: "post", body: { kind: "multipart", fields: [], complete: false, evidence: "Synthetic forwarded data; Content-Type multipart/form-data; no field construction traced." } }),
    record({ operationId: "FixtureKnownMultipart", path: "/fixture/known-multipart", pathParams: [], method: "post", body: { kind: "multipart", fields: [field("subject"), field("body", "string"), field("type", "string", { value: "synthetic" }), field("categories[]", "unknown[]"), field("age_groups[]", "unknown[]"), field("files[]", "unknown[]", { optional: true })], complete: false, evidence: "Synthetic FormData.append traces prove literal parts including repeated categories[], age_groups[], files[]; item and dynamic-part shapes remain unresolved." }, clientRequestVariants: [{ evidence: "Synthetic nested loop appends targetGroups[${index}][${key}] for arbitrary keys; no fixed targetGroups[] part.", dynamicPartPattern: "targetGroups[{index}][{key}]", complete: false }, { evidence: "Synthetic loop repeatedly appends the literal files[] part with a native descriptor; descriptor keys are not multipart properties.", literalPartName: "files[]", repeated: true, complete: false }, { evidence: "Synthetic indexed file parts are dynamic, not the literal files[] collection.", dynamicPartPattern: "files[{index}]", complete: false }] }),
    record({ operationId: "FixtureFileGet", path: "/fixture/{childId}/files/{filename}", pathParams: [field("childId"), field("filename", "string", { evidence: "Synthetic GET uses a filename, not a database ID." })] }),
    record({ operationId: "FixtureFilePut", method: "put", path: "/fixture/{childId}/files/{fileId}", pathParams: [field("childId"), field("fileId", "unknown", { evidence: "Synthetic PUT uses the record ID." })] }),
    record({ operationId: "FixtureFileDelete", method: "delete", path: "/fixture/{childId}/files/{fileId}", pathParams: [field("childId"), field("fileId", "unknown", { evidence: "Synthetic DELETE uses the record ID." })] }),
    record({ operationId: "FixtureBodyAlias", path: "/fixture/body-alias", pathParams: [], method: "post", body: body([field("left")]) }),
    record({ operationId: "FixtureBodyAliasOther", path: "/fixture/body-alias", pathParams: [], method: "post", source: { functionId: 3, functionName: "fixtureOther", line: 3 }, body: body([field("right")]) }),
  ];
}

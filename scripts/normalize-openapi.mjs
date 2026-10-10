import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { bracketQueryEncoding, isDeepObjectQuery } from "./generate.mjs";

/**
 * TypeSpec HTTP/OpenAPI 1.17's native multipartBody/HttpPart emitter ignores
 * model indexers and derives part content types, which are not proven here.
 * Keep the ordinary open partial model for proven literal parts (or {} for
 * opaque forwarded data), and normalize only the observed media type. Never
 * invent part names/encodings; dynamic patterns stay in client-variant metadata.
 * Raw `tsp compile .` retains x-observed-request-content-type for these bodies.
 */
export function normalizeOpenApi(document, catalog) {
  for (const expected of catalog.operations) {
    const response = document.paths[expected.path]?.[expected.method]?.responses;
    if (response) {
      assert.deepEqual(Object.keys(response), ["default"], `${expected.operationId}: only the explicitly unresolved default response is allowed`);
      const responseContent = response.default.content;
      assert.ok(responseContent && Object.keys(responseContent).length === 1 && responseContent["*/*"], `${expected.operationId}: response media must remain wildcard/unknown`);
    }
    // QueryOptions in TypeSpec HTTP 1.17 supports explode, but not deepObject
    // style. Preserve the emitted open partial model and logical name, changing
    // only style/explode for explicitly reviewed bracket-serializer metadata.
    // Proof: Hermes #5683 +0x74–+0x97 -> #5681 +0x1e -> #5669
    // (dots=false at +0x9e); #5674 +0x144–+0x183 / #5677 +0x77–+0xad
    // recurse, and #5666 / #5667 +0x27–+0x33 render bracketed keys.
    for (const query of expected.query.filter(isDeepObjectQuery)) {
      const operation = document.paths[expected.path][expected.method];
      const parameter = operation.parameters.find((p) => p.in === "query" && p.name === query.name);
      assert.ok(parameter, "Reviewed bracket query parameter missing");
      assert.equal(parameter["x-observed-query-encoding"], bracketQueryEncoding);
      assert.deepEqual(parameter["x-evidence"], query.observations);
      assert.ok(parameter.schema?.$ref || parameter.schema?.type === "object", "Bracket query must retain its object schema");
      assert.ok(parameter.style === undefined || parameter.style === "form" || parameter.style === "deepObject", "Bracket normalization must not replace a competing query style");
      parameter.style = "deepObject";
      parameter.explode = true;
    }
     if (expected.body?.kind === "unknown") {
       const operation = document.paths[expected.path][expected.method];
       assert.ok(operation["x-unresolved-request-content-type"], "Unknown request media scope missing");
       const content = operation.requestBody.content;
       assert.ok(Object.keys(content).length === 1 && (content["application/json"] || content["*/*"]), "Unknown media normalization must not discard competing request schemas");
       const media = content["application/json"] ?? content["*/*"];
       assert.deepEqual(media.schema, {}, "Unknown forwarded data must remain unconstrained");
       operation.requestBody.content = { "*/*": media };
       continue;
     }
     if (expected.body?.kind !== "multipart") continue;
    const operation = document.paths[expected.path][expected.method];
    assert.equal(operation["x-observed-request-content-type"], "multipart/form-data");
    const content = operation.requestBody.content;
    assert.ok(Object.keys(content).length === 1 && (content["application/json"] || content["multipart/form-data"]), "Multipart normalization must not discard other request media schemas");
    const media = content["application/json"] ?? content["multipart/form-data"];
    assert.ok(media?.schema, "Multipart request schema missing");
    assert.equal(media.encoding, undefined, "Multipart part encodings are unproven");
    if (!expected.body.fields.length) assert.deepEqual(media.schema, {}, "Forwarded multipart body must remain unknown");
    operation.requestBody.content = { "multipart/form-data": media };
  }
  return document;
}

export async function normalize(root = process.cwd()) {
  const path = resolve(root, "tsp-output/@typespec/openapi3/openapi.json");
  const document = JSON.parse(await readFile(path, "utf8"));
  const catalog = JSON.parse(await readFile(resolve(root, "scripts/operation-catalog.json"), "utf8"));
  normalizeOpenApi(document, catalog);
  await Promise.all([
    writeFile(path, JSON.stringify(document, null, 2) + "\n"),
    writeFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.yaml"), stringify(document, { lineWidth: 0 })),
  ]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await normalize();

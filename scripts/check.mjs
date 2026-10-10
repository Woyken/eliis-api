import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { bracketQueryEncoding, isDeepObjectQuery } from "./generate.mjs";

const methods = ["get", "post", "put", "patch", "delete", "head", "options"];
const sorted = (values) => [...values].sort();

const responseFieldType = (type) => ({ string: "string", boolean: "boolean", integer: "integer", number: "number" })[type];

export function checkOpenApi(document, catalog, responseCatalog = undefined) {
  assert.deepEqual(document.servers?.map((server) => server.url), ["https://api.eliis.eu"], "Production API server must be registered; Pages/default origins are not API servers");
  const routeShapes = new Map();
  for (const path of Object.keys(document.paths ?? {})) {
    const shape = path.replace(/\{[^}]+\}/g, "{}");
    assert.ok(!routeShapes.has(shape), `Equivalent OpenAPI path templates across HTTP methods: ${routeShapes.get(shape)} vs ${path}`);
    routeShapes.set(shape, path);
  }
  const operations = Object.entries(document.paths ?? {}).flatMap(([path, item]) => methods.filter((m) => item[m]).map((method) => ({ path, method, operation: item[method] })));
  assert.equal(operations.length, catalog.operationCount, "OpenAPI operation count differs from research catalog");
  const ids = operations.map((item) => item.operation.operationId);
  assert.equal(new Set(ids).size, ids.length, "Duplicate OpenAPI operation IDs");
  const dereference = (value) => {
    if (value?.allOf?.length === 1) {
      const { allOf, ...siblings } = value;
      return { ...dereference(allOf[0]), ...siblings };
    }
    if (!value?.$ref) return value;
    assert.ok(value.$ref.startsWith("#/"), "Only local references expected");
    return dereference(value.$ref.slice(2).split("/").reduce((obj, part) => obj[part.replace(/~1/g, "/").replace(/~0/g, "~")], document));
  };
  const checkResponseSchemaKeys = (schema, allowed, label) => {
    const unexpected = Object.keys(schema).filter((key) => !key.startsWith("x-") && !allowed.includes(key));
    assert.deepEqual(unexpected, [], `${label}: unproven response schema constraints`);
  };
  const checkProperties = (schema, fields, label, observations) => {
    schema = dereference(schema);
    assert.deepEqual(sorted(Object.keys(schema.properties ?? {})), sorted(fields.map((f) => f.name)), `${label}: exact named properties`);
    assert.ok(schema.additionalProperties === undefined || schema.additionalProperties === true || JSON.stringify(schema.additionalProperties) === "{}", `${label}: server extra properties must remain unresolved/open`);
    assert.deepEqual(schema.required ?? [], [], `${label}: unproven server-required fields`);
    for (const field of fields) {
      const property = schema.properties[field.name];
      const fieldObservations = observations.flatMap((observation) => observation.fields?.filter((p) => p.name === field.name) ?? []);
      assert.deepEqual(property["x-evidence"], fieldObservations, `${label}.${field.name}: exact field evidence missing`);
      assert.ok(property["x-client-presence"], `${label}.${field.name}: requiredness scope missing`);
      assert.ok(!("enum" in property) && !("default" in property) && !("nullable" in property), `${label}.${field.name}: invented enum/default/nullability`);
      if (Object.hasOwn(field, "value")) assert.deepEqual(property["x-client-observed-value"], field.value);
      if (field.fields) {
        if (field.type === "unknown[]") {
          assert.equal(property.type, "array");
          checkProperties(property.items, field.fields, `${label}.${field.name}[]`, fieldObservations);
        } else checkProperties(property, field.fields, `${label}.${field.name}`, fieldObservations);
      }
      else checkType(property, field.type, `${label}.${field.name}`);
    }
  };
  const checkResponseItem = (schema, item, label) => {
    schema = dereference(schema);
    item ??= { kind: "unknown" };
    if (item.kind === "unknown") {
      assert.deepEqual(Object.keys(schema).filter((key) => !key.startsWith("x-")), [], `${label}: unknown array item must remain unconstrained`);
    } else if (item.kind === "scalar") checkResponseScalar(schema, item.scalarType, label);
    else if (item.kind === "array") {
      assert.equal(schema.type, "array", `${label}: evidence-backed nested array`);
      checkResponseSchemaKeys(schema, ["type", "items"], label);
      checkResponseItem(schema.items, item.items, `${label}[]`);
    } else checkResponseProperties(schema, item.fields ?? [], label);
  };
  const checkResponseScalar = (schema, type, label) => {
    schema = dereference(schema);
    assert.equal(schema.type, responseFieldType(type), `${label}: evidence-backed response scalar type`);
    checkResponseSchemaKeys(schema, ["type"], label);
  };
  const checkResponseProperties = (schema, fields, label) => {
    schema = dereference(schema);
    assert.equal(schema.type, "object", `${label}: evidence-backed response object type`);
    checkResponseSchemaKeys(schema, ["type", "properties", "additionalProperties", "required"], label);
    assert.deepEqual(sorted(Object.keys(schema.properties ?? {})), sorted(fields.map((field) => field.name)), `${label}: exact response body properties`);
    assert.ok(schema.additionalProperties === undefined || schema.additionalProperties === true || JSON.stringify(schema.additionalProperties) === "{}", `${label}: response object must remain open`);
    assert.deepEqual(schema.required ?? [], [], `${label}: response fields must remain optional`);
    for (const field of fields) {
      const property = dereference(schema.properties[field.name]);
      assert.equal(property["x-static-field-evidence"], field.evidence, `${label}.${field.name}: field evidence missing`);
      assert.ok(!("enum" in property) && !("default" in property) && !("nullable" in property), `${label}.${field.name}: speculative constraint`);
      if (field.type === "object") checkResponseProperties(property, field.fields ?? [], `${label}.${field.name}`);
      else if (field.type === "array") {
        assert.equal(property.type, "array", `${label}.${field.name}: array type missing`);
        checkResponseSchemaKeys(property, ["type", "items"], `${label}.${field.name}`);
        checkResponseItem(property.items, field.items, `${label}.${field.name}[]`);
      } else if (field.type === "unknown") assert.deepEqual(Object.keys(property).filter((key) => !key.startsWith("x-")), [], `${label}.${field.name}: unknown field must remain unconstrained`);
      else checkResponseScalar(property, field.type, `${label}.${field.name}`);
    }
  };
  const checkType = (schema, type, label) => {
    const expected = { string: "string", boolean: "boolean", integer: "integer", number: "number", "string[]": "array", "unknown[]": "array" }[type];
    assert.equal(schema.type, expected, `${label}: evidence-backed scalar type`);
    if (type === "unknown") assert.deepEqual(Object.keys(schema).filter((key) => !key.startsWith("x-")), [], `${label}: unknown field must remain unconstrained`);
    if (type === "string[]") assert.deepEqual(schema.items, { type: "string" });
    if (type === "unknown[]") assert.deepEqual(schema.items, {});
  };
  for (const expected of catalog.operations) {
    const item = operations.find((op) => op.path === expected.path && op.method === expected.method);
    assert.ok(item, `Missing ${expected.method} ${expected.path}`);
    const op = item.operation;
    assert.equal(op.operationId, expected.operationId);
    assert.deepEqual(op["x-evidence"], expected.records, `${expected.operationId}: operation evidence was lost`);
    assert.deepEqual(op["x-operation-aliases"], expected.aliases);
    const variants = expected.records.flatMap((record) => record.clientRequestVariants ?? []);
    if (variants.length) assert.deepEqual(op["x-client-request-variants"], variants);
    const responseObservations = expected.records.flatMap((record) => record.clientResponseObservations ?? []);
    assert.deepEqual(op["x-client-response-observations"], responseObservations.length ? responseObservations : undefined, `${expected.operationId}: client response observation metadata differs`);
    const expectedResponse = responseCatalog?.operations.find((item) => item.operationId === expected.operationId);
    assert.deepEqual(op["x-unresolved-response"], { statusCodes: "unknown", mediaTypes: "unknown", body: expectedResponse?.disposition === "modeled" ? "partial" : "unknown", evidence: expected.records.map((r) => r.response) }, `${expected.operationId}: response scope extension missing`);
    if (expectedResponse) {
      assert.deepEqual(op["x-static-response-evidence"], expectedResponse, `${expected.operationId}: static response analysis/coverage metadata differs`);
      assert.deepEqual(op["x-static-client-observed"], { scope: "client-observed partial static-derived view; not guaranteed accepted server contract", complete: false, disposition: expectedResponse.disposition, reason: expectedResponse.reason }, `${expected.operationId}: client-observed scope metadata missing`);
    }
    assert.deepEqual(Object.keys(op.responses), ["default"], `${expected.operationId}: invented response status`);
    const response = dereference(op.responses.default);
    assert.deepEqual(Object.keys(response.content ?? {}), ["*/*"], `${expected.operationId}: unproven JSON-only response media contract`);
    if (expectedResponse?.disposition === "modeled") {
      const analysis = expectedResponse.analysis;
      const schema = dereference(response.content["*/*"].schema);
      if (analysis.kind === "object") {
        assert.deepEqual(schema["x-static-client-observed"], { scope: "client-observed partial static-derived view; not guaranteed accepted server contract", complete: false }, `${expected.operationId}: partial model scope metadata missing`);
        assert.deepEqual(schema["x-static-response-evidence"], expectedResponse.observations.map((observation) => observation.analysis), `${expected.operationId}: response schema provenance missing`);
        checkResponseProperties(schema, analysis.fields, expected.operationId);
      } else if (analysis.kind === "scalar") checkResponseScalar(schema, analysis.scalarType, expected.operationId);
      else {
        assert.equal(schema.type, "array", `${expected.operationId}: root response array type missing`);
        checkResponseSchemaKeys(schema, ["type", "items"], expected.operationId);
        checkResponseItem(schema.items, analysis.items, `${expected.operationId}[]`);
      }
    } else assert.deepEqual(response.content["*/*"].schema, {}, `${expected.operationId}: unknown/binary/conflicting response must remain unknown`);
    const params = (op.parameters ?? []).map(dereference);
    assert.ok(!params.some((p) => p.in === "query" && p.name === "unknown"), `${expected.operationId}: synthetic unknown query parameter`);
    assert.deepEqual(sorted(params.map((p) => `${p.in}:${p.name}`)), sorted([...expected.pathParams.map((p) => `path:${p.name}`), ...expected.query.map((p) => `query:${p.name}`)]), `${expected.operationId}: exact named parameters`);
    for (const param of params) {
      const expectedParam = (param.in === "path" ? expected.pathParams : expected.query).find((p) => p.name === param.name);
      assert.deepEqual(param["x-evidence"], expectedParam.observations, `${expected.operationId}.${param.name}: parameter evidence missing`);
      assert.ok(!param.schema?.enum && !Object.hasOwn(param.schema ?? {}, "default"), `${expected.operationId}.${param.name}: invented enum/default`);
      if (param.in === "path") {
        assert.equal(param.schema.type, "string", "Path transport must be string");
        assert.equal(param.required, true, "Path transport must be required");
      }
      else {
        if (isDeepObjectQuery(expectedParam)) {
          assert.equal(param.style, "deepObject", `${expected.operationId}.${param.name}: bracket query style missing`);
          assert.equal(param.explode, true, `${expected.operationId}.${param.name}: bracket query must explode`);
          assert.equal(param["x-observed-query-encoding"], bracketQueryEncoding);
          assert.deepEqual(dereference(param.schema)["x-client-construction"], { complete: false, serverValidation: "unknown", evidence: expectedParam.observations }, `${expected.operationId}.${param.name}: query construction evidence missing`);
          checkProperties(param.schema, expectedParam.fields, `${expected.operationId}.${param.name}`, expectedParam.observations);
        } else {
          assert.notEqual(param.style, "deepObject", `${expected.operationId}.${param.name}: unproven object query encoding`);
          checkType(param.schema, expectedParam.type === "unknown" || expectedParam.type === "unknown[]" || expectedParam.encoding ? "string" : expectedParam.type, `${expected.operationId}.${param.name}`);
        }
        assert.equal(Boolean(param.required), false, `${expected.operationId}.${param.name}: unproven server requiredness`);
        if (Object.hasOwn(expectedParam, "value") && expectedParam.value !== undefined) assert.deepEqual(param["x-client-observed-value"], expectedParam.value);
      }
    }
    assert.equal(Boolean(op["x-unresolved-query"]), expected.queryPassthrough);
    if (expected.auth === "cookie") assert.ok(op.security?.some((entry) => "EliisCookieAuth" in entry), `${expected.operationId}: cookie auth missing`);
    else assert.deepEqual(op.security, [{}], `${expected.operationId}: no observed auth should be enforced`);
    if (expected.body === null) assert.equal(op.requestBody, undefined, `${expected.operationId}: phantom body`);
    else {
      const body = dereference(op.requestBody);
      assert.ok(body, `${expected.operationId}: missing request body`);
      assert.equal(Boolean(body.required), false, `${expected.operationId}: unproven server-required body`);
      assert.ok(op["x-request-body-evidence"], `${expected.operationId}: request body scope missing`);
      assert.deepEqual(op["x-request-body-evidence"].variants, expected.records.map((r) => r.body));
      const media = expected.body.kind === "multipart" ? "multipart/form-data" : expected.body.kind === "unknown" ? "*/*" : "application/json";
      if (expected.body.kind === "unknown") assert.ok(op["x-unresolved-request-content-type"], `${expected.operationId}: unknown request media scope missing`);
      assert.deepEqual(Object.keys(body.content), [media]);
      if (expected.body.kind === "multipart") assert.equal(body.content[media].encoding, undefined, `${expected.operationId}: unproven multipart part encodings`);
      if (expected.body.kind === "object" || (expected.body.kind === "multipart" && expected.body.fields.length)) {
        const schema = dereference(body.content[media].schema);
        assert.deepEqual(schema["x-client-construction"], { complete: expected.body.complete, serverValidation: "unknown", evidence: expected.records.map((r) => r.body) }, `${expected.operationId}: client construction evidence missing`);
        checkProperties(schema, expected.body.fields, expected.operationId, expected.records.map((r) => r.body));
      }
      else assert.deepEqual(body.content[media].schema, {}, `${expected.operationId}: forwarded body must remain unknown`);
    }
  }
  const cookie = document.components?.securitySchemes?.EliisCookieAuth;
  if (catalog.operations.some((op) => op.auth === "cookie")) assert.deepEqual(cookie, { type: "apiKey", in: "cookie", name: "eliis_csrf" });
  return operations.length;
}

export async function check(root = process.cwd()) {
  const load = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
  const [document, catalog, coverage] = await Promise.all([load("tsp-output/@typespec/openapi3/openapi.json"), load("scripts/operation-catalog.json"), load("scripts/coverage.json")]);
  let responseCoverage;
  try { responseCoverage = await load("scripts/response-coverage.json"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  let responseFilesPresent = false;
  try { await readdir(resolve(root, "evidence/responses")); responseFilesPresent = true; }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (responseFilesPresent) assert.ok(responseCoverage?.analysisRequired, "Response analysis files are present but generated coverage is absent/non-strict");
  if (responseCoverage?.analysisRequired) {
    assert.equal(responseCoverage.researchObservationCount, 298, "Response disposition must cover all research observations");
    assert.equal(responseCoverage.canonicalOperationCount, 296, "Response disposition must cover all canonical operations");
    assert.equal(responseCoverage.analyzedObservationCount, 298, "Static response analysis must cover all research observations");
    assert.equal(responseCoverage.missingObservationCount, 0, "Response analysis coverage is incomplete");
    assert.equal(responseCoverage.operations.length, 296, "Every canonical operation needs a response disposition");
    assert.equal(responseCoverage.operations.reduce((sum, item) => sum + item.observations.length, 0), 298, "Response disposition observation count differs");
    assert.equal(new Set(responseCoverage.operations.map((item) => item.operationId)).size, 296, "Duplicate canonical response dispositions");
    for (const [disposition, count] of [["modeled", responseCoverage.modeledOperationCount], ["unknown", responseCoverage.unknownOperationCount], ["binary", responseCoverage.binaryOperationCount]]) {
      assert.equal(responseCoverage.operations.filter((item) => item.disposition === disposition).length, count, `${disposition} response count differs`);
    }
    assert.equal(responseCoverage.modeledOperationCount + responseCoverage.unknownOperationCount + responseCoverage.binaryOperationCount, 296, "Response disposition counts do not cover canonical operations");
  } else responseCoverage = undefined;
  const yamlDocument = parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.yaml"), "utf8"));
  assert.deepEqual(yamlDocument, document, "Published YAML must exactly match normalized JSON");
  const count = checkOpenApi(document, catalog, responseCoverage);
  checkOpenApi(yamlDocument, catalog, responseCoverage);
  assert.equal(coverage.missingCount, 0, `Missing inventory functions: ${coverage.candidates.filter((c) => c.status === "missing").map((c) => `${c.functionId} ${c.functionName}`).join(", ")}`);
  console.log(`Validated ${count} OpenAPI operations; ${coverage.coveredCount} covered and ${coverage.excludedCount} explicitly excluded inventory functions${responseCoverage ? `; ${responseCoverage.modeledOperationCount} partial response models and ${responseCoverage.unknownOperationCount + responseCoverage.binaryOperationCount} unknown/opaque dispositions` : "; legacy unknown responses"}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await check();

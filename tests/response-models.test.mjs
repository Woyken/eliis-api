import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { generate, makeCatalog, makeResponseCatalog, validateResponseAnalysis } from "../scripts/generate.mjs";
import { checkOpenApi } from "../scripts/check.mjs";
import { normalize } from "../scripts/normalize-openapi.mjs";
import { parse } from "yaml";
import { record } from "./fixtures.mjs";

const evidence = (field) => `Synthetic static trace for ${field}.`;
const resolveSchema = (document, schema) => {
  if (schema?.allOf?.length === 1) {
    const { allOf, ...siblings } = schema;
    return { ...resolveSchema(document, allOf[0]), ...siblings };
  }
  if (schema?.$ref) return resolveSchema(document, schema.$ref.slice(2).split("/").reduce((value, part) => value[part.replace(/~1/g, "/").replace(/~0/g, "~")], document));
  return schema;
};
const baseAnalysis = (record, overrides = {}) => ({
  operationId: record.operationId,
  sourceFunctionId: record.source.functionId,
  kind: "unknown", evidence: evidence(record.operationId), trace: [{ functionId: record.source.functionId, line: record.source.line, evidence: evidence("service projection") }],
  fields: [], complete: false, limitations: ["Synthetic fixture is partial."], ...overrides,
});

function fixtureRecords() {
  return [
    record({ operationId: "ResponseObject", path: "/response/object", pathParams: [], source: { functionId: 31, functionName: "object", line: 31 } }),
    record({ operationId: "ResponseArray", path: "/response/array", pathParams: [], source: { functionId: 32, functionName: "array", line: 32 } }),
    record({ operationId: "ResponseScalar", path: "/response/scalar", pathParams: [], source: { functionId: 33, functionName: "scalar", line: 33 } }),
    record({ operationId: "ResponseUnknown", path: "/response/unknown", pathParams: [], source: { functionId: 34, functionName: "unknown", line: 34 } }),
    record({ operationId: "ResponseBinary", path: "/response/binary", pathParams: [], source: { functionId: 35, functionName: "binary", line: 35 } }),
    record({ operationId: "ResponseAliasA", path: "/response/alias", pathParams: [], source: { functionId: 36, functionName: "aliasA", line: 36 } }),
    record({ operationId: "ResponseAliasB", path: "/response/alias", pathParams: [], source: { functionId: 37, functionName: "aliasB", line: 37 } }),
  ];
}

function fixtureAnalysis(records) {
  const [object, array, scalar, unknown, binary, aliasA, aliasB] = records;
  return [
    baseAnalysis(object, { kind: "object", fields: [
      { name: "label", type: "string", evidence: evidence("label") },
      { name: "details", type: "object", evidence: evidence("details"), fields: [{ name: "active", type: "boolean", evidence: evidence("details.active") }] },
      { name: "opaqueValues", type: "array", evidence: evidence("opaque array property") },
    ] }),
    baseAnalysis(array, { kind: "array", items: { kind: "object", evidence: evidence("array item projection"), fields: [
      { name: "id", type: "integer", evidence: evidence("item id") },
      { name: "matrix", type: "array", evidence: evidence("nested array"), items: { kind: "array", evidence: evidence("array-valued item"), items: { kind: "scalar", scalarType: "number", evidence: evidence("nested numeric item") } } },
    ] } }),
    baseAnalysis(scalar, { kind: "scalar", scalarType: "number" }),
    baseAnalysis(unknown),
    baseAnalysis(binary, { kind: "binary" }),
    baseAnalysis(aliasA, { kind: "object", fields: [{ name: "left", type: "string", evidence: evidence("left") }] }),
    baseAnalysis(aliasB, { kind: "object", fields: [{ name: "right", type: "string", evidence: evidence("right") }] }),
  ];
}

test("response analyses validate proof metadata and reject normative/fabricated shapes", () => {
  const sample = baseAnalysis(fixtureRecords()[0], { kind: "object", fields: [{ name: "label", type: "string", evidence: evidence("label") }] });
  assert.equal(validateResponseAnalysis(sample), sample);
  for (const mutate of [
    (value) => { value.fields[0].required = true; },
    (value) => { value.fields[0].enum = ["a"]; },
    (value) => { value.fields[0].evidence = ""; },
    (value) => { value.fields[0].fields = []; },
  ]) {
    const invalid = structuredClone(sample);
    mutate(invalid);
    assert.throws(() => validateResponseAnalysis(invalid), /unsupported|evidence|only valid/);
  }
  const binary = baseAnalysis(fixtureRecords()[4], { kind: "binary", fields: [{ name: "jobId", type: "string", evidence: evidence("native job metadata") }] });
  assert.throws(() => validateResponseAnalysis(binary), /non-object response kinds/);
});

test("complete synthetic response observations compile, preserve scope, and check exact partial schemas", async (t) => {
  const records = fixtureRecords();
  const analyses = fixtureAnalysis(records);
  const catalog = makeCatalog(records);
  const rows = makeResponseCatalog(catalog, [{ name: "fixture.json", entries: analyses }]);
  assert.equal(rows.researchObservationCount, 7);
  assert.equal(rows.canonicalOperationCount, 6);
  assert.equal(rows.modeledOperationCount, 3);
  assert.equal(rows.unknownOperationCount, 2);
  assert.equal(rows.binaryOperationCount, 1);
  assert.equal(rows.operations.find((op) => op.operationId === "ResponseAliasA").disposition, "unknown");
  assert.match(rows.operations.find((op) => op.operationId === "ResponseAliasA").reason, /conflict/);
  assert.throws(() => makeResponseCatalog(catalog, [{ name: "fixture.json", entries: analyses.slice(0, -1) }]), /Missing static response analysis/);

  const root = await mkdtemp(resolve("tests", ".response-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(resolve(root, "evidence/research"), { recursive: true });
  await mkdir(resolve(root, "evidence/responses"), { recursive: true });
  await symlink(resolve("node_modules"), resolve(root, "node_modules"), "dir");
  await Promise.all([
    writeFile(resolve(root, "main.tsp"), await readFile("main.tsp")),
    writeFile(resolve(root, "tspconfig.yaml"), await readFile("tspconfig.yaml")),
    writeFile(resolve(root, "evidence/research/fixture.json"), JSON.stringify(records)),
    writeFile(resolve(root, "evidence/responses/fixture.json"), JSON.stringify(analyses)),
  ]);
  const generated = await generate(root);
  assert.equal(generated.responseCatalog.analyzedObservationCount, 7);
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [resolve("node_modules/@typespec/compiler/cmd/tsp.js"), "compile", "."], { cwd: root, timeout: 60000 });
  assert.ok(!/Diagnostics were reported/.test(stdout + stderr), stdout + stderr);
  await normalize(root);
  const document = JSON.parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.json"), "utf8"));
  const yaml = parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.yaml"), "utf8"));
  assert.deepEqual(yaml, document);
  assert.equal(checkOpenApi(document, generated.catalog, generated.responseCatalog), 6);
  assert.equal(checkOpenApi(yaml, generated.catalog, generated.responseCatalog), 6);
  const partial = document.paths["/response/object"].get;
  const responseSchema = document.components.schemas[partial.responses.default.content["*/*"].schema.$ref.split("/").at(-1)];
  assert.deepEqual(Object.keys(responseSchema.properties).sort(), ["details", "label", "opaqueValues"]);
  assert.deepEqual(responseSchema.properties.opaqueValues.items, {});
  assert.deepEqual(responseSchema.required ?? [], []);
  assert.ok(responseSchema.additionalProperties === undefined || responseSchema.additionalProperties === true || JSON.stringify(responseSchema.additionalProperties) === "{}");
  assert.deepEqual(document.paths["/response/binary"].get.responses.default.content["*/*"].schema, {});
  assert.deepEqual(document.paths["/response/alias"].get.responses.default.content["*/*"].schema, {});
  const responseModelName = partial.responses.default.content["*/*"].schema.$ref.split("/").at(-1);
  const responseRoot = (doc, path) => resolveSchema(doc, doc.paths[path].get.responses.default.content["*/*"].schema);
  const requiredField = structuredClone(document);
  requiredField.components.schemas[responseModelName].required = ["label"];
  assert.throws(() => checkOpenApi(requiredField, generated.catalog, generated.responseCatalog), /response fields must remain optional/);
  const inventedEnum = structuredClone(document);
  inventedEnum.components.schemas[responseModelName].properties.label.enum = ["guessed"];
  assert.throws(() => checkOpenApi(inventedEnum, generated.catalog, generated.responseCatalog), /speculative constraint/);
  const extraField = structuredClone(document);
  extraField.components.schemas[responseModelName].properties.guessed = { type: "string" };
  assert.throws(() => checkOpenApi(extraField, generated.catalog, generated.responseCatalog), /exact response body properties/);

  const wrongRootObjectType = structuredClone(document);
  wrongRootObjectType.components.schemas[responseModelName].type = "string";
  assert.throws(() => checkOpenApi(wrongRootObjectType, generated.catalog, generated.responseCatalog), /response object type/);
  const wrongNestedObjectType = structuredClone(document);
  wrongNestedObjectType.components.schemas[responseModelName].properties.details.type = "string";
  assert.throws(() => checkOpenApi(wrongNestedObjectType, generated.catalog, generated.responseCatalog), /response object type/);
  for (const mutate of [
    (schema) => { schema.minProperties = 1; },
    (schema) => { schema.maxProperties = 4; },
    (schema) => { schema.patternProperties = { "^x": { type: "string" } }; },
    (schema) => { schema.additionalProperties = false; },
  ]) {
    const constrainedObject = structuredClone(document);
    mutate(constrainedObject.components.schemas[responseModelName]);
    assert.throws(() => checkOpenApi(constrainedObject, generated.catalog, generated.responseCatalog), /unproven response schema constraints|response object must remain open/);
  }

  const wrongRootArrayType = structuredClone(document);
  responseRoot(wrongRootArrayType, "/response/array").type = "object";
  assert.throws(() => checkOpenApi(wrongRootArrayType, generated.catalog, generated.responseCatalog), /root response array type missing/);
  for (const mutate of [
    (schema) => { schema.minItems = 1; },
    (schema) => { schema.maxItems = 4; },
    (schema) => { schema.uniqueItems = true; },
    (schema) => { schema.contains = { type: "string" }; },
  ]) {
    const constrainedRootArray = structuredClone(document);
    mutate(responseRoot(constrainedRootArray, "/response/array"));
    assert.throws(() => checkOpenApi(constrainedRootArray, generated.catalog, generated.responseCatalog), /unproven response schema constraints/);
  }
  const wrongArrayItemObjectType = structuredClone(document);
  const wrongItemRoot = responseRoot(wrongArrayItemObjectType, "/response/array");
  wrongItemRoot.items = { ...resolveSchema(wrongArrayItemObjectType, wrongItemRoot.items), type: "string" };
  assert.throws(() => checkOpenApi(wrongArrayItemObjectType, generated.catalog, generated.responseCatalog), /response object type/);
  const constrainedArrayItemObject = structuredClone(document);
  const constrainedItemRoot = responseRoot(constrainedArrayItemObject, "/response/array");
  constrainedItemRoot.items = { ...resolveSchema(constrainedArrayItemObject, constrainedItemRoot.items), minProperties: 1 };
  assert.throws(() => checkOpenApi(constrainedArrayItemObject, generated.catalog, generated.responseCatalog), /unproven response schema constraints/);
  const wrongArrayValuedItemType = structuredClone(document);
  const nestedItemsRoot = responseRoot(wrongArrayValuedItemType, "/response/array");
  nestedItemsRoot.items = resolveSchema(wrongArrayValuedItemType, nestedItemsRoot.items);
  const nestedArrayItems = nestedItemsRoot.items.properties.matrix;
  nestedArrayItems.items = { ...resolveSchema(wrongArrayValuedItemType, nestedArrayItems.items), type: "object" };
  assert.throws(() => checkOpenApi(wrongArrayValuedItemType, generated.catalog, generated.responseCatalog), /evidence-backed nested array/);
  const constrainedNestedArray = structuredClone(document);
  constrainedNestedArray.components.schemas[responseModelName].properties.opaqueValues.minItems = 1;
  assert.throws(() => checkOpenApi(constrainedNestedArray, generated.catalog, generated.responseCatalog), /unproven response schema constraints/);
});

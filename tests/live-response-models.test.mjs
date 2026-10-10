import assert from "node:assert/strict";
import test from "node:test";
import { makeCatalog, makeLiveObservationAuthorization, makeLiveResponseModels, renderLiveObservationModels } from "../scripts/generate.mjs";
import { checkOpenApi } from "../scripts/check.mjs";
import { record } from "./fixtures.mjs";
import { readFile } from "node:fs/promises";

const observation = (name, shape) => ({
  observation: name,
  httpStatusObserved: 200,
  contentTypeObserved: "application/json",
  provenance: "synthetic authenticated sample; values excluded",
  shape,
  limitations: ["Synthetic context only; not a universal response contract."],
});
const object = (properties) => ({ observedType: "object", properties });
const array = (...observedItemShapes) => ({ observedType: "array", observedItemShapes, itemsObserved: observedItemShapes.length > 0 });
const primitive = (observedType) => ({ observedType });
const fixtureAuthorization = (...entries) => ({ exact: true, observations: entries.map(([observation, operationId, sourceFunctionId = 1]) => ({ observation, operationId, sourceFunctionId })) });

test("normative OpenAPI rejects qualified and marker-flagged sample schemas", () => {
  const check = (schemas) => checkOpenApi({
    servers: [{ url: "https://api.eliis.eu" }],
    paths: {},
    components: { schemas },
  }, { operationCount: 0, operations: [] });

  assert.throws(() => check({ "LiveObservations.Observed_Fixture": { type: "object" } }), /Sample-only schema LiveObservations\.Observed_Fixture/);
  assert.throws(() => check({ Fixture: { "x-authenticated-sample-view": true } }), /Sample-only schema Fixture/);
});

test("live response samples produce separately qualified, open models with safe type merging", () => {
  const records = [
    record({ operationId: "SampleObject", path: "/sample/object", pathParams: [] }),
    record({ operationId: "GetStatusLogs", path: "/sample/status-logs", pathParams: [] }),
    record({ operationId: "GetUserPermissions", path: "/sample/permissions", pathParams: [] }),
  ];
  const catalog = makeCatalog(records);
  const document = {
    rawResponsesIncluded: false,
    observations: [
      observation("SampleObject", object({ stable: primitive("boolean"), nullOnly: primitive("null") })),
      observation("GetStatusLogs", array()),
      observation("GetStatusLogs-recorded-day", array(
        object({ id: primitive("integer"), nullOnly: primitive("null") }),
        object({ id: primitive("string"), added: primitive("boolean") }),
      )),
      observation("GetUserPermissions", object({ enabled: primitive("boolean"), changing: primitive("integer") })),
      observation("GetUserPermissions-institution-1", object({ changing: primitive("string"), later: primitive("number") })),
    ],
  };
  const models = makeLiveResponseModels(document, catalog, { authorization: fixtureAuthorization(
    ["SampleObject", "SampleObject"], ["GetStatusLogs", "GetStatusLogs"], ["GetStatusLogs-recorded-day", "GetStatusLogs"],
    ["GetUserPermissions", "GetUserPermissions"], ["GetUserPermissions-institution-1", "GetUserPermissions"],
  ) });
  assert.deepEqual(models.responseModels.map(({ operationId }) => operationId), ["GetStatusLogs", "GetUserPermissions", "SampleObject"]);

  const sample = models.responseModels.find(({ operationId }) => operationId === "SampleObject");
  assert.deepEqual(sample.observationLabels, ["SampleObject"]);
  assert.deepEqual(sample.schema.properties.stable, { type: "boolean" });
  assert.deepEqual(sample.schema.properties.nullOnly, {});
  assert.equal(sample.schema.additionalProperties, true);
  assert.equal("required" in sample.schema, false);
  assert.equal(sample.schema["x-normative"], false);
  assert.equal(sample.schema["x-operation-id"], "SampleObject");
  assert.equal(sample.schema["x-provenance"].type, "redacted-authenticated-observation-shapes");

  const logs = models.responseModels.find(({ operationId }) => operationId === "GetStatusLogs");
  assert.deepEqual(logs.observationLabels, ["GetStatusLogs", "GetStatusLogs-recorded-day"]);
  assert.equal(logs.schema.type, "array");
  assert.equal(logs.schema.items.type, "object");
  assert.equal(logs.schema.items.additionalProperties, true);
  assert.deepEqual(logs.schema.items.properties.id, {});
  assert.deepEqual(logs.schema.items.properties.nullOnly, {});
  assert.deepEqual(logs.schema.items.properties.added, { type: "boolean" });
  assert.equal("required" in logs.schema.items, false);
  const permissions = models.responseModels.find(({ operationId }) => operationId === "GetUserPermissions");
  assert.deepEqual(permissions.observationLabels, ["GetUserPermissions", "GetUserPermissions-institution-1"]);
  assert.equal(permissions.schema.properties.enabled.type, "boolean");
  assert.deepEqual(permissions.schema.properties.changing, {});
  assert.equal(permissions.schema.properties.later.type, "number");

  const json = JSON.stringify(models);
  assert.doesNotMatch(json, /synthetic authenticated sample|application\/json|httpStatusObserved|nullable|example|default|enum/);
  const tsp = renderLiveObservationModels(models);
  assert.match(tsp, /namespace Eliis\.LiveObservations;/);
  assert.match(tsp, /x-authenticated-sample-view/);
  assert.match(tsp, /x-provenance/);
  assert.match(tsp, /`stable`\?: boolean/);
  assert.match(tsp, /`changing`\?: unknown/);
  assert.match(tsp, /StatusLogs-recorded-day/);
  assert.doesNotMatch(tsp, /@route\(|@defaultResponse|@body/);
});

test("empty arrays keep their item schema unconstrained and unmapped observations fail", () => {
  const catalog = makeCatalog([record({ operationId: "GetStatusLogs", path: "/sample/status-logs", pathParams: [] })]);
  const document = {
    rawResponsesIncluded: false,
    observations: [
      observation("StatusLogs", array()),
      observation("StatusLogs-recorded-day", array(object({ id: primitive("integer") }))),
    ],
  };
  const authorization = fixtureAuthorization(["StatusLogs", "GetStatusLogs"], ["StatusLogs-recorded-day", "GetStatusLogs"]);
  const models = makeLiveResponseModels(document, catalog, { authorization });
  assert.deepEqual(models.responseModels[0].observationLabels, ["StatusLogs", "StatusLogs-recorded-day"]);
  assert.equal(models.responseModels[0].schema.items.type, "object");
  assert.equal(models.responseModels[0].schema.items.additionalProperties, true);
  assert.equal(models.responseModels[0].schema.items.properties.id.type, "integer");
  const emptyOnly = makeLiveResponseModels({ rawResponsesIncluded: false, observations: [observation("StatusLogs", array())] }, catalog, { authorization: fixtureAuthorization(["StatusLogs", "GetStatusLogs"]) });
  assert.deepEqual(emptyOnly.responseModels[0].schema.items, {});
  assert.throws(() => makeLiveResponseModels({ ...document, observations: [observation("UnmappedSample", object({}))] }, catalog, { authorization: fixtureAuthorization(["UnmappedSample", "GetStatusLogs"]) }), /substitutes an approved label/);
});

test("production authorization is the exact reviewed 15-label/14-operation set with source identity", async () => {
  const [dispositions, document, catalog] = await Promise.all([
    readFile("evidence/live-audit/path-dispositions.json", "utf8").then(JSON.parse),
    readFile("evidence/live-audit/observed-shapes.json", "utf8").then(JSON.parse),
    readFile("scripts/operation-catalog.json", "utf8").then(JSON.parse),
  ]);
  const authorization = makeLiveObservationAuthorization(dispositions);
  assert.equal(authorization.observations.length, 15);
  assert.equal(new Set(authorization.observations.map(({ operationId }) => operationId)).size, 14);
  const models = makeLiveResponseModels(document, catalog, { authorization });
  assert.equal(models.responseModels.length, 14);
  assert.deepEqual(models.responseModels.find(({ operationId }) => operationId === "GetStatusLogs").observationLabels, ["GetStatusLogs", "GetStatusLogs-recorded-day"]);

  for (const operationId of ["GetGuardianDiary", "GetDiaryData", "DownloadFoodmenuFile"]) {
    const disposition = dispositions.operations.find((item) => item.operationId === operationId);
    assert.ok(catalog.operations.some((operation) => operation.records.some((record) => record.operationId === operationId)), `${operationId} is catalog-known for this regression`);
    const skippedAuthorization = fixtureAuthorization([operationId, operationId, disposition.sourceFunctionId]);
    assert.throws(() => makeLiveResponseModels({ rawResponsesIncluded: false, observations: [observation(operationId, object({}))] }, catalog, { authorization: skippedAuthorization }), /Skipped live operation cannot be authorized/);
  }

  const substituted = structuredClone(document);
  const absenceLabel = substituted.observations.find(({ observation: label }) => label === "GetAbsenceModalData");
  substituted.observations = substituted.observations.filter(({ observation: label }) => label !== "GetUserPermissions-institution-1");
  absenceLabel.observation = "GetUserPermissions-institution-1";
  assert.throws(() => makeLiveResponseModels(substituted, catalog, { authorization }), /Missing reviewed live observation label/);

  const wrongSource = structuredClone(authorization);
  wrongSource.observations.find(({ observation: label }) => label === "GetUserData").sourceFunctionId += 1;
  assert.throws(() => makeLiveResponseModels(document, catalog, { authorization: wrongSource }), /source identity does not match catalog/);

  const missing = structuredClone(document);
  missing.observations = missing.observations.filter(({ observation: label }) => label !== "GetDayMenu");
  assert.throws(() => makeLiveResponseModels(missing, catalog, { authorization }), /Missing reviewed live observation label/);
});

test("nonempty live samples never receive implicit catalog-wide authorization", () => {
  const catalog = makeCatalog([record({ operationId: "AnyCatalogOperation", path: "/sample", pathParams: [] })]);
  const document = { rawResponsesIncluded: false, observations: [observation("AnyCatalogOperation", object({}))] };
  assert.throws(() => makeLiveResponseModels(document, catalog), /require an explicit reviewed\/test authorization fixture/);
  assert.deepEqual(makeLiveResponseModels({ rawResponsesIncluded: false, observations: [] }, catalog).responseModels, []);
});

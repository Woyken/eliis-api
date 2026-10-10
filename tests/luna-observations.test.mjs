import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { generate, validateRecord } from "../scripts/generate.mjs";
import { checkOpenApi } from "../scripts/check.mjs";
import { normalize } from "../scripts/normalize-openapi.mjs";
import { record } from "./fixtures.mjs";

const propertyObservation = {
  evidence: "Consumer #12697 reads these properties from the value returned as response.data.",
  source: 12697,
  coverage: "partial",
  propertyReads: [
    { path: "langs", type: "unknown", evidence: "Bytecode reads langs from the response.data projection." },
    { path: "country", type: "unknown", evidence: "Bytecode reads country from the response.data projection." },
  ],
};

test("client response observations validate, emit as exact metadata, and never constrain responses", async (t) => {
  const observed = record({
    operationId: "ObservedResponse",
    path: "/fixture/observed",
    pathParams: [],
    clientResponseObservations: [propertyObservation],
  });
  const unobserved = record({ operationId: "UnobservedResponse", path: "/fixture/unobserved", pathParams: [] });
  validateRecord(observed);
  for (const invalid of [
    [],
    [{ ...propertyObservation, evidence: "" }],
    [{ ...propertyObservation, propertyReads: "langs" }],
    [{ ...propertyObservation, source: -1 }],
    [{ ...propertyObservation, propertyReads: [{ path: "  ", type: "unknown", evidence: "trace" }] }],
    [{ ...propertyObservation, propertyReads: [{ path: "langs", type: "object", evidence: "trace" }] }],
    [{ ...propertyObservation, propertyReads: [{ path: "langs", type: "unknown", evidence: "" }] }],
  ]) assert.throws(() => validateRecord(record({ clientResponseObservations: invalid })), /clientResponseObservations|client response observation|response property read/);

  const root = await mkdtemp(resolve("tests", ".luna-observations-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(resolve(root, "evidence/research"), { recursive: true });
  await symlink(resolve("node_modules"), resolve(root, "node_modules"), "dir");
  await Promise.all([
    writeFile(resolve(root, "main.tsp"), await readFile("main.tsp")),
    writeFile(resolve(root, "tspconfig.yaml"), await readFile("tspconfig.yaml")),
    writeFile(resolve(root, "evidence/research/fixture.json"), JSON.stringify([observed, unobserved])),
  ]);

  const { catalog } = await generate(root);
  const emitted = await readFile(resolve(root, "routes/generated.tsp"), "utf8");
  assert.match(emitted, /x-client-response-observations/);
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [resolve("node_modules/@typespec/compiler/cmd/tsp.js"), "compile", "."], { cwd: root, timeout: 60000 });
  assert.ok(!/Diagnostics were reported/.test(stdout + stderr), stdout + stderr);
  await normalize(root);

  const document = JSON.parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.json"), "utf8"));
  const observedOperation = document.paths["/fixture/observed"].get;
  const unobservedOperation = document.paths["/fixture/unobserved"].get;
  assert.deepEqual(observedOperation["x-client-response-observations"], [propertyObservation]);
  assert.equal(Object.hasOwn(unobservedOperation, "x-client-response-observations"), false);
  for (const operation of [observedOperation, unobservedOperation]) {
    assert.deepEqual(Object.keys(operation.responses), ["default"]);
    assert.deepEqual(operation.responses.default.content, { "*/*": { schema: {} } });
  }
  assert.equal(checkOpenApi(document, catalog), 2);

  const missingMetadata = structuredClone(document);
  delete missingMetadata.paths["/fixture/observed"].get["x-client-response-observations"];
  assert.throws(() => checkOpenApi(missingMetadata, catalog), /client response observation metadata differs/);
  const inventedMetadata = structuredClone(document);
  inventedMetadata.paths["/fixture/unobserved"].get["x-client-response-observations"] = [propertyObservation];
  assert.throws(() => checkOpenApi(inventedMetadata, catalog), /client response observation metadata differs/);
  const changedMetadata = structuredClone(document);
  changedMetadata.paths["/fixture/observed"].get["x-client-response-observations"][0].propertyReads[0].path = "invented";
  assert.throws(() => checkOpenApi(changedMetadata, catalog), /client response observation metadata differs/);
});

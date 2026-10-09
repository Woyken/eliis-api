import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { bracketQueryEncoding, generate, isDeepObjectQuery, makeCatalog, makeCoverage, renderCatalog, validateRecord } from "../scripts/generate.mjs";
import { checkOpenApi } from "../scripts/check.mjs";
import { normalize, normalizeOpenApi } from "../scripts/normalize-openapi.mjs";
import { parse } from "yaml";
import { body, field, fixtures, record } from "./fixtures.mjs";

test("deterministic generation merges route aliases and preserves every evidence record", () => {
  const records = fixtures();
  const catalog = makeCatalog(records);
  assert.deepEqual(catalog, makeCatalog([...records].reverse()));
  assert.deepEqual(renderCatalog(catalog), renderCatalog(makeCatalog([...records].reverse())));
  assert.equal(catalog.researchRecordCount, 14);
  assert.equal(catalog.operationCount, 12);
  const merged = catalog.operations.find((op) => op.method === "get" && op.path === "/fixture/{itemId}");
  assert.equal(merged.records.length, 2);
  assert.deepEqual(merged.pathParams[0].observations, merged.records.map((r) => r.pathParams[0]));
  assert.equal(merged.query.find((q) => q.name === "count").optional, true);
  assert.equal(merged.pathParams[0].type, "string");
  const conflicting = catalog.operations.find((op) => op.path === "/fixture/body-alias");
  assert.equal(conflicting.body.kind, "unknown");
  assert.deepEqual(conflicting.body.fields, []);
  assert.equal(conflicting.records[0].body.fields[0].name, "left");
  assert.equal(conflicting.records[1].body.fields[0].name, "right");
});

test("same source operation name on different routes is disambiguated deterministically", () => {
  const a = record();
  const b = record({ path: "/fixture/other", pathParams: [] });
  const catalog = makeCatalog([a, b]);
  assert.deepEqual(catalog, makeCatalog([b, a]));
  assert.equal(new Set(catalog.operations.map((op) => op.operationId)).size, 2);
  assert.ok(catalog.operations.every((op) => op.aliases.includes("FixtureGet")));
  assert.throws(() => makeCatalog([a, a]), /Duplicate operationId/);
});

test("same verb/path and operation name with different source functions retains both sources", () => {
  const a = record();
  const b = record({ source: { functionId: 99, functionName: "otherFunction", line: 999 } });
  const catalog = makeCatalog([a, b]);
  assert.equal(catalog.operationCount, 1);
  assert.equal(catalog.operations[0].operationId, "FixtureGet");
  assert.equal(catalog.operations[0].records.length, 2);
});

test("invalid and speculative fields fail before compilation", () => {
  const invalid = [
    [record({ pathParams: [] }), /path parameters mismatch/],
    [record({ path: "/fixture/{fake}", pathParams: [field("itemId")] }), /path parameters mismatch/],
    [record({ path: "/fixture?invented=true", pathParams: [] }), /literal query/],
    [record({ evidence: "" }), /missing tag, summary, or evidence/],
    [record({ source: { functionId: 1, functionName: "indexOnly" } }), /missing source evidence/],
    [record({ query: [field("unproven", "object")] }), /unsupported type/],
    [record({ query: [field("mode", "string", { enum: ["guessed"] })] }), /unsupported field metadata/],
    [record({ query: [field("required", "unknown", { required: true })] }), /unsupported field metadata/],
    [record({ query: [field("unknown")], queryPassthrough: true }), /synthetic unknown query placeholder/],
    [record({ body: body([field("address.address")]) }), /invalid field name/],
    [record({ body: body([{ ...field("missing"), evidence: "" }]) }), /missing evidence/],
    [record({ body: { ...body([field("invented")]), kind: "unknown" } }), /unknown forwarded body/],
    [record({ body: body([field("categories[]")]) }), /invalid field name/],
    [record({ query: [field("files[]")] }), /invalid field name/],
    [record({ path: "/fixture/{files[]}", pathParams: [field("files[]")] }), /invalid field name/],
    [record({ body: { kind: "multipart", fields: [field("files[{index}]")], complete: false, evidence: "Synthetic dynamic construction, not a literal part." } }), /invalid field name/],
    [record({ body: { kind: "multipart", fields: [field("files[]", "unknown[]", { fields: [field("name"), field("type"), field("uri")] })], complete: false, evidence: "Synthetic native descriptor is not a wire object." } }), /must not invent nested file descriptors/],
    [record({ body: { kind: "multipart", fields: [field("targetGroups[{index}][{key}]")], complete: false, evidence: "Synthetic dynamic construction, not a literal part." } }), /invalid field name/],
    [record({ response: { kind: "unknown", evidence: "Unresolved.", status: 201 } }), /unsupported response metadata/],
    [record({ invented: true }), /unsupported operation metadata/],
    [record({ auth: "bearer" }), /unsupported auth/],
  ];
  for (const [input, pattern] of invalid) assert.throws(() => validateRecord(input), pattern);
});

test("route slots canonicalize globally without changing source semantics or colliding with retained names", () => {
  const records = [record({ path: "/fixture/{pathValue2}/{filename}", pathParams: [field("pathValue2"), field("filename")] }), record({ operationId: "Other", method: "delete", path: "/fixture/{pathValue2}/{fileId}", pathParams: [field("pathValue2"), field("fileId")] }), record({ operationId: "GetAlias", path: "/fixture/{pathValue2}/{fileId}", pathParams: [field("pathValue2"), field("fileId")] })];
  const original = structuredClone(records);
  const catalog = makeCatalog(records);
  assert.deepEqual(catalog, makeCatalog([...records].reverse()));
  assert.deepEqual(records, original, "Research records must not be rewritten");
  assert.equal(catalog.operationCount, 2, "Equivalent same-verb routes merge aliases, not HTTP methods");
  assert.ok(catalog.operations.every((op) => op.path === "/fixture/{pathValue2}/{pathValue2_}"));
  const get = catalog.operations.find((op) => op.method === "get");
  assert.deepEqual(get.pathParams[1].observations.map((p) => p.name), ["filename", "fileId"]);
  assert.deepEqual(get.records.map((r) => r.path), [original[0].path, original[2].path]);
  const queryCollision = makeCatalog([record({ query: [field("pathValue1")] }), record({ operationId: "Different", method: "delete", path: "/fixture/{filename}", pathParams: [field("filename")] })]);
  assert.ok(queryCollision.operations.every((op) => op.path === "/fixture/{pathValue1_}"), "Neutral slots must not collide with query argument names");
  const tiedSources = [record(), record({ path: "/fixture/{filename}", pathParams: [field("filename")] })];
  assert.deepEqual(makeCatalog(tiedSources), makeCatalog([...tiedSources].reverse()), "Canonical aliases with the same source ID still sort deterministically");
});

test("authentication conflicts cannot be silently merged", () => {
  assert.throws(() => makeCatalog([record(), record({ operationId: "Other", auth: "none" })]), /authentication conflict/);
});

test("production route families retain baseline coverage and filename versus ID observations", async () => {
  const files = (await readdir("evidence/research")).filter((name) => name.endsWith(".json")).sort();
  const records = (await Promise.all(files.map(async (name) => JSON.parse(await readFile(resolve("evidence/research", name), "utf8"))))).flat();
  const original = structuredClone(records);
  const catalog = makeCatalog(records);
  assert.deepEqual(records, original);
  assert.equal(catalog.researchRecordCount, 298);
  assert.equal(catalog.operationCount, 296);
  assert.deepEqual(catalog, makeCatalog([...records].reverse()));
  const inventory = JSON.parse(await readFile("evidence/inventory.json", "utf8"));
  const coverage = makeCoverage(catalog, inventory);
  assert.equal(coverage.coveredCount, 283);
  assert.equal(coverage.missingCount, 0);
  assert.deepEqual([...new Set(catalog.operations.flatMap((op) => op.records.map((r) => r.source.functionId)))].sort(), [...new Set(records.map((r) => r.source.functionId))].sort());
  const families = [
    ["/api/kindergartens/{kindergartenId}/children/{childId}/files/{pathValue3}", "fileId", ["delete", "get", "put"]],
    ["/api/kindergartens/{kindergartenId}/files/diary/{pathValue2}", "fileId", ["delete", "get", "put"]],
    ["/api/kindergartens/{kindergartenId}/files/documents/{pathValue2}", "documentId", ["delete", "get", "put"]],
    ["/api/kindergartens/{kindergartenId}/files/idea/{pathValue2}", "fileId", ["delete", "get"]],
  ];
  for (const [path, idName, methods] of families) {
    const ops = catalog.operations.filter((op) => op.path === path);
    assert.deepEqual(ops.map((op) => op.method).sort(), methods);
    for (const op of ops) {
      const name = op.method === "get" ? "filename" : idName;
      const slot = op.pathParams.at(-1);
      assert.ok(slot.observations.every((observation) => observation.name === name));
      for (const record of op.records) {
        assert.equal(record.path, path.replace(/\{pathValue\d+\}/, `{${name}}`));
        assert.deepEqual([...record.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]), op.pathParams.map((p) => p === slot ? name : p.name), "Actual URL value order is unchanged");
        assert.deepEqual(slot.observations.find((observation) => observation.evidence === record.pathParams.find((p) => p.name === name).evidence), record.pathParams.find((p) => p.name === name));
      }
    }
  }
});

test("anonymous bytecode names are preserved without invented labels", () => {
  const input = record({ source: { functionId: 38716, functionName: "", line: 1554628 } });
  validateRecord(input);
  assert.equal(makeCatalog([input]).operations[0].records[0].source.functionName, "");
});

test("coverage reports missing functions, preserves exclusions, and rejects unevidenced exclusions", () => {
  const catalog = makeCatalog([record()]);
  const inventory = { candidateFunctions: [{ functionId: 1 }, { functionId: 2 }] };
  assert.equal(makeCoverage(catalog, inventory).missingCount, 1);
  const exclusions = [{ functionId: 2, reason: "Synthetic non-HTTP helper", evidence: "Synthetic function trace contains no HTTP call." }];
  const coverage = makeCoverage(catalog, inventory, exclusions);
  assert.equal(coverage.missingCount, 0);
  assert.equal(coverage.excludedCount, 1);
  assert.deepEqual(coverage.candidates[1].exclusion, exclusions[0]);
  assert.throws(() => makeCoverage(catalog, inventory, [{ functionId: 2, reason: "No evidence" }]), /evidence/);
  assert.throws(() => makeCoverage(catalog, inventory, [{ ...exclusions[0], functionId: 1 }]), /covered exclusion/);
  assert.throws(() => makeCoverage(catalog, inventory, [exclusions[0], exclusions[0]]), /Duplicate/);
});

test("multipart normalization never discards competing media schemas", () => {
  const catalog = makeCatalog([record({ method: "post", body: { kind: "multipart", fields: [], complete: false, evidence: "Synthetic forwarded multipart." } })]);
  const document = { paths: { "/fixture/{itemId}": { post: { "x-observed-request-content-type": "multipart/form-data", requestBody: { content: { "application/json": { schema: {} }, "multipart/form-data": { schema: { properties: { competing: {} } } } } } } } } };
  const before = structuredClone(document);
  assert.throws(() => normalizeOpenApi(document, catalog), /must not discard other request media schemas/);
  assert.deepEqual(document, before);
});

test("bracket query encoding requires explicit reviewed object metadata", () => {
  for (const query of [field("opaque"), field("constructionOnly", "unknown", { fields: [field("known")] }), field("json", "string", { encoding: "JSON.stringify", fields: [field("known")] }), field("items", "unknown[]", { fields: [field("known")] })]) assert.equal(isDeepObjectQuery(query), false);
  for (const query of [field("opaque", "unknown", { encoding: bracketQueryEncoding }), field("scalar", "string", { encoding: bracketQueryEncoding, fields: [field("known")] })]) assert.throws(() => validateRecord(record({ query: [query] })), /bracket query encoding requires/);
  const marked = field("platform", "unknown", { encoding: bracketQueryEncoding, fields: [field("known", "string")] });
  assert.equal(isDeepObjectQuery(marked), true);
  const conflicted = makeCatalog([record({ query: [marked] }), record({ operationId: "Conflicting", source: { functionId: 2, functionName: "other", line: 2 }, query: [field("platform", "string", { encoding: "JSON.stringify", fields: [field("known", "string")] })] })]);
  assert.equal(isDeepObjectQuery(conflicted.operations[0].query[0]), false);
  assert.equal(conflicted.operations[0].query[0].fields, undefined);
});

test("fixture project compiles and emitted OpenAPI matches the evidence catalog exactly", async (t) => {
  const root = await mkdtemp(resolve("tests", ".generated-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(resolve(root, "evidence/research"), { recursive: true });
  await symlink(resolve("node_modules"), resolve(root, "node_modules"), "dir");
  await Promise.all([
    writeFile(resolve(root, "main.tsp"), await readFile("main.tsp")),
    writeFile(resolve(root, "tspconfig.yaml"), await readFile("tspconfig.yaml")),
    writeFile(resolve(root, "evidence/research/fixtures.json"), JSON.stringify(fixtures())),
    writeFile(resolve(root, "evidence/research/notes.md"), "Ignored research notes, not operation data."),
    writeFile(resolve(root, "evidence/inventory.json"), JSON.stringify({ candidateFunctions: [{ functionId: 1 }, { functionId: 2 }, { functionId: 3 }] })),
  ]);
  const { catalog, coverage } = await generate(root);
  assert.equal(coverage.missingCount, 0);
  const before = await readFile(resolve(root, "routes/generated.tsp"), "utf8");
  await generate(root);
  assert.equal(await readFile(resolve(root, "routes/generated.tsp"), "utf8"), before);
  const { stdout, stderr } = await promisify(execFile)(process.execPath, [resolve("node_modules/@typespec/compiler/cmd/tsp.js"), "compile", "."], { cwd: root, timeout: 60000 });
  assert.ok(!/Diagnostics were reported/.test(stdout + stderr), stdout + stderr);
  const raw = JSON.parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.json"), "utf8"));
  const expectedNormalized = structuredClone(raw);
  for (const op of catalog.operations) for (const query of op.query.filter(isDeepObjectQuery)) {
    const parameter = expectedNormalized.paths[op.path][op.method].parameters.find((p) => p.name === query.name && p.in === "query");
    parameter.style = "deepObject";
    parameter.explode = true;
  }
  for (const op of catalog.operations.filter((op) => op.body?.kind === "multipart")) {
    const body = expectedNormalized.paths[op.path][op.method].requestBody;
    body.content = { "multipart/form-data": body.content["application/json"] };
  }
  for (const op of catalog.operations.filter((op) => op.body?.kind === "unknown")) {
    const body = expectedNormalized.paths[op.path][op.method].requestBody;
    body.content = { "*/*": body.content["application/json"] };
  }
  await normalize(root);
  const document = JSON.parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.json"), "utf8"));
  const yaml = parse(await readFile(resolve(root, "tsp-output/@typespec/openapi3/openapi.yaml"), "utf8"));
  assert.deepEqual(yaml, document, "Normalized YAML and JSON must publish the same contract");
  assert.deepEqual(document, expectedNormalized, "Normalization preserves schemas/evidence while applying reviewed bracket styles, multipart media, and explicitly unknown request media ranges");
  normalizeOpenApi(document, catalog);
  assert.equal(checkOpenApi(document, catalog), 12);
  assert.equal(checkOpenApi(yaml, catalog), 12);
  assert.deepEqual(document.servers.map((server) => server.url), ["https://api.eliis.eu"]);
  for (const published of [document, yaml]) {
    for (const op of catalog.operations) {
      assert.deepEqual(Object.keys(published.paths[op.path][op.method].responses.default.content), ["*/*"], "Unknown response media must not be guessed as JSON, including file downloads");
    }
    assert.deepEqual(published.paths["/fixture/{itemId}"].put.requestBody.content, { "*/*": { schema: {} } }, "Forwarded request media remains unknown rather than JSON-only");
    const family = published.paths["/fixture/{childId}/files/{pathValue2}"];
    assert.deepEqual(Object.keys(family).sort(), ["delete", "get", "put"]);
    assert.equal(published.paths["/fixture/{childId}/files/{filename}"], undefined);
    assert.equal(published.paths["/fixture/{childId}/files/{fileId}"], undefined);
    for (const method of ["get", "put", "delete"]) {
      const originalName = method === "get" ? "filename" : "fileId";
      const op = family[method];
      assert.equal(op["x-evidence"][0].path, `/fixture/{childId}/files/{${originalName}}`);
      assert.equal(op["x-evidence"][0].pathParams[1].name, originalName);
      assert.deepEqual(op.parameters.filter((p) => p.in === "path").map((p) => p.name), ["childId", "pathValue2"]);
      const slot = op.parameters.find((p) => p.name === "pathValue2");
      assert.equal(slot["x-evidence"][0].name, originalName);
      assert.match(slot["x-evidence"][0].evidence, method === "get" ? /filename, not a database ID/ : /record ID/);
    }
    const queries = published.paths["/fixture/public"].get.parameters;
    assert.deepEqual(queries.map((p) => p.name), ["jsonPlatform", "platform", "unencodedEvidence"]);
    const platform = queries.find((p) => p.name === "platform");
    assert.equal(platform.style, "deepObject");
    assert.equal(platform.explode, true);
    assert.equal(platform.required, false);
    const schema = published.components.schemas[platform.schema.$ref.split("/").at(-1)];
    assert.deepEqual(Object.keys(schema.properties), ["platform", "browser", "login", "details"]);
    for (const name of ["platform", "browser", "login"]) assert.equal(schema.properties[name].type, "string");
    assert.equal(schema.properties.login["x-client-observed-value"], "password");
    assert.equal(schema.properties.login.enum, undefined);
    assert.equal(schema.properties.login.default, undefined);
    assert.deepEqual(schema.required ?? [], []);
    assert.deepEqual(schema.additionalProperties ?? {}, {});
    for (const name of ["jsonPlatform", "unencodedEvidence"]) {
      const parameter = queries.find((p) => p.name === name);
      assert.equal(parameter.schema.type, "string");
      assert.notEqual(parameter.style, "deepObject");
      assert.equal(parameter["x-evidence"][0].fields.length, 1);
    }
  }
  for (const servers of [undefined, [{ url: "/" }], [{ url: "https://woyken.github.io/eliis-api" }]]) {
    assert.throws(() => checkOpenApi({ ...document, servers }, catalog), /Production API server/);
  }
  const wrongStyle = structuredClone(document);
  wrongStyle.paths["/fixture/public"].get.parameters.find((p) => p.name === "platform").style = "form";
  assert.throws(() => checkOpenApi(wrongStyle, catalog), /bracket query style missing/);
  const wrongJsonStyle = structuredClone(document);
  wrongJsonStyle.paths["/fixture/public"].get.parameters.find((p) => p.name === "jsonPlatform").style = "deepObject";
  assert.throws(() => checkOpenApi(wrongJsonStyle, catalog), /unproven object query encoding/);
  const equivalentPaths = structuredClone(document);
  const family = equivalentPaths.paths["/fixture/{childId}/files/{pathValue2}"];
  equivalentPaths.paths["/fixture/{childId}/files/{filename}"] = { get: family.get };
  delete family.get;
  assert.throws(() => checkOpenApi(equivalentPaths, catalog), /Equivalent OpenAPI path templates across HTTP methods/);
  const extraQueryField = structuredClone(document);
  extraQueryField.components.schemas.FixturePublicQuery_platform_details.properties.invented = {};
  assert.throws(() => checkOpenApi(extraQueryField, catalog), /details: exact named properties/);
  const wrongQueryEvidence = structuredClone(document);
  wrongQueryEvidence.components.schemas.FixturePublicQuery_platform.properties.browser["x-evidence"][0].evidence = "Invented replacement provenance";
  assert.throws(() => checkOpenApi(wrongQueryEvidence, catalog), /browser: exact field evidence missing/);
  const deleteOp = document.paths["/fixture/{itemId}"].delete;
  assert.equal(deleteOp.operationId, "FixtureDelete");
  assert.equal(deleteOp.parameters.filter((p) => p.in === "query").length, 0, "Axios delete config.data is not query");
  const unknownPut = document.paths["/fixture/{itemId}"].put;
  assert.deepEqual(unknownPut.requestBody.content["*/*"].schema, {});
  const multipart = document.paths["/fixture/{itemId}"].post;
  assert.deepEqual(multipart.requestBody.content, { "multipart/form-data": { schema: {} } });
  const knownMultipart = document.paths["/fixture/known-multipart"].post;
  const knownMedia = knownMultipart.requestBody.content["multipart/form-data"];
  const knownSchema = document.components.schemas[knownMedia.schema.$ref.split("/").at(-1)];
  assert.deepEqual(Object.keys(knownSchema.properties), ["subject", "body", "type", "categories[]", "age_groups[]", "files[]"]);
  for (const published of [document, yaml]) {
    const schema = published.components.schemas[knownMedia.schema.$ref.split("/").at(-1)];
    for (const name of ["categories[]", "age_groups[]", "files[]"]) {
      assert.equal(schema.properties[name].type, "array");
      assert.deepEqual(schema.properties[name].items, {}, "No native file descriptor keys become wire properties");
      assert.equal(schema.properties[name]["x-evidence"][0].name, name);
      assert.match(schema.properties[name]["x-client-presence"], /server requiredness unknown/);
    }
    assert.equal(schema.properties["files[{index}]"], undefined);
    assert.equal(schema.properties["targetGroups[]"], undefined);
    assert.equal(published.paths["/fixture/known-multipart"].post["x-client-request-variants"][1].literalPartName, "files[]");
    assert.equal(published.paths["/fixture/known-multipart"].post["x-client-request-variants"][1].repeated, true);
    assert.equal(published.paths["/fixture/known-multipart"].post["x-client-request-variants"][2].dynamicPartPattern, "files[{index}]");
  }
  assert.deepEqual(Object.keys(knownSchema.properties.subject).filter((key) => !key.startsWith("x-")), []);
  assert.equal(knownSchema.properties.body.type, "string");
  assert.equal(knownSchema.properties.type["x-client-observed-value"], "synthetic");
  assert.deepEqual(knownSchema.additionalProperties ?? {}, {}, "Additional multipart parts remain unconstrained");
  assert.deepEqual(knownSchema.required ?? [], []);
  assert.equal(knownMedia.encoding, undefined);
  assert.equal(knownMultipart["x-client-request-variants"][0].dynamicPartPattern, "targetGroups[{index}][{key}]");
  assert.equal(knownSchema.properties["targetGroups[]"], undefined);
  assert.equal(knownSchema.properties["targetGroups[{index}][{key}]"], undefined);
  assert.ok(!JSON.stringify(document).includes('"BearerAuth"'));
  const mode = document.paths["/fixture/{itemId}"].get.parameters.find((param) => param.name === "mode");
  assert.equal(mode["x-client-observed-value"], "synthetic");
  assert.equal(mode.required, false);
  assert.equal(mode.schema.enum, undefined);
  assert.equal(mode.schema.default, undefined);
  for (const [name, value] of [["guardianFields", false], ["landscape", false], ["showApprovalsTable", true]]) {
    const parameter = document.paths["/fixture/{itemId}"].get.parameters.find((param) => param.name === name);
    assert.equal(parameter["x-client-observed-value"], value);
    assert.equal(parameter.schema.type, "boolean");
    assert.equal(parameter.schema.enum, undefined);
    assert.equal(parameter.schema.default, undefined);
  }
  const bad = structuredClone(document);
  bad.paths["/fixture/{itemId}"].put.responses["200"] = bad.paths["/fixture/{itemId}"].put.responses.default;
  assert.throws(() => checkOpenApi(bad, catalog), /invented response status/);
  const phantom = structuredClone(document);
  phantom.paths["/fixture/{itemId}"].post.requestBody.content["multipart/form-data"].schema = { properties: { upload: {} } };
  assert.throws(() => checkOpenApi(phantom, catalog), /forwarded body must remain unknown/);
  assert.throws(() => normalizeOpenApi(phantom, catalog), /must remain unknown/);
  const lostParts = structuredClone(document);
  lostParts.paths["/fixture/known-multipart"].post.requestBody.content["multipart/form-data"].schema = {};
  assert.throws(() => checkOpenApi(lostParts, catalog), /construction evidence missing/);
  const inventedPart = structuredClone(document);
  inventedPart.components.schemas[knownMedia.schema.$ref.split("/").at(-1)].properties["targetGroups[]"] = {};
  assert.throws(() => checkOpenApi(inventedPart, catalog), /exact named properties/);
  const encodedPart = structuredClone(document);
  encodedPart.paths["/fixture/known-multipart"].post.requestBody.content["multipart/form-data"].encoding = { subject: { contentType: "application/json" } };
  assert.throws(() => checkOpenApi(encodedPart, catalog), /unproven multipart part encodings/);
  assert.throws(() => normalizeOpenApi(encodedPart, catalog), /part encodings are unproven/);
  const nestedExtra = structuredClone(document);
  const partialSchema = nestedExtra.components.schemas.FixtureIncompleteBody;
  const detailsRef = partialSchema.properties.details.$ref ?? partialSchema.properties.details.allOf[0].$ref;
  const detailsSchema = nestedExtra.components.schemas[detailsRef.split("/").at(-1)];
  detailsSchema.properties.invented = {};
  assert.throws(() => checkOpenApi(nestedExtra, catalog), /details: exact named properties/);
  const required = structuredClone(document);
  required.paths["/fixture/{itemId}"].delete.requestBody.required = true;
  assert.throws(() => checkOpenApi(required, catalog), /unproven server-required body/);
  const synthetic = structuredClone(document);
  synthetic.paths["/fixture/{itemId}"].get.parameters.push({ name: "unknown", in: "query", schema: { type: "string" } });
  assert.throws(() => checkOpenApi(synthetic, catalog), /synthetic unknown query/);
});

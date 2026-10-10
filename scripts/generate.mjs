import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const methods = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);
const types = new Set(["unknown", "string", "boolean", "integer", "number", "string[]", "unknown[]"]);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const fail = (message) => { throw new Error(message); };
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const quote = (value) => JSON.stringify(value).replaceAll("${", "\\${");
const identifier = (value) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
const tspName = (value) => identifier(value) ? `\`${value}\`` : fail(`Unsupported TypeSpec identifier: ${value}`);
const multipartName = (value) => identifier(value) || /^[A-Za-z_][A-Za-z0-9_]*\[\]$/.test(value);
const tspPropertyName = (value) => multipartName(value) ? `\`${value}\`` : fail(`Unsupported TypeSpec property name: ${value}`);

// Decorator values are TypeSpec values, not model/type expressions.
export function tspValue(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return `#[${value.map(tspValue).join(", ")}]`;
  if (typeof value === "object") return `#{${Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => `${tspName(k)}: ${tspValue(v)}`).join(", ")}}`;
  return typeof value === "string" ? quote(value) : JSON.stringify(value);
}
const extension = (key, value) => `@extension(${quote(key)}, ${tspValue(value)})`;

// Explicit reviewed serializer metadata only; nested construction evidence alone
// does not establish encoding (and JSON.stringify must remain a string).
export const bracketQueryEncoding = "AxiosURLSearchParams brackets";
export const isDeepObjectQuery = (field) => field.type === "unknown" && field.encoding === bracketQueryEncoding && Boolean(field.fields?.length);

function validateFields(fields, context, query = false, multipart = false) {
  if (!Array.isArray(fields)) fail(`${context}: fields must be an array`);
  const names = new Set();
  for (const field of fields) {
    if (!nonempty(field.name) || !(multipart ? multipartName(field.name) : identifier(field.name))) fail(`${context}: invalid field name`);
    if (names.has(field.name)) fail(`${context}: duplicate field ${field.name}`);
    names.add(field.name);
    if (!types.has(field.type)) fail(`${context}.${field.name}: unsupported type ${field.type}`);
    if (!nonempty(field.evidence)) fail(`${context}.${field.name}: missing evidence`);
    if (field.optional !== undefined && typeof field.optional !== "boolean") fail(`${context}.${field.name}: invalid optional`);
    // Object constructions remain one logical parameter, not extra query names.
    const allowed = new Set(["name", "type", "evidence", "optional", "value", "fields", ...(query ? ["encoding"] : [])]);
    for (const key of Object.keys(field)) if (!allowed.has(key)) fail(`${context}.${field.name}: unsupported field metadata ${key}`);
    if (field.fields) {
      if (multipart && !identifier(field.name)) fail(`${context}.${field.name}: literal repeated multipart parts must not invent nested file descriptors`);
      if (!["unknown", "unknown[]"].includes(field.type) && !(query && field.type === "string" && nonempty(field.encoding))) fail(`${context}.${field.name}: nested fields require unknown object/item type or an explicitly encoded query string`);
      validateFields(field.fields, `${context}.${field.name}`);
    }
    if (field.encoding !== undefined && !nonempty(field.encoding)) fail(`${context}.${field.name}: invalid encoding`);
    if (field.encoding === bracketQueryEncoding && (!query || !isDeepObjectQuery(field))) fail(`${context}.${field.name}: bracket query encoding requires known fields on an unknown object`);
  }
}

export function validateRecord(record, context = "record") {
  if (!record || typeof record !== "object" || Array.isArray(record)) fail(`${context}: operation record must be an object`);
  const allowed = new Set(["operationId", "method", "path", "tag", "summary", "source", "evidence", "pathParams", "query", "queryPassthrough", "body", "response", "auth", "notes", "clientRequestVariants", "clientResponseObservations"]);
  for (const key of Object.keys(record)) if (!allowed.has(key)) fail(`${context}: unsupported operation metadata ${key}`);
  if (!identifier(record.operationId ?? "")) fail(`${context}: invalid operationId`);
  if (!methods.has(record.method)) fail(`${context}: unsupported method ${record.method}`);
  if (!nonempty(record.path) || !record.path.startsWith("/") || /[?#]/.test(record.path)) fail(`${context}: path must be absolute and have no literal query/fragment`);
  if (!nonempty(record.tag) || !nonempty(record.summary) || !nonempty(record.evidence)) fail(`${context}: missing tag, summary, or evidence`);
  // Hermes anonymous functions may legitimately have an empty resolved name.
  if (!Number.isInteger(record.source?.functionId) || record.source.functionId < 0 || typeof record.source.functionName !== "string" || !Number.isInteger(record.source.line) || record.source.line < 1) fail(`${context}: missing source evidence`);
  for (const key of Object.keys(record.source)) if (!["functionId", "functionName", "line"].includes(key)) fail(`${context}: unsupported source metadata ${key}`);
  if (!Array.isArray(record.pathParams) || !Array.isArray(record.query)) fail(`${context}: missing parameter arrays`);
  validateFields(record.pathParams, `${context}.pathParams`);
  validateFields(record.query, `${context}.query`, true);
  if (record.query.some((field) => field.name === "unknown")) fail(`${context}: synthetic unknown query placeholder is forbidden; use queryPassthrough with no invented names`);
  const placeholders = [...record.path.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]);
  if (/[{}]/.test(record.path.replace(/\{[^{}]+\}/g, "")) || placeholders.some((p) => !identifier(p))) fail(`${context}: invalid route template`);
  const expected = [...new Set(placeholders)].sort(compare);
  const actual = record.pathParams.map((p) => p.name).sort(compare);
  if (!equal(expected, actual)) fail(`${context}: path parameters mismatch: ${expected} vs ${actual}`);
  if (record.pathParams.some((p) => p.optional === true)) fail(`${context}: path parameters cannot be optional`);
  if (typeof record.queryPassthrough !== "boolean") fail(`${context}: queryPassthrough must be explicit`);
  if (!["cookie", "none", "unknown"].includes(record.auth)) fail(`${context}: unsupported auth`);
  if (record.response?.kind !== "unknown" || !nonempty(record.response.evidence)) fail(`${context}: unresolved response evidence required; observed samples must be modeled separately`);
  for (const key of Object.keys(record.response)) if (!["kind", "evidence"].includes(key)) fail(`${context}: unsupported response metadata ${key}`);
  if (record.body !== null) {
    const body = record.body;
    if (!body || !["unknown", "object", "multipart"].includes(body.kind) || !nonempty(body.evidence) || typeof body.complete !== "boolean") fail(`${context}: invalid request body`);
    validateFields(body.fields, `${context}.body`, false, body.kind === "multipart");
    for (const key of Object.keys(body)) if (!["kind", "fields", "evidence", "complete"].includes(key)) fail(`${context}: unsupported body metadata ${key}`);
    if (body.kind === "unknown" && (body.fields.length || body.complete)) fail(`${context}: unknown forwarded body must not fabricate fields or completeness`);
  }
  if (record.notes !== undefined && (!Array.isArray(record.notes) || record.notes.some((note) => typeof note !== "string"))) fail(`${context}: invalid notes`);
  if (record.clientRequestVariants !== undefined) {
    if (!Array.isArray(record.clientRequestVariants)) fail(`${context}: clientRequestVariants must be an array`);
    for (const variant of record.clientRequestVariants) {
      if (!variant || typeof variant !== "object" || !nonempty(variant.evidence)) fail(`${context}: each client request variant needs evidence`);
      // Variants are non-normative, callsite-scoped observations. Only normalized
      // fields are accepted when supplied; no dotted paths become wire properties.
      if (variant.fields !== undefined) validateFields(variant.fields, `${context}.clientRequestVariants`, false, record.body?.kind === "multipart");
    }
  }
  if (record.clientResponseObservations !== undefined) {
    const observations = record.clientResponseObservations;
    if (!Array.isArray(observations) || observations.length === 0) fail(`${context}: clientResponseObservations must be a nonempty array`);
    for (const observation of observations) {
      if (!observation || typeof observation !== "object" || Array.isArray(observation) || !nonempty(observation.evidence)) fail(`${context}: each client response observation needs evidence`);
      const observationAllowed = new Set(["evidence", "source", "propertyReads", "coverage"]);
      for (const key of Object.keys(observation)) if (!observationAllowed.has(key)) fail(`${context}: unsupported client response observation metadata ${key}`);
      if (observation.source !== undefined && !((Number.isInteger(observation.source) && observation.source >= 0) || nonempty(observation.source))) fail(`${context}: invalid client response observation source`);
      if (!Array.isArray(observation.propertyReads)) fail(`${context}: client response observation propertyReads must be an array`);
      if (!nonempty(observation.coverage)) fail(`${context}: client response observation coverage is required`);
      for (const read of observation.propertyReads) {
        if (!read || typeof read !== "object" || Array.isArray(read) || !nonempty(read.path) || !types.has(read.type) || !nonempty(read.evidence)) fail(`${context}: each response property read needs a logical path, supported type, and evidence`);
        for (const key of Object.keys(read)) if (!["path", "type", "evidence"].includes(key)) fail(`${context}: unsupported response property read metadata ${key}`);
      }
    }
  }
}

const fieldShape = (field) => ({ ...field, evidence: undefined, fields: field.fields?.map(fieldShape) });
const bodyShape = (body) => body === null ? null : { ...body, evidence: undefined, fields: body.fields.map(fieldShape) };

export function makeCatalog(records) {
  const ids = new Map();
  const observations = new Set();
  const groups = new Map();
  const routeShapes = new Map();
  const routeReservedNames = new Map();
  // OpenAPI path equivalence is global, not scoped to the HTTP verb. Only
  // conflicting transport slots get neutral names; source records stay intact.
  for (const record of records) {
    validateRecord(record, record.operationId);
    const shape = record.path.replace(/\{[^}]+\}/g, "{}");
    const names = [...record.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
    if (!routeShapes.has(shape)) routeShapes.set(shape, names.map(() => new Set()));
    names.forEach((name, index) => routeShapes.get(shape)[index].add(name));
    if (!routeReservedNames.has(shape)) routeReservedNames.set(shape, new Set());
    for (const name of [...names, ...record.query.map((field) => field.name), ...(record.body ? ["requestBody"] : [])]) routeReservedNames.get(shape).add(name);
  }
  for (const [shape, slots] of routeShapes) {
    const reserved = routeReservedNames.get(shape);
    const names = slots.map((slot, index) => {
      if (slot.size === 1) return [...slot][0];
      let name = `pathValue${index + 1}`;
      while (reserved.has(name)) name += "_";
      reserved.add(name);
      return name;
    });
    let index = 0;
    routeShapes.set(shape, { path: shape.replace(/\{\}/g, () => `{${names[index++]}}`), names });
  }
  for (const record of records) {
    const sourceKey = `${record.method} ${record.path}`;
    const canonical = routeShapes.get(record.path.replace(/\{[^}]+\}/g, "{}"));
    const key = `${record.method} ${canonical.path}`;
    const observation = `${sourceKey} ${record.operationId} ${record.source.functionId}`;
    if (observations.has(observation)) fail(`Duplicate operationId/source observation ${observation}`);
    observations.add(observation);
    ids.set(record.operationId, [...new Set([...(ids.get(record.operationId) ?? []), key])]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  const operations = [...groups.entries()].sort(([a], [b]) => compare(a, b)).map(([, aliases]) => {
    aliases.sort((a, b) => compare(a.operationId, b.operationId) || a.source.functionId - b.source.functionId || compare(a.path, b.path));
    const first = aliases[0];
    const canonical = routeShapes.get(first.path.replace(/\{[^}]+\}/g, "{}"));
    const sourceNames = aliases.map((r) => [...r.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]));
    if (aliases.some((r) => r.auth !== first.auth)) fail(`${first.operationId}: alias authentication conflict`);
    const queryNames = [...new Set(aliases.flatMap((r) => r.query.map((q) => q.name)))].sort(compare);
    const query = queryNames.map((name) => {
      const variants = aliases.flatMap((r) => r.query.filter((p) => p.name === name));
      const shape = fieldShape(variants[0]);
      const compatible = variants.every((p) => equal(fieldShape(p), shape));
      return { ...variants[0], type: compatible ? variants[0].type : "unknown", optional: variants.length !== aliases.length || variants.some((p) => p.optional === true), ...(compatible ? {} : { value: undefined, encoding: undefined, fields: undefined }), observations: variants };
    });
    const bodyCompatible = aliases.every((r) => equal(bodyShape(r.body), bodyShape(first.body)));
    // Conflicting alias bodies are retained as evidence variants, not combined into a fake object.
    const body = bodyCompatible ? first.body : { kind: "unknown", fields: [], complete: false, evidence: "Alias request body shapes differ; see x-evidence for the individual constructions." };
    return {
      operationId: ids.get(first.operationId).length === 1 ? first.operationId : `${first.operationId}_${first.method}_${first.path.replace(/[{}]/g, "").replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_|_$/g, "")}`,
      method: first.method, path: canonical.path, tag: first.tag, summary: first.summary,
      pathParams: [...new Set(canonical.names)].map((name) => {
        const index = canonical.names.indexOf(name);
        const observations = aliases.map((r, aliasIndex) => r.pathParams.find((p) => p.name === sourceNames[aliasIndex][index]));
        return { ...observations[0], name, type: "string", observations };
      }),
      query, queryPassthrough: aliases.some((r) => r.queryPassthrough), body,
      bodyOptional: aliases.some((r) => r.body === null), bodyVariantsUnresolved: !bodyCompatible,
      auth: first.auth, aliases: [...new Set(aliases.map((r) => r.operationId))], records: aliases,
    };
  });
  if (new Set(operations.map((op) => op.operationId)).size !== operations.length) fail("Duplicate generated operationIds after deterministic route disambiguation");
  return { schemaVersion: 1, researchRecordCount: records.length, operationCount: operations.length, operations };
}

export function renderCatalog(catalog) {
  const prelude = '// Generated by scripts/generate.mjs. Edit research evidence, not this file.\nusing TypeSpec.Http;\nusing TypeSpec.OpenAPI;\nnamespace Eliis;\n';
  const models = [prelude];
  const routes = [prelude];
  function renderBodyModel(name, fields, body, observations) {
    const properties = [];
    for (const field of fields) {
      const fieldObservations = observations.flatMap((b) => b.fields?.filter((p) => p.name === field.name) ?? []);
      let type = fieldType(field.type);
      if (field.fields) {
        const nestedName = `${name}_${field.name}`;
        renderBodyModel(nestedName, field.fields, { complete: false }, fieldObservations);
        type = field.type === "unknown[]" ? `${nestedName}[]` : nestedName;
      }
      properties.push(`  ${extension("x-evidence", fieldObservations)}`);
      properties.push(`  ${extension("x-client-presence", field.optional ? "conditional; server requiredness unknown" : "present in traced construction; server requiredness unknown")}`);
      if (Object.hasOwn(field, "value")) properties.push(`  ${extension("x-client-observed-value", field.value)}`);
      properties.push(`  ${tspPropertyName(field.name)}?: ${type};`);
    }
    models.push(extension("x-client-construction", { complete: body.complete, serverValidation: "unknown", evidence: observations }));
    models.push(`model ${name} extends Record<unknown> {`, ...properties);
    models.push("}\n");
  }
  for (const op of catalog.operations) {
    let bodyType = "unknown";
    if (op.body?.kind === "object" || (op.body?.kind === "multipart" && op.body.fields.length)) {
      bodyType = `${op.operationId}Body`;
      renderBodyModel(bodyType, op.body.fields, op.body, op.records.map((r) => r.body));
    }
    routes.push(`@route(${quote(op.path)})`, `@${op.method}`, `@tag(${quote(op.tag)})`, `@summary(${quote(op.summary)})`);
    routes.push(`@useAuth(${op.auth === "cookie" ? "EliisCookieAuth" : "NoAuth"})`);
    routes.push(extension("x-auth-evidence", { observed: op.auth, serverRequirement: "unknown" }));
    routes.push(extension("x-evidence", op.records));
    routes.push(extension("x-operation-aliases", op.aliases));
    const clientVariants = op.records.flatMap((record) => record.clientRequestVariants ?? []);
    if (clientVariants.length) routes.push(extension("x-client-request-variants", clientVariants));
    const clientResponseObservations = op.records.flatMap((record) => record.clientResponseObservations ?? []);
    if (clientResponseObservations.length) routes.push(extension("x-client-response-observations", clientResponseObservations));
    routes.push(extension("x-unresolved-response", { statusCodes: "unknown", mediaTypes: "unknown", body: "unknown", evidence: op.records.map((r) => r.response) }));
    if (op.queryPassthrough) routes.push(extension("x-unresolved-query", { reason: "Client forwards an untraced params object; no additional named parameters inferred.", sources: op.records.filter((r) => r.queryPassthrough).map((r) => r.source) }));
    if (op.body) routes.push(extension("x-request-body-evidence", { variants: op.records.map((r) => r.body), complete: op.body.complete, serverValidation: "unknown", unresolved: op.body.kind === "unknown" || op.body.kind === "multipart" || !op.body.complete || op.bodyVariantsUnresolved }));
    const params = [];
    for (const p of op.pathParams) params.push(`${extension("x-evidence", p.observations)} ${extension("x-transport-type", "string serialization only; server domain type unknown")} @path ${tspName(p.name)}: string`);
    for (const p of op.query) {
      const unresolved = p.type === "unknown" || p.type === "unknown[]" || p.encoding;
      const deepObject = isDeepObjectQuery(p);
      let type = unresolved ? "string" : fieldType(p.type);
      if (deepObject) {
        type = `${op.operationId}Query_${p.name}`;
        renderBodyModel(type, p.fields, { complete: false }, p.observations);
      }
      params.push(`${extension("x-evidence", p.observations)} ${extension("x-client-presence", p.optional ? "conditional; server requiredness unknown" : "present in traced query construction; server requiredness unknown")} ${Object.hasOwn(p, "value") && p.value !== undefined ? extension("x-client-observed-value", p.value) + " " : ""}${deepObject ? extension("x-observed-query-encoding", bracketQueryEncoding) + " " : unresolved ? extension("x-transport-type", "string serialization only; original value/shape unresolved or encoded") + " " : ""}@query ${tspName(p.name)}?: ${type}`);
    }
    if (op.body) {
      if (op.body.kind === "unknown") routes.push(extension("x-unresolved-request-content-type", "Forwarded data and its serialization are unresolved; no JSON-only media contract is inferred."));
      if (op.body.kind === "multipart") routes.push(extension("x-observed-request-content-type", "multipart/form-data"));
      routes.push(extension("x-client-body-presence", op.bodyOptional ? "not present in every observed alias; server requiredness unknown" : "supplied by observed client call; server requiredness unknown"));
      params.push(`${extension("x-evidence", op.records.map((r) => r.body))} @body requestBody?: ${bodyType}`);
    }
    routes.push(`op ${tspName(op.operationId)}(\n  ${params.join(",\n  ")}\n): UnresolvedResponse;\n`);
  }
  return { models: models.join("\n"), routes: routes.join("\n") };
}

function fieldType(type) {
  return ({ unknown: "unknown", string: "string", boolean: "boolean", integer: "integer", number: "numeric", "string[]": "string[]", "unknown[]": "unknown[]" })[type] ?? fail(`Unsupported type ${type}`);
}

async function optionalJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}

export function makeCoverage(catalog, inventory, exclusions = []) {
  if (!Array.isArray(inventory.candidateFunctions)) fail("Inventory candidateFunctions must be an array");
  if (!Array.isArray(exclusions)) fail("Coverage exclusions must be an array");
  const covered = new Set(catalog.operations.flatMap((op) => op.records.map((r) => r.source.functionId)));
  const excluded = new Map();
  for (const exclusion of exclusions) {
    if (!Number.isInteger(exclusion.functionId) || !nonempty(exclusion.evidence) || !nonempty(exclusion.reason)) fail("Every coverage exclusion needs functionId, evidence, and reason");
    if (excluded.has(exclusion.functionId) || covered.has(exclusion.functionId)) fail(`Duplicate or covered exclusion ${exclusion.functionId}`);
    excluded.set(exclusion.functionId, exclusion);
  }
  const candidates = inventory.candidateFunctions.map((candidate) => ({ ...candidate, status: covered.has(candidate.functionId) ? "covered" : excluded.has(candidate.functionId) ? "excluded" : "missing", ...(excluded.has(candidate.functionId) ? { exclusion: excluded.get(candidate.functionId) } : {}) }));
  return { schemaVersion: 1, candidateCount: candidates.length, coveredCount: candidates.filter((c) => c.status === "covered").length, excludedCount: candidates.filter((c) => c.status === "excluded").length, missingCount: candidates.filter((c) => c.status === "missing").length, candidates, additionalFunctionIds: [...covered].filter((id) => !candidates.some((c) => c.functionId === id)).sort((a, b) => a - b) };
}

export async function generate(root = process.cwd()) {
  const researchDir = resolve(root, "evidence/research");
  const files = (await readdir(researchDir)).filter((file) => file.endsWith(".json")).sort(compare);
  const records = [];
  for (const file of files) {
    const data = JSON.parse(await readFile(resolve(researchDir, file), "utf8"));
    if (!Array.isArray(data)) fail(`${file}: research JSON must be an operation array`);
    for (const record of data) { validateRecord(record, file); records.push(record); }
  }
  const catalog = makeCatalog(records);
  const exclusions = await optionalJson(resolve(root, "evidence/coverage-exclusions.json"), []);
  const inventory = await optionalJson(resolve(root, "evidence/inventory.json"), { candidateFunctions: [] });
  const coverage = makeCoverage(catalog, inventory, exclusions);
  const rendered = renderCatalog(catalog);
  for (const dir of ["models", "routes", "scripts"]) await mkdir(resolve(root, dir), { recursive: true });
  await Promise.all([
    writeFile(resolve(root, "models/generated.tsp"), rendered.models),
    writeFile(resolve(root, "routes/generated.tsp"), rendered.routes),
    writeFile(resolve(root, "scripts/operation-catalog.json"), JSON.stringify(catalog, null, 2) + "\n"),
    writeFile(resolve(root, "scripts/coverage.json"), JSON.stringify(coverage, null, 2) + "\n"),
  ]);
  console.log(`Generated ${catalog.operationCount} operations from ${catalog.researchRecordCount} evidence records; ${coverage.missingCount} inventory functions missing.`);
  return { catalog, coverage };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generate();

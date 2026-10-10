import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateLiveObservations } from "./check-live-observations.mjs";

const methods = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);
const types = new Set(["unknown", "string", "boolean", "integer", "number", "string[]", "unknown[]"]);
const responseKinds = new Set(["object", "array", "scalar", "unknown", "binary"]);
const responseFieldTypes = new Set(["unknown", "object", "array", "string", "boolean", "integer", "number"]);
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

const responseSchemaShape = (entry) => ({
  kind: entry.kind,
  scalarType: entry.scalarType,
  fields: entry.fields?.map(responseFieldSchemaShape),
  items: entry.items ? responseItemSchemaShape(entry.items) : undefined,
});
const responseFieldSchemaShape = (field) => ({
  name: field.name, type: field.type,
  fields: field.fields?.map(responseFieldSchemaShape),
  items: field.items ? responseItemSchemaShape(field.items) : undefined,
});
const responseItemSchemaShape = (item) => ({
  kind: item.kind, scalarType: item.scalarType,
  fields: item.fields?.map(responseFieldSchemaShape),
  items: item.items ? responseItemSchemaShape(item.items) : undefined,
});
const responseFieldEvidenceShape = (field) => ({ name: field.name, evidence: field.evidence, fields: field.fields?.map(responseFieldEvidenceShape), items: field.items ? responseItemEvidenceShape(field.items) : undefined });
const responseItemEvidenceShape = (item) => ({ evidence: item.evidence, fields: item.fields?.map(responseFieldEvidenceShape), items: item.items ? responseItemEvidenceShape(item.items) : undefined });
const responseEvidenceShape = (entry) => ({ evidence: entry.evidence, fields: entry.fields?.map(responseFieldEvidenceShape), items: entry.items ? responseItemEvidenceShape(entry.items) : undefined });

function validateResponseFields(fields, context) {
  if (!Array.isArray(fields)) fail(`${context}: fields must be an array`);
  const names = new Set();
  for (const field of fields) {
    if (!field || typeof field !== "object" || Array.isArray(field) || !identifier(field.name ?? "")) fail(`${context}: invalid response field name`);
    if (names.has(field.name)) fail(`${context}: duplicate response field ${field.name}`);
    names.add(field.name);
    if (!responseFieldTypes.has(field.type) || !nonempty(field.evidence)) fail(`${context}.${field.name}: unsupported type or missing field evidence`);
    for (const key of Object.keys(field)) if (!["name", "type", "evidence", "fields", "items"].includes(key)) fail(`${context}.${field.name}: unsupported response field metadata ${key}`);
    if (field.type === "object") {
      if (field.fields !== undefined) validateResponseFields(field.fields, `${context}.${field.name}`);
    } else if (field.fields !== undefined) fail(`${context}.${field.name}: fields are only valid for object fields`);
    if (field.type === "array") {
      if (field.items !== undefined) validateResponseItem(field.items, `${context}.${field.name}[]`);
    } else if (field.items !== undefined) fail(`${context}.${field.name}: items are only valid for array fields`);
  }
}

function validateResponseItem(item, context) {
  if (!item || typeof item !== "object" || Array.isArray(item) || !["object", "array", "scalar", "unknown"].includes(item.kind) || !nonempty(item.evidence)) fail(`${context}: invalid response item shape/evidence`);
  for (const key of Object.keys(item)) if (!["kind", "fields", "evidence", "items", "scalarType"].includes(key)) fail(`${context}: unsupported response item metadata ${key}`);
  if (item.kind === "object") {
    if (item.fields !== undefined) validateResponseFields(item.fields, context);
  } else if (item.fields !== undefined) fail(`${context}: fields only allowed on object items`);
  if (item.kind === "array") {
    if (item.items !== undefined) validateResponseItem(item.items, `${context}[]`);
  } else if (item.items !== undefined) fail(`${context}: items only allowed on array items`);
  if (item.kind === "scalar" && !["string", "boolean", "integer", "number"].includes(item.scalarType)) fail(`${context}: scalar item needs a supported scalarType`);
  if (item.kind !== "scalar" && item.scalarType !== undefined) fail(`${context}: scalarType only allowed on scalar items`);
}

export function validateResponseAnalysis(entry, context = "response") {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) fail(`${context}: analysis must be an object`);
  const allowed = new Set(["operationId", "sourceFunctionId", "kind", "evidence", "trace", "fields", "complete", "limitations", "scalarType", "items"]);
  for (const key of Object.keys(entry)) if (!allowed.has(key)) fail(`${context}: unsupported response analysis metadata ${key}`);
  if (!identifier(entry.operationId ?? "") || !Number.isInteger(entry.sourceFunctionId) || entry.sourceFunctionId < 0) fail(`${context}: invalid operation/source key`);
  if (!responseKinds.has(entry.kind) || !nonempty(entry.evidence)) fail(`${context}: kind and evidence are required`);
  if (!Array.isArray(entry.trace) || entry.trace.some((item) => !item || !Number.isInteger(item.functionId) || item.functionId < 0 || (item.line !== undefined && (!Number.isInteger(item.line) || item.line < 1)) || !nonempty(item.evidence) || Object.keys(item).some((key) => !["functionId", "line", "evidence"].includes(key)))) fail(`${context}: invalid response trace evidence`);
  if (!Array.isArray(entry.fields) || !Array.isArray(entry.limitations) || entry.limitations.some((value) => typeof value !== "string") || entry.complete !== false) fail(`${context}: fields, limitations, and complete:false are required`);
  if (entry.kind === "object") validateResponseFields(entry.fields, context);
  else if (entry.fields.length) fail(`${context}: non-object response kinds cannot have fields`);
  if (entry.kind === "scalar" && !["string", "boolean", "integer", "number"].includes(entry.scalarType)) fail(`${context}: scalar response needs a supported scalarType`);
  if (entry.kind !== "scalar" && entry.scalarType !== undefined) fail(`${context}: scalarType only allowed for scalar responses`);
  if (entry.kind === "array") {
    if (entry.items !== undefined) validateResponseItem(entry.items, `${context}[]`);
  } else if (entry.items !== undefined) fail(`${context}: items only allowed for array responses`);
  if (entry.kind === "binary" && entry.fields.length) fail(`${context}: binary transport metadata must not become body fields`);
  return entry;
}

/** Match static response rows one-to-one with research observations, then safely resolve aliases. */
export function makeResponseCatalog(catalog, responseFiles = [], { strict = true } = {}) {
  const expectedRows = catalog.operations.flatMap((op) => op.records.map((record) => ({ operationId: record.operationId, sourceFunctionId: record.source.functionId, op, record })));
  const expectedKeys = new Map();
  for (const row of expectedRows) {
    const key = `${row.operationId}\0${row.sourceFunctionId}`;
    if (expectedKeys.has(key)) fail(`Research observations are not uniquely keyed by operationId/sourceFunctionId: ${row.operationId}/${row.sourceFunctionId}`);
    expectedKeys.set(key, row);
  }
  const analyses = new Map();
  for (const file of responseFiles) {
    if (!Array.isArray(file.entries)) fail(`${file.name}: response JSON must be an array`);
    for (const raw of file.entries) {
      const entry = validateResponseAnalysis(raw, `${file.name}:${raw?.operationId ?? "?"}`);
      const key = `${entry.operationId}\0${entry.sourceFunctionId}`;
      if (!expectedKeys.has(key)) fail(`${file.name}: unexpected response analysis ${entry.operationId}/${entry.sourceFunctionId}`);
      if (analyses.has(key)) fail(`${file.name}: duplicate response analysis ${entry.operationId}/${entry.sourceFunctionId}`);
      analyses.set(key, entry);
    }
  }
  const missing = [...expectedKeys.keys()].filter((key) => !analyses.has(key));
  if (strict && missing.length) fail(`Missing static response analysis for ${missing.length} research observation(s): ${missing.map((key) => key.replace("\0", "/")).join(", ")}`);
  const operations = catalog.operations.map((op) => {
    const observations = op.records.map((record) => ({ operationId: record.operationId, sourceFunctionId: record.source.functionId, analysis: analyses.get(`${record.operationId}\0${record.source.functionId}`) ?? null }));
    const present = observations.map((item) => item.analysis).filter(Boolean);
    let disposition = "unknown";
    let analysis = null;
    let reason = "No static response analysis is available.";
    if (!present.length && !strict) reason = "Legacy mode: evidence/responses is absent; response remains unresolved.";
    else if (present.length !== observations.length) reason = "One or more route-alias observations lack static response analysis.";
    else {
      const first = present[0];
      const same = present.every((item) => equal(responseSchemaShape(item), responseSchemaShape(first)) && equal(responseEvidenceShape(item), responseEvidenceShape(first)));
      if (!same) reason = "Alias response analyses conflict in shape or evidence; no merged body model is emitted.";
      else if (first.kind === "object" || first.kind === "array" || first.kind === "scalar") {
        disposition = "modeled";
        analysis = first;
        reason = "Partial static-derived client-observed body view; not a complete or guaranteed server contract.";
      } else if (first.kind === "binary") {
        disposition = "binary";
        reason = "Opaque binary/native download body; native job metadata is not the HTTP body.";
      }
      else reason = "Static analysis explicitly leaves the response body unknown.";
    }
    return { operationId: op.operationId, disposition, reason, analysis, observations };
  });
  const recordCount = expectedRows.length;
  return { schemaVersion: 1, analysisRequired: strict, researchObservationCount: recordCount, canonicalOperationCount: catalog.operationCount, analyzedObservationCount: analyses.size, missingObservationCount: missing.length, modeledOperationCount: operations.filter((op) => op.disposition === "modeled").length, unknownOperationCount: operations.filter((op) => op.disposition === "unknown").length, binaryOperationCount: operations.filter((op) => op.disposition === "binary").length, operations, missing: missing.map((key) => key.replace("\0", "/")) };
}

const liveObservationAliases = new Map([
  ["StatusLogs", "GetStatusLogs"],
  ["StatusLogs-recorded-day", "GetStatusLogs"],
  ["GetStatusLogs-recorded-day", "GetStatusLogs"],
  ["GetUserPermissions-institution-1", "GetUserPermissions"],
]);
const skippedLiveOperationIds = new Set(["GetGuardianDiary", "GetDiaryData", "DownloadFoodmenuFile"]);
const observedPrimitiveTypes = new Set(["string", "integer", "number", "boolean"]);

function sampleLabelFromReference(reference, context) {
  const match = /^evidence\/live-audit\/observed-shapes\.json#([A-Za-z][A-Za-z0-9-]*)$/.exec(reference ?? "");
  if (!match) fail(`${context}: expected an observed-shapes label reference`);
  return match[1];
}

/** Build the exact nonempty sample allowlist from the reviewed path dispositions. */
export function makeLiveObservationAuthorization(dispositions) {
  if (!dispositions || !Array.isArray(dispositions.operations) || !dispositions.summary) fail("Live path dispositions are required for nonempty authenticated samples");
  const expectedSkipped = new Map([
    ["GetGuardianDiary", 25630],
    ["GetDiaryData", 25935],
    ["DownloadFoodmenuFile", 37318],
  ]);
  const labels = [];
  const seenOperations = new Set();
  const seenSkipped = new Set();
  for (const item of dispositions.operations) {
    if (!item || typeof item.operationId !== "string" || !Number.isInteger(item.sourceFunctionId)) fail("Live path disposition is missing operation/source identity");
    if (item.disposition === "skipped") {
      if (expectedSkipped.has(item.operationId)) {
        if (item.sourceFunctionId !== expectedSkipped.get(item.operationId)) fail(`Live skipped operation source identity mismatch: ${item.operationId}`);
        seenSkipped.add(item.operationId);
      }
      continue;
    }
    if (item.disposition !== "sampled") continue;
    if (skippedLiveOperationIds.has(item.operationId)) fail(`Skipped live operation cannot be authorized: ${item.operationId}`);
    if (seenOperations.has(item.operationId)) fail(`Duplicate sampled operation disposition: ${item.operationId}`);
    seenOperations.add(item.operationId);
    const refs = item.provenance?.sampleShapes ?? (item.provenance?.sampleShape ? [item.provenance.sampleShape] : []);
    if (!Array.isArray(refs) || !refs.length) fail(`${item.operationId}: sampled disposition has no reviewed observation label reference`);
    const operationLabels = refs.map((reference) => sampleLabelFromReference(reference, item.operationId));
    if (new Set(operationLabels).size !== operationLabels.length) fail(`${item.operationId}: duplicate reviewed observation labels`);
    if (item.sampleObservationCount !== operationLabels.length) fail(`${item.operationId}: reviewed observation label count differs from disposition`);
    for (const label of operationLabels) labels.push({ observation: label, operationId: item.operationId, sourceFunctionId: item.sourceFunctionId });
  }
  if (expectedSkipped.size !== seenSkipped.size) fail("Live path dispositions do not contain all reviewed skipped-operation identities");
  const { uniqueScopedOperations, sampledOperations, skippedOperations, bodyObservations, sampleOperationModels, sampleObservationLabels } = dispositions.summary;
  const actual = { uniqueScopedOperations: seenOperations.size + seenSkipped.size, sampledOperations: seenOperations.size, skippedOperations: seenSkipped.size, bodyObservations: labels.length, sampleOperationModels: seenOperations.size, sampleObservationLabels: labels.length };
  const expected = { uniqueScopedOperations, sampledOperations, skippedOperations, bodyObservations, sampleOperationModels, sampleObservationLabels };
  if (JSON.stringify(actual) !== JSON.stringify(expected) || JSON.stringify(actual) !== JSON.stringify({ uniqueScopedOperations: 17, sampledOperations: 14, skippedOperations: 3, bodyObservations: 15, sampleOperationModels: 14, sampleObservationLabels: 15 })) {
    fail(`Live path disposition coverage differs from reviewed sample set: ${JSON.stringify(actual)}`);
  }
  if (labels.length !== 15 || new Set(labels.map((entry) => entry.observation)).size !== 15) fail("Reviewed live observation labels must be exactly 15 unique labels");
  return { exact: true, observations: labels };
}

function liveModelName(operationId) {
  return `Observed_${operationId}`;
}

function observedShapeType(shape) {
  if (shape.observedType === "null") return "unknown";
  if (observedPrimitiveTypes.has(shape.observedType)) return shape.observedType;
  return shape.observedType;
}

/** Merge shapes without inventing unions/nullability or treating absent fields as required. */
function mergeObservedShapes(shapes) {
  const types = new Set(shapes.map(observedShapeType));
  if (types.size !== 1 || types.has("unknown")) return { type: "unknown" };
  const [type] = types;
  if (type === "object") {
    const keys = [...new Set(shapes.flatMap((shape) => Object.keys(shape.properties)))].sort(compare);
    const properties = {};
    for (const key of keys) {
      const variants = shapes.flatMap((shape) => Object.hasOwn(shape.properties, key) ? [shape.properties[key]] : []);
      properties[key] = mergeObservedShapes(variants);
    }
    return { type, properties };
  }
  if (type === "array") {
    const itemShapes = shapes.flatMap((shape) => shape.observedItemShapes);
    return { type, items: itemShapes.length ? mergeObservedShapes(itemShapes) : { type: "unknown" } };
  }
  return { type };
}

function toSampleJsonSchema(shape) {
  if (shape.type === "unknown") return {};
  if (shape.type === "object") {
    const properties = Object.fromEntries(Object.entries(shape.properties).map(([name, child]) => [name, toSampleJsonSchema(child)]));
    return { type: "object", properties, additionalProperties: true };
  }
  if (shape.type === "array") return { type: "array", items: toSampleJsonSchema(shape.items) };
  return { type: shape.type };
}

/** Construct named sample views separately from the normative/static response catalog. */
export function makeLiveResponseModels(document, catalog, { authorization } = {}) {
  validateLiveObservations(document);
  if (document.observations.length && !authorization) fail("Nonempty live observations require an explicit reviewed/test authorization fixture");
  const authorized = new Map();
  if (authorization !== undefined) {
    if (!authorization || authorization.exact !== true || !Array.isArray(authorization.observations)) fail("Live observation authorization must be an explicit exact label set");
    for (const entry of authorization.observations) {
      if (!entry || typeof entry.observation !== "string" || typeof entry.operationId !== "string" || !Number.isInteger(entry.sourceFunctionId)) fail("Live observation authorization needs label, operationId, and sourceFunctionId");
      if (authorized.has(entry.observation)) fail(`Duplicate authorized live observation label: ${entry.observation}`);
      if (skippedLiveOperationIds.has(entry.operationId)) fail(`Skipped live operation cannot be authorized: ${entry.operationId}`);
      authorized.set(entry.observation, entry);
    }
  }
  const observedLabels = new Set(document.observations.map((observation) => observation.observation));
  for (const observation of document.observations) {
    const approval = authorized.get(observation.observation);
    if (!approval) fail(`Live observation label is not in the reviewed authorization set: ${observation.observation}`);
    const mappedOperationId = liveObservationAliases.get(observation.observation) ?? observation.observation;
    if (mappedOperationId !== approval.operationId) fail(`Live observation ${observation.observation} substitutes an approved label for ${approval.operationId}`);
    if (!catalog.operations.some((operation) => operation.records.some((record) => record.operationId === approval.operationId && record.source.functionId === approval.sourceFunctionId))) {
      fail(`Live observation ${observation.observation} source identity does not match catalog operation ${approval.operationId}/${approval.sourceFunctionId}`);
    }
  }
  if (authorization?.exact) {
    const missing = [...authorized.keys()].filter((label) => !observedLabels.has(label)).sort(compare);
    if (missing.length) fail(`Missing reviewed live observation label(s): ${missing.join(", ")}`);
    const unexpected = [...observedLabels].filter((label) => !authorized.has(label)).sort(compare);
    if (unexpected.length) fail(`Unexpected reviewed live observation label(s): ${unexpected.join(", ")}`);
  }
  const operationIds = new Set(catalog.operations.map((operation) => operation.operationId));
  const grouped = new Map();
  for (const observation of document.observations) {
    const operationId = liveObservationAliases.get(observation.observation) ?? observation.observation;
    if (!operationIds.has(operationId)) fail(`Live observation ${observation.observation} does not map to a catalog operation (${operationId})`);
    if (!grouped.has(operationId)) grouped.set(operationId, []);
    grouped.get(operationId).push(observation);
  }
  const responseModels = [...grouped.entries()].sort(([a], [b]) => compare(a, b)).map(([operationId, observations]) => {
    const shape = mergeObservedShapes(observations.map((observation) => observation.shape));
    return {
      operationId,
      name: liveModelName(operationId),
      observationLabels: observations.map((observation) => observation.observation).sort(compare),
      schema: {
        ...toSampleJsonSchema(shape),
        "x-authenticated-sample-view": true,
        "x-operation-id": operationId,
        "x-observation-labels": observations.map((observation) => observation.observation).sort(compare),
        "x-provenance": {
          type: "redacted-authenticated-observation-shapes",
          operationId,
          observationLabels: observations.map((observation) => observation.observation).sort(compare),
        },
        "x-normative": false,
      },
    };
  });
  return {
    schemaVersion: 1,
    scope: "x-authenticated-sample-view; context-specific observation, not a universal or accepted API contract",
    normative: false,
    responseModels,
  };
}

function tspObservedType(shape, name, models, observationLabels = undefined, operationId = undefined) {
  if (shape.type === "unknown") return "unknown";
  if (shape.type === "object") {
    const properties = Object.entries(shape.properties);
    const lines = [
      ...(observationLabels ? [`@extension("x-observation-labels", ${tspValue(observationLabels)})`] : []),
      ...(operationId ? [`@extension("x-operation-id", ${quote(operationId)})`, `@extension("x-provenance", ${tspValue({ type: "redacted-authenticated-observation-shapes", operationId, observationLabels })})`] : []),
      `@extension("x-authenticated-sample-view", true)`,
      `@extension("x-normative", false)`,
      `model ${name} extends Record<unknown> {`,
    ];
    for (const [property, child] of properties) {
      const childType = tspObservedType(child, `${name}_${property}`, models);
      lines.push(`  @extension("x-sample-observed-type", ${quote(child.type)})`);
      lines.push(`  ${tspPropertyName(property)}?: ${childType};`);
    }
    lines.push("}");
    models.push(lines.join("\n"));
    return name;
  }
  if (shape.type === "array") return `${tspObservedType(shape.items, `${name}Item`, models)}[]`;
  return shape.type === "number" ? "numeric" : shape.type;
}

/** Render free-standing sample models; deliberately emit no operation response bindings. */
export function renderLiveObservationModels(modelDocument) {
  const output = [
    "// Generated sample-only views from redacted authenticated observations.",
    "// These types are not linked to API operations or static response models.",
    "using TypeSpec.OpenAPI;",
    "namespace Eliis.LiveObservations;",
  ];
  for (const responseModel of modelDocument.responseModels) {
    const generated = [];
    const schema = responseModel.schema;
    const labels = responseModel.observationLabels;
    if (schema.type === "object") {
      tspObservedType({ type: "object", properties: Object.fromEntries(Object.entries(schema.properties).map(([name, property]) => [name, schemaShapeFromJsonSchema(property)])) }, responseModel.name, generated, labels, responseModel.operationId);
    } else if (schema.type === "array") {
      const itemType = schemaShapeFromJsonSchema(schema.items);
      const bodyType = `${tspObservedType(itemType, `${responseModel.name}Item`, generated, labels, responseModel.operationId)}[]`;
      generated.push(`// Sample-only response array view for ${responseModel.operationId}; labels: ${labels.join(", ")}.\nalias ${responseModel.name} = ${bodyType};`);
    } else if (schema.type) {
      const bodyType = schema.type === "number" ? "numeric" : schema.type;
      generated.push(`// Sample-only response scalar view for ${responseModel.operationId}; labels: ${labels.join(", ")}.\nalias ${responseModel.name} = ${bodyType};`);
    } else {
      generated.push(`// Sample-only unresolved response view for ${responseModel.operationId}; labels: ${labels.join(", ")}.\nalias ${responseModel.name} = unknown;`);
    }
    output.push(generated.join("\n\n"));
  }
  return `${output.join("\n\n")}\n`;
}

function schemaShapeFromJsonSchema(schema) {
  if (!schema || !Object.keys(schema).length) return { type: "unknown" };
  if (schema.type === "object") return { type: "object", properties: Object.fromEntries(Object.entries(schema.properties ?? {}).map(([name, child]) => [name, schemaShapeFromJsonSchema(child)])) };
  if (schema.type === "array") return { type: "array", items: schemaShapeFromJsonSchema(schema.items) };
  return { type: schema.type };
}

function responseFieldType(field, name, models) {
  if (["string", "boolean", "integer", "number"].includes(field.type)) return field.type === "number" ? "numeric" : field.type;
  if (field.type === "unknown") return "unknown";
  if (field.type === "object") return renderResponseObject(name, field.fields ?? [], models);
  return `${field.items ? responseItemType(field.items, `${name}Item`, models) : "unknown"}[]`;
}

function responseItemType(item, name, models) {
  if (item.kind === "unknown") return "unknown";
  if (item.kind === "scalar") return item.scalarType === "number" ? "numeric" : item.scalarType;
  if (item.kind === "array") return `${item.items ? responseItemType(item.items, `${name}Item`, models) : "unknown"}[]`;
  return renderResponseObject(name, item.fields ?? [], models);
}

function renderResponseObject(name, fields, models) {
  const lines = [`model ${name} extends Record<unknown> {`];
  for (const field of fields) lines.push(`  ${extension("x-static-field-evidence", field.evidence)}`, `  ${tspPropertyName(field.name)}?: ${responseFieldType(field, `${name}_${field.name}`, models)};`);
  lines.push("}");
  models.push(lines.join("\n"));
  return name;
}

/** Emit named body and default-response types for analyzed operations only. */
export function renderResponseModels(responseCatalog, catalog = undefined) {
  const output = ['// Generated by scripts/generate.mjs. Edit evidence/responses, not this file.', 'using TypeSpec.Http;', 'using TypeSpec.OpenAPI;', 'namespace Eliis;'];
  const names = new Set();
  const operationTypes = new Map();
  const claim = (name) => {
    if (names.has(name)) fail(`Response model name collision: ${name}`);
    names.add(name);
  };
  for (const name of ["UnresolvedResponse", "EliisCookieAuth"]) names.add(name);
  const reserveRequestNested = (modelName, fields) => {
    for (const field of fields ?? []) if (field.fields) {
      const nested = `${modelName}_${field.name}`;
      names.add(nested);
      reserveRequestNested(nested, field.fields);
    }
  };
  for (const op of catalog?.operations ?? []) {
    if (op.body?.kind === "object" || (op.body?.kind === "multipart" && op.body.fields.length)) {
      names.add(`${op.operationId}Body`);
      reserveRequestNested(`${op.operationId}Body`, op.body.fields);
    }
    for (const query of op.query.filter(isDeepObjectQuery)) {
      const queryModel = `${op.operationId}Query_${query.name}`;
      names.add(queryModel);
      reserveRequestNested(queryModel, query.fields);
    }
  }
  for (const item of responseCatalog.operations) {
    if (item.disposition !== "modeled") continue;
    const base = `${item.operationId}ResponseBody`;
    claim(base);
    const generated = [];
    // Every response-side model, including nested object/array item models, uses
    // names disjoint from request models; claim names as the types are emitted.
    const responseTypeNames = new Set([base]);
    const collectFieldNames = (prefix, fields) => {
      for (const field of fields ?? []) {
        if (field.type === "object") { const nested = `${prefix}_${field.name}`; responseTypeNames.add(nested); collectFieldNames(nested, field.fields); }
        if (field.type === "array") collectItemNames(`${prefix}_${field.name}Item`, field.items);
      }
    };
    const collectItemNames = (prefix, itemShape) => {
      if (!itemShape) return;
      if (itemShape.kind === "object") { responseTypeNames.add(prefix); collectFieldNames(prefix, itemShape.fields); }
      if (itemShape.kind === "array") collectItemNames(`${prefix}Item`, itemShape.items);
    };
    if (item.analysis.kind === "object") collectFieldNames(base, item.analysis.fields);
    if (item.analysis.kind === "array") collectItemNames(`${base}Item`, item.analysis.items);
    for (const name of responseTypeNames) {
      if (name !== base) claim(name);
      if (catalog && [...catalog.operations].some((op) => ((op.body?.kind === "object" || op.body?.kind === "multipart") && `${op.operationId}Body` === name) || op.query.some((query) => isDeepObjectQuery(query) && `${op.operationId}Query_${query.name}` === name))) fail(`Response model name collides with generated request type: ${name}`);
    }
    const analysis = item.analysis;
    let bodyType;
    if (analysis.kind === "object") bodyType = renderResponseObject(base, analysis.fields ?? [], generated);
    else if (analysis.kind === "scalar") {
      bodyType = base;
      generated.push(`alias ${base} = ${analysis.scalarType === "number" ? "numeric" : analysis.scalarType};`);
    } else {
      bodyType = `${analysis.items ? responseItemType(analysis.items, `${base}Item`, generated) : "unknown"}[]`;
      generated.push(`alias ${base} = ${bodyType};`);
    }
    const scope = { scope: "client-observed partial static-derived view; not guaranteed accepted server contract", complete: false };
    if (analysis.kind === "object") {
      const rootIndex = generated.findIndex((line) => line.startsWith(`model ${base} `));
      generated.splice(rootIndex, 0, extension("x-static-client-observed", scope));
      generated.splice(rootIndex + 1, 0, extension("x-static-response-evidence", item.observations.map((observation) => observation.analysis)));
    }
    const wrapper = `${item.operationId}StaticResponse`;
    claim(wrapper);
    generated.push(`@defaultResponse`, `${extension("x-static-client-observed", scope)}`, `model ${wrapper} {`, `  @header contentType: "*/*";`, `  @body body: ${base};`, `}`);
    output.push(generated.join("\n"));
    operationTypes.set(item.operationId, wrapper);
  }
  return { tsp: `${output.join("\n\n")}\n`, operationTypes };
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

export function renderCatalog(catalog, responseCatalog = undefined) {
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
    const responseInfo = responseCatalog?.operations.find((item) => item.operationId === op.operationId);
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
    routes.push(extension("x-unresolved-response", { statusCodes: "unknown", mediaTypes: "unknown", body: responseInfo?.disposition === "modeled" ? "partial" : "unknown", evidence: op.records.map((r) => r.response) }));
    if (responseInfo) {
      routes.push(extension("x-static-response-evidence", responseInfo));
      routes.push(extension("x-static-client-observed", { scope: "client-observed partial static-derived view; not guaranteed accepted server contract", complete: false, disposition: responseInfo.disposition, reason: responseInfo.reason }));
    }
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
    const responseType = responseInfo?.disposition === "modeled" ? `${op.operationId}StaticResponse` : "UnresolvedResponse";
    routes.push(`op ${tspName(op.operationId)}(\n  ${params.join(",\n  ")}\n): ${responseType};\n`);
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
  const responseDir = resolve(root, "evidence/responses");
  let responseFiles;
  try { responseFiles = (await readdir(responseDir)).filter((file) => file.endsWith(".json")).sort(compare); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const responseCatalog = responseFiles
    ? makeResponseCatalog(catalog, await Promise.all(responseFiles.map(async (name) => ({ name, entries: JSON.parse(await readFile(resolve(responseDir, name), "utf8")) }))), { strict: true })
    : makeResponseCatalog(catalog, [], { strict: false });
  const liveObservations = await optionalJson(resolve(root, "evidence/live-audit/observed-shapes.json"), { observations: [], rawResponsesIncluded: false });
  let liveAuthorization;
  if (liveObservations.observations?.length) {
    const dispositions = await optionalJson(resolve(root, "evidence/live-audit/path-dispositions.json"), null);
    if (!dispositions) fail("Nonempty live observations require evidence/live-audit/path-dispositions.json");
    liveAuthorization = makeLiveObservationAuthorization(dispositions);
  }
  const liveResponseModels = makeLiveResponseModels(liveObservations, catalog, { authorization: liveAuthorization });
  const liveModelsTsp = renderLiveObservationModels(liveResponseModels);
  const exclusions = await optionalJson(resolve(root, "evidence/coverage-exclusions.json"), []);
  const inventory = await optionalJson(resolve(root, "evidence/inventory.json"), { candidateFunctions: [] });
  const coverage = makeCoverage(catalog, inventory, exclusions);
  const rendered = renderCatalog(catalog, responseCatalog.analysisRequired ? responseCatalog : undefined);
  const renderedResponses = renderResponseModels(responseCatalog, catalog);
  for (const dir of ["models", "routes", "scripts"]) await mkdir(resolve(root, dir), { recursive: true });
  await Promise.all([
    writeFile(resolve(root, "models/generated.tsp"), rendered.models),
    writeFile(resolve(root, "models/responses.tsp"), renderedResponses.tsp),
    writeFile(resolve(root, "models/live-observations.tsp"), liveModelsTsp),
    writeFile(resolve(root, "routes/generated.tsp"), rendered.routes),
    writeFile(resolve(root, "scripts/operation-catalog.json"), JSON.stringify(catalog, null, 2) + "\n"),
    writeFile(resolve(root, "scripts/coverage.json"), JSON.stringify(coverage, null, 2) + "\n"),
    writeFile(resolve(root, "scripts/response-coverage.json"), JSON.stringify(responseCatalog, null, 2) + "\n"),
    writeFile(resolve(root, "scripts/observed-response-models.json"), JSON.stringify(liveResponseModels, null, 2) + "\n"),
  ]);
  console.log(`Generated ${catalog.operationCount} operations from ${catalog.researchRecordCount} evidence records; ${responseCatalog.modeledOperationCount} partial response models, ${liveResponseModels.responseModels.length} separate sample-only views, ${responseCatalog.unknownOperationCount} unknown, ${responseCatalog.binaryOperationCount} opaque binary; ${coverage.missingCount} inventory functions missing.`);
  return { catalog, coverage, responseCatalog, liveResponseModels };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generate();

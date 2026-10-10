import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRecord, validateResponseAnalysis } from "./generate.mjs";

export const guardianDomains = ["auth", "discovery", "events", "attendance", "diary", "food"];
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const keyOf = (row) => `${row.operationId}\0${row.sourceFunctionId}`;

function checkTrace(trace, context) {
  assert.ok(Array.isArray(trace) && trace.length > 0, `${context}: trace must be a nonempty array`);
  for (const [index, item] of trace.entries()) {
    assert.ok(item && typeof item === "object" && !Array.isArray(item), `${context}.trace[${index}]: expected an object`);
    assert.ok(Number.isInteger(item.functionId) && item.functionId >= 0, `${context}.trace[${index}]: invalid functionId`);
    if (item.line !== undefined) assert.ok(Number.isInteger(item.line) && item.line > 0, `${context}.trace[${index}]: line must be a positive source line when supplied`);
    assert.ok(nonempty(item.evidence), `${context}.trace[${index}]: evidence is required`);
    assert.deepEqual(Object.keys(item).sort(), item.line === undefined ? ["evidence", "functionId"] : ["evidence", "functionId", "line"], `${context}.trace[${index}]: unsupported trace metadata`);
  }
}

function checkClaimArray(value, context) {
  assert.ok(Array.isArray(value), `${context}: must be an array`);
  value.forEach((claim, index) => {
    assert.ok(claim && typeof claim === "object" && !Array.isArray(claim), `${context}[${index}]: expected a claim object`);
    assert.ok(nonempty(claim.claim), `${context}[${index}]: claim text is required`);
    assert.ok(nonempty(claim.evidence), `${context}[${index}]: evidence or an explicit evidence boundary is required`);
    assert.equal(typeof claim.established, "boolean", `${context}[${index}]: established must be boolean`);
    assert.deepEqual(Object.keys(claim).sort(), ["claim", "established", "evidence"], `${context}[${index}]: unsupported claim metadata`);
  });
}

function checkFieldDisposition(value, context) {
  assert.ok(Array.isArray(value), `${context}: must be an array`);
  value.forEach((field, index) => {
    if (typeof field === "string") {
      assert.ok(nonempty(field), `${context}[${index}]: field text cannot be empty`);
      return;
    }
    assert.ok(field && typeof field === "object" && !Array.isArray(field), `${context}[${index}]: expected field text or an object`);
    assert.ok(Object.keys(field).length > 0, `${context}[${index}]: field object cannot be empty`);
    for (const key of ["name", "path", "evidence"]) {
      if (Object.hasOwn(field, key)) assert.ok(nonempty(field[key]), `${context}[${index}].${key}: cannot be empty`);
    }
  });
}

export function mergeRequestFields(existingFields, candidateFields, context, query = false, candidateSource = "") {
  const merged = structuredClone(existingFields);
  const indexes = new Map(merged.map((field, index) => [field.name, index]));
  const annotate = (field) => ({
    ...structuredClone(field),
    evidence: candidateSource
      ? `${field.evidence} Candidate-observed type ${field.type}; source ${candidateSource}.`
      : field.evidence,
    ...(field.fields ? { fields: field.fields.map(annotate) } : {}),
  });
  for (const candidate of candidateFields.map(annotate)) {
    const index = indexes.get(candidate.name);
    if (index === undefined) {
      indexes.set(candidate.name, merged.length);
      merged.push(candidate);
      continue;
    }

    const existing = merged[index];
    const fieldContext = `${context}.${candidate.name}`;
    const compatibleTypes = existing.type === candidate.type
      || existing.type === "unknown"
      || candidate.type === "unknown"
      || (existing.type === "unknown[]" && candidate.type === "string[]")
      || (existing.type === "string[]" && candidate.type === "unknown[]");
    assert.ok(compatibleTypes, `${fieldContext}: conflicting proved types ${existing.type} and ${candidate.type}`);
    for (const key of ["optional", "value", "encoding"]) {
      if (Object.hasOwn(existing, key) && Object.hasOwn(candidate, key)) {
        assert.deepEqual(candidate[key], existing[key], `${fieldContext}: conflicting ${key} metadata`);
      } else if (Object.hasOwn(candidate, key)) {
        existing[key] = candidate[key];
      }
    }

    const nextType = existing.type === "unknown" || existing.type === "unknown[]" ? candidate.type : existing.type;
    const canContainFields = ["unknown", "unknown[]"].includes(nextType)
      || (query && nextType === "string" && (existing.encoding ?? candidate.encoding));
    if (existing.fields) {
      assert.ok(canContainFields, `${fieldContext}: established nested fields conflict with candidate ${candidate.type} field shape`);
    }
    if (candidate.fields && !existing.fields) {
      assert.ok(canContainFields, `${fieldContext}: candidate nested fields conflict with established ${existing.type} field shape`);
      existing.fields = structuredClone(candidate.fields);
    } else if (candidate.fields && existing.fields) {
      existing.fields = mergeRequestFields(existing.fields, candidate.fields, fieldContext, query);
    }

    // The research field is the baseline transport view. Candidate-local detail
    // enriches its evidence but cannot narrow an unresolved baseline type.
    const proofs = [existing.evidence, candidate.evidence].filter(nonempty);
    existing.evidence = [...new Set(proofs)].join(" ");
  }
  return merged;
}

function checkRequestCandidate(candidate, context, recordsByKey, mergedRecordsByKey) {
  assert.ok(candidate && typeof candidate === "object" && !Array.isArray(candidate), `${context}: expected an object`);
  assert.deepEqual(Object.keys(candidate).sort(), ["evidence", "fields", "limitations", "operationId", "placement", "sourceFunctionId", "trace"], `${context}: unsupported request candidate metadata`);
  assert.ok(nonempty(candidate.operationId), `${context}: operationId is required`);
  assert.ok(Number.isInteger(candidate.sourceFunctionId) && candidate.sourceFunctionId >= 0, `${context}: sourceFunctionId is required`);
  assert.ok(candidate.placement === "query" || candidate.placement === "body", `${context}: placement must be query or body`);
  assert.ok(nonempty(candidate.evidence), `${context}: evidence is required`);
  assert.ok(Array.isArray(candidate.fields) && candidate.fields.length > 0, `${context}: at least one request field is required`);
  assert.ok(Array.isArray(candidate.limitations) && candidate.limitations.every(nonempty), `${context}: limitations must be nonempty strings`);
  checkTrace(candidate.trace, context);

  const key = keyOf(candidate);
  const base = mergedRecordsByKey.get(key) ?? recordsByKey.get(key);
  assert.ok(base, `${context}: no existing research record for operation/source`);
  const standalone = structuredClone(base);
  if (candidate.placement === "query") {
    standalone.query = structuredClone(candidate.fields);
  } else {
    const kind = base.body?.kind === "multipart" ? "multipart" : "object";
    standalone.body = { kind, fields: structuredClone(candidate.fields), complete: false, evidence: candidate.evidence };
  }
  validateRecord(standalone, `${context} candidate ${candidate.placement}`);

  const traceSources = candidate.trace.map(({ functionId, line }) => `functionId ${functionId}${line === undefined ? "" : ` line ${line}`}`);
  const candidateSource = [...new Set(traceSources)].join(", ");
  const merged = structuredClone(base);
  if (candidate.placement === "query") {
    merged.query = mergeRequestFields(merged.query, candidate.fields, `${context} merged query`, true, candidateSource);
  } else {
    const existing = merged.body;
    // Candidate fields have the same shape validated by validateRecord. Preserve
    // known body placement/kind; a newly traced body is only a partial object.
    const kind = existing?.kind === "multipart" ? "multipart" : "object";
    merged.body = {
      kind,
      fields: mergeRequestFields(existing && existing.kind !== "unknown" ? existing.fields : [], candidate.fields, `${context} merged body`, false, candidateSource),
      complete: false,
      evidence: [existing?.evidence, candidate.evidence].filter(nonempty).join(" "),
    };
  }
  validateRecord(merged, `${context} merged ${candidate.placement}`);
  mergedRecordsByKey.set(key, merged);
}

/** Validate a guardian-batch snapshot without changing it or the repository. */
export function checkGuardianBatch({ scope, candidates, researchRecords }) {
  assert.ok(scope && typeof scope === "object" && !Array.isArray(scope), "scope: expected an object");
  assert.equal(scope.operationCount, 17, "guardian scope must declare exactly 17 operations");
  assert.ok(Array.isArray(scope.operations) && scope.operations.length === 17, "guardian scope must contain exactly 17 operations");
  const scopeByKey = new Map();
  for (const [index, item] of scope.operations.entries()) {
    const context = `scope.operations[${index}]`;
    assert.ok(item && typeof item === "object" && !Array.isArray(item), `${context}: expected an object`);
    assert.ok(guardianDomains.includes(item.domain), `${context}: unknown domain ${item.domain}`);
    assert.ok(nonempty(item.operationId), `${context}: operationId is required`);
    assert.ok(Number.isInteger(item.sourceFunctionId) && item.sourceFunctionId >= 0, `${context}: sourceFunctionId is required`);
    assert.deepEqual(Object.keys(item).sort(), ["domain", "operationId", "sourceFunctionId"], `${context}: unsupported scope metadata`);
    const key = keyOf(item);
    assert.ok(!scopeByKey.has(key), `${context}: duplicate scope operation/source ${item.operationId}/${item.sourceFunctionId}`);
    scopeByKey.set(key, item);
  }
  assert.deepEqual([...new Set(scope.operations.map((item) => item.domain))].sort(), [...guardianDomains].sort(), "scope must cover exactly the six guardian domains");
  assert.deepEqual(Object.fromEntries(guardianDomains.map((domain) => [domain, scope.operations.filter((item) => item.domain === domain).length])), {
    auth: 2, discovery: 4, events: 2, attendance: 3, diary: 3, food: 3,
  }, "scope domain operation counts differ from the guardian batch contract");
  assert.ok(Array.isArray(candidates), "candidates: expected six domain candidate documents");
  assert.ok(Array.isArray(researchRecords), "researchRecords: expected existing research records for request validation");

  const candidatesByDomain = new Map();
  for (const [index, document] of candidates.entries()) {
    assert.ok(document && typeof document === "object" && !Array.isArray(document), `candidates[${index}]: expected a domain document`);
    assert.ok(guardianDomains.includes(document.domain), `candidates[${index}]: unknown domain ${document.domain}`);
    assert.ok(!candidatesByDomain.has(document.domain), `duplicate candidate document for domain ${document.domain}`);
    assert.deepEqual(Object.keys(document).sort(), ["capabilities", "domain", "requestCandidates", "responseCandidates"], `${document.domain}: unsupported candidate document metadata`);
    candidatesByDomain.set(document.domain, document);
    for (const key of ["responseCandidates", "requestCandidates", "capabilities"]) {
      assert.ok(Array.isArray(document[key]), `${document.domain}.${key}: expected an array`);
    }
  }
  assert.deepEqual([...candidatesByDomain.keys()].sort(), [...guardianDomains].sort(), "all six domain candidate files are required");

  const recordsByKey = new Map();
  for (const record of researchRecords) {
    if (!record?.source || !Number.isInteger(record.source.functionId)) continue;
    const key = `${record.operationId}\0${record.source.functionId}`;
    assert.ok(!recordsByKey.has(key), `researchRecords: duplicate existing operation/source ${record.operationId}/${record.source.functionId}`);
    recordsByKey.set(key, record);
  }

  const responseKeys = new Set();
  const capabilityKeys = new Set();
  const mergedRecordsByKey = new Map();
  for (const domain of guardianDomains) {
    const document = candidatesByDomain.get(domain);
    const expectedInDomain = new Map([...scopeByKey].filter(([, item]) => item.domain === domain));
    for (const [index, response] of document.responseCandidates.entries()) {
      const context = `${domain}.responseCandidates[${index}]`;
      validateResponseAnalysis(response, context);
      checkTrace(response.trace, context);
      const key = keyOf(response);
      assert.ok(expectedInDomain.has(key), `${context}: operation/source is outside its declared domain scope`);
      assert.ok(!responseKeys.has(key), `${context}: duplicate response candidate ${response.operationId}/${response.sourceFunctionId}`);
      responseKeys.add(key);
    }
    for (const [index, candidate] of document.capabilities.entries()) {
      const context = `${domain}.capabilities[${index}]`;
      assert.ok(candidate && typeof candidate === "object" && !Array.isArray(candidate), `${context}: expected an object`);
      assert.deepEqual(Object.keys(candidate).sort(), ["blockers", "dateTimeSemantics", "establishedFields", "operationId", "pagination", "permissions", "querySemantics", "readSideEffects", "sourceFunctionId", "trace", "unresolvedFields"], `${context}: unsupported capability metadata`);
      const key = keyOf(candidate);
      assert.ok(expectedInDomain.has(key), `${context}: operation/source is outside its declared domain scope`);
      assert.ok(!capabilityKeys.has(key), `${context}: duplicate capability ${candidate.operationId}/${candidate.sourceFunctionId}`);
      capabilityKeys.add(key);
      checkFieldDisposition(candidate.establishedFields, `${context}.establishedFields`);
      checkFieldDisposition(candidate.unresolvedFields, `${context}.unresolvedFields`);
      for (const name of ["querySemantics", "permissions", "dateTimeSemantics", "pagination", "readSideEffects"]) {
        checkClaimArray(candidate[name], `${context}.${name}`);
      }
      assert.ok(Array.isArray(candidate.blockers) && candidate.blockers.every(nonempty), `${context}.blockers: expected nonempty blocker strings`);
      checkTrace(candidate.trace, context);
    }
    for (const [index, request] of document.requestCandidates.entries()) {
      const context = `${domain}.requestCandidates[${index}]`;
      const key = keyOf(request);
      assert.ok(expectedInDomain.has(key), `${context}: operation/source is outside its declared domain scope`);
      checkRequestCandidate(request, context, recordsByKey, mergedRecordsByKey);
    }
  }
  assert.deepEqual([...responseKeys].sort(), [...scopeByKey.keys()].sort(), "each scoped operation must have exactly one response candidate");
  assert.deepEqual([...capabilityKeys].sort(), [...scopeByKey.keys()].sort(), "each scoped operation must have exactly one capability row");
  return { operationCount: scopeByKey.size, responseCandidateCount: responseKeys.size, capabilityCount: capabilityKeys.size };
}

export async function checkGuardianBatchFiles(root = process.cwd()) {
  const load = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
  const scope = await load("evidence/guardian-batch/scope.json");
  const candidates = await Promise.all(guardianDomains.map((domain) => load(`evidence/guardian-batch/${domain}.json`)));
  const researchDirectory = resolve(root, "evidence/research");
  const files = (await readdir(researchDirectory)).filter((name) => name.endsWith(".json"));
  const researchRecords = (await Promise.all(files.map(async (name) => ({ name, entries: await load(`evidence/research/${name}`) }))))
    .flatMap(({ name, entries }) => {
      assert.ok(Array.isArray(entries), `evidence/research/${name}: expected an operation array`);
      return entries;
    });
  return checkGuardianBatch({ scope, candidates, researchRecords });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkGuardianBatchFiles();
  console.log(`Validated guardian batch: ${result.operationCount} response candidates, ${result.capabilityCount} capability rows.`);
}

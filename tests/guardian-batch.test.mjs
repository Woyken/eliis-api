import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkGuardianBatch, checkGuardianBatchFiles, guardianDomains, mergeRequestFields } from "../scripts/check-guardian-batch.mjs";
import { record } from "./fixtures.mjs";

const domainCounts = { auth: 2, discovery: 4, events: 2, attendance: 3, diary: 3, food: 3 };
const syntheticEvidence = (label) => `Synthetic test evidence for ${label}; not production research.`;

function snapshot() {
  const operations = [];
  let sourceFunctionId = 80000;
  for (const [domain, count] of Object.entries(domainCounts)) {
    for (let index = 0; index < count; index += 1) {
      const operationId = `Synthetic${domain[0].toUpperCase()}${domain.slice(1)}${index + 1}`;
      operations.push({ domain, operationId, sourceFunctionId: sourceFunctionId++ });
    }
  }
  const scope = { operationCount: 17, operations };
  const researchRecords = operations.map(({ operationId, sourceFunctionId }, index) => record({
    operationId,
    path: `/synthetic/${index}`,
    pathParams: [],
    source: { functionId: sourceFunctionId, functionName: `synthetic${index}`, line: index + 1 },
  }));
  const candidates = guardianDomains.map((domain) => {
    const rows = operations.filter((item) => item.domain === domain);
    return {
      domain,
      responseCandidates: rows.map(({ operationId, sourceFunctionId }, index) => ({
        operationId,
        sourceFunctionId,
        kind: "unknown",
        evidence: syntheticEvidence(`${operationId} response disposition`),
        trace: [{ functionId: sourceFunctionId, line: index + 1, evidence: syntheticEvidence("service returns response.data") }],
        fields: [],
        complete: false,
        limitations: ["Synthetic response shape intentionally remains unknown."],
      })),
      requestCandidates: [],
      capabilities: rows.map(({ operationId, sourceFunctionId }, index) => ({
        operationId,
        sourceFunctionId,
        establishedFields: ["synthetic field observation"],
        unresolvedFields: [{ name: "synthetic-unresolved", evidence: syntheticEvidence("unknown client read") }],
        querySemantics: [{ claim: "No query behavior is asserted by this fixture.", evidence: syntheticEvidence("no query callsite included"), established: false }],
        permissions: [],
        dateTimeSemantics: [],
        pagination: [],
        readSideEffects: [],
        trace: [{ functionId: sourceFunctionId, line: index + 1, evidence: syntheticEvidence("synthetic caller trace") }],
        blockers: ["Synthetic fixture provides no production permissions evidence."],
      })),
    };
  });
  return { scope, candidates, researchRecords };
}

test("guardian batch checker accepts complete synthetic six-domain coverage", () => {
  assert.deepEqual(checkGuardianBatch(snapshot()), { operationCount: 17, responseCandidateCount: 17, capabilityCount: 17 });
});

test("requires all 17 response analyses and capability rows exactly once", () => {
  const missingResponse = snapshot();
  missingResponse.candidates[0].responseCandidates.pop();
  assert.throws(() => checkGuardianBatch(missingResponse), /exactly one response candidate/);

  const extraCapability = snapshot();
  const duplicate = structuredClone(extraCapability.candidates[0].capabilities[0]);
  extraCapability.candidates[0].capabilities.push(duplicate);
  assert.throws(() => checkGuardianBatch(extraCapability), /duplicate capability/);

  const missingCapability = snapshot();
  missingCapability.candidates.find((item) => item.domain === "food").capabilities.pop();
  assert.throws(() => checkGuardianBatch(missingCapability), /exactly one capability row/);
});

test("rejects candidate rows with extra operations, wrong sources, and duplicate response rows", () => {
  const extra = snapshot();
  extra.candidates[0].responseCandidates[0].operationId = "NotInScope";
  assert.throws(() => checkGuardianBatch(extra), /outside its declared domain scope/);

  const wrongSource = snapshot();
  wrongSource.candidates[0].capabilities[0].sourceFunctionId += 1;
  assert.throws(() => checkGuardianBatch(wrongSource), /outside its declared domain scope/);

  const duplicate = snapshot();
  duplicate.candidates[0].responseCandidates.push(structuredClone(duplicate.candidates[0].responseCandidates[0]));
  assert.throws(() => checkGuardianBatch(duplicate), /duplicate response candidate/);
});

test("requires evidence and correctly typed capability claims and traces", () => {
  const noEvidence = snapshot();
  noEvidence.candidates[0].responseCandidates[0].evidence = "  ";
  assert.throws(() => checkGuardianBatch(noEvidence), /evidence/);

  const wrongBoolean = snapshot();
  wrongBoolean.candidates[0].capabilities[0].permissions.push({ claim: "Unproven permission", evidence: syntheticEvidence("boundary"), established: "false" });
  assert.throws(() => checkGuardianBatch(wrongBoolean), /established must be boolean/);

  const optionalTraceLine = snapshot();
  delete optionalTraceLine.candidates[0].capabilities[0].trace[0].line;
  assert.equal(checkGuardianBatch(optionalTraceLine).operationCount, 17, "trace line is optional by the evidence contract");

  const invalidTraceLine = snapshot();
  invalidTraceLine.candidates[0].capabilities[0].trace[0].line = 0;
  assert.throws(() => checkGuardianBatch(invalidTraceLine), /line must be a positive source line/);

  const invalidNestedItem = snapshot();
  const analysis = invalidNestedItem.candidates[0].responseCandidates[0];
  analysis.kind = "array";
  analysis.items = { kind: "scalar", evidence: syntheticEvidence("array item type omitted") };
  assert.throws(() => checkGuardianBatch(invalidNestedItem), /scalar item needs a supported scalarType/);
});

test("validates candidate request fields through validateRecord on a non-mutating merged record", () => {
  const valid = snapshot();
  const operation = valid.scope.operations[0];
  valid.candidates[0].requestCandidates.push({
    operationId: operation.operationId,
    sourceFunctionId: operation.sourceFunctionId,
    placement: "query",
    fields: [{ name: "observedFilter", type: "unknown", evidence: syntheticEvidence("query field") }],
    evidence: syntheticEvidence("query params construction"),
    trace: [{ functionId: operation.sourceFunctionId, line: 90, evidence: syntheticEvidence("Axios params construction") }],
    limitations: ["Synthetic query meaning is unresolved."],
  });
  const before = structuredClone(valid.researchRecords[0]);
  assert.equal(checkGuardianBatch(valid).operationCount, 17);
  assert.deepEqual(valid.researchRecords[0], before, "checking must not mutate original request records");

  const invalid = snapshot();
  const invalidOperation = invalid.scope.operations[0];
  invalid.candidates[0].requestCandidates.push({
    operationId: invalidOperation.operationId,
    sourceFunctionId: invalidOperation.sourceFunctionId,
    placement: "body",
    fields: [{ name: "bad-field-name", type: "mystery", evidence: syntheticEvidence("bad field") }],
    evidence: syntheticEvidence("body construction"),
    trace: [{ functionId: invalidOperation.sourceFunctionId, line: 91, evidence: syntheticEvidence("body trace") }],
    limitations: [],
  });
  assert.throws(() => checkGuardianBatch(invalid), /invalid field name|unsupported type/);
});

test("upserts compatible request fields and recursively retains all proof without mutating inputs", () => {
  const existing = [
    { name: "form", type: "unknown", evidence: "Existing outer form proof.", fields: [
      { name: "user_id", type: "unknown", evidence: "Existing nested user id proof." },
    ] },
    { name: "date", type: "unknown", evidence: "Existing date proof." },
  ];
  const candidate = [
    { name: "date", type: "string", evidence: "Additional date proof." },
    { name: "form", type: "unknown", evidence: "Additional outer form proof.", fields: [
      { name: "user_id", type: "string", evidence: "Additional nested user id proof." },
    ] },
  ];
  const beforeExisting = structuredClone(existing);
  const beforeCandidate = structuredClone(candidate);
  const merged = mergeRequestFields(existing, candidate, "synthetic merged query", true, "functionId 25650 line 42");
  assert.deepEqual(merged.map(({ name }) => name), ["form", "date"]);
  assert.equal(merged.filter(({ name }) => name === "date").length, 1);
  const date = merged.find(({ name }) => name === "date");
  assert.equal(date.type, "unknown", "a caller-local string observation cannot narrow the baseline transport type");
  assert.match(date.evidence, /Existing date proof\. Additional date proof\. Candidate-observed type string; source functionId 25650 line 42\./);
  const userId = merged.find(({ name }) => name === "form").fields[0];
  assert.equal(userId.type, "unknown", "nested caller-local detail also preserves the baseline unknown type");
  assert.match(userId.evidence, /Existing nested user id proof\. Additional nested user id proof\. Candidate-observed type string; source functionId 25650 line 42\./);
  assert.match(merged.find(({ name }) => name === "form").evidence, /Existing outer form proof\. Additional outer form proof\. Candidate-observed type unknown; source functionId 25650 line 42\./);
  assert.deepEqual(existing, beforeExisting);
  assert.deepEqual(candidate, beforeCandidate);

  const knownMerged = mergeRequestFields(
    [{ name: "status", type: "string", evidence: "Existing proved status type." }],
    [{ name: "status", type: "string", evidence: "Additional status proof." }],
    "synthetic merged query",
    true,
    "functionId 25651 line 43",
  );
  assert.equal(knownMerged.length, 1);
  assert.equal(knownMerged[0].type, "string");
  assert.match(knownMerged[0].evidence, /Existing proved status type\. Additional status proof\. Candidate-observed type string; source functionId 25651 line 43\./);

  const data = snapshot();
  const operation = data.scope.operations[0];
  data.researchRecords[0].query = [{ name: "date", type: "unknown", evidence: "Existing date proof." }];
  data.candidates[0].requestCandidates.push({
    operationId: operation.operationId,
    sourceFunctionId: operation.sourceFunctionId,
    placement: "query",
    fields: [{ name: "date", type: "string", evidence: "Additional date proof." }],
    evidence: syntheticEvidence("same date query parameter"),
    trace: [{ functionId: operation.sourceFunctionId, evidence: syntheticEvidence("trace with omitted line")}],
    limitations: [],
  });
  assert.equal(checkGuardianBatch(data).operationCount, 17, "a compatible duplicate is merged rather than rejected as duplicate");
});

test("rejects conflicting known request types and incompatible field metadata", () => {
  assert.throws(() => mergeRequestFields(
    [{ name: "date", type: "string", evidence: "Established string date." }],
    [{ name: "date", type: "integer", evidence: "Conflicting integer date." }],
    "synthetic merged query",
    true,
  ), /date: conflicting proved types string and integer/);

  assert.throws(() => mergeRequestFields(
    [{ name: "filter", type: "string", encoding: "JSON.stringify", evidence: "Established JSON encoding." }],
    [{ name: "filter", type: "string", encoding: "AxiosURLSearchParams brackets", evidence: "Conflicting encoding." }],
    "synthetic merged query",
    true,
  ), /filter: conflicting encoding metadata/);

  assert.throws(() => mergeRequestFields(
    [{ name: "count", type: "integer", evidence: "Established scalar field shape." }],
    [{ name: "count", type: "integer", evidence: "Candidate nested shape.", fields: [{ name: "value", type: "string", evidence: "Nested value." }] }],
    "synthetic merged query",
    true,
  ), /count: candidate nested fields conflict with established integer field shape/);

  assert.throws(() => mergeRequestFields(
    [{ name: "form", type: "unknown", evidence: "Established nested query construction.", fields: [{ name: "user_id", type: "unknown", evidence: "Nested id." }] }],
    [{ name: "form", type: "string", evidence: "Candidate scalar form." }],
    "synthetic merged query",
    true,
  ), /form: established nested fields conflict with candidate string field shape/);
});

test("validates the actual six guardian candidate files against research records", async () => {
  assert.deepEqual(await checkGuardianBatchFiles(), { operationCount: 17, responseCandidateCount: 17, capabilityCount: 17 });
});

test("existing absence-modal operation identity remains GetAbsenceModalData / 25652", async () => {
  const scope = JSON.parse(await readFile("evidence/guardian-batch/scope.json", "utf8"));
  assert.ok(scope.operations.some((item) => item.operationId === "GetAbsenceModalData" && item.sourceFunctionId === 25652));
});

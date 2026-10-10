import assert from "node:assert/strict";
import test from "node:test";
import { renderGuardianBatch } from "../scripts/render-guardian-capabilities.mjs";
import { guardianDomains } from "../scripts/check-guardian-batch.mjs";
import { record } from "./fixtures.mjs";

const operationsByDomain = {
  auth: [["Login", 16308], ["Login2FA", 16309]],
  discovery: [["GetUserData", 16344], ["GetUserPermissions", 16348], ["GetChildProfile", 25634], ["GetChildCourses", 25624]],
  events: [["GetEvents", 25403], ["GetRecentEvents", 25401]],
  attendance: [["GetChildCalendar", 25644], ["GetStatusLogs", 25650], ["GetAbsenceModalData", 25652]],
  diary: [["GetGuardianFeed", 25632], ["GetGuardianDiary", 25630], ["GetDiaryData", 25935]],
  food: [["GetDayMenu", 26007], ["GetWeekMenu", 26009], ["DownloadFoodmenuFile", 37318]],
};

const syntheticEvidence = "Synthetic fixture evidence; not production research.";

function fixture() {
  const operations = [];
  const researchRecords = [];
  const candidates = guardianDomains.map((domain) => {
    const responseCandidates = [];
    const capabilities = [];
    for (const [operationId, sourceFunctionId] of operationsByDomain[domain]) {
      operations.push({ domain, operationId, sourceFunctionId });
      researchRecords.push(record({
        operationId,
        path: `/fixture/${operationId}`,
        pathParams: [],
        source: { functionId: sourceFunctionId, functionName: operationId, line: sourceFunctionId },
      }));
      responseCandidates.push({
        operationId,
        sourceFunctionId,
        kind: "object",
        evidence: syntheticEvidence,
        trace: [{ functionId: sourceFunctionId, evidence: syntheticEvidence }],
        fields: [{
          name: operationId === "GetGuardianFeed" ? "data" : "value",
          type: operationId === "GetGuardianFeed" ? "array" : "unknown",
          evidence: `#${sourceFunctionId} reads this root property.`,
          ...(operationId === "GetGuardianFeed" ? {
            items: {
              kind: "object",
              evidence: `#${sourceFunctionId} maps one group.`,
              fields: [{ name: "date", type: "unknown", evidence: `#${sourceFunctionId} reads data[].date.` }],
            },
          } : {}),
        }],
        complete: false,
        limitations: ["Only traced client reads are represented."],
      });
      capabilities.push({
        operationId,
        sourceFunctionId,
        establishedFields: [operationId === "GetGuardianFeed" ? "body.data[] has a client-observed date read" : "A synthetic client path is traced."],
        unresolvedFields: ["Unknown wire type and server guarantees."],
        querySemantics: [{ claim: "The query meaning is unresolved.", evidence: syntheticEvidence, established: false }],
        permissions: [{ claim: "A UI path is not server authorization.", evidence: `#${sourceFunctionId} client-only evidence.`, established: false }],
        dateTimeSemantics: [],
        pagination: [],
        readSideEffects: [],
        trace: [{ functionId: sourceFunctionId, evidence: syntheticEvidence }],
        blockers: ["No server authorization is established."],
      });
    }
    return { domain, responseCandidates, requestCandidates: [], capabilities };
  });
  const calendarResearch = researchRecords.find((item) => item.operationId === "GetChildCalendar");
  calendarResearch.query = [{ name: "date", type: "unknown", evidence: "Research baseline leaves the query value unresolved." }];
  calendarResearch.queryPassthrough = true;
  candidates.find((item) => item.domain === "attendance").requestCandidates.push({
    operationId: "GetChildCalendar",
    sourceFunctionId: 25644,
    placement: "query",
    fields: [{ name: "date", type: "string", evidence: "Calendar caller locally formats a date string." }],
    evidence: "The traced caller provides a string value for this query key; baseline transport type stays unknown.",
    trace: [{ functionId: 44368, evidence: "Synthetic exact caller trace." }],
    limitations: ["Caller construction does not prove server acceptance or range semantics."],
  });
  return { scope: { operationCount: 17, operations }, candidates, researchRecords };
}

test("renders all 17 validated capability rows and the feature blocker sections deterministically", () => {
  const input = fixture();
  const before = structuredClone(input);
  const first = renderGuardianBatch(input);
  const second = renderGuardianBatch(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, before, "rendering must not mutate candidate or research inputs");
  assert.equal(first.capabilities.split("\n").filter((line) => /^\| \*\*/.test(line)).length, 17);
  assert.match(first.capabilities, /Client-observed response paths/);
  assert.match(first.capabilities, /body\.data\[\]\.date/);
  assert.match(first.capabilities, /\*\*unknown\*\*/);
  assert.match(first.capabilities, /Query semantics/);
  assert.match(first.capabilities, /Permission evidence/);
  assert.match(first.capabilities, /Date\/time semantics/);
  assert.match(first.capabilities, /Pagination/);
  assert.match(first.capabilities, /Read-side effects/);
  assert.match(first.capabilities, /\*\*Research-record query fields:\*\*/);
  assert.match(first.capabilities, /\*\*Caller observation\*\* `date`: \*\*string\*\*/);
  assert.match(first.capabilities, /`date`: \*\*unknown\*\* \[fn #25644\]/, "candidate caller type must not narrow the research query type");
  for (const title of ["Setup, authentication, and child selection", "Events", "Attendance and absence", "Diary summaries and feedback", "Food menus and downloads"]) {
    assert.ok(first.blockers.includes(`## ${title}`), `missing blocker section ${title}`);
  }
  assert.match(first.blockers, /Never infer absence/);
  assert.match(first.blockers, /GetGuardianDiary/);
  assert.match(first.blockers, /week_menu/);
  assert.match(first.capabilities, /Historical static client research/);
  assert.match(first.capabilities, /later bounded, authorized read-only audit/);
  assert.match(first.blockers, /later bounded, authorized audit/);
});

test("renders stale static-batch blocker notes as historical and acknowledges sampled audit scope", () => {
  const input = fixture();
  const auth = input.candidates.find((item) => item.domain === "auth");
  auth.capabilities.find((item) => item.operationId === "Login").blockers.unshift(
    "No live login or private account test was performed; server-required fields remain unknown.",
  );
  const attendance = input.candidates.find((item) => item.domain === "attendance");
  attendance.capabilities.find((item) => item.operationId === "GetStatusLogs").blockers.push(
    "No write request or live status-log response was used.",
  );

  const { blockers } = renderGuardianBatch(input);
  assert.ok(blockers.includes("candidate analysis did not include runtime account validation"));
  assert.ok(blockers.includes("candidate analysis did not use a live status"));
  assert.doesNotMatch(blockers, /No live login or private account test was performed/);
  assert.doesNotMatch(blockers, /No write request or live status-log response was used/);
});

test("escapes untrusted evidence and field/path text in Markdown table output", () => {
  const input = fixture();
  const authDocument = input.candidates.find((item) => item.domain === "auth");
  authDocument.capabilities[0].establishedFields = [{
    claim: "literal | <script>alert(1)</script> <img src=x>\n[click](javascript:alert(1))",
    evidence: "Source text #16308 says | <img src=x> and has a newline.\nNo HTML or link is trusted.",
  }];
  input.researchRecords.find((item) => item.operationId === "Login").path = "/fixture/unsafe|danger";

  const { capabilities } = renderGuardianBatch(input);
  assert.match(capabilities, /&#124;/);
  assert.match(capabilities, /&lt;script&gt;/);
  assert.match(capabilities, /&lt;img src=x&gt;/);
  assert.doesNotMatch(capabilities, /<script>|<img src=x>/);
  assert.doesNotMatch(capabilities, /\]\(javascript:/);
  assert.equal(capabilities.split("\n").filter((line) => /^\| \*\*/.test(line)).length, 17, "embedded newlines must not split Markdown table rows");
});

test("refuses to render a candidate snapshot that is not structurally complete", () => {
  const input = fixture();
  input.researchRecords.pop();
  assert.throws(() => renderGuardianBatch(input), /renderer: missing research record/);
});

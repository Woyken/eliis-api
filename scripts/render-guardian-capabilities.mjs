import assert from "node:assert/strict";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGuardianBatch, guardianDomains } from "./check-guardian-batch.mjs";

// Escape data as plain Markdown text before it is placed in a table cell. Links
// are assembled separately from fixed, validated domain names and numeric IDs.
function markdownText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("|", "&#124;")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\n", "<br>")
    .replace(/[\\`*_{}\[\]()#+.!~-]/g, "\\$&");
}

function codeText(value) {
  return String(value)
    .replaceAll("|", "&#124;")
    .replaceAll("\r\n", " ")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ")
    .replaceAll("`", "&#96;");
}

function evidenceIds(value) {
  const ids = new Set();
  for (const match of String(value ?? "").matchAll(/#(\d{3,})/g)) ids.add(Number(match[1]));
  return [...ids].sort((left, right) => left - right);
}

function sourceLinks(ids, domain) {
  return [...new Set(ids)].map((id) => `[fn #${id}](../evidence/guardian-batch/${domain}.json)`).join(", ");
}

function traceIds(capability, response) {
  const id = capability.sourceFunctionId ?? response.sourceFunctionId;
  return Number.isInteger(id) ? [id] : [];
}

function claimEvidence(claim, domain, fallbackIds) {
  const ids = evidenceIds(claim?.evidence);
  return sourceLinks(ids.length ? ids : fallbackIds, domain);
}

function claimLine(claim, domain, fallbackIds, { established = claim?.established } = {}) {
  const text = typeof claim === "string" ? claim : claim.claim ?? claim.name ?? claim.path ?? JSON.stringify(claim);
  const marker = established === true ? "Observed:" : established === false ? "Unresolved:" : "Finding:";
  const citations = claimEvidence(typeof claim === "string" ? null : claim, domain, fallbackIds);
  return `- **${marker}** ${markdownText(text)}${citations ? ` (${citations})` : ""}`;
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return [value];
  return [];
}

function fieldPaths(fields, prefix = "body") {
  const lines = [];
  for (const field of fields ?? []) {
    const path = `${prefix}.${field.name}`;
    const type = field.type ?? "unknown";
    lines.push({ path, type, evidence: field.evidence });
    if (field.fields?.length) lines.push(...fieldPaths(field.fields, path));
    if (field.items) {
      const itemPrefix = `${path}[]`;
      if (field.items.kind === "unknown") {
        lines.push({ path: itemPrefix, type: "unknown item shape", evidence: field.items.evidence });
      } else {
        lines.push({ path: itemPrefix, type: field.items.kind, evidence: field.items.evidence });
        if (field.items.fields?.length) lines.push(...fieldPaths(field.items.fields, itemPrefix));
      }
    }
  }
  return lines;
}

function responseCell(response, capability, domain) {
  const ids = traceIds(capability, response);
  const model = response.kind === "unknown"
    ? "Observed body shape is opaque/unknown"
    : response.kind === "binary"
      ? "Downloaded body is opaque bytes"
      : `Partial body view: ${response.kind}`;
  const lines = [`**${markdownText(model)}**`];
  const paths = fieldPaths(response.fields);
  if (response.items) {
    if (response.items.kind === "unknown") paths.push({ path: "body[]", type: "unknown item shape", evidence: response.items.evidence });
    else {
      paths.push({ path: "body[]", type: response.items.kind, evidence: response.items.evidence });
      paths.push(...fieldPaths(response.items.fields, "body[]"));
    }
  }
  for (const field of paths) {
    const refs = sourceLinks(evidenceIds(field.evidence).length ? evidenceIds(field.evidence) : ids, domain);
    lines.push(`- \`${codeText(field.path)}\`: **${markdownText(field.type)}**${refs ? ` (${refs})` : ""}`);
  }
  const additional = asList(capability.establishedFields);
  if (additional.length) {
    lines.push("**Additional client-observed findings:**");
    for (const finding of additional) lines.push(claimLine(finding, domain, ids, { established: true }));
  }
  if (!paths.length && response.kind !== "unknown" && response.kind !== "binary") {
    lines.push("- No body properties were established by the traced consumer.");
  }
  return lines.join("<br>");
}

function unresolvedCell(response, capability, domain) {
  const fallbackIds = traceIds(capability, response);
  const items = [
    ...asList(capability.unresolvedFields),
    ...(response.limitations ?? []).map((text) => ({ claim: text, evidence: response.evidence })),
    ...(capability.blockers ?? []).map((text) => ({ claim: text, evidence: capability.trace.map((item) => `#${item.functionId}`).join(" ") })),
  ];
  const seen = new Set();
  const lines = [];
  for (const item of items) {
    const label = typeof item === "string" ? item : item.claim ?? item.name ?? item.path ?? JSON.stringify(item);
    if (seen.has(label)) continue;
    seen.add(label);
    lines.push(claimLine(item, domain, fallbackIds, { established: false }));
  }
  return lines.length ? lines.join("<br>") : "No additional unresolved-field notes recorded.";
}

function claimsCell(claims, domain, fallbackIds) {
  if (!claims?.length) return `No capability claim recorded; this is not evidence that server behavior is absent. ${sourceLinks(fallbackIds, domain)}`;
  return claims.map((claim) => claimLine(claim, domain, fallbackIds)).join("<br>");
}

function queryFieldLines(fields, domain, fallbackIds, prefix = "", sourceLabel = "") {
  const lines = [];
  for (const field of fields ?? []) {
    const name = prefix ? `${prefix}.${field.name}` : field.name;
    const details = [field.optional === true ? "optional in client construction" : "", field.encoding ? `encoding: ${field.encoding}` : "", Object.hasOwn(field, "value") ? `client value: ${JSON.stringify(field.value)}` : ""]
      .filter(Boolean);
    const refs = sourceLinks(evidenceIds(field.evidence).length ? evidenceIds(field.evidence) : fallbackIds, domain);
    lines.push(`- ${sourceLabel ? `**${markdownText(sourceLabel)}** ` : ""}\`${codeText(name)}\`: **${markdownText(field.type ?? "unknown")}**${details.length ? ` (${markdownText(details.join("; "))})` : ""}${refs ? ` ${refs}` : ""}`);
    if (field.fields?.length) lines.push(...queryFieldLines(field.fields, domain, fallbackIds, name, sourceLabel));
  }
  return lines;
}

function queryCell(record, requestCandidates, capability, domain, fallbackIds) {
  const lines = [];
  const query = record.query ?? [];
  if (query.length) {
    lines.push("**Research-record query fields:**", ...queryFieldLines(query, domain, [record.source.functionId]));
  } else if (record.queryPassthrough) {
    lines.push(`Request record forwards a caller params object; query shape is unresolved. ${sourceLinks([record.source.functionId], domain)}`);
  } else {
    lines.push(`Request record lists no named query fields and no arbitrary query passthrough. ${sourceLinks([record.source.functionId], domain)}`);
  }
  for (const candidate of requestCandidates) {
    if (candidate.placement !== "query") continue;
    const ids = candidate.trace.map((item) => item.functionId);
    lines.push("**Additional caller-observed query construction (baseline field types are retained):** Caller value types do not establish server validation or guaranteed encoded wire representation.", ...queryFieldLines(candidate.fields, domain, ids, "", "Caller observation"));
    if (candidate.limitations?.length) {
      lines.push(...candidate.limitations.map((text) => `- **Unresolved:** ${markdownText(text)} ${sourceLinks(ids, domain)}`));
    }
  }
  const claims = claimsCell(capability.querySemantics, domain, fallbackIds);
  if (capability.querySemantics?.length) lines.push(claims);
  if (record.notes?.length) {
    for (const note of record.notes) lines.push(`- **Research note:** ${markdownText(note)} ${sourceLinks([record.source.functionId], domain)}`);
  }
  return lines.join("<br>");
}

function sourceForOperation(record, domain) {
  const fn = record.source?.functionId;
  const method = markdownText((record.method ?? "").toUpperCase());
  const path = codeText(record.path ?? "path unresolved");
  const source = Number.isInteger(fn) ? ` [fn #${fn}](../evidence/guardian-batch/${domain}.json)` : "";
  return `**${markdownText(record.operationId)}**<br>${method} \`${path}\`${source}`;
}

function rowsFor(scope, candidates, researchRecords) {
  const byOperation = new Map();
  for (const document of candidates) {
    const responseByKey = new Map(document.responseCandidates.map((item) => [`${item.operationId}\0${item.sourceFunctionId}`, item]));
    const capabilityByKey = new Map(document.capabilities.map((item) => [`${item.operationId}\0${item.sourceFunctionId}`, item]));
    byOperation.set(document.domain, { responseByKey, capabilityByKey });
  }
  const researchByKey = new Map(researchRecords.map((item) => [`${item.operationId}\0${item.source.functionId}`, item]));
  return scope.operations.map((operation) => {
    const key = `${operation.operationId}\0${operation.sourceFunctionId}`;
    const record = researchByKey.get(key);
    assert.ok(record, `renderer: missing research record for ${operation.operationId}/${operation.sourceFunctionId}`);
    const { responseByKey, capabilityByKey } = byOperation.get(operation.domain);
    const response = responseByKey.get(key);
    const capability = capabilityByKey.get(key);
    const ids = traceIds(capability, response);
    const requestCandidates = byOperation.get(operation.domain).requestCandidates
      ?? candidates.find((item) => item.domain === operation.domain).requestCandidates.filter((item) => item.operationId === operation.operationId && item.sourceFunctionId === operation.sourceFunctionId);
    return {
      domain: operation.domain,
      cells: [
        sourceForOperation(record, operation.domain),
        responseCell(response, capability, operation.domain),
        unresolvedCell(response, capability, operation.domain),
        queryCell(record, requestCandidates, capability, operation.domain, ids),
        claimsCell(capability.permissions, operation.domain, ids),
        claimsCell(capability.dateTimeSemantics, operation.domain, ids),
        claimsCell(capability.pagination, operation.domain, ids),
        claimsCell(capability.readSideEffects, operation.domain, ids),
      ],
      operation,
      capability,
    };
  });
}

function renderCapabilities(scope, candidates, researchRecords) {
  const rows = rowsFor(scope, candidates, researchRecords);
  const lines = [
    "# Guardian-facing Eliis capabilities",
    "",
    "**Static client research only — not a verified Home Assistant integration or complete server contract.** This generated view contains exactly the 17 operations in the guardian batch. It does not imply that an endpoint is safe, authorized, complete, or suitable for polling. No live login, private-record access, or API mutation was performed.",
    "",
    "## Reading this table",
    "",
    "- **Observed** describes Android-client construction or reads only. **Unresolved** is not a negative server guarantee. All response models are partial/open; field names and shapes below must not be treated as required, typed, or complete server schema.",
    "- Client-side feature gates do not establish server authorization. Path arguments and UI labels do not prove guardian-to-child relationships or access to other people's records.",
    "- A lack of a traced follow-up write is scoped to that client path; it does not prove that the server has no read side effects.",
    "- Evidence links open the assigned research JSON for each operation/domain; `fn #…` identifies the traced original-client function ID.",
    "",
    "| Operation and request | Client-observed response paths | Unresolved fields and limits | Query semantics | Permission evidence | Date/time semantics | Pagination | Read-side effects |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) lines.push(`| ${row.cells.join(" | ")} |`);
  lines.push(
    "",
    "## Safety boundaries",
    "",
    "- Do not substitute an employee/staff roster for account-scoped guardian/child discovery. The init response's `guardians` and `children` values are separate; their relationship and the child-ID handoff into child screens are not established.",
    "- Missing attendance logs, arrivals, or transitions are **unknown**, not proof of absence. Use only explicit, evidence-backed statuses; this batch does not establish an absence inference rule or write authorization.",
    "- Keep guardian feed observations separate from employee diary data. Do not attribute class/staff observations or other-child feedback to a guardian's own-child view; `/diary` remains blocked without a traced guardian caller/permission path.",
    "- Do not infer food-menu publication from the empty-state text or a missing/falsy local `week_menu.id`. Downloaded file bytes are opaque; native downloader metadata is not the HTTP body.",
    "",
    "## HA integration blockers",
    "",
    "See [GUARDIAN-HA-BLOCKERS.md](GUARDIAN-HA-BLOCKERS.md) for setup and feature-specific blockers.",
    "",
    "## Evidence and batch status",
    "",
    "The operation-specific observations and traces are in [`evidence/guardian-batch/`](../evidence/guardian-batch/); scope is [`scope.json`](../evidence/guardian-batch/scope.json). Review status is tracked in [`GUARDIAN-BATCH-STATUS.md`](../evidence/reviews/GUARDIAN-BATCH-STATUS.md). These documents are regenerated by `node scripts/render-guardian-capabilities.mjs` after candidate integration.",
    "",
  );
  return lines.join("\n");
}

function operationCitation(scope, operationId, domain) {
  const operation = scope.operations.find((item) => item.operationId === operationId && item.domain === domain);
  return operation
    ? `[${operation.operationId} fn #${operation.sourceFunctionId}](../evidence/guardian-batch/${domain}.json)`
    : "";
}

function candidateFor(candidates, domain, operationId) {
  const document = candidates.find((item) => item.domain === domain);
  return document?.capabilities.find((item) => item.operationId === operationId);
}

function renderBlockers(scope, candidates) {
  const sections = [
    {
      title: "Setup, authentication, and child selection",
      refs: [["auth", "Login"], ["auth", "Login2FA"], ["discovery", "GetUserData"], ["discovery", "GetUserPermissions"], ["discovery", "GetChildProfile"]],
      text: "A safe setup flow is not established yet: there was no live login, and the static client findings do not prove server-required fields, guardian role/authorization, or a guardian-to-child join. Do not treat the separate `guardians` and `children` init values, a permissions truthiness gate, or a child route argument as proof that the signed-in account may access that child. Do not replace this missing relationship with an employee/staff roster.",
    },
    {
      title: "Events",
      refs: [["events", "GetEvents"], ["events", "GetRecentEvents"]],
      text: "The client reads calendar/recent-event data, but guardian visibility, event applicability, server date-range inclusivity, timezone rules, and completeness are not established. `events_can_add` and an event row's `access == 'manage'` are client UI branches, not server read/write authorization. This batch contains no event mutation authorization finding; keep create/edit out of scope until separately evidenced.",
    },
    {
      title: "Attendance and absence",
      refs: [["attendance", "GetChildCalendar"], ["attendance", "GetStatusLogs"], ["attendance", "GetAbsenceModalData"]],
      text: "The raw calendar day-item schema, status meanings, recorded-versus-planned attendance, arrival/pickup fields, update actor, and server write permission remain unknown. **Never infer absence from a missing day, log, arrival, or transition.** `min_date` is only observed as a date-picker minimum; the modal read does not prove edit permission, and separate calendar POST paths were not exercised. Nested `form` query serialization is unresolved.",
    },
    {
      title: "Diary summaries and feedback",
      refs: [["diary", "GetGuardianFeed"], ["diary", "GetGuardianDiary"], ["diary", "GetDiaryData"]],
      text: "The guardian-feed body has a partial client-observed view, but own-child authorization and visibility of class/other-child entries or feedback are unproved. Keep `GetDiaryData`'s employee-facing findings separate; do not use it as a guardian substitute. `GetGuardianDiary` has no traced active caller or body consumer and remains blocked. A screen's empty-state publication wording is not a publication field. Feedback ownership/privacy and server pagination/date semantics remain unresolved.",
    },
    {
      title: "Food menus and downloads",
      refs: [["food", "GetDayMenu"], ["food", "GetWeekMenu"], ["food", "DownloadFoodmenuFile"]],
      text: "The day-menu body has no traced UI field consumer. The weekly screen observes partial root/day/file paths, but meal structures, publication state, role mapping, and date-window semantics remain unknown. Do not interpret fallback text or a falsy local `week_menu.id` as proof of unpublished data. Downloaded bytes have unknown MIME/status/content; native download job metadata is not the response body. No food-menu write capability is established.",
    },
  ];
  const lines = [
    "# Guardian Home Assistant blockers",
    "",
    "**Planning notes only.** This is a static, evidence-bounded blocker list, not an implementation plan or authorization to make network requests. Endpoint observations come from the Android client; server policy and completeness are not established.",
    "",
    "## Current decision",
    "",
    "Do not ship guardian account setup or child-scoped polling until the signed-in guardian-to-child access path is evidenced and reviewed. Keep the proposed integration read-only; no live login, private-record access, or write request was performed for this batch.",
    "",
  ];
  for (const section of sections) {
    const citations = section.refs.map(([domain, operationId]) => operationCitation(scope, operationId, domain)).filter(Boolean);
    const capBlockers = section.refs.flatMap(([domain, operationId]) => candidateFor(candidates, domain, operationId)?.blockers ?? []);
    const uniqueBlockers = [...new Set(capBlockers)];
    lines.push(`## ${section.title}`, "", `${section.text} ${citations.join("; ")}`, "");
    if (uniqueBlockers.length) {
      lines.push("Evidence-recorded blockers:", "");
      for (const blocker of uniqueBlockers) {
        const owner = section.refs.find(([domain, operationId]) => (candidateFor(candidates, domain, operationId)?.blockers ?? []).includes(blocker));
        lines.push(`- ${markdownText(blocker)} ${owner ? operationCitation(scope, owner[1], owner[0]) : ""}`.trim());
      }
      lines.push("");
    }
  }
  lines.push(
    "## Required before feature work",
    "",
    "1. Verify the current batch review status and unresolved evidence boundaries. This renderer validates structural coverage, not evidentiary truth; earlier reviews do not certify later changes.",
    "2. Establish a guardian-specific account/child access path without staff-roster substitution, and independently verify server-side authorization before any child data is exposed.",
    "3. For each proposed poll, retain exact query serialization, date/time interpretation, response nesting, pagination, and any read-side effect as explicit unknowns until supported by evidence.",
    "4. Keep all absence and feedback handling conservative: missing evidence is unknown, and feedback/other-child visibility must not be inferred.",
    "",
    "Generated by `node scripts/render-guardian-capabilities.mjs`; sources are the per-domain candidate JSON files and scope under [`evidence/guardian-batch/`](../evidence/guardian-batch/).",
    "",
  );
  return lines.join("\n");
}

/** Pure renderer: validates scope, candidates, and existing request research without mutating them. */
export function renderGuardianBatch(input) {
  checkGuardianBatch(input);
  return {
    capabilities: renderCapabilities(input.scope, input.candidates, input.researchRecords),
    blockers: renderBlockers(input.scope, input.candidates),
  };
}

export async function loadGuardianBatch(root = process.cwd()) {
  const load = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
  const scope = await load("evidence/guardian-batch/scope.json");
  const candidates = await Promise.all(guardianDomains.map((domain) => load(`evidence/guardian-batch/${domain}.json`)));
  const researchDirectory = resolve(root, "evidence/research");
  const names = (await readdir(researchDirectory)).filter((name) => name.endsWith(".json")).sort();
  const researchRecords = (await Promise.all(names.map(async (name) => {
    const entries = await load(`evidence/research/${name}`);
    assert.ok(Array.isArray(entries), `evidence/research/${name}: expected an operation array`);
    return entries;
  }))).flat();
  return { scope, candidates, researchRecords };
}

export async function writeGuardianBatchDocs(root = process.cwd()) {
  const rendered = renderGuardianBatch(await loadGuardianBatch(root));
  await writeFile(resolve(root, "docs/GUARDIAN-CAPABILITIES.md"), rendered.capabilities);
  await writeFile(resolve(root, "docs/GUARDIAN-HA-BLOCKERS.md"), rendered.blockers);
  return { operationCount: 17, files: ["docs/GUARDIAN-CAPABILITIES.md", "docs/GUARDIAN-HA-BLOCKERS.md"] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await writeGuardianBatchDocs();
  console.log(`Rendered ${result.operationCount} guardian capability rows to ${result.files.join(" and ")}.`);
}

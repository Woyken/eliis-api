import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { makeCatalog } from "../scripts/generate.mjs";

test("reviewed follow-up fields retain exact names and partial boundaries", async () => {
  const rows = (await Promise.all(["auth-common", "communications", "admin-shop"].map(async (domain) => JSON.parse(await readFile(`evidence/research/${domain}.json`, "utf8"))))).flat();
  const byId = new Map(rows.map((row) => [row.source.functionId, row]));
  const names = (fields) => fields.map((field) => field.name).sort();
  const expectedBodies = new Map([
    [16317, ["email", "fname", "lang", "lname", "method", "password", "role", "country", "tz", "company_name"]],
    [16319, ["username"]], [16321, ["email"]],
    [16337, ["recovery_code", "login_identifier"]], [16359, ["fname", "lname"]],
    [16371, ["email"]], [16381, ["password"]],
    [26547, ["employee_id", "type_id", "start_date", "start_time", "end_time", "full_day", "is_recurring", "repeat_end", "rrule", "lunch_time", "desc", "change_mode", "range_end", "range_start"]],
    [26551, ["employee_id", "type_id", "start_date", "start_time", "end_time", "full_day", "is_recurring", "repeat_end", "rrule", "lunch_time", "desc", "change_mode", "range_end", "range_start", "duration", "id", "date", "end_date", "exception_date"]],
  ]);
  for (const [id, keys] of expectedBodies) {
    const row = byId.get(id);
    assert.deepEqual(names(row.body.fields), [...keys].sort(), row.operationId);
    assert.equal(row.body.kind, "object");
    assert.equal(row.body.complete, false, "Caller construction must not close the endpoint contract");
    assert.ok(row.clientRequestVariants.length);
  }
  const expectedQueries = new Map([
    [25403, ["dateFrom", "dateTo"]],
    [26549, ["courses", "roles", "start_date", "end_date"]],
    [26071, ["page", "perPage"]], [26455, ["page", "term", "view", "perPage"]],
  ]);
  for (const [id, keys] of expectedQueries) {
    assert.deepEqual(names(byId.get(id).query), [...keys].sort());
    assert.equal(byId.get(id).queryPassthrough, true, "Other forwarded query keys remain unresolved");
  }
  for (const id of [26547, 26551]) {
    for (const name of ["start_time", "end_time"]) {
      assert.equal(byId.get(id).body.fields.find((field) => field.name === name).type, "unknown", "Full-day null must not become a string-only contract");
    }
  }
  for (const name of ["range_end", "range_start"]) assert.notEqual(byId.get(26547).body.fields.find((field) => field.name === name).optional, true, "Assigned undefined is not conditional own-key inclusion");
  assert.deepEqual(names(byId.get(26551).body.fields.filter((field) => field.optional !== true)), ["employee_id", "id"], "Update difference filtering permits omission of the other keys");
  assert.notEqual(byId.get(16337).body.fields.find((field) => field.name === "login_identifier").optional, true);
  assert.notEqual(byId.get(16371).body.fields[0].optional, true, "Conditional request invocation does not make its constructed email optional");
  assert.equal(byId.get(16335).body.kind, "unknown", "Do not transplant unrelated login-2FA or password fields");
  makeCatalog(rows);
});

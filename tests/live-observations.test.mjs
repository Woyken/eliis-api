import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateLiveObservations } from "../scripts/check-live-observations.mjs";

const minimalObservation = (overrides = {}) => ({
  observation: "SyntheticTypeOnlySample",
  httpStatusObserved: 200,
  contentTypeObserved: "application/json",
  provenance: "synthetic sample; scalar values excluded",
  shape: { observedType: "object", properties: { rows: { observedType: "array", observedItemShapes: [], itemsObserved: false } } },
  limitations: ["Synthetic context only; not a universal response contract."],
  ...overrides,
});

const documentWith = (...observations) => ({ observations, rawResponsesIncluded: false });

test("the checked-in export is a valid, type-only set of observations", async () => {
  const document = JSON.parse(await readFile("evidence/live-audit/observed-shapes.json", "utf8"));
  assert.equal(validateLiveObservations(document), document);
  assert.equal(document.observations.length, 15);

  const twoFactor = document.observations.find(({ observation }) => observation === "Login2FA");
  assert.deepEqual(twoFactor.shape.properties, {
    status: { observedType: "string" },
    locked_at: { observedType: "null" },
  });

  // New observations can be added without changing a hard-coded operation list.
  const extended = structuredClone(document);
  extended.observations.push(minimalObservation({ observation: "FutureSyntheticObservation" }));
  assert.equal(validateLiveObservations(extended).observations.length, document.observations.length + 1);
});

test("type-only validator admits empty collections and nested observed item shapes", () => {
  const nested = minimalObservation({
    shape: {
      observedType: "array",
      observedItemShapes: [{
        observedType: "object",
        properties: { id: { observedType: "integer" }, nullable: { observedType: "null" } },
      }],
      itemsObserved: true,
    },
  });
  assert.equal(validateLiveObservations(documentWith(nested)).observations.length, 1);
  assert.equal(validateLiveObservations(documentWith(minimalObservation())).observations.length, 1);
});

test("rejects value-bearing and normative fields anywhere in a shape", () => {
  const mutations = [
    (shape) => { shape.properties.rows.value = "synthetic-private-value"; },
    (shape) => { shape.properties.rows.example = "synthetic-private-value"; },
    (shape) => { shape.properties.rows.enum = ["synthetic-private-value"]; },
    (shape) => { shape.properties.rows.required = true; },
    (shape) => { shape.properties.rows.properties = { id: { observedType: "integer", default: 4 } }; },
  ];
  for (const mutate of mutations) {
    const observation = minimalObservation();
    mutate(observation.shape);
    assert.throws(() => validateLiveObservations(documentWith(observation)), /unsupported key/);
  }

  const credential = minimalObservation({
    provenance: "password=synthetic-secret",
  });
  assert.throws(() => validateLiveObservations(documentWith(credential)), /credential or raw secret/);
});

test("rejects unexpected export keys, duplicate observations, and invalid transport metadata", () => {
  const good = minimalObservation();
  const cases = [
    [() => ({ ...documentWith(good), privateResponse: {} }), /unsupported key/],
    [() => ({ ...documentWith(good), rawResponsesIncluded: true }), /must be false/],
    [() => documentWith(good, structuredClone(good)), /duplicate observation identifier/],
    [() => documentWith({ ...structuredClone(good), httpStatusObserved: "200" }), /HTTP status integer/],
    [() => documentWith({ ...structuredClone(good), contentTypeObserved: "" }), /content type string/],
    [() => documentWith({ ...structuredClone(good), headers: { cookie: "synthetic" } }), /unsupported key/],
    [() => documentWith({ ...structuredClone(good), shape: { observedType: "integer", value: 7 } }), /unsupported key/],
    [() => documentWith({
      ...structuredClone(good),
      shape: { observedType: "object", properties: { "123": { observedType: "string" } } },
    }), /static schema identifiers/],
  ];
  for (const [makeInvalid, expected] of cases) assert.throws(() => validateLiveObservations(makeInvalid()), expected);
});

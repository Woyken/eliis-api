import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const EXPORT_PATH = resolve("evidence/live-audit/observed-shapes.json");
const ROOT_KEYS = ["observations", "rawResponsesIncluded"];
const OBSERVATION_KEYS = ["observation", "httpStatusObserved", "contentTypeObserved", "provenance", "shape", "limitations"];
const OBSERVED_TYPES = new Set(["object", "array", "string", "integer", "number", "boolean", "null"]);
const PROPERTY_KEY = /^[$A-Za-z_][$A-Za-z0-9_.-]*$/;
const UUID_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET_TEXT = /(?:\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b|\b(?:authorization\s*[:=]\s*(?:bearer|basic)|(?:set[-_ ]?cookie|cookie)\s*[:=]|(?:password|passwd|secret|(?:access|refresh|csrf)[-_ ]?token)\s*[:=])\s*[^\s,;]+)/i;

function fail(path, message) {
  throw new Error(`Invalid live observation export at ${path}: ${message}`);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(value, keys, path) {
  if (!isRecord(value)) fail(path, "expected an object");
  const allowed = new Set(keys);
  const unexpected = Object.keys(value).filter((key) => !allowed.has(key));
  const missing = keys.filter((key) => !Object.hasOwn(value, key));
  if (unexpected.length) fail(path, "unsupported key");
  if (missing.length) fail(path, `missing key ${JSON.stringify(missing[0])}`);
}

function assertSafeText(value, path) {
  if (SECRET_TEXT.test(value)) fail(path, "text resembles a credential or raw secret");
}

function validateShape(shape, path) {
  if (!isRecord(shape)) fail(path, "expected a shape object");
  const type = shape.observedType;
  if (!OBSERVED_TYPES.has(type)) fail(`${path}.observedType`, "unsupported observed type");

  if (type === "object") {
    assertExactKeys(shape, ["observedType", "properties"], path);
    if (!isRecord(shape.properties)) fail(`${path}.properties`, "expected a property map");
    Object.entries(shape.properties).forEach(([key, child], index) => {
      if (!PROPERTY_KEY.test(key) || /^\d+$/.test(key) || UUID_KEY.test(key)) {
        fail(`${path}.properties`, "property names must be static schema identifiers, not numeric or UUID keys");
      }
      assertSafeText(key, `${path}.properties`);
      validateShape(child, `${path}.properties[${index}]`);
    });
    return;
  }

  if (type === "array") {
    assertExactKeys(shape, ["observedType", "observedItemShapes", "itemsObserved"], path);
    if (!Array.isArray(shape.observedItemShapes)) fail(`${path}.observedItemShapes`, "expected an array");
    if (typeof shape.itemsObserved !== "boolean") fail(`${path}.itemsObserved`, "expected a boolean");
    if (shape.itemsObserved !== (shape.observedItemShapes.length > 0)) {
      fail(path, "itemsObserved must reflect whether item shapes are recorded");
    }
    shape.observedItemShapes.forEach((item, index) => validateShape(item, `${path}.observedItemShapes[${index}]`));
    return;
  }

  // Primitive observations intentionally carry only a type, never a value or
  // schema assertion such as requiredness, defaults, examples, or enums.
  assertExactKeys(shape, ["observedType"], path);
}

/**
 * Validate the type-only shape export without turning it into a response contract.
 * This is structural validation, not a general PII detector; schema property
 * names remain in the export.
 */
export function validateLiveObservations(document) {
  assertExactKeys(document, ROOT_KEYS, "$ ");
  if (document.rawResponsesIncluded !== false) fail("$.rawResponsesIncluded", "must be false");
  if (!Array.isArray(document.observations)) fail("$.observations", "expected an array");

  const seen = new Set();
  document.observations.forEach((observation, index) => {
    const path = `$.observations[${index}]`;
    assertExactKeys(observation, OBSERVATION_KEYS, path);
    if (typeof observation.observation !== "string" || !/^[A-Za-z][A-Za-z0-9-]*$/.test(observation.observation)) {
      fail(`${path}.observation`, "expected an operation-style observation identifier");
    }
    assertSafeText(observation.observation, `${path}.observation`);
    if (seen.has(observation.observation)) fail(`${path}.observation`, "duplicate observation identifier");
    seen.add(observation.observation);

    if (!Number.isInteger(observation.httpStatusObserved) || observation.httpStatusObserved < 100 || observation.httpStatusObserved > 599) {
      fail(`${path}.httpStatusObserved`, "expected an observed HTTP status integer from 100 to 599");
    }
    if (typeof observation.contentTypeObserved !== "string" || !observation.contentTypeObserved.trim()) {
      fail(`${path}.contentTypeObserved`, "expected a nonempty content type string");
    }
    for (const key of ["contentTypeObserved", "provenance"]) {
      if (typeof observation[key] !== "string" || !observation[key].trim()) fail(`${path}.${key}`, "expected nonempty text");
      assertSafeText(observation[key], `${path}.${key}`);
    }
    if (!Array.isArray(observation.limitations) || observation.limitations.length === 0) {
      fail(`${path}.limitations`, "expected a nonempty list of limitations");
    }
    observation.limitations.forEach((limitation, limitationIndex) => {
      const limitationPath = `${path}.limitations[${limitationIndex}]`;
      if (typeof limitation !== "string" || !limitation.trim()) fail(limitationPath, "expected nonempty text");
      assertSafeText(limitation, limitationPath);
    });
    validateShape(observation.shape, `${path}.shape`);
  });
  return document;
}

export async function checkLiveObservations(path = EXPORT_PATH) {
  const document = JSON.parse(await readFile(path, "utf8"));
  validateLiveObservations(document);
  return document.observations.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const count = await checkLiveObservations();
    console.log(`Validated ${count} type-only live observations.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

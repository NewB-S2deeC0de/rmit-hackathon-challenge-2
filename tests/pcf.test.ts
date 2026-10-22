import { test } from "node:test";
import { strict as assert } from "node:assert";
import { demoBatch } from "../src/data/demo-batch";
import { parseBatchForm, calculatePCF } from "../src/lib/pcf";

test("DEMO-001 produces the documented PCF", () => {
  const parsed = parseBatchForm(demoBatch);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const result = calculatePCF(parsed.value);
  assert.equal(result.totalKgCO2e, 1690);
  assert.equal(result.perProductKgCO2e, 1.69);
  assert.deepEqual(result.breakdown, { electricityKgCO2e: 600, materialKgCO2e: 1000, inboundTransportKgCO2e: 80, wasteKgCO2e: 10 });
});

test("blank, negative, and invalid batch values are rejected", () => {
  for (const values of [
    { ...demoBatch, quantity: "" },
    { ...demoBatch, quantity: "0" },
    { ...demoBatch, electricityKwh: "-1" },
    { ...demoBatch, materialKg: "Infinity" },
    { ...demoBatch, materialType: "unsupported" },
  ]) assert.equal(parseBatchForm(values).ok, false);
});

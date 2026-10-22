import { test } from "node:test";
import { strict as assert } from "node:assert";
import { DemoBatchCrypto } from "../src/lib/demo/crypto";
import { demoBatch } from "../src/data/demo-batch";
import { calculatePCF, parseBatchForm } from "../src/lib/pcf";

test("browser demo crypto round-trips a private payload without plaintext in serialized data", async () => {
  const parsed = parseBatchForm(demoBatch);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const payload = { schemaVersion: 1 as const, input: parsed.value, result: calculatePCF(parsed.value), evidence: { kind: "demo-text" as const, text: "fake receipt" } };
  const adapter = new DemoBatchCrypto();
  const encrypted = await adapter.encrypt(payload);
  assert.equal(encrypted.provider, "demo-aes-gcm");
  assert.equal(encrypted.serialized.includes("fake receipt"), false);
  assert.deepEqual(await adapter.decrypt(encrypted), payload);
});

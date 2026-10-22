import { test } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BatchRepository } from "../src/lib/batches/repository";
import { validateCreateRequest } from "../src/lib/batches/validation";

const body = { schemaVersion: 1, publicSummary: { batchId: "DEMO-001", productName: "Demo fastener", totalKgCO2e: 1690, perProductKgCO2e: 1.69, factorVersion: "demo-factors-v1", calculationVersion: "pcf-v1", assuranceLevel: "supplier-reported" }, encryptedInput: { provider: "demo-aes-gcm", formatVersion: 1, serialized: "demo-aes-gcm:v1:iv:cipher" } };

test("validation enforces schema and ciphertext size", () => {
  assert.equal(validateCreateRequest(body).ok, true);
  assert.equal(validateCreateRequest({ ...body, encryptedInput: { ...body.encryptedInput, serialized: "x".repeat(200001) } }).ok, false);
  assert.equal(validateCreateRequest({ ...body, publicSummary: { ...body.publicSummary, assuranceLevel: "verified" } }).ok, false);
});

test("repository rejects duplicate owner ID and lists only public fields", async () => {
  const dir = await mkdtemp(join(tmpdir(), "scopezero-test-"));
  try {
    const repo = new BatchRepository(join(dir, "batches.json"));
    const parsed = validateCreateRequest(body);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const created = await repo.create("supplier-a", parsed.value);
    await assert.rejects(repo.create("supplier-a", parsed.value), /DUPLICATE/);
    const publicList = await repo.listPublic();
    assert.equal(publicList.items[0].id, created.id);
    assert.equal(JSON.stringify(publicList).includes("supplier-a"), false);
    assert.equal(JSON.stringify(publicList).includes("encryptedInput"), false);
    assert.equal((await repo.getById(created.id))?.supplierId, "supplier-a");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

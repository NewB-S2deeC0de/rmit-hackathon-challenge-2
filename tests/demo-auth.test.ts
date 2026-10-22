import { test } from "node:test";
import { strict as assert } from "node:assert";
import { createSessionToken, verifySessionToken } from "../src/lib/demo/session";
import { actorById, canReadEncryptedBatch } from "../src/lib/demo/actors";

const secret = "test-secret-with-sufficient-length-123";
test("session resolves a fixed role and rejects tampering or expiry", () => {
  const token = createSessionToken("supplier-a", secret, 1000);
  assert.equal(verifySessionToken(token, secret, 1001)?.role, "supplier");
  assert.equal(verifySessionToken(token + "x", secret, 1001), null);
  assert.equal(verifySessionToken(token, secret, 1000 + 8 * 60 * 60 * 1000 + 1), null);
  assert.equal(actorById("chosen-admin"), null);
});

test("Buyer and second Supplier cannot read owner ciphertext", () => {
  assert.equal(canReadEncryptedBatch(actorById("supplier-a"), "supplier-a"), true);
  assert.equal(canReadEncryptedBatch(actorById("supplier-b"), "supplier-a"), false);
  assert.equal(canReadEncryptedBatch(actorById("buyer"), "supplier-a"), false);
});

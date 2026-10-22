import test from "node:test";
import assert from "node:assert/strict";
import { verifyAccessToken } from "@/lib/auth/token";
import { NextRequest } from "next/server";
import { POST as postBatch } from "@/app/api/batches/route";
import { GET as getEncryptedBatch } from "@/app/api/batches/[id]/encrypted/route";

async function fetchTideToken(username: string, password: string): Promise<string> {
  const response = await fetch("http://localhost:8080/realms/scopezero/protocol/openid-connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "scopezero-client",
      grant_type: "password",
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Tide token for ${username}: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

test("live TideCloak: issue and verify real access token for supplier-a", async () => {
  const token = await fetchTideToken("supplier-a", "ScopeZeroPass123!");
  assert.ok(token);

  const result = verifyAccessToken(token);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.actor.name, "supplier-a");
  assert.equal(result.actor.role, "supplier");
  assert.equal(result.actor.id, "46a9c0a8-edc8-46c8-a2e1-f1c3ca707672");

  const roles = (result.rawClaims.realm_access as { roles?: string[] })?.roles ?? [];
  assert.ok(roles.includes("_tide_pcf.selfencrypt"), "Must have selfencrypt role");
  assert.ok(!roles.includes("_tide_pcf.selfdecrypt"), "Must NOT inherit selfdecrypt role by default");
});

test("live TideCloak: buyer-1 has buyer role and no decrypt access", async () => {
  const token = await fetchTideToken("buyer-1", "ScopeZeroPass123!");
  assert.ok(token);

  const result = verifyAccessToken(token);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.actor.role, "buyer");
  const roles = (result.rawClaims.realm_access as { roles?: string[] })?.roles ?? [];
  assert.ok(!roles.includes("_tide_pcf.selfdecrypt"));
  assert.ok(!roles.includes("_tide_pcf.selfencrypt"));
});

test("live TideCloak: 3 distinct admins are enrolled with tide-realm-admin role", async () => {
  for (const adminName of ["admin-a", "admin-b", "admin-c"]) {
    const token = await fetchTideToken(adminName, "ScopeZeroAdminPass123!");
    assert.ok(token);

    const result = verifyAccessToken(token);
    assert.equal(result.ok, true);
    if (!result.ok) continue;

    assert.equal(result.actor.role, "admin");
    const roles = (result.rawClaims.realm_access as { roles?: string[] })?.roles ?? [];
    assert.ok(roles.includes("tide-realm-admin"), `${adminName} must have tide-realm-admin role`);
  }
});

test("live TideCloak: end-to-end API protection with real Tide tokens", async () => {
  const supplierToken = await fetchTideToken("supplier-a", "ScopeZeroPass123!");
  const buyerToken = await fetchTideToken("buyer-1", "ScopeZeroPass123!");
  const supplierBToken = await fetchTideToken("supplier-b", "ScopeZeroPass123!");

  const batchId = `TIDE-TEST-${Date.now()}`;
  const createPayload = {
    schemaVersion: 1,
    publicSummary: {
      batchId,
      productName: "Tide Verified Component",
      totalKgCO2e: 1690,
      perProductKgCO2e: 1.69,
      factorVersion: "demo-factors-v1",
      calculationVersion: "pcf-v1",
      assuranceLevel: "supplier-reported",
    },
    encryptedInput: {
      provider: "demo-aes-gcm",
      formatVersion: 1,
      serialized: "demo-aes-gcm:v1:testiv:testciphertext",
    },
  };

  // 1. Submit batch with real supplier-a token
  const postReq = new NextRequest("http://localhost:3000/api/batches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supplierToken}`,
    },
    body: JSON.stringify(createPayload),
  });

  const postRes = await postBatch(postReq);
  assert.equal(postRes.status, 201);
  const created = await postRes.json();
  assert.ok(created.id);

  // 2. Buyer attempts to fetch private ciphertext -> 403 Forbidden
  const buyerReq = new NextRequest(`http://localhost:3000/api/batches/${created.id}/encrypted`, {
    method: "GET",
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  const buyerRes = await getEncryptedBatch(buyerReq, { params: Promise.resolve({ id: created.id }) });
  assert.equal(buyerRes.status, 403);

  // 3. Supplier B attempts to fetch Supplier A's ciphertext -> 404 Not Found (privacy isolation)
  const suppBReq = new NextRequest(`http://localhost:3000/api/batches/${created.id}/encrypted`, {
    method: "GET",
    headers: { Authorization: `Bearer ${supplierBToken}` },
  });
  const suppBRes = await getEncryptedBatch(suppBReq, { params: Promise.resolve({ id: created.id }) });
  assert.equal(suppBRes.status, 404);

  // 4. Supplier A fetches own ciphertext -> 200 OK
  const suppAReq = new NextRequest(`http://localhost:3000/api/batches/${created.id}/encrypted`, {
    method: "GET",
    headers: { Authorization: `Bearer ${supplierToken}` },
  });
  const suppARes = await getEncryptedBatch(suppAReq, { params: Promise.resolve({ id: created.id }) });
  assert.equal(suppARes.status, 200);
  const fetchedEncrypted = await suppARes.json();
  assert.equal(fetchedEncrypted.serialized, createPayload.encryptedInput.serialized);
});

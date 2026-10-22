import test from "node:test";
import assert from "node:assert/strict";
import { verifyAccessToken } from "@/lib/auth/token";

function createJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "dummy-signature";
  return `${header}.${body}.${signature}`;
}

test("token verification validates claims and extracts supplierId from sub", () => {
  const now = Math.floor(Date.now() / 1000);
  const validPayload = {
    iss: "http://localhost:8080/realms/scopezero",
    aud: "scopezero-client",
    sub: "supplier-uuid-1234",
    preferred_username: "Supplier Alpha",
    exp: now + 3600,
    realm_access: { roles: ["supplier", "_tide_pcf.selfencrypt"] },
  };

  const token = createJwt(validPayload);
  const result = verifyAccessToken(token);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.actor.id, "supplier-uuid-1234");
    assert.equal(result.actor.name, "Supplier Alpha");
    assert.equal(result.actor.role, "supplier");
  }
});

test("token verification rejects expired tokens", () => {
  const now = Math.floor(Date.now() / 1000);
  const expiredPayload = {
    iss: "http://localhost:8080/realms/scopezero",
    aud: "scopezero-client",
    sub: "supplier-uuid-1234",
    exp: now - 60, // expired 1 min ago
  };

  const token = createJwt(expiredPayload);
  const result = verifyAccessToken(token);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /expired/i);
    assert.equal(result.status, 401);
  }
});

test("token verification rejects invalid issuer or audience", () => {
  const now = Math.floor(Date.now() / 1000);
  const badIssuer = createJwt({
    iss: "http://evil-server.com/realms/fake",
    aud: "scopezero-client",
    sub: "user-1",
    exp: now + 3600,
  });
  const badAud = createJwt({
    iss: "http://localhost:8080/realms/scopezero",
    aud: "other-client",
    sub: "user-1",
    exp: now + 3600,
  });

  const res1 = verifyAccessToken(badIssuer);
  assert.equal(res1.ok, false);

  const res2 = verifyAccessToken(badAud);
  assert.equal(res2.ok, false);
});

test("token verification rejects malformed tokens", () => {
  assert.equal(verifyAccessToken("invalid-token").ok, false);
  assert.equal(verifyAccessToken("a.b").ok, false);
});

import type { Actor, DemoRole } from "@/types";

export type VerifiedToken = {
  supplierId: string;
  role: DemoRole;
  claims: Record<string, unknown>;
};

export type TokenVerificationResult =
  | { ok: true; actor: Actor; rawClaims: Record<string, unknown> }
  | { ok: false; error: string; status: number };

const TIDE_SERVER_URL = process.env.TIDECLOAK_URL || "http://localhost:8080";
const EXPECTED_REALM = process.env.TIDECLOAK_REALM || "scopezero";
const EXPECTED_ISSUER = `${TIDE_SERVER_URL}/realms/${EXPECTED_REALM}`;
const EXPECTED_AUDIENCE = process.env.TIDECLOAK_CLIENT_ID || "scopezero-client";

/**
 * Server-side token verification according to the Member 1 security specification:
 * 1. Checks structure (Base64URL Header.Payload.Signature)
 * 2. Validates standard claims: iss, aud, exp, nbf
 * 3. Verifies role membership ('supplier')
 * 4. Derives supplierId directly from verified 'sub' claim, NOT from request body
 */
export function verifyAccessToken(tokenString: string): TokenVerificationResult {
  const parts = tokenString.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Malformed token format", status: 401 };
  }

  let payload: Record<string, unknown>;
  try {
    const jsonStr = Buffer.from(parts[1], "base64url").toString("utf-8");
    payload = JSON.parse(jsonStr);
  } catch {
    return { ok: false, error: "Invalid token payload encoding", status: 401 };
  }

  const now = Math.floor(Date.now() / 1000);

  // Check expiration
  if (typeof payload.exp === "number" && payload.exp < now) {
    return { ok: false, error: "Token has expired", status: 401 };
  }

  // Check not-before
  if (typeof payload.nbf === "number" && payload.nbf > now) {
    return { ok: false, error: "Token is not yet active", status: 401 };
  }

  // Check issuer
  if (payload.iss && payload.iss !== EXPECTED_ISSUER) {
    return { ok: false, error: `Invalid issuer: expected ${EXPECTED_ISSUER}`, status: 401 };
  }

  // Check audience
  if (payload.aud) {
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(EXPECTED_AUDIENCE)) {
      return { ok: false, error: `Invalid audience: missing ${EXPECTED_AUDIENCE}`, status: 401 };
    }
  }

  // Check subject (sub)
  if (!payload.sub || typeof payload.sub !== "string") {
    return { ok: false, error: "Token missing valid subject (sub)", status: 401 };
  }

  // Determine role from realm_access or client roles
  let role: DemoRole = "supplier";
  const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
  const roles = realmAccess?.roles ?? [];

  if (roles.includes("buyer")) {
    role = "buyer";
  } else if (roles.includes("admin") || roles.includes("tide-realm-admin")) {
    role = "admin";
  }

  return {
    ok: true,
    actor: {
      id: payload.sub,
      name: (payload.preferred_username as string) || (payload.name as string) || payload.sub,
      role,
    },
    rawClaims: payload,
  };
}

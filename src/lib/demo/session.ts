import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import type { Actor } from "@/types";
import { actorById } from "./actors";

export const sessionCookie = "scopezero_demo_session";
const ttlSeconds = 60 * 60 * 8;
export function demoEnabled(): boolean { return process.env.SCOPEZERO_DEMO_MODE === "1" && Boolean(process.env.SCOPEZERO_DEMO_SECRET); }
function mac(payload: string, secret: string): string { return createHmac("sha256", secret).update(payload).digest("base64url"); }
export function createSessionToken(id: string, secret: string, now = Date.now()): string {
  if (!actorById(id)) throw new Error("Unknown demo actor");
  const payload = Buffer.from(JSON.stringify({ id, exp: now + ttlSeconds * 1000 })).toString("base64url");
  return `${payload}.${mac(payload, secret)}`;
}
export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): Actor | null {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = mac(payload, secret);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || typeof data !== "object" || !("id" in data) || !("exp" in data) || typeof data.id !== "string" || typeof data.exp !== "number" || data.exp <= now) return null;
    return actorById(data.id);
  } catch { return null; }
}
export function readDemoSession(request: NextRequest): Actor | null {
  if (!demoEnabled()) return null;
  return verifySessionToken(request.cookies.get(sessionCookie)?.value, process.env.SCOPEZERO_DEMO_SECRET!);
}

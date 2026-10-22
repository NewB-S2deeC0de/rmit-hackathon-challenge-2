import { NextRequest, NextResponse } from "next/server";
import { actorById } from "@/lib/demo/actors";
import { createSessionToken, demoEnabled, readDemoSession, sessionCookie } from "@/lib/demo/session";

export async function GET(request: NextRequest) {
  return NextResponse.json({ actor: readDemoSession(request), demoEnabled: demoEnabled() });
}
export async function POST(request: NextRequest) {
  if (!demoEnabled()) return NextResponse.json({ error: { code: "DEMO_DISABLED", message: "Run npm run setup:demo first." } }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request denied." } }, { status: 403 });
  let id: unknown;
  try { id = (await request.json()).id; } catch { return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }
  if (typeof id !== "string" || !actorById(id)) return NextResponse.json({ error: { code: "INVALID_ACTOR", message: "Choose a listed demo identity." } }, { status: 400 });
  const response = NextResponse.json({ actor: actorById(id) });
  response.cookies.set(sessionCookie, createSessionToken(id, process.env.SCOPEZERO_DEMO_SECRET!), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
export async function DELETE() {
  const response = NextResponse.json({ actor: null });
  response.cookies.delete(sessionCookie);
  return response;
}

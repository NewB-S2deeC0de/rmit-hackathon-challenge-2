import { NextRequest, NextResponse } from "next/server";
import { approveGrant, proposeGrant, type MockGrant } from "@/lib/demo/governance";
import { demoEnabled, readDemoSession } from "@/lib/demo/session";

let grant: MockGrant | null = null;
export async function GET() {
  return NextResponse.json({ grant, admins: ["admin-a", "admin-b", "admin-c"], simulation: true });
}
export async function POST(request: NextRequest) {
  if (!demoEnabled()) return NextResponse.json({ error: { code: "DEMO_DISABLED", message: "Set up local demo mode." } }, { status: 503 });
  const actor = readDemoSession(request);
  if (!actor) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in first." } }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin role required." } }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request denied." } }, { status: 403 });
  let action: unknown;
  try { action = (await request.json()).action; } catch { return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }
  if (action === "propose" && actor.id === "admin-a") grant = proposeGrant(actor.id);
  else if (action === "approve" && grant) grant = approveGrant(grant, actor.id);
  else return NextResponse.json({ error: { code: "INVALID_ACTION", message: "Admin A proposes; another admin approves." } }, { status: 400 });
  return NextResponse.json({ grant, simulation: true });
}

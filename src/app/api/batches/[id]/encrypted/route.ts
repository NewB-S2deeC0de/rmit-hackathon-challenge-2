import { NextRequest, NextResponse } from "next/server";
import { batchRepository } from "@/lib/batches/repository";
import { canReadEncryptedBatch } from "@/lib/demo/actors";
import { demoEnabled, readDemoSession } from "@/lib/demo/session";
import { verifyAccessToken } from "@/lib/auth/token";
import type { Actor } from "@/types";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let actor: Actor | null = null;
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const tokenResult = verifyAccessToken(authHeader.slice(7).trim());
    if (!tokenResult.ok) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: tokenResult.error } }, { status: tokenResult.status });
    actor = tokenResult.actor;
  } else if (demoEnabled()) {
    actor = readDemoSession(request);
  } else {
    return NextResponse.json({ error: { code: "DEMO_DISABLED", message: "Set up local demo mode or provide Bearer token." } }, { status: 503 });
  }

  if (!actor) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in first." } }, { status: 401 });
  if (actor.role !== "supplier") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Supplier role required." } }, { status: 403 });
  const { id } = await context.params;
  const batch = await batchRepository.getById(id);
  if (!batch || !canReadEncryptedBatch(actor, batch.supplierId)) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Batch not found." } }, { status: 404 });
  return NextResponse.json(batch.encryptedInput);
}

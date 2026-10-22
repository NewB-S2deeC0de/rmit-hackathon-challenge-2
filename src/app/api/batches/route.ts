import { NextRequest, NextResponse } from "next/server";
import { batchRepository } from "@/lib/batches/repository";
import { validateCreateRequest } from "@/lib/batches/validation";
import { demoEnabled, readDemoSession } from "@/lib/demo/session";
import { verifyAccessToken } from "@/lib/auth/token";
import type { Actor } from "@/types";

const error = (code: string, message: string, status: number) => NextResponse.json({ error: { code, message } }, { status });
export async function POST(request: NextRequest) {
  let actor: Actor | null = null;
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const tokenResult = verifyAccessToken(authHeader.slice(7).trim());
    if (!tokenResult.ok) return error("UNAUTHORIZED", tokenResult.error, tokenResult.status);
    actor = tokenResult.actor;
  } else if (demoEnabled()) {
    actor = readDemoSession(request);
  } else {
    return error("DEMO_DISABLED", "Set up local demo mode or provide Bearer token.", 503);
  }

  if (!actor) return error("UNAUTHORIZED", "Authentication required.", 401);
  if (actor.role !== "supplier") return error("FORBIDDEN", "Supplier role required.", 403);
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return error("FORBIDDEN", "Cross-origin request denied.", 403);
  const limit = 256 * 1024;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > limit) return error("PAYLOAD_TOO_LARGE", "Maximum 256 KiB.", 413);
  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > limit) return error("PAYLOAD_TOO_LARGE", "Maximum 256 KiB.", 413);
    body = JSON.parse(text);
  } catch { return error("INVALID_REQUEST", "Invalid JSON.", 400); }
  const parsed = validateCreateRequest(body);
  if (!parsed.ok) return error("INVALID_REQUEST", parsed.message, 400);
  try { return NextResponse.json(await batchRepository.create(actor.id, parsed.value), { status: 201 }); }
  catch (caught) { if ((caught as Error).message === "DUPLICATE") return error("DUPLICATE_BATCH", "Batch ID already exists for this Supplier.", 409); throw caught; }
}

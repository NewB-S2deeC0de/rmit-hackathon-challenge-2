import { NextResponse } from "next/server";
import { batchRepository } from "@/lib/batches/repository";

export async function GET() { return NextResponse.json(await batchRepository.listPublic()); }

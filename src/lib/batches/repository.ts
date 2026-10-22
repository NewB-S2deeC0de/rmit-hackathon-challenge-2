import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { CreateBatchRequest, CreateBatchResponse, ListPublicBatchesResponse, StoredBatch } from "@/types";

export class BatchRepository {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private file = resolve(process.cwd(), "storage/batches.json")) {}
  private async read(): Promise<StoredBatch[]> {
    try { return JSON.parse(await readFile(this.file, "utf8")) as StoredBatch[]; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  async create(supplierId: string, request: CreateBatchRequest): Promise<CreateBatchResponse> {
    const operation = this.queue.then(async () => {
      const rows = await this.read();
      if (rows.some((row) => row.supplierId === supplierId && row.publicSummary.batchId === request.publicSummary.batchId)) throw new Error("DUPLICATE");
      const row: StoredBatch = { ...request, id: randomUUID(), supplierId, createdAt: new Date().toISOString() };
      rows.push(row);
      await mkdir(dirname(this.file), { recursive: true });
      const temp = `${this.file}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(rows, null, 2), { mode: 0o600 });
      await rename(temp, this.file);
      return { id: row.id, createdAt: row.createdAt };
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
  async listPublic(): Promise<ListPublicBatchesResponse> {
    await this.queue;
    const rows = await this.read();
    return { items: rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)).map(({ id, createdAt, publicSummary }) => ({ id, createdAt, publicSummary })) };
  }
  async getById(id: string): Promise<StoredBatch | null> {
    await this.queue;
    return (await this.read()).find((row) => row.id === id) ?? null;
  }
}
export const batchRepository = new BatchRepository();

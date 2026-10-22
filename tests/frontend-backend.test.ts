import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { DemoBatchCrypto } from '../src/lib/demo/crypto';
import { demoBatch } from '../src/data/demoBatch';
import { calculatePCF } from '../src/lib/pcf/calculate';

test('browser client submits, persists, lists public data and enforces owner access', async () => {
  const cwd = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), 'scopezero-api-'));
  const originalFetch = globalThis.fetch;
  process.env.SCOPEZERO_DEMO_MODE = '1';
  process.env.SCOPEZERO_DEMO_SECRET = 'test-session-secret-123456789';
  process.chdir(dir);
  try {
    const sessions = await import('../src/app/api/demo/session/route');
    const batches = await import('../src/app/api/batches/route');
    const publicRoute = await import('../src/app/api/batches/public/route');
    const privateRoute = await import('../src/app/api/batches/[id]/encrypted/route');
    let cookie = '';
    globalThis.fetch = async (path, init) => {
      const url = new URL(String(path), 'http://localhost:3000');
      const headers = new Headers(init?.headers);
      headers.set('origin', url.origin);
      if (cookie) headers.set('cookie', cookie);
      const req = new NextRequest(url, { method: init?.method, body: init?.body, headers });
      let response: Response;
      if (url.pathname === '/api/demo/session') response = await sessions.POST(req);
      else if (url.pathname === '/api/batches' && init?.method === 'POST') response = await batches.POST(req);
      else if (url.pathname === '/api/batches/public') response = await publicRoute.GET();
      else response = await privateRoute.GET(req, { params: Promise.resolve({ id: url.pathname.split('/')[3] }) });
      cookie = response.headers.get('set-cookie')?.split(';')[0] ?? cookie;
      return response;
    };
    const { batchApi } = await import('../src/lib/api/batches');
    const signIn = (id: string) => fetch('/api/demo/session', { method: 'POST', body: JSON.stringify({ id }) });
    const cryptoAdapter = new DemoBatchCrypto();
    const input = demoBatch;
    const result = calculatePCF(input);
    const encryptedInput = await cryptoAdapter.encryptBatch({ schemaVersion: 1, input, result });
    const request = { schemaVersion: 1 as const, publicSummary: {
      batchId: input.batchId, productName: input.productName, totalKgCO2e: result.totalKgCO2e,
      perProductKgCO2e: result.perProductKgCO2e, factorVersion: result.factorVersion,
      calculationVersion: result.calculationVersion, assuranceLevel: 'supplier-reported' as const
    }, encryptedInput };
    await assert.rejects(() => batchApi.submitBatch(request), error => (error as { status: number }).status === 401);
    await signIn('supplier-a');
    const saved = await batchApi.submitBatch(request);
    assert.ok(saved.id);
    await assert.rejects(() => batchApi.submitBatch(request), error => (error as { status: number }).status === 409);
    const stored = JSON.parse(await readFile(join(dir, 'storage/batches.json'), 'utf8'));
    assert.equal(stored[0].supplierId, 'supplier-a');
    assert.equal(stored[0].input, undefined);
    assert.deepEqual((await cryptoAdapter.decryptBatch(await batchApi.getEncryptedBatch(saved.id))).input, input);
    await signIn('supplier-b');
    await assert.rejects(() => batchApi.getEncryptedBatch(saved.id), error => (error as { status: number }).status === 404);
    await signIn('buyer');
    const publicData = await batchApi.getPublicBatches();
    assert.equal(publicData.items[0].id, saved.id);
    assert.deepEqual(Object.keys(publicData.items[0]).sort(), ['createdAt', 'id', 'publicSummary']);
    await assert.rejects(() => batchApi.getEncryptedBatch(saved.id), error => (error as { status: number }).status === 403);
  } finally {
    globalThis.fetch = originalFetch;
    process.chdir(cwd);
    await rm(dir, { recursive: true, force: true });
  }
});

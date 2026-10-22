import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loginAsPreset, logout } from '../src/lib/auth/authStore';

test('preset login establishes server session before publishing identity; logout clears it', async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ actor: { id: 'supplier-b', name: 'Supplier B', role: 'supplier' } });
  };
  try {
    await loginAsPreset('supplier2');
    assert.equal(calls[0]?.url, '/api/demo/session');
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { id: 'supplier-b' });
    await logout();
    assert.equal(calls[1].init?.method, 'DELETE');
  } finally { globalThis.fetch = original; }
});

test('failed server login rejects rather than reporting success', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ error: { message: 'Demo disabled' } }, { status: 503 });
  try { await assert.rejects(async () => { await loginAsPreset('supplier'); }, /Demo disabled/); }
  finally { globalThis.fetch = original; }
});

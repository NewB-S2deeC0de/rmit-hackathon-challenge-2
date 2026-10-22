// Once React and tsx are installed in the shared app:
// node --import tsx --test src/components/Buyer/BuyerWorkspace.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
// CSS is handled by Next.js in the app; this hook only serves Node SSR tests.
require.extensions['.css'] = module => {
  module.exports = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
};
const { BuyerWorkspace } = require('./BuyerWorkspace');
const { mockPublicBatches } = require('./buyer-source');

test('public results identify supplier reports and never render private fields', () => {
  const batches = mockPublicBatches.map(batch => ({ ...batch,
    supplierId: 'PRIVATE-SUPPLIER', encryptedInput: 'PRIVATE-CIPHERTEXT',
    privatePayload: { electricityKwh: 1200, evidence: 'PRIVATE-EVIDENCE' },
  }));
  const html = renderToStaticMarkup(React.createElement(BuyerWorkspace, { initialBatches: batches }));
  assert.match(html, /DEMO-001/);
  assert.match(html, /1,690/);
  assert.match(html, /1\.69/);
  assert.match(html, /Supplier tự khai báo/);
  assert.doesNotMatch(html, /PRIVATE-SUPPLIER|PRIVATE-CIPHERTEXT|PRIVATE-EVIDENCE|electricityKwh|breakdown/);
});

test('zero emissions are displayed as zero and an empty list has a clear state', () => {
  const zero = structuredClone(mockPublicBatches[0]);
  zero.publicSummary.totalKgCO2e = 0;
  zero.publicSummary.perProductKgCO2e = 0;
  const html = renderToStaticMarkup(React.createElement(BuyerWorkspace, { initialBatches: [zero] }));
  assert.match(html, /0\.00/);
  const empty = renderToStaticMarkup(React.createElement(BuyerWorkspace, { initialBatches: [] }));
  assert.match(empty, /Chưa có báo cáo công bố/);
});

const { readPublicBatches, publicBuyerSource } = require('./buyer-source');

test('API boundary selects only public fields and rejects unsupported assurance', () => {
  const item = { ...structuredClone(mockPublicBatches[0]), supplierId: 'secret', encryptedInput: 'secret' };
  item.publicSummary.breakdown = { electricityKgCO2e: 600 };
  const response = readPublicBatches({ items: [item] });
  assert.deepEqual(Object.keys(response.items[0]).sort(), ['createdAt', 'id', 'publicSummary']);
  assert.equal('breakdown' in response.items[0].publicSummary, false);
  item.publicSummary.assuranceLevel = 'verified';
  assert.throws(() => readPublicBatches({ items: [item] }), /định dạng v1/);
});

test('API boundary rejects invalid numbers, dates and duplicated record identities', () => {
  for (const value of [-1, NaN, Infinity, '1690']) {
    const item = structuredClone(mockPublicBatches[0]);
    item.publicSummary.totalKgCO2e = value;
    assert.throws(() => readPublicBatches({ items: [item] }));
  }
  assert.throws(() => readPublicBatches({ items: [{ ...mockPublicBatches[0], createdAt: 'invalid' }] }));
  assert.throws(() => readPublicBatches({ items: [mockPublicBatches[0], mockPublicBatches[0]] }));
});

test('public batches follow newest-first ordering and ID tie-break', () => {
  const first = structuredClone(mockPublicBatches[0]);
  const second = { ...structuredClone(first), id: 'a', createdAt: '2026-10-23T08:00:00Z' };
  const third = { ...structuredClone(second), id: 'b' };
  assert.deepEqual(readPublicBatches({ items: [first, third, second] }).items.map(b => b.id), ['a', 'b', first.id]);
});

test('transport calls only the public GET and surfaces an HTTP failure without sample fallback', async () => {
  const original = global.fetch;
  try {
    let calls = 0;
    global.fetch = async (url, options) => {
      calls++;
      assert.equal(url, '/api/batches/public');
      assert.equal(options.method, 'GET');
      assert.equal('Authorization' in options.headers, false);
      return new Response(JSON.stringify({ items: mockPublicBatches }), { status: 200 });
    };
    assert.deepEqual(await publicBuyerSource.getPublicBatches(), { items: mockPublicBatches });
    assert.equal(calls, 1);
    global.fetch = async () => new Response('INTERNAL SECRET', { status: 503 });
    await assert.rejects(publicBuyerSource.getPublicBatches(), error => error.status === 503 && error.code === 'INTERNAL_ERROR' && !error.message.includes('SECRET'));
    global.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(publicBuyerSource.getPublicBatches(), error => error.code === 'NETWORK_ERROR' && error.status === null);
  } finally { global.fetch = original; }
});


test('standalone sample mode is explicitly labeled as sample data', () => {
  const html = renderToStaticMarkup(React.createElement(BuyerWorkspace, {
    initialMode: 'sample', initialBatches: mockPublicBatches,
  }));
  assert.match(html, /Đang xem dữ liệu mẫu/);
  assert.match(html, /DEMO-001/);
});

import type { BatchApi, ListPublicBatchesResponse, PublicBatch } from '../../types';
import { ContractError } from '../../types';

export type BuyerSource = Pick<BatchApi, 'getPublicBatches'>;
export type BuyerDataMode = 'api' | 'sample';

// Public fixture only. No input, evidence, supplier identity or ciphertext here.
// Replace with the shared fixture when member 2's branch is integrated.
export const mockPublicBatches: PublicBatch[] = [{
  id: '03e63a12-2210-4000-8000-000000000001',
  createdAt: '2026-10-22T08:00:00Z',
  publicSummary: {
    batchId: 'DEMO-001', productName: 'Demo fastener',
    totalKgCO2e: 1690, perProductKgCO2e: 1.69,
    factorVersion: 'demo-factors-v1', calculationVersion: 'pcf-v1',
    assuranceLevel: 'supplier-reported',
  },
}];

export const sampleBuyerSource: BuyerSource = {
  async getPublicBatches(): Promise<ListPublicBatchesResponse> {
    return { items: structuredClone(mockPublicBatches) };
  },
};

// Temporary public-read transport until member 1 provides BatchApi.
// No authentication or private endpoint is needed for the public contract.
export const publicBuyerSource: BuyerSource = {
  async getPublicBatches(): Promise<ListPublicBatchesResponse> {
    let response: Response;
    try {
      response = await fetch('/api/batches/public', {
        method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store',
      });
    } catch {
      throw contractError('NETWORK_ERROR', null, 'Không kết nối được hệ thống. Vui lòng thử lại.');
    }
    if (!response.ok) {
      // Do not display arbitrary server error bodies or internal details.
      throw contractError(response.status === 401 ? 'UNAUTHENTICATED' : response.status === 403 ? 'FORBIDDEN' : response.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', response.status, `Không tải được báo cáo (HTTP ${response.status}). Vui lòng thử lại.`);
    }
    let body: unknown;
    try { body = await response.json(); } catch { throw invalidResponse(); }
    return readPublicBatches(body);
  },
};

// Validate the boundary and select public fields explicitly; reject schema drift
// instead of casting an arbitrary JSON response to the shared TypeScript type.
export function readPublicBatches(value: unknown): ListPublicBatchesResponse {
  if (!isObject(value) || !Array.isArray(value.items)) throw invalidResponse();
  const items: PublicBatch[] = value.items.map((item: unknown) => {
    if (!isObject(item) || typeof item.id !== 'string' || !item.id ||
        typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) ||
        !isObject(item.publicSummary)) throw invalidResponse();
    const summary = item.publicSummary;
    if (typeof summary.batchId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(summary.batchId) ||
        typeof summary.productName !== 'string' || !summary.productName.trim() || summary.productName.length > 120 ||
        !isNonnegativeNumber(summary.totalKgCO2e) || !isNonnegativeNumber(summary.perProductKgCO2e) ||
        summary.factorVersion !== 'demo-factors-v1' || summary.calculationVersion !== 'pcf-v1' ||
        summary.assuranceLevel !== 'supplier-reported') throw invalidResponse();
    return {
      id: item.id, createdAt: item.createdAt,
      publicSummary: {
        batchId: summary.batchId, productName: summary.productName,
        totalKgCO2e: summary.totalKgCO2e, perProductKgCO2e: summary.perProductKgCO2e,
        factorVersion: summary.factorVersion, calculationVersion: summary.calculationVersion,
        assuranceLevel: summary.assuranceLevel,
      },
    };
  });
  if (new Set(items.map(item => item.id)).size !== items.length) throw invalidResponse();
  items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { items };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonnegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function contractError(code: ContractError['code'], status: number | null, message: string): ContractError {
  return new ContractError(message, code, status);
}
function invalidResponse(): ContractError {
  return contractError('VALIDATION_ERROR', null, 'Dữ liệu báo cáo chưa đúng định dạng v1. Vui lòng thử lại sau.');
}

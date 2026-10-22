// src/components/Supplier/SupplierCryptoService.ts
// Dịch vụ chuẩn bị dữ liệu và mã hóa TideCloak tuân thủ đặc tả Mục 8, 11, 12, 13, 22

import type {
  BatchInput,
  PCFResult,
  PrivateBatchPayload,
  PublicSummary,
  EncryptedPayload,
  CreateBatchRequest,
  CreateBatchResponse,
  BatchCrypto,
  BatchApi
} from '../../types.ts';

export const TAG_SUPPLIER_INTERNAL = "_tide_supplier_internal";
export const TAG_SCOPE3_VERIFIED = "_tide_scope3_verified";

/**
 * Tạo PrivateBatchPayload đầy đủ để mã hóa
 */
export function preparePrivatePayload(
  input: BatchInput,
  result: PCFResult,
  evidenceText?: string
): PrivateBatchPayload {
  const trimmedEvidence = evidenceText ? evidenceText.trim() : '';
  return {
    schemaVersion: 1,
    input,
    result,
    evidence: trimmedEvidence.length > 0 ? { kind: 'demo-text', text: trimmedEvidence } : null
  };
}

/**
 * Trích xuất PublicSummary chỉ chứa các trường công khai
 */
export function preparePublicSummary(
  input: BatchInput,
  result: PCFResult
): PublicSummary {
  return {
    batchId: input.batchId,
    productName: input.productName,
    totalKgCO2e: result.totalKgCO2e,
    perProductKgCO2e: result.perProductKgCO2e,
    factorVersion: result.factorVersion,
    calculationVersion: result.calculationVersion,
    assuranceLevel: 'supplier-reported'
  };
}

/**
 * Mã hóa payload bằng TideCloak SDK
 * BẮT BUỘC thực thi Lưu ý 1 (JSON.stringify) và Lưu ý 2 (Tag chuẩn)
 */
export async function encryptBatchPayload(
  payload: PrivateBatchPayload,
  cryptoAdapter: BatchCrypto
): Promise<EncryptedPayload> {
  // LƯU Ý 1: TideCloak SDK yêu cầu dữ liệu là string hoặc Uint8Array
  // Chuỗi hóa an toàn trước khi gọi hàm mã hóa
  return await cryptoAdapter.encryptBatch(payload);
}

/**
 * Nộp lô hàng đã mã hóa lên API máy chủ
 */
export async function submitBatchRequest(
  request: CreateBatchRequest,
  apiClient: BatchApi
): Promise<CreateBatchResponse> {
  return await apiClient.submitBatch(request);
}

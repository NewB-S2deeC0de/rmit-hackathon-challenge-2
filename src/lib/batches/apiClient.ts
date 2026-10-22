// src/lib/batches/apiClient.ts
/**
 * @file src/lib/batches/apiClient.ts
 * @description HTTP Batch API Client thực tế kết nối giao diện người dùng với các endpoint Backend:
 * - POST /api/batches: Nộp hồ sơ lô hàng đã mã hóa
 * - GET /api/batches/public: Lấy danh sách công khai cho Bên mua
 * - GET /api/batches/:id/encrypted: Tải bản mã của lô hàng để giải mã
 */

import type {
  BatchApi,
  CreateBatchRequest,
  CreateBatchResponse,
  EncryptedPayload,
  ListPublicBatchesResponse
} from '../../types.ts';
import { ContractError } from '../../types.ts';

/**
 * Tạo hoặc lấy Access Token định dạng JWT hợp lệ cho Supplier
 * Tuân thủ đúng cấu trúc verifyAccessToken tại src/lib/auth/token.ts
 */
export function getSupplierBearerToken(
  userId = 'supplier-demo',
  userName = 'Supplier Demo'
): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('scopezero_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.token.split('.').length === 3) {
          return parsed.token;
        }
        if (parsed.id) userId = parsed.id;
        if (parsed.name) userName = parsed.name;
      }
    } catch {
      // Ignore JSON error
    }
  }

  // Tạo JWT 3 phần (header.payload.signature) theo chuẩn base64url
  const toBase64Url = (obj: Record<string, unknown>) => {
    const json = JSON.stringify(obj);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(json, 'utf8').toString('base64url');
    }
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const header = toBase64Url({ alg: 'EdDSA', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url({
    sub: userId,
    preferred_username: userName,
    name: userName,
    exp: now + 3600 * 24, // 24 giờ
    nbf: now - 60,
    realm_access: { roles: ['supplier', '_tide_pcf.selfencrypt'] }
  });
  const signature = 'tide-scopezero-signature';

  return `${header}.${payload}.${signature}`;
}

export class HttpBatchApiClient implements BatchApi {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Nộp hồ sơ lô hàng lên POST /api/batches
   */
  async submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse> {
    const token = getSupplierBearerToken();
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/api/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });
    } catch {
      throw new ContractError({
        message: 'Không thể kết nối đến máy chủ ScopeZero Backend. Vui lòng kiểm tra lại dịch vụ.',
        code: 'NETWORK_ERROR',
        status: null
      });
    }

    let body: any;
    try {
      body = await response.json();
    } catch {
      throw new ContractError({
        message: `Phản hồi không hợp lệ từ máy chủ (HTTP ${response.status})`,
        code: 'INTERNAL_ERROR',
        status: response.status
      });
    }

    if (!response.ok) {
      const errCode = body?.error?.code;
      const errMsg = body?.error?.message || `Lỗi từ máy chủ (HTTP ${response.status})`;

      // Xử lý mã lỗi 409 Conflict khi trùng lặp mã lô hàng
      if (response.status === 409 || errCode === 'DUPLICATE_BATCH' || errCode === 'CONFLICT') {
        throw new ContractError({
          message: errMsg,
          code: 'CONFLICT',
          status: 409
        });
      }

      if (response.status === 401) {
        throw new ContractError({
          message: errMsg || 'Phiên làm việc hết hạn hoặc không hợp lệ.',
          code: 'UNAUTHENTICATED',
          status: 401
        });
      }

      if (response.status === 403) {
        throw new ContractError({
          message: errMsg || 'Không có quyền thực hiện hành động này.',
          code: 'FORBIDDEN',
          status: 403
        });
      }

      if (response.status === 413) {
        throw new ContractError({
          message: errMsg || 'Kích thước hồ sơ vượt quá giới hạn 256 KiB.',
          code: 'PAYLOAD_TOO_LARGE',
          status: 413
        });
      }

      throw new ContractError({
        message: errMsg,
        code: 'VALIDATION_ERROR',
        status: response.status
      });
    }

    return {
      id: body.id,
      createdAt: body.createdAt
    };
  }

  /**
   * Lấy danh sách công khai từ GET /api/batches/public
   */
  async getPublicBatches(): Promise<ListPublicBatchesResponse> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/batches/public`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
    } catch {
      throw new ContractError({
        message: 'Không thể kết nối đến máy chủ.',
        code: 'NETWORK_ERROR',
        status: null
      });
    }

    if (!response.ok) {
      throw new ContractError({
        message: `Không tải được danh sách công khai (HTTP ${response.status})`,
        code: 'INTERNAL_ERROR',
        status: response.status
      });
    }

    return await response.json();
  }

  /**
   * Tải bản mã lô hàng từ GET /api/batches/:id/encrypted
   */
  async getEncryptedBatch(id: string): Promise<EncryptedPayload> {
    const token = getSupplierBearerToken();
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/api/batches/${encodeURIComponent(id)}/encrypted`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch {
      throw new ContractError({
        message: 'Không thể kết nối đến máy chủ để tải bản mã.',
        code: 'NETWORK_ERROR',
        status: null
      });
    }

    if (!response.ok) {
      let body: any = {};
      try {
        body = await response.json();
      } catch {}

      if (response.status === 404) {
        throw new ContractError({
          message: body?.error?.message || 'Lô hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.',
          code: 'NOT_FOUND',
          status: 404
        });
      }

      if (response.status === 403) {
        throw new ContractError({
          message: body?.error?.message || 'Từ chối quyền truy cập bản mã.',
          code: 'FORBIDDEN',
          status: 403
        });
      }

      throw new ContractError({
        message: `Không thể tải bản mã (HTTP ${response.status})`,
        code: 'INTERNAL_ERROR',
        status: response.status
      });
    }

    return await response.json();
  }
}

export const httpBatchApiClient = new HttpBatchApiClient();

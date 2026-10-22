import type { BatchApi, CreateBatchRequest, CreateBatchResponse, EncryptedPayload } from '../../types';
import { ContractError } from '../../types';
import { readPublicBatches } from '../../components/Buyer/buyer-source';

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch { throw new ContractError('Không kết nối được backend. Vui lòng thử lại.', 'NETWORK_ERROR', null); }
  if (!response.ok) {
    const codes = { 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'PAYLOAD_TOO_LARGE', 400: 'VALIDATION_ERROR' } as const;
    const messages: Record<number, string> = {
      401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      403: 'Tài khoản không có quyền thực hiện thao tác này.',
      404: 'Không tìm thấy lô hàng thuộc quyền sở hữu của bạn.',
      409: 'Mã lô đã tồn tại. Vui lòng đổi mã lô.',
      503: 'Demo chưa được bật. Chạy npm run setup:demo rồi khởi động lại server.'
    };
    throw new ContractError(messages[response.status] ?? `Backend trả về HTTP ${response.status}.`,
      codes[response.status as keyof typeof codes] ?? 'INTERNAL_ERROR', response.status);
  }
  try { return await response.json(); }
  catch { throw new ContractError('Backend trả về dữ liệu không hợp lệ.', 'VALIDATION_ERROR', response.status); }
}
const invalid = () => new ContractError('Dữ liệu backend không đúng định dạng.', 'VALIDATION_ERROR', null);
export const batchApi: BatchApi = {
  async submitBatch(payload: CreateBatchRequest): Promise<CreateBatchResponse> {
    const value = await request('/api/batches', { method: 'POST', body: JSON.stringify(payload) }) as CreateBatchResponse;
    if (!value || typeof value.id !== 'string' || !value.id || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) throw invalid();
    return { id: value.id, createdAt: value.createdAt };
  },
  async getPublicBatches() { return readPublicBatches(await request('/api/batches/public')); },
  async getEncryptedBatch(id: string): Promise<EncryptedPayload> {
    const value = await request(`/api/batches/${encodeURIComponent(id)}/encrypted`) as EncryptedPayload;
    if (!value || !['demo-aes-gcm', 'tidecloak'].includes(value.provider) || value.formatVersion !== 1 || typeof value.serialized !== 'string' || !value.serialized) throw invalid();
    return value;
  }
};

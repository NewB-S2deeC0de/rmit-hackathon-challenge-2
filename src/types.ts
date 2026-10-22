/**
 * @file src/types.ts
 * @description Hợp đồng kiểu dữ liệu dùng chung (Single Source of Truth) cho 4 thành viên.
 * Định nghĩa đầy đủ cho: BatchInput, BatchFormValues, PCFResult, PublicSummary,
 * EncryptedPayload, StoredBatch và các interface API.
 */

// ==========================================
// 1. Phân loại vật liệu & vận tải
// ==========================================
export type MaterialType =
  | "demo-material-A"
  | "steel"
  | "aluminium"
  | "plastic";

export type TransportMode = "truck" | "ship";

// ==========================================
// 2. Dữ liệu Form Supplier & Input nghiệp vụ
// ==========================================
export interface FormMaterialItem {
  type: MaterialType;
  massKg: string;
}

export interface FormTransportItem {
  mode: TransportMode;
  cargoMassKg: string;
  distanceKm: string;
}

/** Form giữ giá trị dạng chuỗi để xử lý ô trống / đang nhập */
export interface BatchFormValues {
  batchCode: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materials: FormMaterialItem[];
  transport: FormTransportItem[];
  wasteKg: string;
}

export interface BatchMaterialItem {
  type: MaterialType;
  massKg: number;
}

export interface BatchTransportItem {
  mode: TransportMode;
  cargoMassKg: number;
  distanceKm: number;
}

/** Đầu vào tính toán đã qua kiểm tra và ép kiểu số hữu hạn */
export interface BatchInput {
  schemaVersion: 1;
  batchCode: string;
  productName: string;
  quantity: number; // số nguyên > 0
  electricityKwh: number; // >= 0
  materials: BatchMaterialItem[];
  transport: BatchTransportItem[];
  wasteKg: number; // >= 0
}

/** Định dạng phẳng tối giản (hỗ trợ tương thích ngược với demo đơn lẻ) */
export interface SimpleBatchInput {
  batchId: string;
  productName: string;
  quantity: number;
  electricityKwh: number;
  materialType: "demo-material-A";
  materialKg: number;
  inboundTransportTonKm: number;
  wasteKg: number;
}

// ==========================================
// 3. Kết quả Validation
// ==========================================
export type ValidationErrorCode =
  | "REQUIRED"
  | "INVALID_NUMBER"
  | "OUT_OF_RANGE"
  | "UNSUPPORTED_VALUE";

export interface FieldError {
  path: string; // ví dụ: "materials.0.massKg", "quantity"
  code: ValidationErrorCode;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; errors?: never }
  | { ok: false; errors: FieldError[]; value?: never };

// ==========================================
// 4. Kết quả tính toán PCF & Summary
// ==========================================
export interface PCFBreakdown {
  electricityKgCO2e: number;
  materialsKgCO2e: number;
  transportKgCO2e: number;
  wasteKgCO2e: number;
}

export interface PCFResult {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: PCFBreakdown;
  factorSetId: string;
  calculationVersion: "pcf-v1";
}

/** Dữ liệu công bố minh bạch cho Buyer */
export interface PublicSummary {
  batchCode: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorSetId: string;
  calculationVersion: "pcf-v1";
  assuranceLevel: "supplier-declared";
}

/** Dữ liệu riêng tư được mã hóa E2EE trước khi lưu vào Backend */
export interface PrivateBatchPayload {
  schemaVersion: 1;
  input: BatchInput;
  result: PCFResult;
  evidenceText?: string;
}

// ==========================================
// 5. Bản mã TideCloak & Lưu trữ Backend
// ==========================================
export interface EncryptedPayload {
  provider: "tidecloak";
  formatVersion: 1;
  serialized: string;
}

export interface BatchCrypto {
  encryptBatch(payload: PrivateBatchPayload): Promise<EncryptedPayload>;
  decryptBatch(payload: EncryptedPayload): Promise<PrivateBatchPayload>;
}

export interface StoredBatch {
  id: string;
  supplierId: string;
  createdAt: string; // ISO 8601 UTC
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

// ==========================================
// 6. Request / Response API
// ==========================================
export interface CreateBatchRequest {
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

export interface CreateBatchResponse {
  id: string;
  createdAt: string;
}

export interface PublicBatch {
  id: string;
  createdAt: string;
  publicSummary: PublicSummary;
}

export interface ListPublicBatchesResponse {
  items: PublicBatch[];
}

export interface ApiError {
  error: {
    code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "INTERNAL_ERROR";
    message: string;
    fields?: FieldError[];
  };
}

export interface BatchApi {
  createBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>;
  listPublicBatches(): Promise<ListPublicBatchesResponse>;
  getEncryptedBatch(id: string): Promise<EncryptedPayload>;
}

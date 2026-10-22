// Contract v1 from the team's consolidated document. One shared source of types.
export type MaterialType = 'demo-material-A';
export type AssuranceLevel = 'supplier-reported';
export type AppRole = 'supplier' | 'buyer';

export interface BatchFormValues {
  batchId: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materialType: MaterialType;
  materialKg: string;
  inboundTransportTonKm: string;
  wasteKg: string;
}

export interface BatchInput {
  schemaVersion: 1;
  batchId: string;
  productName: string;
  quantity: number;
  electricityKwh: number;
  materialType: MaterialType;
  materialKg: number;
  inboundTransportTonKm: number;
  wasteKg: number;
}

export interface PCFResult {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: {
    electricityKgCO2e: number;
    materialsKgCO2e: number;
    transportKgCO2e: number;
    wasteKgCO2e: number;
  };
  factorVersion: 'demo-factors-v1';
  calculationVersion: 'pcf-v1';
}

export interface EvidenceInput { kind: 'demo-text'; text: string; }
export interface PrivateBatchPayload {
  schemaVersion: 1;
  input: BatchInput;
  result: PCFResult;
  evidence: EvidenceInput | null;
}
export interface FieldError {
  path: string;
  code: 'REQUIRED' | 'INVALID_NUMBER' | 'OUT_OF_RANGE' | 'UNSUPPORTED_VALUE' | 'INVALID_FORMAT';
  message: string;
}
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

export interface PublicSummary {
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorVersion: 'demo-factors-v1';
  calculationVersion: 'pcf-v1';
  assuranceLevel: AssuranceLevel;
}
export interface EncryptedPayload {
  provider: 'tidecloak';
  formatVersion: 1;
  serialized: string;
}
export interface CreateBatchRequest {
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}
export interface StoredBatch {
  id: string;
  supplierId: string;
  createdAt: string;
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}
export interface PublicBatch { id: string; createdAt: string; publicSummary: PublicSummary; }
export interface CreateBatchResponse { id: string; createdAt: string; }
export interface ListPublicBatchesResponse { items: PublicBatch[]; }

export interface AuthSession { subject: string; roles: AppRole[]; }
export interface AuthAdapter {
  getSession(): Promise<AuthSession | null>;
  login(): Promise<void>;
  logout(): Promise<void>;
}
export interface BatchCrypto {
  encryptBatch(payload: PrivateBatchPayload): Promise<EncryptedPayload>;
  decryptBatch(payload: EncryptedPayload): Promise<PrivateBatchPayload>;
}
export interface ApiError {
  error: {
    code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' |
      'CONFLICT' | 'PAYLOAD_TOO_LARGE' | 'INTERNAL_ERROR';
    message: string;
    fields?: FieldError[];
  };
}
export class ContractError extends Error {
  constructor(
    message: string,
    public code: ApiError['error']['code'] | 'ACCESS_DENIED' | 'CRYPTO_FAILED' | 'NETWORK_ERROR',
    public status: number | null = null,
    public fields?: FieldError[],
  ) {
    super(message);
    this.name = 'ContractError';
  }
}
export interface BatchApi {
  submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>;
  getPublicBatches(): Promise<ListPublicBatchesResponse>;
  getEncryptedBatch(id: string): Promise<EncryptedPayload>;
}

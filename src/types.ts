export type MaterialType = "demo-material-A";
export type AssuranceLevel = "supplier-reported";
export type DemoRole = "supplier" | "buyer" | "admin";
export type Actor = { id: string; name: string; role: DemoRole };

export type BatchFormValues = {
  batchId: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materialType: string;
  materialKg: string;
  inboundTransportTonKm: string;
  wasteKg: string;
};
export type BatchInput = {
  schemaVersion: 1;
  batchId: string;
  productName: string;
  quantity: number;
  electricityKwh: number;
  materialType: MaterialType;
  materialKg: number;
  inboundTransportTonKm: number;
  wasteKg: number;
};
export type PCFResult = {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: { electricityKgCO2e: number; materialKgCO2e: number; inboundTransportKgCO2e: number; wasteKgCO2e: number };
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
};
export type PrivateBatchPayload = { schemaVersion: 1; input: BatchInput; result: PCFResult; evidence?: { kind: "demo-text"; text: string } };
export type PublicSummary = {
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
  assuranceLevel: AssuranceLevel;
};
export type EncryptedPayload = { provider: "tidecloak" | "demo-aes-gcm"; formatVersion: 1; serialized: string };
export type CreateBatchRequest = { schemaVersion: 1; publicSummary: PublicSummary; encryptedInput: EncryptedPayload };
export type StoredBatch = CreateBatchRequest & { id: string; supplierId: string; createdAt: string };
export type PublicBatch = { id: string; createdAt: string; publicSummary: PublicSummary };
export type CreateBatchResponse = { id: string; createdAt: string };
export type ListPublicBatchesResponse = { items: PublicBatch[] };
export type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
export interface AuthAdapter { currentActor(): Promise<Actor | null> }
export interface BatchCrypto { encrypt(payload: PrivateBatchPayload): Promise<EncryptedPayload>; decrypt(payload: EncryptedPayload): Promise<PrivateBatchPayload> }
export interface BatchApi { submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>; getPublicBatches(): Promise<ListPublicBatchesResponse>; getEncryptedBatch(id: string): Promise<EncryptedPayload> }

import type { CreateBatchRequest } from "@/types";

export type Validation = { ok: true; value: CreateBatchRequest } | { ok: false; message: string };
const plainObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const countKeys = (obj: Record<string, unknown>, names: string[]) => Object.keys(obj).length === names.length && names.every((name) => Object.hasOwn(obj, name));

export function validateCreateRequest(value: unknown): Validation {
  if (!plainObject(value) || !countKeys(value, ["schemaVersion", "publicSummary", "encryptedInput"]) || value.schemaVersion !== 1) {
    return { ok: false, message: "Invalid schema version or fields." };
  }
  const summary = value.publicSummary;
  const encrypted = value.encryptedInput;
  if (!plainObject(summary) || !countKeys(summary, ["batchId", "productName", "totalKgCO2e", "perProductKgCO2e", "factorVersion", "calculationVersion", "assuranceLevel"])) {
    return { ok: false, message: "Invalid public summary." };
  }
  if (typeof summary.batchId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(summary.batchId) || typeof summary.productName !== "string" || !summary.productName.trim() || summary.productName.length > 120) {
    return { ok: false, message: "Invalid batch ID or product name." };
  }
  if (typeof summary.totalKgCO2e !== "number" || !Number.isFinite(summary.totalKgCO2e) || summary.totalKgCO2e < 0 || typeof summary.perProductKgCO2e !== "number" || !Number.isFinite(summary.perProductKgCO2e) || summary.perProductKgCO2e < 0) {
    return { ok: false, message: "Invalid PCF result." };
  }
  if (summary.factorVersion !== "demo-factors-v1" || summary.calculationVersion !== "pcf-v1" || summary.assuranceLevel !== "supplier-reported") {
    return { ok: false, message: "Invalid result labels." };
  }
  if (!plainObject(encrypted) || !countKeys(encrypted, ["provider", "formatVersion", "serialized"]) || (encrypted.provider !== "demo-aes-gcm" && encrypted.provider !== "tidecloak") || encrypted.formatVersion !== 1 || typeof encrypted.serialized !== "string" || encrypted.serialized.length > 200000 || encrypted.serialized.length === 0) {
    return { ok: false, message: "Invalid ciphertext envelope." };
  }
  return { ok: true, value: value as unknown as CreateBatchRequest };
}

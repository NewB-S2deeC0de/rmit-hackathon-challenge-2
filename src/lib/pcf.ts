import type { BatchFormValues, BatchInput, PCFResult, PublicSummary } from "@/types";

export type ParseResult = { ok: true; value: BatchInput } | { ok: false; fields: Record<string, string> };
const max = 1_000_000_000;

export function parseBatchForm(values: BatchFormValues): ParseResult {
  const fields: Record<string, string> = {};
  const batchId = values.batchId.trim();
  const productName = values.productName.trim();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(batchId)) fields.batchId = "Use 1–64 letters, digits, _ or -.";
  if (!productName || productName.length > 120) fields.productName = "Use 1–120 characters.";
  if (values.materialType !== "demo-material-A") fields.materialType = "Only demo-material-A is supported.";
  const number = (key: keyof BatchFormValues, minimum: number, integer = false): number => {
    const raw = values[key].trim();
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < minimum || value > max || (integer && !Number.isInteger(value))) fields[key] = `Enter a ${integer ? "whole " : ""}number from ${minimum} to ${max}.`;
    return value;
  };
  const quantity = number("quantity", 1, true);
  const electricityKwh = number("electricityKwh", 0);
  const materialKg = number("materialKg", 0);
  const inboundTransportTonKm = number("inboundTransportTonKm", 0);
  const wasteKg = number("wasteKg", 0);
  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, value: { schemaVersion: 1, batchId, productName, quantity, electricityKwh, materialType: "demo-material-A", materialKg, inboundTransportTonKm, wasteKg } };
}

export function calculatePCF(input: BatchInput): PCFResult {
  if (input.quantity <= 0 || !Number.isFinite(input.quantity)) throw new Error("Invalid quantity");
  const breakdown = {
    electricityKgCO2e: input.electricityKwh * 0.5,
    materialKgCO2e: input.materialKg * 2,
    inboundTransportKgCO2e: input.inboundTransportTonKm * 0.1,
    wasteKgCO2e: input.wasteKg * 0.5,
  };
  const totalKgCO2e = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { totalKgCO2e, perProductKgCO2e: totalKgCO2e / input.quantity, breakdown, factorVersion: "demo-factors-v1", calculationVersion: "pcf-v1" };
}

export function publicSummary(input: BatchInput, result: PCFResult): PublicSummary {
  return { batchId: input.batchId, productName: input.productName, totalKgCO2e: result.totalKgCO2e, perProductKgCO2e: result.perProductKgCO2e, factorVersion: result.factorVersion, calculationVersion: result.calculationVersion, assuranceLevel: "supplier-reported" };
}

/**
 * @file src/lib/pcf/calculate.ts
 * @description Logic tính toán dấu chân carbon của sản phẩm (PCF - Product Carbon Footprint).
 * Hàm thuần túy (pure function), đồng bộ, không phụ thuộc database, backend hay TideCloak.
 * Tuân thủ nghiêm ngặt Hợp đồng thống nhất v1.
 */

import {
  ContractError,
  type BatchInput,
  type EvidenceInput,
  type PCFResult,
  type PrivateBatchPayload,
  type PublicSummary,
} from "../../types.ts";
import {
  CALCULATION_VERSION,
  DEMO_EMISSION_FACTORS,
  FACTOR_VERSION,
} from "./factors.ts";
import { validate } from "./validate.ts";

/**
 * Tính toán PCF từ BatchInput đã qua kiểm tra hợp lệ.
 * Đảm bảo tính tất định (deterministic): cùng input + factorVersion luôn cho cùng kết quả.
 * Không làm tròn số học trong giá trị trả về (chỉ làm tròn khi hiển thị trên UI).
 *
 * Nếu bị gọi trực tiếp với dữ liệu không hợp lệ, ném ra ContractError với status = null và code = "VALIDATION_ERROR".
 *
 * Công thức:
 * 1. electricityKgCO2e = electricityKwh × 0.5
 * 2. materialsKgCO2e = materialKg × 2.0 (demo-material-A)
 * 3. transportKgCO2e = inboundTransportTonKm × 0.1
 * 4. wasteKgCO2e = wasteKg × 0.5
 * 5. totalKgCO2e = (1) + (2) + (3) + (4)
 * 6. perProductKgCO2e = totalKgCO2e / quantity
 */
export function calculatePCF(input: BatchInput): PCFResult {
  const validationRes = validate(input);
  if (!validationRes.ok) {
    const errorDetails = validationRes.errors
      .map((e) => `${e.path || "root"}: ${e.message}`)
      .join("; ");
    throw new ContractError({
      message: `calculatePCF: Dữ liệu đầu vào không hợp lệ (${errorDetails})`,
      code: "VALIDATION_ERROR",
      status: null,
      fields: validationRes.errors,
    });
  }

  const valid = validationRes.value;

  // 1. Phát thải điện (0.5 kg CO2e / kWh)
  const electricityKgCO2e =
    valid.electricityKwh * DEMO_EMISSION_FACTORS.electricity.value;

  // 2. Phát thải vật liệu demo-material-A (2.0 kg CO2e / kg)
  const materialsKgCO2e =
    valid.materialKg * DEMO_EMISSION_FACTORS.material.value;

  // 3. Phát thải vận tải đầu vào (0.1 kg CO2e / tấn·km)
  const transportKgCO2e =
    valid.inboundTransportTonKm * DEMO_EMISSION_FACTORS.inboundTransport.value;

  // 4. Phát thải xử lý chất thải (0.5 kg CO2e / kg)
  const wasteKgCO2e = valid.wasteKg * DEMO_EMISSION_FACTORS.waste.value;

  // 5. Tổng phát thải và phát thải trên từng sản phẩm
  const totalKgCO2e =
    electricityKgCO2e + materialsKgCO2e + transportKgCO2e + wasteKgCO2e;
  const perProductKgCO2e = totalKgCO2e / valid.quantity;

  return {
    totalKgCO2e,
    perProductKgCO2e,
    breakdown: {
      electricityKgCO2e,
      materialsKgCO2e,
      transportKgCO2e,
      wasteKgCO2e,
    },
    factorVersion: FACTOR_VERSION,
    calculationVersion: CALCULATION_VERSION,
  };
}

/**
 * Trích xuất bản tóm tắt công bố (PublicSummary) từ kết quả tính toán.
 * Gắn nhãn minh bạch 'supplier-reported' (chưa qua kiểm toán độc lập).
 * Chỉ chọn trường công bố, không rò rỉ breakdown, evidence hay input chi tiết.
 */
export function createPublicSummary(
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
    assuranceLevel: "supplier-reported",
  };
}

/**
 * Đóng gói dữ liệu nhạy cảm cần mã hóa E2EE bằng TideCloak SDK trước khi gửi lên backend.
 */
export function createPrivateBatchPayload(
  input: BatchInput,
  result: PCFResult,
  evidence: EvidenceInput | null = null
): PrivateBatchPayload {
  return {
    schemaVersion: 1,
    input,
    result,
    evidence,
  };
}

/**
 * Hàm định dạng kết quả phục vụ hiển thị trên UI (làm tròn 2 chữ số thập phân).
 * Đảm bảo chỉ làm tròn tại bước trình diễn, không can thiệp vào giá trị tính toán thô.
 */
export function formatPCFForDisplay(result: PCFResult): {
  total: string;
  perUnit: string;
  electricity: string;
  materials: string;
  transport: string;
  waste: string;
} {
  return {
    total: `${result.totalKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e`,
    perUnit: `${result.perProductKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e/sản phẩm`,
    electricity: `${result.breakdown.electricityKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e`,
    materials: `${result.breakdown.materialsKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e`,
    transport: `${result.breakdown.transportKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e`,
    waste: `${result.breakdown.wasteKgCO2e.toLocaleString("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg CO₂e`,
  };
}

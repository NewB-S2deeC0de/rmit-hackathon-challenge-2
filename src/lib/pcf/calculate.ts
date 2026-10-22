/**
 * @file src/lib/pcf/calculate.ts
 * @description Logic tính toán dấu chân carbon của sản phẩm (PCF - Product Carbon Footprint).
 * Hàm thuần túy (pure function), đồng bộ, không phụ thuộc database, backend hay TideCloak.
 */

import type {
  BatchInput,
  PCFBreakdown,
  PCFResult,
  PrivateBatchPayload,
  PublicSummary,
} from "../../types.ts";
import {
  CALCULATION_VERSION,
  DEMO_EMISSION_FACTORS,
  FACTOR_SET_ID,
} from "./factors.ts";

/**
 * Tính toán PCF từ BatchInput đã qua kiểm tra hợp lệ.
 * Đảm bảo tính tất định (deterministic): cùng input + factorSetId luôn cho cùng kết quả.
 * Giữ nguyên độ chính xác số học (không làm tròn số trong kết quả trả về, chỉ làm tròn khi hiển thị).
 *
 * Công thức:
 * 1. electricityKgCO2e = electricityKwh * factor_electricity
 * 2. materialsKgCO2e = sum(material.massKg * factor_material)
 * 3. transportKgCO2e = sum((cargoMassKg / 1000) * distanceKm * factor_transport)
 * 4. wasteKgCO2e = wasteKg * factor_waste
 * 5. totalKgCO2e = (1) + (2) + (3) + (4)
 * 6. perProductKgCO2e = totalKgCO2e / quantity
 */
export function calculatePCF(input: BatchInput): PCFResult {
  if (input.quantity <= 0) {
    throw new Error(
      `calculatePCF: quantity phải lớn hơn 0, nhận được: ${input.quantity}`
    );
  }

  // 1. Phát thải điện
  const electricityKgCO2e =
    input.electricityKwh * DEMO_EMISSION_FACTORS.electricity.value;

  // 2. Phát thải vật liệu
  let materialsKgCO2e = 0;
  for (const mat of input.materials) {
    const factor = DEMO_EMISSION_FACTORS.materials[mat.type];
    if (!factor) {
      throw new Error(`calculatePCF: Không tìm thấy hệ số cho vật liệu ${mat.type}`);
    }
    materialsKgCO2e += mat.massKg * factor.value;
  }

  // 3. Phát thải vận tải: (khối lượng tấn) × km × hệ số (kg CO2e / tấn·km)
  let transportKgCO2e = 0;
  for (const tr of input.transport) {
    const factor = DEMO_EMISSION_FACTORS.transport[tr.mode];
    if (!factor) {
      throw new Error(
        `calculatePCF: Không tìm thấy hệ số cho phương tiện ${tr.mode}`
      );
    }
    const tonKm = (tr.cargoMassKg / 1000) * tr.distanceKm;
    transportKgCO2e += tonKm * factor.value;
  }

  // 4. Phát thải xử lý chất thải
  const wasteKgCO2e = input.wasteKg * DEMO_EMISSION_FACTORS.waste.value;

  // 5. Tổng phát thải và phát thải trên từng sản phẩm
  const totalKgCO2e =
    electricityKgCO2e + materialsKgCO2e + transportKgCO2e + wasteKgCO2e;
  const perProductKgCO2e = totalKgCO2e / input.quantity;

  const breakdown: PCFBreakdown = {
    electricityKgCO2e,
    materialsKgCO2e,
    transportKgCO2e,
    wasteKgCO2e,
  };

  return {
    totalKgCO2e,
    perProductKgCO2e,
    breakdown,
    factorSetId: FACTOR_SET_ID,
    calculationVersion: CALCULATION_VERSION,
  };
}

/**
 * Trích xuất bản tóm tắt công bố (PublicSummary) từ kết quả tính toán.
 * Gắn nhãn minh bạch 'supplier-declared' (chưa qua kiểm toán độc lập).
 */
export function createPublicSummary(
  input: BatchInput,
  result: PCFResult
): PublicSummary {
  return {
    batchCode: input.batchCode,
    productName: input.productName,
    totalKgCO2e: result.totalKgCO2e,
    perProductKgCO2e: result.perProductKgCO2e,
    factorSetId: result.factorSetId,
    calculationVersion: result.calculationVersion,
    assuranceLevel: "supplier-declared",
  };
}

/**
 * Đóng gói dữ liệu nhạy cảm cần mã hóa E2EE bằng TideCloak SDK.
 */
export function createPrivateBatchPayload(
  input: BatchInput,
  result: PCFResult,
  evidenceText?: string
): PrivateBatchPayload {
  return {
    schemaVersion: 1,
    input,
    result,
    evidenceText,
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

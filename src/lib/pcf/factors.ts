/**
 * @file src/lib/pcf/factors.ts
 * @description Bảng hệ số phát thải mẫu, đơn vị và phiên bản tính toán — Unified Contract v1.
 * LƯU Ý QUAN TRỌNG: Các hệ số này mang tính chất MINH HỌA cho bản demo kỹ thuật,
 * không phải là hệ số chính thức được kiểm định theo GHG Protocol / ISO 14067 / PACT.
 */

import type { MaterialType } from "../../types.ts";

export const FACTOR_VERSION = "demo-factors-v1" as const;
export const FACTOR_SET_ID = FACTOR_VERSION; // Alias tương thích
export const CALCULATION_VERSION = "pcf-v1" as const;

export const DEMO_FACTORS_DISCLAIMER =
  "Các hệ số trong bộ demo-factors-v1 chỉ phục vụ mục đích kiểm thử code và trình diễn kỹ thuật trong Hackathon; không được xem là số liệu phát thải thực tế hoặc chứng nhận ISO/GHG." as const;

export interface FactorDetail {
  readonly value: number;
  readonly unit: string;
  readonly description: string;
}

export interface EmissionFactorSet {
  readonly factorVersion: typeof FACTOR_VERSION;
  readonly calculationVersion: typeof CALCULATION_VERSION;
  readonly disclaimer: typeof DEMO_FACTORS_DISCLAIMER;
  readonly electricity: FactorDetail;
  readonly material: FactorDetail;
  readonly inboundTransport: FactorDetail;
  readonly waste: FactorDetail;
}

export const DEMO_EMISSION_FACTORS: EmissionFactorSet = {
  factorVersion: FACTOR_VERSION,
  calculationVersion: CALCULATION_VERSION,
  disclaimer: DEMO_FACTORS_DISCLAIMER,

  // Điện: 0.5 kg CO2e / kWh
  electricity: {
    value: 0.5,
    unit: "kg CO2e / kWh",
    description: "Hệ số phát thải lưới điện mẫu",
  },

  // Vật liệu demo-material-A: 2.0 kg CO2e / kg
  material: {
    value: 2.0,
    unit: "kg CO2e / kg",
    description: "Hệ số phát thải vật liệu demo-material-A",
  },

  // Vận tải đầu vào: 0.1 kg CO2e / tấn·km (tấn hàng × km hành trình)
  // Đã tính trực tiếp theo tấn-km (1 tấn = 1.000 kg)
  inboundTransport: {
    value: 0.1,
    unit: "kg CO2e / ton·km",
    description: "Vận tải đầu vào đường bộ (tấn-km)",
  },

  // Xử lý chất thải: 0.5 kg CO2e / kg chất thải
  waste: {
    value: 0.5,
    unit: "kg CO2e / kg",
    description: "Xử lý chất thải phát sinh từ quy trình sản xuất",
  },
};

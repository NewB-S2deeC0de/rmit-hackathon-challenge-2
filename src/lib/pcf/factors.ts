/**
 * @file src/lib/pcf/factors.ts
 * @description Bảng hệ số phát thải mẫu, đơn vị và phiên bản tính toán.
 * LƯU Ý QUAN TRỌNG: Các hệ số này hoàn toàn mang tính chất MINH HỌA cho bản demo kỹ thuật,
 * không phải là hệ số chính thức được kiểm định theo GHG Protocol / ISO 14067.
 */

import type { MaterialType, TransportMode } from "../../types.ts";

export const FACTOR_SET_ID = "demo-factors-v1" as const;
export const CALCULATION_VERSION = "pcf-v1" as const;

export const DEMO_FACTORS_DISCLAIMER =
  "Các hệ số trong bộ demo-factors-v1 chỉ phục vụ mục đích kiểm thử code và trình diễn kỹ thuật trong Hackathon; không được xem là số liệu phát thải thực tế." as const;

export interface FactorDetail {
  readonly value: number;
  readonly unit: string;
  readonly description: string;
}

export interface EmissionFactorSet {
  readonly factorSetId: typeof FACTOR_SET_ID;
  readonly calculationVersion: typeof CALCULATION_VERSION;
  readonly disclaimer: typeof DEMO_FACTORS_DISCLAIMER;
  readonly electricity: FactorDetail;
  readonly materials: Record<MaterialType, FactorDetail>;
  readonly transport: Record<TransportMode, FactorDetail>;
  readonly waste: FactorDetail;
}

export const DEMO_EMISSION_FACTORS: EmissionFactorSet = {
  factorSetId: FACTOR_SET_ID,
  calculationVersion: CALCULATION_VERSION,
  disclaimer: DEMO_FACTORS_DISCLAIMER,

  // Điện: 0.5 kg CO2e / kWh
  electricity: {
    value: 0.5,
    unit: "kg CO2e / kWh",
    description: "Hệ số phát thải lưới điện mẫu",
  },

  // Vật liệu (kg CO2e / kg)
  materials: {
    "demo-material-A": {
      value: 2.0,
      unit: "kg CO2e / kg",
      description: "Vật liệu mẫu A (chuẩn kiểm thử benchmark)",
    },
    steel: {
      value: 1.8,
      unit: "kg CO2e / kg",
      description: "Thép hợp kim minh họa",
    },
    aluminium: {
      value: 8.2,
      unit: "kg CO2e / kg",
      description: "Nhôm sơ cấp minh họa",
    },
    plastic: {
      value: 2.5,
      unit: "kg CO2e / kg",
      description: "Nhựa polymer minh họa",
    },
  },

  // Vận tải: kg CO2e / tấn·km (tấn hàng × km hành trình)
  // 1 tấn·km = (cargoMassKg / 1000) * distanceKm
  transport: {
    truck: {
      value: 0.1,
      unit: "kg CO2e / ton·km",
      description: "Vận chuyển đường bộ bằng xe tải",
    },
    ship: {
      value: 0.02,
      unit: "kg CO2e / ton·km",
      description: "Vận chuyển đường biển",
    },
  },

  // Xử lý chất thải: 0.5 kg CO2e / kg chất thải
  waste: {
    value: 0.5,
    unit: "kg CO2e / kg",
    description: "Xử lý chất thải phát sinh từ quy trình sản xuất",
  },
};

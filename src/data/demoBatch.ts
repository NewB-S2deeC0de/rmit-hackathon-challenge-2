/**
 * @file src/data/demoBatch.ts
 * @description Dữ liệu lô hàng mẫu phục vụ demo kiểm thử, tính tay đối chiếu và test case lỗi.
 */

import type {
  BatchFormValues,
  BatchInput,
  PCFResult,
  SimpleBatchInput,
} from "../types.ts";

// ============================================================================
// 1. Lô hàng hợp lệ chuẩn Benchmark (Đối chiếu phép tính tay)
// ============================================================================
export const validBenchmarkInput: BatchInput = {
  schemaVersion: 1,
  batchCode: "BATCH-2026-RMIT-001",
  productName: "Linh kiện hợp kim Demo-A",
  quantity: 1000,
  electricityKwh: 1200,
  materials: [
    {
      type: "demo-material-A",
      massKg: 500,
    },
  ],
  transport: [
    {
      mode: "truck",
      cargoMassKg: 8000, // 8 tấn
      distanceKm: 100, // 100 km -> 8 * 100 = 800 tấn·km
    },
  ],
  wasteKg: 20,
};

/** Dạng phẳng SimpleBatchInput để tương thích ngược */
export const validSimpleBenchmarkInput: SimpleBatchInput = {
  batchId: "BATCH-2026-RMIT-001",
  productName: "Linh kiện hợp kim Demo-A",
  quantity: 1000,
  electricityKwh: 1200,
  materialType: "demo-material-A",
  materialKg: 500,
  inboundTransportTonKm: 800,
  wasteKg: 20,
};

/** Dữ liệu dạng Form string để cắm vào nút "Điền dữ liệu mẫu" trên giao diện Supplier */
export const validBenchmarkFormValues: BatchFormValues = {
  batchCode: "BATCH-2026-RMIT-001",
  productName: "Linh kiện hợp kim Demo-A",
  quantity: "1000",
  electricityKwh: "1200",
  materials: [
    {
      type: "demo-material-A",
      massKg: "500",
    },
  ],
  transport: [
    {
      mode: "truck",
      cargoMassKg: "8000",
      distanceKm: "100",
    },
  ],
  wasteKg: "20",
};

/**
 * Bằng chứng mẫu (chứng từ nhà cung cấp, hóa đơn EVN, vận đơn).
 * Dữ liệu này là BÍ MẬT KINH DOANH, được mã hóa E2EE bởi TideCloak cùng với input,
 * KHÔNG tham gia phép nhân hệ số và KHÔNG gửi rõ lên backend.
 */
export const sampleConfidentialEvidence = {
  supplierLegalName: "Công ty Cổ phần Công nghệ Xanh RMIT",
  taxCode: "0312345678",
  facilityAddress: "Khu Công nghệ cao, TP. Hồ Chí Minh",
  powerInvoiceNumber: "EVN-HCM-2026-004921",
  powerSourceMix: "70% Điện mặt trời mái nhà, 30% Điện lưới quốc gia",
  materialSupplier: "Nippon Steel Vietnam (Hóa đơn GTGT #0092182)",
  logisticsPartner: "Logistics Xanh Trans - Vận đơn BL-88219",
  auditorNote:
    "Chứng từ lưu nội bộ để phục vụ đối chiếu khi Reviewer có thẩm quyền TideCloak yêu cầu thẩm định.",
};

// ============================================================================
// 2. Kết quả tính tay đối chiếu (Hand-Calculated Benchmark)
// ============================================================================
export const handCalculatedBenchmark = {
  description: "Phép tính tay kiểm thử độc lập cho lô chuẩn BATCH-2026-RMIT-001",
  steps: {
    electricity: "1.200 kWh × 0,5 kg CO₂e/kWh = 600 kg CO₂e",
    material: "500 kg × 2,0 kg CO₂e/kg = 1.000 kg CO₂e",
    transport: "8 tấn × 100 km = 800 tấn·km; 800 tấn·km × 0,1 kg CO₂e/tấn·km = 80 kg CO₂e",
    waste: "20 kg × 0,5 kg CO₂e/kg = 10 kg CO₂e",
    totalFormula: "600 + 1.000 + 80 + 10 = 1.690 kg CO₂e",
    perUnitFormula: "1.690 kg CO₂e / 1.000 sản phẩm = 1,69 kg CO₂e/sản phẩm",
  },
  expectedResult: {
    totalKgCO2e: 1690,
    perProductKgCO2e: 1.69,
    breakdown: {
      electricityKgCO2e: 600,
      materialsKgCO2e: 1000,
      transportKgCO2e: 80,
      wasteKgCO2e: 10,
    },
    factorSetId: "demo-factors-v1",
    calculationVersion: "pcf-v1",
  } as PCFResult,
};

// ============================================================================
// 3. Các lô hàng lỗi phục vụ demo xử lý ngoại lệ (Invalid Batches)
// ============================================================================

/** Lỗi 1: Số lượng bằng 0 (quantity = 0 -> không thể chia PCF/sản phẩm) */
export const invalidBatchZeroQuantity: BatchFormValues = {
  ...validBenchmarkFormValues,
  batchCode: "BATCH-ERR-ZERO-QTY",
  quantity: "0",
};

/** Lỗi 2: Điện năng âm (-500 kWh) */
export const invalidBatchNegativeElectricity: BatchFormValues = {
  ...validBenchmarkFormValues,
  batchCode: "BATCH-ERR-NEG-POWER",
  electricityKwh: "-500",
};

/** Lỗi 3: Vật liệu chưa được hệ thống hỗ trợ */
export const invalidBatchUnsupportedMaterial: BatchFormValues = {
  ...validBenchmarkFormValues,
  batchCode: "BATCH-ERR-UNSUPPORTED-MAT",
  materials: [
    {
      type: "titanium-grade-5" as unknown as any,
      massKg: "250",
    },
  ],
};

/** Lỗi 4: Bỏ trống các trường bắt buộc (Mã lô, tên SP, số lượng) */
export const invalidBatchMissingRequired: BatchFormValues = {
  batchCode: "",
  productName: "",
  quantity: "",
  electricityKwh: "",
  materials: [],
  transport: [],
  wasteKg: "",
};

/** Lỗi 5: Dữ liệu nhập chữ thay vì số */
export const invalidBatchNonNumeric: BatchFormValues = {
  ...validBenchmarkFormValues,
  batchCode: "BATCH-ERR-NAN",
  quantity: "mot-nghin-chiec",
  electricityKwh: "chua-do",
};

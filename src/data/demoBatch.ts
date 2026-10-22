/**
 * @file src/data/demoBatch.ts
 * @description Dữ liệu lô hàng mẫu phục vụ demo kiểm thử, tính tay đối chiếu và test case lỗi — Unified Contract v1.
 */

import type {
  BatchFormValues,
  BatchInput,
  EvidenceInput,
  PCFResult,
} from "../types.ts";

// ============================================================================
// 1. Lô hàng hợp lệ chuẩn Benchmark (Theo Mục 5 của Hợp đồng v1)
// ============================================================================

export const demoBatch: BatchInput = {
  schemaVersion: 1,
  batchId: "DEMO-001",
  productName: "Demo fastener",
  quantity: 1000,
  electricityKwh: 1200,
  materialType: "demo-material-A",
  materialKg: 500,
  inboundTransportTonKm: 800,
  wasteKg: 20,
};

/** Alias tương thích ngược */
export const validBenchmarkInput: BatchInput = demoBatch;

/** Dữ liệu dạng Form string để cắm vào nút "Điền dữ liệu mẫu" trên giao diện Supplier */
export const demoBatchFormValues: BatchFormValues = {
  batchId: "DEMO-001",
  productName: "Demo fastener",
  quantity: "1000",
  electricityKwh: "1200",
  materialType: "demo-material-A",
  materialKg: "500",
  inboundTransportTonKm: "800",
  wasteKg: "20",
};

/** Alias tương thích ngược */
export const validBenchmarkFormValues: BatchFormValues = demoBatchFormValues;

/**
 * Bằng chứng mẫu (chứng từ nhà cung cấp, ghi chú demo).
 * v1 chỉ hỗ trợ kind: "demo-text", được mã hóa E2EE cùng input,
 * KHÔNG tham gia tính toán PCF và KHÔNG lưu bản rõ ở backend.
 */
export const demoEvidence: EvidenceInput = {
  kind: "demo-text",
  text: "Hóa đơn tiền điện EVN #004921 (1.200 kWh) + Phiếu xuất kho #5512 (500 kg demo-material-A) + Vận đơn Logistics BL-88219 (800 tấn-km)",
};

/** Alias tương thích */
export const sampleConfidentialEvidence = demoEvidence;

// ============================================================================
// 2. Kết quả tính tay đối chiếu chuẩn (Hand-Calculated Benchmark)
// ============================================================================

export const handCalculatedBenchmark = {
  description: "Phép tính tay kiểm thử độc lập cho lô chuẩn DEMO-001",
  steps: {
    electricity: "1.200 kWh × 0,5 kg CO₂e/kWh = 600 kg CO₂e",
    material: "500 kg × 2,0 kg CO₂e/kg = 1.000 kg CO₂e",
    transport: "800 tấn·km × 0,1 kg CO₂e/tấn·km = 80 kg CO₂e",
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
    factorVersion: "demo-factors-v1",
    calculationVersion: "pcf-v1",
  } as PCFResult,
};

// ============================================================================
// 3. Các lô hàng lỗi phục vụ demo xử lý ngoại lệ (Invalid Batches)
// ============================================================================

/** Lỗi 1: Số lượng bằng 0 (quantity = 0 -> lỗi OUT_OF_RANGE) */
export const invalidBatchZeroQuantity: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO-ERR-ZERO-QTY",
  quantity: "0",
};

/** Lỗi 2: Điện năng âm (-500 kWh -> lỗi OUT_OF_RANGE) */
export const invalidBatchNegativeElectricity: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO-ERR-NEG-POWER",
  electricityKwh: "-500",
};

/** Lỗi 3: Vật liệu chưa được hệ thống hỗ trợ (lỗi UNSUPPORTED_VALUE) */
export const invalidBatchUnsupportedMaterial: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO-ERR-UNSUPPORTED-MAT",
  materialType: "titanium-grade-5" as any,
};

/** Lỗi 4: Bỏ trống các trường bắt buộc (lỗi REQUIRED) */
export const invalidBatchMissingRequired: BatchFormValues = {
  batchId: "",
  productName: "",
  quantity: "",
  electricityKwh: "",
  materialType: "demo-material-A",
  materialKg: "",
  inboundTransportTonKm: "",
  wasteKg: "",
};

/** Lỗi 5: Dữ liệu nhập chữ vào ô số (lỗi INVALID_NUMBER) */
export const invalidBatchNonNumeric: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO-ERR-NAN",
  quantity: "mot-nghin-chiec",
  electricityKwh: "chua-do",
};

/** Lỗi 6: Mã lô sai quy cách (chứa khoảng trắng và ký tự đặc biệt -> lỗi INVALID_FORMAT) */
export const invalidBatchInvalidFormatId: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO INVALID BATCH!@#",
};

/** Lỗi 7: Số lượng vượt giới hạn 1 tỷ (lỗi OUT_OF_RANGE) */
export const invalidBatchExceedsLimit: BatchFormValues = {
  ...demoBatchFormValues,
  batchId: "DEMO-ERR-OVERFLOW",
  quantity: "2000000000",
};

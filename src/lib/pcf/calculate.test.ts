/**
 * @file src/lib/pcf/calculate.test.ts
 * @description Bộ kiểm thử toàn diện cho module PCF (Hàm tính, Bộ quy tắc kiểm tra, Định dạng hiển thị).
 * Sử dụng test runner có sẵn của Node 22 (node:test + node:assert).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  handCalculatedBenchmark,
  invalidBatchMissingRequired,
  invalidBatchNegativeElectricity,
  invalidBatchNonNumeric,
  invalidBatchUnsupportedMaterial,
  invalidBatchZeroQuantity,
  validBenchmarkFormValues,
  validBenchmarkInput,
  validSimpleBenchmarkInput,
} from "../../data/demoBatch.ts";
import type { BatchInput } from "../../types.ts";
import {
  calculatePCF,
  createPrivateBatchPayload,
  createPublicSummary,
  formatPCFForDisplay,
} from "./calculate.ts";
import {
  CALCULATION_VERSION,
  DEMO_EMISSION_FACTORS,
  FACTOR_SET_ID,
} from "./factors.ts";
import {
  fromSimpleBatchInput,
  parseBatchForm,
  validateBatchInput,
} from "./validate.ts";

describe("1. Kiểm tra Phép tính PCF Chuẩn (Benchmark Test)", () => {
  it("khớp chính xác 100% với phép tính tay 1.690 kg CO2e và 1,69 kg CO2e/sản phẩm", () => {
    const result = calculatePCF(validBenchmarkInput);

    // Kiểm tra từng thành phần phân rã (Breakdown)
    assert.equal(
      result.breakdown.electricityKgCO2e,
      600,
      "Điện: 1.200 kWh * 0.5 = 600 kg CO2e"
    );
    assert.equal(
      result.breakdown.materialsKgCO2e,
      1000,
      "Vật liệu: 500 kg * 2.0 = 1000 kg CO2e"
    );
    assert.equal(
      result.breakdown.transportKgCO2e,
      80,
      "Vận tải: 8 tấn * 100 km * 0.1 = 80 kg CO2e"
    );
    assert.equal(
      result.breakdown.wasteKgCO2e,
      10,
      "Chất thải: 20 kg * 0.5 = 10 kg CO2e"
    );

    // Kiểm tra tổng và đơn vị
    assert.equal(
      result.totalKgCO2e,
      handCalculatedBenchmark.expectedResult.totalKgCO2e,
      "Tổng phát thải phải bằng 1690 kg CO2e"
    );
    assert.equal(
      result.perProductKgCO2e,
      handCalculatedBenchmark.expectedResult.perProductKgCO2e,
      "Phát thải mỗi sản phẩm phải bằng 1.69 kg CO2e"
    );

    // Kiểm tra metadata phiên bản
    assert.equal(result.factorSetId, FACTOR_SET_ID);
    assert.equal(result.calculationVersion, CALCULATION_VERSION);
  });

  it("cho kết quả tất định (deterministic) qua nhiều lần gọi độc lập", () => {
    const firstRun = calculatePCF(validBenchmarkInput);
    for (let i = 0; i < 5; i++) {
      const run = calculatePCF(validBenchmarkInput);
      assert.deepEqual(run, firstRun);
    }
  });

  it("tương thích chính xác với định dạng phẳng SimpleBatchInput", () => {
    const converted = fromSimpleBatchInput(validSimpleBenchmarkInput);
    const result = calculatePCF(converted);

    assert.equal(result.totalKgCO2e, 1690);
    assert.equal(result.perProductKgCO2e, 1.69);
  });
});

describe("2. Kiểm tra Nhiều Vật liệu & Nhiều Chặng Vận chuyển", () => {
  it("tính chính xác khi có nhiều vật liệu (thép, nhôm, nhựa) và đường biển", () => {
    const complexBatch: BatchInput = {
      schemaVersion: 1,
      batchCode: "BATCH-COMPLEX-002",
      productName: "Sản phẩm công nghiệp đa thành phần",
      quantity: 500,
      electricityKwh: 2000, // 2000 * 0.5 = 1000
      materials: [
        { type: "steel", massKg: 100 }, // 100 * 1.8 = 180
        { type: "aluminium", massKg: 50 }, // 50 * 8.2 = 410
        { type: "plastic", massKg: 40 }, // 40 * 2.5 = 100
      ], // Tổng vật liệu = 180 + 410 + 100 = 690
      transport: [
        { mode: "ship", cargoMassKg: 50000, distanceKm: 1000 }, // 50t * 1000km * 0.02 = 1000
        { mode: "truck", cargoMassKg: 5000, distanceKm: 200 }, // 5t * 200km * 0.1 = 100
      ], // Tổng vận tải = 1000 + 100 = 1100
      wasteKg: 50, // 50 * 0.5 = 25
    };

    const result = calculatePCF(complexBatch);

    assert.equal(result.breakdown.electricityKgCO2e, 1000);
    assert.equal(result.breakdown.materialsKgCO2e, 690);
    assert.equal(result.breakdown.transportKgCO2e, 1100);
    assert.equal(result.breakdown.wasteKgCO2e, 25);

    // Tổng: 1000 + 690 + 1100 + 25 = 2815 kg CO2e
    assert.equal(result.totalKgCO2e, 2815);
    // Mỗi sp: 2815 / 500 = 5.63 kg CO2e/sp
    assert.equal(result.perProductKgCO2e, 5.63);
  });
});

describe("3. Kiểm tra Bộ Quy tắc Validation (parseBatchForm & validateBatchInput)", () => {
  it("chấp nhận form mẫu hợp lệ", () => {
    const validation = parseBatchForm(validBenchmarkFormValues);
    assert.equal(validation.ok, true);
    if (validation.ok) {
      assert.equal(validation.value.batchCode, "BATCH-2026-RMIT-001");
      assert.equal(validation.value.quantity, 1000);
      assert.equal(validation.value.materials[0].massKg, 500);
    }
  });

  it("từ chối khi quantity = 0 (lỗi OUT_OF_RANGE)", () => {
    const validation = parseBatchForm(invalidBatchZeroQuantity);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "quantity");
      assert.ok(err, "Phải có lỗi ở trường quantity");
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi số liệu âm (điện năng âm)", () => {
    const validation = parseBatchForm(invalidBatchNegativeElectricity);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "electricityKwh");
      assert.ok(err, "Phải có lỗi ở trường electricityKwh");
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi vật liệu không nằm trong danh mục hỗ trợ", () => {
    const validation = parseBatchForm(invalidBatchUnsupportedMaterial);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "materials.0.type");
      assert.ok(err, "Phải báo lỗi vật liệu không hỗ trợ");
      assert.equal(err!.code, "UNSUPPORTED_VALUE");
    }
  });

  it("từ chối khi thiếu các trường bắt buộc", () => {
    const validation = parseBatchForm(invalidBatchMissingRequired);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.ok(validation.errors.some((e) => e.path === "batchCode"));
      assert.ok(validation.errors.some((e) => e.path === "productName"));
      assert.ok(validation.errors.some((e) => e.path === "quantity"));
    }
  });

  it("từ chối khi nhập chữ vào ô số (INVALID_NUMBER)", () => {
    const validation = parseBatchForm(invalidBatchNonNumeric);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.ok(
        validation.errors.some(
          (e) => e.path === "quantity" && e.code === "INVALID_NUMBER"
        )
      );
    }
  });

  it("hàm validateBatchInput hoạt động đúng với đối tượng JSON thô", () => {
    const validRaw = {
      batchCode: "BATCH-RAW-001",
      productName: "Sản phẩm thử nghiệm",
      quantity: 50,
      electricityKwh: 100,
      materialType: "demo-material-A",
      materialKg: 200,
      inboundTransportTonKm: 300,
      wasteKg: 10,
    };
    const res = validateBatchInput(validRaw);
    assert.equal(res.ok, true);
  });
});

describe("4. Kiểm tra PublicSummary, Payload Bảo mật & Định dạng Hiển thị", () => {
  it("tạo PublicSummary đúng với assuranceLevel là 'supplier-declared'", () => {
    const pcfResult = calculatePCF(validBenchmarkInput);
    const summary = createPublicSummary(validBenchmarkInput, pcfResult);

    assert.equal(summary.batchCode, "BATCH-2026-RMIT-001");
    assert.equal(summary.totalKgCO2e, 1690);
    assert.equal(summary.perProductKgCO2e, 1.69);
    assert.equal(summary.assuranceLevel, "supplier-declared");
  });

  it("đóng gói PrivateBatchPayload chứa toàn vẹn dữ liệu nhạy cảm", () => {
    const pcfResult = calculatePCF(validBenchmarkInput);
    const payload = createPrivateBatchPayload(
      validBenchmarkInput,
      pcfResult,
      "Chứng từ bảo mật ISO 14064"
    );

    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.input.quantity, 1000);
    assert.equal(payload.evidenceText, "Chứng từ bảo mật ISO 14064");
  });

  it("định dạng hiển thị formatPCFForDisplay làm tròn 2 chữ số thập phân", () => {
    const pcfResult = calculatePCF(validBenchmarkInput);
    const formatted = formatPCFForDisplay(pcfResult);

    assert.match(formatted.total, /1[.,]690[.,]00 kg CO₂e/);
    assert.match(formatted.perUnit, /1[.,]69 kg CO₂e\/sản phẩm/);
  });
});

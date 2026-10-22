/**
 * @file src/lib/pcf/calculate.test.ts
 * @description Bộ kiểm thử toàn diện cho module PCF theo Unified Contract v1.
 * Sử dụng test runner có sẵn của Node 22 (node:test + node:assert).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  demoBatch,
  demoBatchFormValues,
  demoEvidence,
  handCalculatedBenchmark,
  invalidBatchExceedsLimit,
  invalidBatchInvalidFormatId,
  invalidBatchMissingRequired,
  invalidBatchNegativeElectricity,
  invalidBatchNonNumeric,
  invalidBatchUnsupportedMaterial,
  invalidBatchZeroQuantity,
} from "../../data/demoBatch.ts";
import { ContractError, type BatchInput } from "../../types.ts";
import {
  calculatePCF,
  createPrivateBatchPayload,
  createPublicSummary,
  formatPCFForDisplay,
} from "./calculate.ts";
import { CALCULATION_VERSION, FACTOR_VERSION } from "./factors.ts";
import { parseBatchForm, validate, validateEvidence } from "./validate.ts";

describe("1. Kiểm tra Phép tính PCF Chuẩn (Benchmark Test — Mục 5)", () => {
  it("khớp chính xác 100% với phép tính tay 1.690 kg CO2e và 1,69 kg CO2e/sản phẩm", () => {
    const result = calculatePCF(demoBatch);

    // 1. Phân rã phát thải (Breakdown)
    assert.equal(
      result.breakdown.electricityKgCO2e,
      600,
      "Điện: 1.200 kWh × 0.5 = 600 kg CO2e"
    );
    assert.equal(
      result.breakdown.materialsKgCO2e,
      1000,
      "Vật liệu: 500 kg × 2.0 = 1000 kg CO2e"
    );
    assert.equal(
      result.breakdown.transportKgCO2e,
      80,
      "Vận tải: 800 tấn·km × 0.1 = 80 kg CO2e"
    );
    assert.equal(
      result.breakdown.wasteKgCO2e,
      10,
      "Chất thải: 20 kg × 0.5 = 10 kg CO2e"
    );

    // 2. Tổng phát thải và phát thải trên đơn vị sản phẩm
    assert.equal(
      result.totalKgCO2e,
      handCalculatedBenchmark.expectedResult.totalKgCO2e,
      "Tổng phát thải: 600 + 1000 + 80 + 10 = 1690 kg CO2e"
    );
    assert.equal(
      result.perProductKgCO2e,
      handCalculatedBenchmark.expectedResult.perProductKgCO2e,
      "Phát thải mỗi sản phẩm: 1690 / 1000 = 1.69 kg CO2e"
    );

    // 3. Metadata phiên bản
    assert.equal(result.factorVersion, FACTOR_VERSION);
    assert.equal(result.calculationVersion, CALCULATION_VERSION);
  });

  it("cho kết quả tất định (deterministic) qua nhiều lần gọi độc lập", () => {
    const firstRun = calculatePCF(demoBatch);
    for (let i = 0; i < 5; i++) {
      const run = calculatePCF(demoBatch);
      assert.deepEqual(run, firstRun);
    }
  });
});

describe("2. Kiểm tra Bộ Quy tắc Validation (validate & parseBatchForm)", () => {
  it("chấp nhận form mẫu hợp lệ", () => {
    const validation = parseBatchForm(demoBatchFormValues);
    assert.equal(validation.ok, true);
    if (validation.ok) {
      assert.equal(validation.value.batchId, "DEMO-001");
      assert.equal(validation.value.productName, "Demo fastener");
      assert.equal(validation.value.quantity, 1000);
      assert.equal(validation.value.materialType, "demo-material-A");
      assert.equal(validation.value.materialKg, 500);
      assert.equal(validation.value.inboundTransportTonKm, 800);
      assert.equal(validation.value.wasteKg, 20);
    }
  });

  it("từ chối khi quantity = 0 (lỗi OUT_OF_RANGE)", () => {
    const validation = parseBatchForm(invalidBatchZeroQuantity);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "quantity");
      assert.ok(err, "Phải có lỗi tại path 'quantity'");
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi quantity không phải số nguyên", () => {
    const invalidQuantityFloat = {
      ...demoBatch,
      quantity: 100.5,
    };
    const res = validate(invalidQuantityFloat);
    assert.equal(res.ok, false);
    if (!res.ok) {
      const err = res.errors.find((e) => e.path === "quantity");
      assert.ok(err);
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi quantity vượt quá giới hạn 1 tỷ", () => {
    const validation = parseBatchForm(invalidBatchExceedsLimit);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "quantity");
      assert.ok(err);
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi số liệu âm (điện năng âm)", () => {
    const validation = parseBatchForm(invalidBatchNegativeElectricity);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "electricityKwh");
      assert.ok(err, "Phải có lỗi tại path 'electricityKwh'");
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("từ chối khi vật liệu không phải 'demo-material-A'", () => {
    const validation = parseBatchForm(invalidBatchUnsupportedMaterial);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "materialType");
      assert.ok(err, "Phải báo lỗi vật liệu không hỗ trợ");
      assert.equal(err!.code, "UNSUPPORTED_VALUE");
    }
  });

  it("từ chối khi thiếu các trường bắt buộc", () => {
    const validation = parseBatchForm(invalidBatchMissingRequired);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.ok(validation.errors.some((e) => e.path === "batchId"));
      assert.ok(validation.errors.some((e) => e.path === "productName"));
      assert.ok(validation.errors.some((e) => e.path === "quantity"));
      assert.ok(validation.errors.some((e) => e.path === "electricityKwh"));
      assert.ok(validation.errors.some((e) => e.path === "materialKg"));
      assert.ok(
        validation.errors.some((e) => e.path === "inboundTransportTonKm")
      );
      assert.ok(validation.errors.some((e) => e.path === "wasteKg"));
    }
  });

  it("không tự ý đổi ô số trống thành 0 (quy tắc REQUIRED cho ô trống)", () => {
    const formWithEmptyWaste = {
      ...demoBatchFormValues,
      wasteKg: "   ",
    };
    const res = parseBatchForm(formWithEmptyWaste);
    assert.equal(res.ok, false);
    if (!res.ok) {
      const err = res.errors.find((e) => e.path === "wasteKg");
      assert.ok(err);
      assert.equal(err!.code, "REQUIRED");
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
      assert.ok(
        validation.errors.some(
          (e) => e.path === "electricityKwh" && e.code === "INVALID_NUMBER"
        )
      );
    }
  });

  it("từ chối mã lô (batchId) chứa ký tự không hợp lệ hoặc khoảng trắng", () => {
    const validation = parseBatchForm(invalidBatchInvalidFormatId);
    assert.equal(validation.ok, false);
    if (!validation.ok) {
      const err = validation.errors.find((e) => e.path === "batchId");
      assert.ok(err);
      assert.equal(err!.code, "INVALID_FORMAT");
    }
  });

  it("chấp nhận mã lô (batchId) hợp lệ với chữ, số, gạch ngang, gạch dưới", () => {
    const validIds = ["LOT-2026_01", "BATCH_A-1", "999", "prod-lot-xyz"];
    for (const bid of validIds) {
      const res = parseBatchForm({
        ...demoBatchFormValues,
        batchId: bid,
      });
      assert.equal(res.ok, true, `Mã lô ${bid} phải hợp lệ`);
    }
  });

  it("từ chối tên sản phẩm dài quá 120 ký tự", () => {
    const longName = "A".repeat(121);
    const res = parseBatchForm({
      ...demoBatchFormValues,
      productName: longName,
    });
    assert.equal(res.ok, false);
    if (!res.ok) {
      const err = res.errors.find((e) => e.path === "productName");
      assert.ok(err);
      assert.equal(err!.code, "OUT_OF_RANGE");
    }
  });

  it("validate từ chối khi truyền chuỗi vào trường số (validate nhận unknown không tự ép kiểu chuỗi)", () => {
    const rawWithStrings = {
      ...demoBatch,
      quantity: "1000", // Sai kiểu
    };
    const res = validate(rawWithStrings);
    assert.equal(res.ok, false);
    if (!res.ok) {
      const err = res.errors.find((e) => e.path === "quantity");
      assert.ok(err);
      assert.equal(err!.code, "INVALID_NUMBER");
    }
  });

  it("validate từ chối schemaVersion khác 1", () => {
    const badSchema = {
      ...demoBatch,
      schemaVersion: 2,
    };
    const res = validate(badSchema);
    assert.equal(res.ok, false);
    if (!res.ok) {
      const err = res.errors.find((e) => e.path === "schemaVersion");
      assert.ok(err);
      assert.equal(err!.code, "UNSUPPORTED_VALUE");
    }
  });
});

describe("3. Kiểm tra Ngoại lệ calculatePCF với ContractError", () => {
  it("ném ContractError với status = null và code = 'VALIDATION_ERROR' khi input không hợp lệ", () => {
    const invalidInput = {
      ...demoBatch,
      quantity: 0,
    } as BatchInput;

    assert.throws(
      () => calculatePCF(invalidInput),
      (err: unknown) => {
        assert.ok(err instanceof ContractError, "Phải là thể hiện ContractError");
        assert.equal(err.status, null, "status phải là null");
        assert.equal(err.code, "VALIDATION_ERROR");
        assert.ok(err.fields && err.fields.length > 0);
        return true;
      }
    );
  });
});

describe("4. Kiểm tra PublicSummary, PrivateBatchPayload & Bằng chứng", () => {
  it("tạo PublicSummary đúng với assuranceLevel là 'supplier-reported'", () => {
    const pcfResult = calculatePCF(demoBatch);
    const summary = createPublicSummary(demoBatch, pcfResult);

    assert.equal(summary.batchId, "DEMO-001");
    assert.equal(summary.productName, "Demo fastener");
    assert.equal(summary.totalKgCO2e, 1690);
    assert.equal(summary.perProductKgCO2e, 1.69);
    assert.equal(summary.factorVersion, "demo-factors-v1");
    assert.equal(summary.calculationVersion, "pcf-v1");
    assert.equal(summary.assuranceLevel, "supplier-reported");

    // Đảm bảo không rò rỉ breakdown, supplierId hay encryptedInput
    assert.equal((summary as any).breakdown, undefined);
    assert.equal((summary as any).supplierId, undefined);
    assert.equal((summary as any).encryptedInput, undefined);
  });

  it("đóng gói PrivateBatchPayload chứa toàn vẹn dữ liệu nhạy cảm", () => {
    const pcfResult = calculatePCF(demoBatch);
    const payload = createPrivateBatchPayload(
      demoBatch,
      pcfResult,
      demoEvidence
    );

    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.input.quantity, 1000);
    assert.equal(payload.result.totalKgCO2e, 1690);
    assert.deepEqual(payload.evidence, demoEvidence);
  });

  it("kiểm tra hợp lệ bằng chứng (validateEvidence)", () => {
    // 1. null / undefined hợp lệ
    assert.equal(validateEvidence(null).ok, true);
    assert.equal(validateEvidence(undefined).ok, true);

    // 2. demoEvidence hợp lệ
    const validRes = validateEvidence(demoEvidence);
    assert.equal(validRes.ok, true);

    // 3. Thiếu text hoặc rỗng
    const emptyRes = validateEvidence({ kind: "demo-text", text: "   " });
    assert.equal(emptyRes.ok, false);

    // 4. Sai kind
    const wrongKind = validateEvidence({ kind: "pdf-invoice", text: "abc" });
    assert.equal(wrongKind.ok, false);

    // 5. Quá 10.000 ký tự
    const over10k = validateEvidence({
      kind: "demo-text",
      text: "X".repeat(10_001),
    });
    assert.equal(over10k.ok, false);
  });

  it("định dạng hiển thị formatPCFForDisplay làm tròn 2 chữ số thập phân", () => {
    const pcfResult = calculatePCF(demoBatch);
    const formatted = formatPCFForDisplay(pcfResult);

    assert.match(formatted.total, /1[.,]690[.,]00 kg CO₂e/);
    assert.match(formatted.perUnit, /1[.,]69 kg CO₂e\/sản phẩm/);
    assert.match(formatted.electricity, /600[.,]00 kg CO₂e/);
    assert.match(formatted.materials, /1[.,]000[.,]00 kg CO₂e/);
    assert.match(formatted.transport, /80[.,]00 kg CO₂e/);
    assert.match(formatted.waste, /10[.,]00 kg CO₂e/);
  });
});

import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MockBatchCrypto,
  MockBatchApiClient,
  mockBatchApi,
  mockPublicBatches,
  mockStoredBatches,
} from "./fixtures.ts";
import { demoBatch } from "../data/demoBatch.ts";
import { calculatePCF, createPrivateBatchPayload } from "../lib/pcf/calculate.ts";
import {
  TAG_SUPPLIER_INTERNAL,
  TAG_SCOPE3_VERIFIED,
  ContractError,
  type PrivateBatchPayload,
} from "../types.ts";

describe("5. Kiểm tra MockBatchCrypto & 3 Lưu ý Kỹ thuật TideCloak SDK (Mục 22)", () => {
  const pcfResult = calculatePCF(demoBatch);
  const privatePayload: PrivateBatchPayload = createPrivateBatchPayload(
    demoBatch,
    pcfResult,
    { kind: "demo-text", text: "Hóa đơn điện tháng 10/2026 - Mã EVN: 12345" }
  );

  it("Mã hóa thành công với TAG_SUPPLIER_INTERNAL mặc định (Lưu ý 1 & 2)", async () => {
    const crypto = new MockBatchCrypto();
    const encrypted = await crypto.encryptBatch(privatePayload);

    assert.equal(encrypted.provider, "tidecloak");
    assert.equal(encrypted.formatVersion, 1);
    assert.ok(encrypted.serialized.includes(`tag=${TAG_SUPPLIER_INTERNAL}`));
  });

  it("Giải mã thành công khi cung cấp chính xác thẻ TAG_SUPPLIER_INTERNAL", async () => {
    const crypto = new MockBatchCrypto();
    const encrypted = await crypto.encryptBatch(privatePayload, TAG_SUPPLIER_INTERNAL);
    const decrypted = await crypto.decryptBatch(encrypted, TAG_SUPPLIER_INTERNAL);

    assert.deepEqual(decrypted.input, demoBatch);
    assert.equal(decrypted.result.totalKgCO2e, 1690);
    assert.equal(decrypted.evidence?.text, "Hóa đơn điện tháng 10/2026 - Mã EVN: 12345");
  });

  it("Từ chối giải mã (403 ACCESS_DENIED) khi thẻ giải mã không khớp với thẻ mã hóa gốc", async () => {
    const crypto = new MockBatchCrypto();
    const encrypted = await crypto.encryptBatch(privatePayload, TAG_SUPPLIER_INTERNAL);

    await assert.rejects(
      async () => {
        // Cố tình truyền thẻ sai (TAG_SCOPE3_VERIFIED thay vì TAG_SUPPLIER_INTERNAL)
        await crypto.decryptBatch(encrypted, TAG_SCOPE3_VERIFIED);
      },
      (err: unknown) => {
        assert.ok(err instanceof ContractError);
        assert.equal(err.code, "ACCESS_DENIED");
        assert.equal(err.status, 403);
        return true;
      }
    );
  });
});

describe("6. Kiểm tra Mock Batch API & Public API Contamination Prevention", () => {
  it("getPublicBatches không làm lộ supplierId hoặc encryptedInput trong danh sách công khai", async () => {
    const res = await mockBatchApi.getPublicBatches();
    assert.ok(res.items.length > 0);

    for (const item of res.items) {
      assert.ok(item.id);
      assert.ok(item.createdAt);
      assert.ok(item.publicSummary);
      assert.equal(item.publicSummary.assuranceLevel, "supplier-reported");
      // Đảm bảo không leak trường nhạy cảm sang PublicBatch
      assert.equal((item as any).supplierId, undefined);
      assert.equal((item as any).encryptedInput, undefined);
    }
  });

  it("mockStoredBatches có đầy đủ định dạng hợp lệ của StoredBatch v1", () => {
    assert.ok(mockStoredBatches.length >= 5);
    for (const b of mockStoredBatches) {
      assert.ok(b.id);
      assert.ok(b.supplierId);
      assert.ok(b.createdAt);
      assert.equal(b.schemaVersion, 1);
      assert.equal(b.publicSummary.assuranceLevel, "supplier-reported");
      assert.equal(b.encryptedInput.provider, "tidecloak");
    }
  });
});

# SCOPEZERO — BÀN GIAO NHÁNH `feat/logic-and-data` (MEMBER 2)

> **Nhánh (Branch)**: `feat/logic-and-data` (hoặc `feat/pcf-data`)  
> **Người phụ trách**: Thành viên 2 — Logic & Data (`backend/reporting/`, `data/sample/`, `src/lib/pcf/`, `src/types.ts`)  
> **Phiên bản Hợp đồng**: ScopeZero Unified Contract v1 (Đặc tả hệ thống 22 mục)  
> **Trạng thái kiểm thử**: **26/26 tests PASS**, TypeScript Typecheck **0 lỗi**  

---

## 1. Mục tiêu & Phạm vi Đã Hoàn thành

Thành viên 2 chịu trách nhiệm xây dựng nền tảng tính toán, dữ liệu và kiểm tra hợp lệ độc lập cho toàn bộ giải pháp ScopeZero. Toàn bộ logic được thiết kế theo nguyên tắc:
1. **Không phụ thuộc cơ sở dữ liệu hay mạng**: Hàm tính toán PCF là hàm thuần túy (*pure function*), chạy đồng bộ và tất định.
2. **Bảo vệ ranh giới tin cậy (Trust Boundary)**: Phép tính PCF chạy trực tiếp trên trình duyệt của Supplier trước khi mã hóa; backend chỉ lưu trữ bản mã `encryptedInput` và dữ liệu tóm tắt công bố `publicSummary`.
3. **Tuân thủ tuyệt đối Hợp đồng v1 & Mục 22 Đặc tả Hệ thống**: Tích hợp các quy tắc cú pháp của TideCloak SDK (`JSON.stringify`, tag matching, client console config).

---

## 2. Danh mục Thành phần Đã Cài đặt

### 2.1. Hợp đồng Kiểu Dữ liệu Duy nhất (Single Source of Truth)
* **File**: [`src/types.ts`](../src/types.ts)
* **Nội dung**:
  * Các kiểu cốt lõi: `BatchFormValues`, `BatchInput`, `PCFResult`, `EvidenceInput`, `PrivateBatchPayload`.
  * Các kiểu lưu trữ & API: `PublicSummary`, `EncryptedPayload`, `StoredBatch`, `PublicBatch`, `CreateBatchRequest`, `CreateBatchResponse`, `ListPublicBatchesResponse`.
  * Mô hình lỗi chuẩn: `ApiError`, `ContractError` (hỗ trợ `status: number | null`, mã lỗi `ACCESS_DENIED`, `CRYPTO_FAILED`, `VALIDATION_ERROR`, v.v.).
  * **Hằng số TideCloak SDK (Mục 22)**:
    * `TAG_SUPPLIER_INTERNAL = "_tide_supplier_internal"`
    * `TAG_SCOPE3_VERIFIED = "_tide_scope3_verified"`

### 2.2. Bộ Máy Tính toán & Xác thực PCF (`src/lib/pcf/`)
* **[`src/lib/pcf/factors.ts`](../src/lib/pcf/factors.ts)**:
  * Bộ hệ số cố định `demo-factors-v1`: Điện ($0,5$), Vật liệu A ($2,0$), Vận tải ($0,1$), Rác thải ($0,5$).
* **[`src/lib/pcf/validate.ts`](../src/lib/pcf/validate.ts)**:
  * `validate(unknown)`: Kiểm tra kiểu lúc chạy, bounds 0–1 tỷ, regex `batchId`, từ chối chuỗi ở ô số, ô số trống trả lỗi `REQUIRED` (không tự ép thành 0).
  * `parseBatchForm(BatchFormValues)`: Trim chuỗi và chuyển đổi kiểu từ form UI.
  * `validateEvidence(unknown)`: Xác thực bằng chứng văn bản giả lập `kind: "demo-text"`.
* **[`src/lib/pcf/calculate.ts`](../src/lib/pcf/calculate.ts)**:
  * `calculatePCF(BatchInput)`: Hàm tính toán pure function tất định. Ném `ContractError` với `status = null` và `code = "VALIDATION_ERROR"` khi dữ liệu sai.
  * `createPublicSummary`: Tạo dữ liệu công bố minh bạch với nhãn trung thực `assuranceLevel: "supplier-reported"`.
  * `createPrivateBatchPayload`: Đóng gói `input` + `result` + `evidence` phục vụ mã hóa E2EE.
  * `formatPCFForDisplay`: Định dạng làm tròn 2 chữ số thập phân khi hiển thị UI.

### 2.3. Khử trùng lặp Mã nguồn (Mục 16 Đặc tả)
* [`backend/reporting/`](../backend/reporting/calculate.ts) và [`data/sample/`](../data/sample/demoBatch.ts): Được cấu hình re-export trực tiếp từ `src/` nhằm đảm bảo một nguồn code duy nhất, không bảo trì song song 2 bộ code.

### 2.4. Dữ liệu Mẫu & Fixtures Kiểm thử (`src/data/`, `src/mocks/`)
* **[`src/data/demoBatch.ts`](../src/data/demoBatch.ts)**:
  * Lô chuẩn `DEMO-001` (1.000 fastener): Điện 1.200 kWh, Vật liệu 500 kg, Vận tải 800 tấn-km, Rác thải 20 kg.
    * Phân rã: Điện = 600, Vật liệu = 1.000, Vận tải = 80, Rác = 10.
    * **Tổng phát thải (`totalKgCO2e`)**: **1.690 kg CO2e**.
    * **Mỗi sản phẩm (`perProductKgCO2e`)**: **1,69 kg CO2e/sản phẩm**.
  * 7 ca kiểm thử lỗi biên: `quantity = 0`, số âm, vật liệu lạ, `batchId` sai định dạng, chuỗi rỗng, v.v.
* **[`src/mocks/fixtures.ts`](../src/mocks/fixtures.ts)**:
  * 5 preset lô hàng đa ngành công nghiệp (Fastener, EV Engine, Industrial Valve, Precision Gear, Temperature Sensor).
  * `MockBatchApiClient`: Giả lập đầy đủ API Client với Promise & Network delay phục vụ Member 3 và Member 4 ghép giao diện UI độc lập.
  * `MockBatchCrypto`: Mô phỏng TideCloak SDK với 3 lưu ý kỹ thuật Mục 22:
    1. Yêu cầu dữ liệu mã hóa là chuỗi (`JSON.stringify`).
    2. Kiểm tra khớp thẻ giải mã (`TAG_SUPPLIER_INTERNAL`), ném lỗi 403 `ACCESS_DENIED` nếu sai thẻ.
* **[`storage/batches.json`](../storage/batches.json)**: Seed sẵn 5 lô hàng chứa `publicSummary` và `encryptedInput` mô phỏng phục vụ backend thử nghiệm (được `.gitignore` bảo vệ).

### 2.5. Cấu hình Mẫu TideCloak Console (Mục 22.3)
* **[`infra/tidecloak/tidecloak.example.json`](../infra/tidecloak/tidecloak.example.json)**:
  * Client ID: `scopezero-web`.
  * Standard Flow Enabled: `true`.
  * Valid Redirect URIs: `http://localhost:5173/*` và `http://localhost:3000/*`.

---

## 3. Kết quả Kiểm thử Tự động (26/26 Tests Pass)

Chạy kiểm thử thông qua script chuẩn [`scripts/test-all.sh`](../scripts/test-all.sh):

```bash
=== 1. Running Unit Tests in backend/reporting/ ===
▶ 1. Kiểm tra Phép tính PCF Chuẩn (Benchmark Test — Mục 5) (2 tests)
▶ 2. Kiểm tra Bộ Quy tắc Validation (validate & parseBatchForm) (14 tests)
▶ 3. Kiểm tra Ngoại lệ calculatePCF với ContractError (1 test)
▶ 4. Kiểm tra PublicSummary, PrivateBatchPayload & Bằng chứng (4 tests)
ℹ tests 21, pass 21, fail 0

=== 2. Running Unit Tests in src/lib/pcf/ ===
ℹ tests 21, pass 21, fail 0

=== 3. Running Unit Tests in src/mocks/ (TideCloak Mock & Leak Prevention) ===
▶ 5. Kiểm tra MockBatchCrypto & 3 Lưu ý Kỹ thuật TideCloak SDK (Mục 22)
  ✔ Mã hóa thành công với TAG_SUPPLIER_INTERNAL mặc định
  ✔ Giải mã thành công khi cung cấp chính xác thẻ TAG_SUPPLIER_INTERNAL
  ✔ Từ chối giải mã (403 ACCESS_DENIED) khi thẻ giải mã không khớp với thẻ mã hóa gốc
▶ 6. Kiểm tra Mock Batch API & Public API Contamination Prevention
  ✔ getPublicBatches không làm lộ supplierId hoặc encryptedInput trong danh sách công khai
  ✔ mockStoredBatches có đầy đủ định dạng hợp lệ của StoredBatch v1
ℹ tests 5, pass 5, fail 0

=== 4. Running TypeScript Typecheck ===
=== All tests and type checks passed successfully! ===
```

---

## 4. Hướng dẫn Tích hợp cho Các Thành viên Khác

1. **Member 1 (Tide/Backend - `feat/tide-backend`)**:
   * Dùng [`src/types.ts`](../src/types.ts) làm hợp đồng API chuẩn cho các endpoints:
     * `POST /api/batches`: nhận `CreateBatchRequest`, lưu `StoredBatch`.
     * `GET /api/batches/public`: trả `ListPublicBatchesResponse` (chỉ gồm `PublicBatch[]`, cấm trả `supplierId` hoặc `encryptedInput`).
     * `GET /api/batches/:id/encrypted`: trả `EncryptedPayload` cho chính chủ, trả 404 cho Supplier khác.
2. **Member 3 (Supplier UI - `feat/supplier-ui`)**:
   * Dùng [`parseBatchForm`](../src/lib/pcf/validate.ts) để validate form.
   * Dùng [`calculatePCF`](../src/lib/pcf/calculate.ts) để tính kết quả trước khi gửi.
   * Chuỗi hóa bằng `JSON.stringify(privatePayload)` trước khi nạp vào TideCloak SDK và gửi payload lên backend.
3. **Member 4 (Buyer UI - `feat/buyer-ui`)**:
   * Import `mockBatchApi` từ [`src/mocks/fixtures.ts`](../src/mocks/fixtures.ts) để render danh sách lô hàng công khai và màn hình chi tiết.
   * Hiển thị rõ nhãn **"Supplier tự khai báo"** (`supplier-reported`), không hiển thị breakdown hay verified badge.

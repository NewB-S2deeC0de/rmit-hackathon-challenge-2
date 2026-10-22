# Data — Sample Inputs & Benchmark Fixtures

> **Phụ trách**: Member 2 — logic/data  
> **Mục tiêu**: Cung cấp toàn bộ bộ dữ liệu mẫu chuẩn (fixtures), mock data cho Buyer UI/Backend, và mock API client phục vụ phát triển song song.

---

## 1. Dữ liệu Lô hàng Mẫu Chuẩn: `DEMO-001`
File: [`demoBatch.ts`](./demoBatch.ts) hoặc [`src/data/demoBatch.ts`](../../src/data/demoBatch.ts)

* **Input**:
  * `batchId`: `"DEMO-001"`
  * `productName`: `"Demo fastener"`
  * `quantity`: $1.000$ sản phẩm
  * `electricityKwh`: $1.200\ \text{kWh}$
  * `materialType`: `"demo-material-A"`
  * `materialKg`: $500\ \text{kg}$
  * `inboundTransportTonKm`: $800\ \text{tấn-km}$
  * `wasteKg`: $20\ \text{kg}$

* **Kết quả tính toán tay chuẩn (Hand-Calculated Benchmark)**:
  * Điện: $1.200 \times 0.5 = 600\ \text{kg CO}_2\text{e}$
  * Vật liệu: $500 \times 2.0 = 1.000\ \text{kg CO}_2\text{e}$
  * Vận tải: $800 \times 0.1 = 80\ \text{kg CO}_2\text{e}$
  * Chất thải: $20 \times 0.5 = 10\ \text{kg CO}_2\text{e}$
  * **Tổng phát thải (`totalKgCO2e`)**: $600 + 1000 + 80 + 10 = \mathbf{1.690\ \text{kg CO}_2\text{e}}$
  * **Phát thải mỗi sản phẩm (`perProductKgCO2e`)**: $\frac{1.690}{1.000} = \mathbf{1.69\ \text{kg CO}_2\text{e/sản phẩm}}$

---

## 2. Mock Data cho Buyer UI & Dashboard
File: [`fixtures.ts`](./fixtures.ts) hoặc [`src/mocks/fixtures.ts`](../../src/mocks/fixtures.ts)

* `mockPublicBatches`: Danh sách 5 lô hàng công bố đa dạng ngành nghề (Fastener, Bracket, Valve, Gear, Sensor) với timestamp giảm dần và kết quả PCF chính xác.
* `mockListPublicBatchesResponse`: Object response chuẩn `{ items: PublicBatch[] }` sẵn sàng cắm vào `GET /api/batches/public`.

---

## 3. Mock Data Lưu trữ Phía Server (Seed Data)
* `mockStoredBatches`: 5 bản ghi `StoredBatch` hoàn chỉnh (gồm `id` UUID, `supplierId`, `createdAt`, `publicSummary`, và `encryptedInput` với bản mã chuỗi TideCloak mô phỏng).
* Dùng làm seed data ban đầu cho `storage/batches.json`.

---

## 4. Mock API Client (`MockBatchApiClient`)
* Class `MockBatchApiClient` cài đặt đầy đủ interface `BatchApi`:
  * `getPublicBatches()`: Trả về danh sách lô hàng công khai sau độ trễ mạng giả lập 100ms.
  * `submitBatch(request)`: Kiểm tra schema, kiểm tra trùng mã lô (ném `409 Conflict`), sinh ID/thời gian.
  * `getEncryptedBatch(id)`: Trả về bản mã hoặc ném `404 Not Found`.
* Giúp Member 3 (Supplier UI) và Member 4 (Buyer UI) chạy thử toàn bộ luồng giao diện mà không cần phụ thuộc backend.

---

## 5. Các Ca Dữ liệu Ngoại lệ Biên (Error Fixtures)
* `invalidBatchZeroQuantity`: `quantity: "0"` $\rightarrow$ Lỗi `OUT_OF_RANGE`.
* `invalidBatchNegativeElectricity`: `electricityKwh: "-500"` $\rightarrow$ Lỗi `OUT_OF_RANGE`.
* `invalidBatchUnsupportedMaterial`: `materialType: "titanium-grade-5"` $\rightarrow$ Lỗi `UNSUPPORTED_VALUE`.
* `invalidBatchMissingRequired`: Bỏ trống các ô bắt buộc $\rightarrow$ Lỗi `REQUIRED`.
* `invalidBatchNonNumeric`: Chữ trong ô số $\rightarrow$ Lỗi `INVALID_NUMBER`.
* `invalidBatchInvalidFormatId`: Mã lô chứa dấu cách / ký tự lạ $\rightarrow$ Lỗi `INVALID_FORMAT`.
* `invalidBatchExceedsLimit`: Số lượng $> 1.000.000.000$ $\rightarrow$ Lỗi `OUT_OF_RANGE`.

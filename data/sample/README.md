# Data — Sample Inputs & Benchmark Fixtures

> **Phụ trách**: Member 2 — logic/data  
> **Mục tiêu**: Cung cấp các bộ dữ liệu mẫu chuẩn (fixtures) phục vụ kiểm thử tính toán tay, demo nhanh bằng nút bấm và các ca thử nghiệm ngoại lệ biên.

---

## 1. Dữ liệu Lô hàng Mẫu Chuẩn: `DEMO-001`
File: [`demoBatch.ts`](./demoBatch.ts)

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

## 2. Bằng chứng Chứng từ Mẫu: `demoEvidence`
* Ghi chú text demo: `"Hóa đơn tiền điện EVN #004921 (1.200 kWh) + Phiếu xuất kho #5512 (500 kg demo-material-A) + Vận đơn Logistics BL-88219 (800 tấn-km)"`.
* Mã hóa E2EE bởi TideCloak SDK, không bao giờ gửi rõ lên backend.

---

## 3. Các Ca Dữ liệu Ngoại lệ Biên (Error Fixtures)
* `invalidBatchZeroQuantity`: `quantity: "0"` $\rightarrow$ Lỗi `OUT_OF_RANGE`.
* `invalidBatchNegativeElectricity`: `electricityKwh: "-500"` $\rightarrow$ Lỗi `OUT_OF_RANGE`.
* `invalidBatchUnsupportedMaterial`: `materialType: "titanium-grade-5"` $\rightarrow$ Lỗi `UNSUPPORTED_VALUE`.
* `invalidBatchMissingRequired`: Bỏ trống các ô bắt buộc $\rightarrow$ Lỗi `REQUIRED`.
* `invalidBatchNonNumeric`: Chữ trong ô số $\rightarrow$ Lỗi `INVALID_NUMBER`.
* `invalidBatchInvalidFormatId`: Mã lô chứa dấu cách / ký tự lạ $\rightarrow$ Lỗi `INVALID_FORMAT`.
* `invalidBatchExceedsLimit`: Số lượng $> 1.000.000.000$ $\rightarrow$ Lỗi `OUT_OF_RANGE`.

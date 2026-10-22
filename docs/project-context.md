# ScopeZero — Đặc tả Hệ thống Tổng thể & Hợp đồng Kỹ thuật

> **Bản hợp nhất**: Toàn bộ bảy thẻ trong tài liệu Hackathon Challenge 2 (PCF + TideCloak), cập nhật ngày 22/10/2026.  
> **Mục tiêu**: Cung cấp tài liệu xuyên suốt để nhóm triển khai, ghép và kiểm tra hệ thống ScopeZero.  
> **Bản sao lưu nguyên trạng trước hợp nhất**: [Google Docs Backup](https://docs.google.com/document/d/1nX5WkbjnZvaQJO3eWEI0rUUbCZb4E9IhCAZCMIRIjmk/edit?usp=drivesdk)  
> **Quy ước trạng thái**:
> - **MVP v1**: Phạm vi triển khai được mô tả trong hợp đồng dữ liệu/API.
> - **Đề xuất cần xác nhận**: Quyết định nền tảng cần cả nhóm thống nhất.
> - **Cần kiểm chứng**: Khả năng SDK hoặc bảo đảm an ninh cần chạy thử thực tế.
> - **Mở rộng**: Tầm nhìn tương lai, không thuộc MVP.

---

## 1. Bài toán và Giá trị Sản phẩm

* **Vấn đề thực tế**: Nhà cung cấp linh kiện (Supplier — doanh nghiệp vừa và nhỏ) muốn chia sẻ dấu chân carbon sản phẩm (PCF) cho bên mua (Buyer — tập đoàn lớn), nhưng lo ngại dữ liệu điện năng, nguyên vật liệu (BOM), sản lượng và logistics làm lộ cơ cấu chi phí hoặc công suất, ảnh hưởng bất lợi đến đàm phán thương mại. Bên mua cần thông tin phát thải để lựa chọn đối tác và báo cáo chuỗi cung ứng.
* **Giải pháp ScopeZero**: Cho phép chia sẻ kết quả phát thải tổng hợp công khai trong khi bảo vệ tuyệt đối hồ sơ nguồn bằng mã hóa đầu cuối (E2EE) và kiểm soát quyền truy cập phi tập trung qua TideCloak.
* **Ranh giới trung thực MVP**:
  * Kết quả hiện tại là **Supplier tự khai báo (`supplier-reported`)**, chưa phải chứng nhận ISO/GHG/PACT độc lập.
  * Giá trị chứng minh được là: **công bố thông tin được chọn lọc (`PublicSummary`)** và **bảo vệ dữ liệu đầu vào bằng cơ chế truy cập thực tế của TideCloak**.
  * PCF của một lô chỉ phục vụ đánh giá linh kiện cụ thể, không đồng nhất với toàn bộ phát thải Scope 3 của doanh nghiệp.

---

## 2. Mức độ Phù hợp với Challenge 2

* **Hoạt động hữu ích**: Supplier chia sẻ kết quả phát thải và duy trì hồ sơ riêng tư phục vụ hợp tác lâu dài.
* **Rào cản niềm tin**: Supplier phải tin rằng người vận hành hệ thống (ScopeZero operator/admin) không thể tự ý đọc lén hoặc tự cấp quyền giải mã hồ sơ kinh doanh cho bên thứ ba.
* **Thao tác bảo vệ trọng tâm**:
  1. Giải mã `PrivateBatchPayload` của lô hàng chỉ dành cho chính chủ sở hữu.
  2. Ngăn chặn một admin TideCloak đơn phương thay đổi chính sách/cấp quyền khi chưa đủ phê duyệt đồng thuận **Quorum Execution Approval (QEA)**.
  3. Phải chứng minh bằng: **truy cập hợp lệ thành công** và **vượt quyền thất bại thực tế (Access Denied / 403 Forbidden)**, không chỉ bằng giao diện hay việc database chứa bản mã.
* **Tuyên bố bảo đảm**: Kiểm chứng khả năng bảo vệ quyền giải mã và thay đổi quyền; không tuyên bố đã loại bỏ mọi quyền đơn phương của dev trên toàn bộ hạ tầng backend/frontend.

---

## 3. Chủ thể, Phạm vi MVP và Phần Mở rộng

### 3.1. Ba Chủ thể Chính
1. **Supplier**: Đơn vị sản xuất, nhập liệu, tính toán PCF tại trình duyệt và mã hóa dữ liệu nhạy cảm.
2. **Buyer / Công chúng**: Bên mua hoặc khách truy cập xem `PublicSummary` công khai không cần đăng nhập.
3. **Nền tảng ScopeZero**:
   - Admin vận hành ứng dụng (App Admin): Vận hành hạ tầng, lưu trữ bản mã.
   - Admin TideCloak / QEA: Quản trị chính sách quyền, tách biệt hoàn toàn khỏi `AppRole`.

### 3.2. Phạm vi MVP v1 vs Mở rộng
* **Trong phạm vi MVP v1**:
  * Một vật liệu minh họa: `demo-material-A`.
  * Bốn nguồn phát thải: Điện (`electricityKwh`), Vật liệu (`materialKg`), Vận tải đầu vào trực tiếp bằng tấn-km (`inboundTransportTonKm`), Chất thải (`wasteKg`).
  * Tính PCF đồng bộ trên trình duyệt Supplier trước khi mã hóa.
  * Bằng chứng dạng văn bản demo (`demo-text`, 1–10.000 ký tự sau trim).
  * Backend lưu `PublicSummary` và `EncryptedPayload`.
  * Supplier xem và giải mã lô của chính mình; Buyer chỉ xem summary.
  * Kiểm chứng cơ chế QEA $\ge 2/3$ admin độc lập.
* **Không thuộc MVP (Hướng Mở rộng)**:
  * Tính toán trên bản mã (FHE/MPC tổng quát), kiểm PKI trên dữ liệu đang mã hóa.
  * Vai trò Reviewer / Kiểm toán viên độc lập; phê duyệt cấp quyền theo từng lần truy cập; thu hồi bản sao đã tải.
  * Upload hóa đơn PDF/ảnh, chữ ký điện tử bảo vệ summary, cập nhật/xóa lô hàng, phân trang danh sách.

---

## 4. Kiến trúc và Luồng Dữ liệu (End-to-End Flow)

```
[Supplier Browser]
  Nhập BatchFormValues
        ↓ parseBatchForm(values) -> validate(candidate)
  BatchInput (chuẩn hóa)
        ↓ calculatePCF(input) [Pure TypeScript]
  PCFResult { totalKgCO2e, perProductKgCO2e, breakdown, factorVersion, calculationVersion }
        ↓ createPublicSummary(input, result) & createPrivateBatchPayload(input, result, evidence)
  PublicSummary + PrivateBatchPayload
        ↓ TideCloak SDK: encryptBatch(privatePayload)
  EncryptedPayload { provider: "tidecloak", formatVersion: 1, serialized }
        ↓ POST /api/batches { schemaVersion: 1, publicSummary, encryptedInput }

[Backend / Storage]
  Xác minh Bearer Token (sub -> supplierId), kiểm tra schema, chống trùng (supplierId, batchId)
  Sinh UUID id và createdAt (ISO 8601 UTC)
  Lưu vào storage/batches.json (StoredBatch)

[Buyer Browser]
  GET /api/batches/public -> ListPublicBatchesResponse (items: PublicBatch[])
  (Buyer chỉ nhận PublicSummary; không có breakdown, supplierId hay encryptedInput; không thể giải mã)
```

---

## 5. Phân công Nhóm & Bản đồ Scaffold Chung (Section 16 & 18)

> **Cấu trúc tham chiếu thống nhất**: Tiếp tục **Next.js + React + TypeScript** để dùng phần Buyer đã viết và khớp thẻ "Chia việc".  
> Sơ đồ `frontend/`, `backend/`, `data/` ở scaffold cũ là phân nhóm trách nhiệm, **không triển khai song song như bộ code thứ hai**.

```text
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout chung
│   │   ├── supplier/          # [Member 3] Giao diện Supplier
│   │   ├── buyer/             # [Member 4] Giao diện Buyer
│   │   └── api/               # [Member 1] Next.js API Routes (POST /api/batches, GET public, v.v.)
│   ├── components/            # UI components (Supplier*, Buyer*)
│   ├── types.ts               # [Single Source of Truth] Khai báo types duy nhất toàn dự án
│   ├── lib/
│   │   ├── pcf/               # [Member 2] Core PCF Engine (calculate, validate, factors, tests)
│   │   ├── tide/              # [Member 1] AuthAdapter & BatchCrypto (TideCloak SDK integration)
│   │   └── api/               # [Member 1] API Client (submitBatch, getPublicBatches)
│   ├── data/
│   │   └── demoBatch.ts       # [Member 2] Fixture chuẩn DEMO-001 và các ca lỗi biên
│   └── mocks/
│       └── fixtures.ts        # Mock fixtures cho UI
│
├── storage/                   # File JSON lưu trữ phía server (storage/batches.json không commit)
├── infra/tidecloak/           # [Member 1] Cấu hình cục bộ TideCloak Docker Compose & QEA 3 admin
├── docs/                      # Tài liệu dự án (project-context.md)
├── scripts/                   # Shared development scripts (test-all.sh, check.sh)
└── demo/                      # [Member 4] Kịch bản demo và bằng chứng kiểm chứng
```

### Bảng phân công trách nhiệm:
| Thành viên | Nhánh chính | Trách nhiệm chính |
|---|---|---|
| **Member 1 — Tide/backend** | `feat/tide-backend` | Scaffold/dependency/lockfile chung, API routes, repository (`storage/batches.json`), `AuthAdapter`, `BatchCrypto`, cấu hình TideCloak/QEA 3 admin. |
| **Member 2 — logic/data** *(Current Agent)* | `feat/pcf-data` | `src/types.ts`, `src/lib/pcf/**` (`calculatePCF`, `validate`, `factors`), `src/data/demoBatch.ts`, bàn giao fixture DEMO-001 (1690 / 1.69), 21 unit tests pass 100%. |
| **Member 3 — Supplier** | `feat/supplier-ui` | Form nhập liệu, điền mẫu, lỗi theo path, công bố dữ liệu rõ ràng, luồng parse → calculate → tạo payload → encrypt → submit; giữ form khi lỗi. |
| **Member 4 — Buyer/demo** | `feat/buyer-ui` | Danh sách/chi tiết `PublicSummary`, tìm kiếm, tải lại, hiển thị "Supplier tự khai báo", kịch bản access-denied; phối hợp chuẩn bị demo ở giai đoạn sau. |

---

## 6. Hợp đồng Kiểu Dữ liệu Duy nhất (`src/types.ts`)

```typescript
export type MaterialType = "demo-material-A";
export type AssuranceLevel = "supplier-reported";
export type AppRole = "supplier" | "buyer";

export interface BatchFormValues {
  batchId: string;
  productName: string;
  quantity: string;
  electricityKwh: string;
  materialType: MaterialType;
  materialKg: string;
  inboundTransportTonKm: string;
  wasteKg: string;
}

export interface BatchInput {
  schemaVersion: 1;
  batchId: string;
  productName: string;
  quantity: number;              // Số nguyên 1 – 1.000.000.000
  electricityKwh: number;        // Hữu hạn 0 – 1.000.000.000
  materialType: MaterialType;    // "demo-material-A"
  materialKg: number;            // Hữu hạn 0 – 1.000.000.000
  inboundTransportTonKm: number; // Hữu hạn 0 – 1.000.000.000 (tấn-km)
  wasteKg: number;               // Hữu hạn 0 – 1.000.000.000
}

export interface PCFResult {
  totalKgCO2e: number;
  perProductKgCO2e: number;
  breakdown: {
    electricityKgCO2e: number;
    materialsKgCO2e: number;
    transportKgCO2e: number;
    wasteKgCO2e: number;
  };
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
}

export interface EvidenceInput {
  kind: "demo-text";
  text: string; // 1–10.000 ký tự sau trim
}

export interface PrivateBatchPayload {
  schemaVersion: 1;
  input: BatchInput;
  result: PCFResult;
  evidence: EvidenceInput | null;
}

export interface PublicSummary {
  batchId: string;
  productName: string;
  totalKgCO2e: number;
  perProductKgCO2e: number;
  factorVersion: "demo-factors-v1";
  calculationVersion: "pcf-v1";
  assuranceLevel: AssuranceLevel; // "supplier-reported"
}

export interface EncryptedPayload {
  provider: "tidecloak";
  formatVersion: 1;
  serialized: string; // Tối đa 200.000 ký tự
}

export interface CreateBatchRequest {
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

export interface StoredBatch {
  id: string;         // UUID do server sinh
  supplierId: string; // Claim "sub" từ token đã xác minh
  createdAt: string;  // ISO 8601 UTC do server tạo
  schemaVersion: 1;
  publicSummary: PublicSummary;
  encryptedInput: EncryptedPayload;
}

export interface PublicBatch {
  id: string;
  createdAt: string;
  publicSummary: PublicSummary;
}

export interface CreateBatchResponse {
  id: string;
  createdAt: string;
}

export interface ListPublicBatchesResponse {
  items: PublicBatch[];
}
```

---

## 7. Quy tắc Xác thực & Hàm Tính toán PCF

### 7.1. Bảng quy tắc xác thực (`src/lib/pcf/validate.ts`)
* `validate(input: unknown)`: Nhận `unknown`, kiểm tra chặt chẽ type runtime, không ép kiểu thô:
  * `batchId`: 1–64 ký tự sau trim, regex `/^[A-Za-z0-9_-]{1,64}$/`.
  * `productName`: 1–120 ký tự sau trim.
  * `quantity`: Số nguyên $1 \le q \le 10^9$.
  * Các trường số: Số thực hữu hạn $0 \le n \le 10^9$.
  * `materialType`: `"demo-material-A"`.
  * `schemaVersion`: Bắt buộc bằng 1.
  * Từ chối chuỗi ở các ô số (việc parse chuỗi chỉ thuộc `parseBatchForm`).
* `parseBatchForm(values: BatchFormValues)`: Trim chuỗi, chuyển đổi số; ô số trống là `REQUIRED`, không tự chuyển thành 0; gọi `validate`.
* `validateEvidence(evidence: unknown)`: Cho phép `null`/`undefined`; nếu có thì `kind: "demo-text"` và `text` 1–10.000 ký tự sau trim.

### 7.2. Logic tính toán (`src/lib/pcf/calculate.ts`)
* Thuần túy (pure), đồng bộ, tất định, không can thiệp làm tròn số học (chỉ làm tròn hiển thị trên UI).
* Khi input không hợp lệ: Ném ra `ContractError` (`status: null`, `code: "VALIDATION_ERROR"`, `fields: FieldError[]`).
* Hệ số minh họa `demo-factors-v1`:
  * Điện lưới: $0.5\ \text{kg CO}_2\text{e/kWh}$
  * Vật liệu `demo-material-A`: $2.0\ \text{kg CO}_2\text{e/kg}$
  * Vận tải đầu vào: $0.1\ \text{kg CO}_2\text{e/tấn}\cdot\text{km}$
  * Xử lý chất thải: $0.5\ \text{kg CO}_2\text{e/kg}$
* Công thức:
  $$\text{totalKgCO2e} = (\text{kwh} \times 0.5) + (\text{matKg} \times 2.0) + (\text{tonKm} \times 0.1) + (\text{wasteKg} \times 0.5)$$
  $$\text{perProductKgCO2e} = \frac{\text{totalKgCO2e}}{\text{quantity}}$$

### 7.3. Benchmark chuẩn `DEMO-001` (`src/data/demoBatch.ts`)
* Input: `quantity = 1000`, `electricityKwh = 1200`, `materialKg = 500`, `inboundTransportTonKm = 800`, `wasteKg = 20`.
* Kết quả phân rã: Điện = 600, Vật liệu = 1000, Vận tải = 80, Chất thải = 10.
* **Tổng phát thải**: $\mathbf{1.690\ \text{kg CO}_2\text{e}}$.
* **Mỗi sản phẩm**: $\mathbf{1,69\ \text{kg CO}_2\text{e/sản phẩm}}$.

---

## 8. API Backend & Mô hình Lỗi

* `POST /api/batches`: Bearer token của Supplier $\rightarrow$ Nhận `CreateBatchRequest` $\rightarrow$ Trùng mã lô trả `409 Conflict`, vượt kích thước trả `413` $\rightarrow$ Trả `201 Created` kèm `{ id, createdAt }`.
* `GET /api/batches/public`: Công khai không cần auth $\rightarrow$ Trả `ListPublicBatchesResponse` (chỉ gồm `PublicBatch[]`, không có `supplierId` hay `encryptedInput`).
* `GET /api/batches/:id/encrypted`: Yêu cầu token chính chủ $\rightarrow$ Nếu không thuộc Supplier hoặc không tồn tại trả `404 Not Found`.
* Lớp lỗi chuẩn: `ContractError` với mã: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`, `ACCESS_DENIED`, `CRYPTO_FAILED`, `NETWORK_ERROR`.

---

## 9. Quorum Execution Approval (QEA) & Bảo đảm An ninh

* **Chính sách**: 3 tài khoản admin TideCloak độc lập; chính sách nhạy cảm yêu cầu ngưỡng đồng thuận $\ge 2/3$.
* **Kiểm chứng thực thi**: Đề xuất cấp quyền giải mã $\rightarrow$ trạng thái `PENDING` $\rightarrow$ thực thi giải mã vẫn bị **từ chối (403)** cho đến khi admin thứ hai phê duyệt.
* **Giới hạn**: QEA bảo vệ chính sách TideCloak; không tự bảo vệ được mã nguồn nếu dev can thiệp vào máy chủ ứng dụng hoặc trình duyệt.

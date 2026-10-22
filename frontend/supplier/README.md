# Frontend — Supplier Module

> **Phụ trách**: Member 3 — Supplier  
> **Mục tiêu**: Xây dựng giao diện cho Nhà cung cấp (Supplier) nhập liệu phát thải, tính toán PCF tại trình duyệt và mã hóa dữ liệu nhạy cảm bằng TideCloak SDK trước khi gửi lên Backend.

---

## 1. Vị trí Triển khai Chính thức (Next.js Proposal)
Theo đề xuất thống nhất tại Mục 5 của `docs/project-context.md`:
* Nếu nhóm chốt Next.js: Mã nguồn giao diện Supplier được đặt tại **`src/app/supplier/**`** và các component phụ trợ tại **`src/components/**`**.
* Không tạo một app React độc lập tại `frontend/supplier/`. Thư mục này chỉ đóng vai trò ghi chú phân công nghiệp vụ cho Member 3.

---

## 2. Trách nhiệm & Phạm vi công việc
* **Form nhập liệu (`BatchFormValues`)**:
  * Các trường: Mã lô (`batchId`), Tên sản phẩm (`productName`), Số lượng (`quantity`), Điện năng (`electricityKwh`), Vật liệu (`materialKg`), Vận tải đầu vào (`inboundTransportTonKm`), Chất thải (`wasteKg`), Bằng chứng mô tả (`evidence`).
  * Nút "Điền dữ liệu mẫu" (sử dụng fixture `demoBatchFormValues` từ `data/sample/demoBatch.ts`).
* **Validation & Tính toán tại client**:
  * Gọi `parseBatchForm(values)` từ `backend/reporting/validate.ts` (hoặc `src/lib/pcf/validate.ts`) để kiểm tra lỗi tức thì theo từng ô nhập (hiển thị lỗi đỏ dưới đúng `path`).
  * Gọi `calculatePCF(batchInput)` từ `backend/reporting/calculate.ts` để tính phát thải ngay trên máy Supplier mà không cần gửi bản rõ lên server.
* **Chỉ rõ ranh giới Minh bạch vs Bảo mật (Clear indication)**:
  * Trực quan hóa phần **Công bố công khai**: `PublicSummary` (`batchId`, `productName`, `totalKgCO2e`, `perProductKgCO2e`, `factorVersion`, nhãn `supplier-reported`).
  * Trực quan hóa phần **Mã hóa bảo vệ (E2EE)**: `PrivateBatchPayload` (`electricityKwh`, `materialKg`, `inboundTransportTonKm`, `wasteKg`, `breakdown`, `evidence`) được niêm phong bởi TideCloak trước khi bấm "Gửi báo cáo".
* **Mã hóa & Gửi lên Backend**:
  * Gọi `tidecloak.encryptBatch(privatePayload)` để nhận `EncryptedPayload`.
  * Gửi `POST /api/batches` với body `{ schemaVersion: 1, publicSummary, encryptedInput }`.
  * Giữ nguyên dữ liệu trên form khi có lỗi để Supplier không phải nhập lại từ đầu.

---

## 3. Các điểm phụ thuộc từ Member 2 (Logic/Data)
* Import types chuẩn duy nhất từ `src/types.ts`.
* Import hàm tính toán: `calculatePCF`, `createPublicSummary`, `createPrivateBatchPayload` từ `backend/reporting/calculate.ts` (hoặc `src/lib/pcf/calculate.ts`).
* Import hàm kiểm tra: `parseBatchForm`, `validateEvidence` từ `backend/reporting/validate.ts`.
* Import dữ liệu mẫu: `demoBatchFormValues`, `demoEvidence` từ `data/sample/demoBatch.ts`.

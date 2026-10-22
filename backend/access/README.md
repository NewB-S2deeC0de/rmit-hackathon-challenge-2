# Backend — Access & Storage Module

> **Phụ trách**: Member 1 — Tide/backend  
> **Mục tiêu**: Xây dựng API tiếp nhận bản mã, tích hợp xác thực và phân quyền TideCloak, lưu trữ tài liệu JSON và đảm bảo không lộ bản rõ trong server/storage/log.

---

## 1. Vị trí Triển khai & Tích hợp vào App (Next.js Proposal)
Theo Mục 5 của `docs/project-context.md`:
* Nếu nhóm chọn Next.js: Thành viên 1 xác định cách nối `backend/access` và `backend/reporting` với app.
  * Các API endpoint được triển khai tại **`src/app/api/**`**:
    - `POST /api/batches` $\rightarrow$ `src/app/api/batches/route.ts`
    - `GET /api/batches/public` $\rightarrow$ `src/app/api/batches/public/route.ts`
    - `GET /api/batches/[id]/encrypted` $\rightarrow$ `src/app/api/batches/[id]/encrypted/route.ts`
  * Module bảo mật & TideCloak adapter đặt tại `src/lib/tide/` hoặc `backend/access/`.

---

## 2. Trách nhiệm & Phạm vi công việc
* **Xác thực & Bảo mật API**:
  * Kiểm tra Bearer token từ TideCloak: trích xuất claim `sub` làm `supplierId`, kiểm tra role `supplier`.
  * Không tin tưởng bất kỳ trường ID người dùng nào truyền từ client JSON.
* **Endpoint API (theo Unified Contract v1)**:
  * `POST /api/batches`:
    - Nhận `CreateBatchRequest` `{ schemaVersion: 1, publicSummary, encryptedInput }`.
    - Kiểm tra giới hạn kích thước request (tối đa 256 KiB), độ dài bản mã `serialized` ($\le 200.000$ ký tự).
    - Kiểm tra trùng lặp `(supplierId, publicSummary.batchId)` $\rightarrow$ trả về `409 Conflict` nếu đã tồn tại.
    - Sinh UUID `id` và thời gian chuẩn UTC `createdAt` (ISO 8601).
    - Lưu vào `storage/batches.json` dưới dạng `StoredBatch`.
    - Trả về `201 Created` kèm `{ id, createdAt }`.
  * `GET /api/batches/public`:
    - Công khai không cần auth.
    - Trả về danh sách `items: PublicBatch[]` (chỉ gồm `id`, `createdAt`, `publicSummary`), sắp xếp theo thời gian mới nhất.
    - Tuyệt đối không trả `encryptedInput`, `supplierId` hay `breakdown`.
  * `GET /api/batches/:id/encrypted`:
    - Yêu cầu token của Supplier là chính chủ nhân của lô hàng đó.
    - Nếu lô hàng thuộc Supplier khác hoặc không tồn tại: trả về `404 Not Found` (để tránh rò rỉ sự tồn tại của lô hàng).
* **Quản lý Lưu trữ (Storage)**:
  * Lưu trữ file `storage/batches.json`.
  * Đảm bảo ghi an toàn (atomic write qua file tạm) để tránh race condition khi có nhiều request đồng thời.

---

## 3. Các điểm phụ thuộc từ Member 2 (Logic/Data)
* Import types từ `src/types.ts` (`CreateBatchRequest`, `CreateBatchResponse`, `ListPublicBatchesResponse`, `PublicBatch`, `StoredBatch`, `EncryptedPayload`, `ApiError`, `ContractError`).

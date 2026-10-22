# Frontend — Buyer & Public Module

> **Phụ trách**: Member 4 — Buyer/demo  
> **Mục tiêu**: Xây dựng màn hình tra cứu phát thải cho Người mua (Buyer) hoặc công chúng, bảo đảm Buyer chỉ thấy thông tin tóm tắt và bị từ chối giải mã dữ liệu nhạy cảm.

---

## 1. Trách nhiệm & Phạm vi công việc
* **Bảng báo cáo phát thải cho Buyer**:
  * Đọc dữ liệu từ `GET /api/batches/public` (`ListPublicBatchesResponse`).
  * Hiển thị bảng danh sách các lô hàng: `batchId`, `productName`, `totalKgCO2e`, `perProductKgCO2e`, `factorVersion`, thời gian công bố.
  * Hiển thị rõ nhãn nguồn gốc: **"Supplier tự khai báo" (`supplier-reported`)**. Tuyệt đối không hiển thị "Verified" hay "Audited".
  * Không hiển thị (và không có dữ liệu về) `breakdown`, `materialKg`, `electricityKwh`, hay danh tính `supplierId`.
* **Kịch bản chứng minh từ chối truy cập (Access Denied Demo)**:
  * Nút "Xem chi tiết bí mật kinh doanh" hoặc "Thử giải mã bằng chứng":
    - Khi Buyer bấm vào, hệ thống thực hiện truy vấn giải mã qua TideCloak SDK $\rightarrow$ TideCloak từ chối cấp khóa giải mã.
    - Hiển thị thông báo trực quan: `Quyền truy cập bị từ chối (403 Forbidden / Access Denied). Dữ liệu này chỉ thuộc về Supplier và Hội đồng QEA.`
* **Kịch bản so sánh đối chiếu**:
  * Cho phép Buyer chọn lô hàng để đối chiếu mức phát thải chuẩn (so sánh mức $1,69\ \text{kg CO}_2\text{e/sp}$ với tiêu chuẩn ngành).

---

## 2. Các điểm phụ thuộc từ Member 2 (Logic/Data)
* Import types từ `src/types.ts` hoặc `backend/reporting/types.ts` (`PublicSummary`, `PublicBatch`, `ListPublicBatchesResponse`).
* Import hàm định dạng: `formatPCFForDisplay` từ `backend/reporting/calculate.ts`.
* Sử dụng dữ liệu đối chiếu từ `data/sample/demoBatch.ts` (`handCalculatedBenchmark`).

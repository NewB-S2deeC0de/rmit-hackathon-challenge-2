# Frontend — Overview & Placement Map

> **Mục tiêu**: Thư mục chứa tài liệu định hướng và vị trí đặt giao diện người dùng cho Hackathon Challenge 2.

---

## 1. Cấu trúc thư mục định hướng (Placement Reference)
* [`supplier/`](./supplier/): [Member 3] Luồng nhập liệu, tính toán PCF tại trình duyệt và niêm phong E2EE trước khi gửi lên backend.
* [`buyer/`](./buyer/): [Member 4] Màn hình tra cứu PublicSummary cho Buyer/Công chúng, kịch bản từ chối truy cập và trình diễn Quorum Execution Approval (QEA).

---

## 2. Đề xuất Kiến trúc Next.js Thống nhất (Theo Mục 5 docs/project-context.md)
* **Đề xuất của nhóm**: Tiếp tục sử dụng **Next.js + React + TypeScript** để tận dụng code Buyer đã viết và khớp với thẻ "Chia việc".
* **Vị trí code chính thức nếu chọn Next.js**:
  * Giao diện Supplier: `src/app/supplier/**`
  * Giao diện Buyer: `src/app/buyer/**`
  * Thành phần dùng chung: `src/components/**`
  * Kiểu dữ liệu dùng chung: `src/types.ts`
* **Lưu ý**: Tuyệt đối **không tạo thêm một frontend React độc lập tại `frontend/**`** để tránh phân mảnh dependencies. Cả nhóm cần xác nhận trước khi Thành viên 1 cài đặt runtime chung.

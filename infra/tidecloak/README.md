# Infra — TideCloak & QEA Configuration

> **Phụ trách**: Member 1 — Tide/backend  
> **Mục tiêu**: Cung cấp môi trường cục bộ TideCloak (Docker Compose), cấu hình realm, clients, roles, chính sách Quorum Execution Approval (QEA) 3 admin và tuân thủ 3 lưu ý kỹ thuật (Mục 22).

---

## 1. Trách nhiệm & Phạm vi cấu hình
* **Cấu hình TideCloak Instance**:
  * Chạy cục bộ bằng Docker / Docker Compose.
  * Thiết lập realm và client ID cho ứng dụng ScopeZero.
  * Phân tách hai AppRole ứng dụng: `supplier` và `buyer`.
* **Cấu hình Quorum Execution Approval (QEA) 3 Admin**:
  * Khởi tạo **3 tài khoản quản trị TideCloak độc lập** (ví dụ: `admin1@company.com`, `admin2@company.com`, `admin3@company.com`).
  * Thiết lập chính sách bảo vệ nhạy cảm (Protected Policies) yêu cầu **ngưỡng đồng thuận 2/3 (Threshold = 2)**.
  * Bất kỳ yêu cầu thay đổi quyền hạn (như cấp quyền giải mã bản mã của Supplier hoặc hạ ngưỡng duyệt) đều phải:
    1. Trạng thái ban đầu: `PENDING` (chưa có hiệu lực thực tế).
    2. Cần thêm 1 phiếu phê duyệt từ admin thứ hai để chuyển thành `APPROVED`.
* **Kiểm chứng hiệu lực thực thi (Enforcement Testing)**:
  * Kiểm thử kịch bản: Khi chỉ có 1 admin bấm thay đổi quyền, thử dùng token giải mã ngay lập tức $\rightarrow$ Hệ thống TideCloak vẫn phải từ chối giải mã (chứng minh quyền không có hiệu lực khi chưa đủ Quorum).
  * Chỉ khi admin thứ 2 phê duyệt thành công thì lệnh giải mã mới hoạt động.

---

## 2. Ba Lưu ý Kỹ thuật Cốt lõi của TideCloak SDK (Mục 22 Đặc tả ScopeZero)

1. **Dữ liệu đầu vào của hàm mã hóa**:
   * SDK của Tide yêu cầu dữ liệu đưa vào hàm mã hóa phải là dạng `string` hoặc `Uint8Array` (tuyệt đối không truyền trực tiếp JavaScript Object `{}`).
   * **Cách xử lý**: Luôn luôn chạy `JSON.stringify(privateBatchPayload)` trước khi gọi lệnh mã hóa.
2. **Khớp chính xác tên thẻ (Tags)**:
   * TideCloak yêu cầu thẻ dùng để giải mã phải trùng khớp từng ký tự với thẻ đã dùng khi mã hóa.
   * Giữ nguyên quy ước hằng số (constants) tại [`src/types.ts`](../../src/types.ts):
     * `TAG_SUPPLIER_INTERNAL = "_tide_supplier_internal"`
     * `TAG_SCOPE3_VERIFIED = "_tide_scope3_verified"`
3. **Cấu hình Client trong TideCloak Console**:
   * Client ID: `scopezero-web` (hoặc cấu hình tương đương).
   * Capability config: Bật chế độ **Standard Flow**.
   * Valid Redirect URIs: `http://localhost:5173/*`, `http://localhost:3000/*`.
   * Tải file cấu hình `tidecloak.json` đặt vào thư mục gốc của dự án frontend (xem file mẫu [`tidecloak.example.json`](./tidecloak.example.json)).

---

## 3. Ghi chú Bảo mật (Security & Git Policy)
* Không lưu private keys, master admin passwords thật hoặc secrets nhạy cảm vào Git.
* Dùng `.env.example` và docker-compose mẫu để các thành viên khác có thể kéo về chạy cục bộ nhanh chóng.

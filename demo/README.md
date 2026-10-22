# Demo — Run-Through & Observable Evidence

> **Phụ trách**: Member 4 — Buyer/demo  
> **Mục tiêu**: Chuẩn bị kịch bản demo chạy mượt mà trong 2-3 phút, trình diễn đầy đủ các tính năng then chốt và các bằng chứng quan sát được (observable evidence) để gây ấn tượng với Ban giám khảo Hackathon.

---

## 1. Kịch bản Demo 7 Bước (2-3 Phút)

| Bước | Diễn viên | Thao tác trên màn hình | Bằng chứng quan sát được (Observable Evidence) |
|:---:|---|---|---|
| **1** | Supplier | Đăng nhập tài khoản Supplier $\rightarrow$ Bấm nút "Điền dữ liệu mẫu". | Form hiển thị lô `DEMO-001`, sản phẩm "Demo fastener", 1000 sp, 1200 kWh điện, 500 kg vật liệu demo-A, 800 tấn-km vận tải, 20 kg chất thải. |
| **2** | Supplier | Xem tính toán trực tiếp tại trình duyệt. | Hiển thị tức thì: Tổng $1.690\ \text{kg CO}_2\text{e}$ và $1,69\ \text{kg CO}_2\text{e/sp}$ (khớp 100% phép tính tay). |
| **3** | Supplier | Bấm "Gửi báo cáo & Niêm phong E2EE". | UI hiển thị rõ 2 phần: `PublicSummary` sẵn sàng công bố, còn dữ liệu định mức BOM & chứng từ được đóng gói thành bản mã chuỗi qua TideCloak SDK. |
| **4** | Buyer | Mở tab ẩn danh (không cần đăng nhập) vào trang Buyer. | Bảng công bố hiển thị lô `DEMO-001` với $1,69\ \text{kg CO}_2\text{e/sp}$, nhãn **"Supplier tự khai báo"**. Hoàn toàn không có breakdown hay số liệu nguyên liệu. |
| **5** | Buyer | Bấm "Thử xem chi tiết định mức BOM & hóa đơn". | Thông báo lỗi đỏ: **403 Forbidden / Access Denied** từ TideCloak. Buyer không có quyền giải mã. |
| **6** | Admin 1 | Vào TideCloak Admin Console, đơn phương tạo policy cấp quyền giải mã cho Buyer. | Policy hiển thị trạng thái `PENDING (Waiting for Quorum)`. Buyer vẫn tiếp tục bị từ chối truy cập (chứng minh một admin đơn lẻ không thể lộng quyền). |
| **7** | Admin 2 | Đăng nhập tài khoản Admin 2, duyệt yêu cầu QEA. | Trạng thái chuyển sang `APPROVED`. Khi đó quyền mới chính thức có hiệu lực theo đúng cơ chế Quorum. |

---

## 2. Bằng chứng Kỹ thuật Cần Quay Video
1. Network Tab trên trình duyệt Supplier: Request `POST /api/batches` chỉ gửi `publicSummary` và bản mã `encryptedInput.serialized`.
2. Storage File `storage/batches.json`: Xác nhận trong file lưu trữ không có bất kỳ chuỗi văn bản rõ nào của hóa đơn hay khối lượng vật liệu.
3. Node.js Unit Tests: Chạy `npm test` chứng minh 21/21 tests pass, độ chính xác toán học 100%.

# ScopeZero

## Project overview

ScopeZero giúp nhà cung cấp chia sẻ dấu chân carbon sản phẩm (PCF) cho bên mua, hạn chế tiết lộ dữ liệu vận hành.

### 1. Vision & originality

Đề xuất chia sẻ kết quả thay vì hồ sơ nguồn: tính PCF tại trình duyệt, tách báo cáo công khai khỏi dữ liệu riêng được mã hóa.

### 2. Trust constraint insight

Bên mua cần số liệu Scope 3, nhưng nhà cung cấp sợ lộ điện năng, nguyên liệu và công suất. Phân quyền giúp chia sẻ kết quả mà không trao quyền đọc hồ sơ nguồn. Tổng và suất phát thải vẫn có thể suy ra sản lượng.

### 3. Value & impact

Nhà cung cấp giảm tiết lộ bí mật kinh doanh; bên mua có số liệu tham khảo. Lô DEMO-001 công bố 1.690 kg CO₂e, tương ứng 1,69 kg/sản phẩm. Nhãn `supplier-reported` thể hiện chưa kiểm toán.

### 4. Why TideCloak matters

TideCloak là hướng tích hợp xác thực, kiểm soát giải mã và phê duyệt chính sách theo ngưỡng 2/3 quản trị viên. Luồng hiện tại dùng phiên demo và AES-GCM với khóa công khai trong mã nguồn; chưa chứng minh bảo vệ trước quản trị viên. Cấp phép Tide còn vướng lỗi upstream.

### 5. Prototype & storytelling

Supplier A nhập mẫu, tính PCF, mã hóa rồi nộp backend. Buyer đọc báo cáo đã lưu. API từ chối Buyer đọc bản mã (`403`), Supplier khác (`404`); chính chủ được tải và giải mã. Bản mẫu chưa xác minh tính đúng đắn của dữ liệu nguồn.

### 6. Video demo & presentation script

- **Video demo 2 phút:** [demo.mp4](demo.mp4)
- **Kịch bản thuyết trình chi tiết & Hỏi đáp phản biện:** [docs/DEMO_SCRIPT_2_MINUTES.md](docs/DEMO_SCRIPT_2_MINUTES.md)

## Setup

Chạy `npm ci`, `npm run setup:demo`, `npm run dev`; mở http://localhost:3000/auth, chọn tài khoản mẫu. Xem [INSTALL.md](INSTALL.md) để cài đặt, kiểm thử và biết giới hạn demo.

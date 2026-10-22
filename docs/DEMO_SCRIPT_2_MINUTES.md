# Kịch Bản Demo 2 Phút: Chuỗi Liên Kết Supplier - Buyer & Bảo Mật Dữ Liệu Phát Thải ScopeZero

> **Thời lượng:** Đúng 2 phút (120 giây)  
> **Mục tiêu:** Thể hiện trọn vẹn luồng dữ liệu liên kết từ Nhà cung cấp (Supplier) đến Bên mua (Buyer), đồng thời chứng minh 4 cơ chế bảo mật cốt lõi: **E2EE Client-side**, **Multi-tenant Isolation**, **Zero Private Leakage**, và **QEA Multi-Admin Quorum Consensus**.

---

## 1. Chuẩn Bị & Các Tài Khoản Mock (1-Click Demo)

Hệ thống đã tích hợp sẵn thanh **"Trợ lý Demo 2 Phút" (Demo Assistant)** ở cạnh trên của giao diện và Cổng xác thực `/auth`. Người thuyết trình chỉ cần bấm trực tiếp vào từng bước để tự động chuyển tài khoản và giao diện:

| Tài khoản Mock | Đại diện | Vai trò trong Demo |
| :--- | :--- | :--- |
| **Supplier A** (`supplier@companya.vn`) | Công ty Cơ khí A | Chủ sở hữu lô hàng `DEMO-001`, tính PCF tại client, mã hóa E2EE và sở hữu khóa giải mã. |
| **Supplier B** (`supplier2@companyb.vn`) | Công ty Điện tử B | Nhà cung cấp độc lập khác (Tenant thứ 2) — Dùng để kiểm chứng cô lập: Không thể giải mã dữ liệu của Supplier A. |
| **Buyer** (`procurement@corpb.vn`) | Tập đoàn Mua Hàng B | Bên mua hàng — Đọc báo cáo phát thải công bố để làm Scope 3, bị chặn 100% khi cố truy cập dữ liệu vận hành nhạy cảm. |
| **Admin QEA** (`audit@qea.network`) | Hội đồng Bảo mật QEA | Quản trị viên TideCloak QEA — Minh họa cơ chế đồng thuận 2/3 admin ngăn chặn độc quyền giải mã. |

---

## 2. Kịch Bản Chi Tiết Từng Giây (0:00 – 2:00)

```
 [0:00 - 0:30]               [0:30 - 1:00]               [1:00 - 1:30]               [1:30 - 2:00]
 Supplier Khai báo           Giải mã Owner &             Buyer nhận Scope 3 &        Kiến trúc Quản trị
 PCF & Niêm phong E2EE       Cô lập Multi-tenant         Zero Private Leakage        TideCloak QEA (2/3)
       │                           │                           │                           │
       ▼                           ▼                           ▼                           ▼
 Client-side Calc (1,690)    Supplier A giải mã OK       Thấy 1,690 kg CO₂e          Ngay cả Admin cũng
 E2EE _tide_supplier_...     Supplier B bị chặn 403      Test API Private -> 403     không có Master Key
```

---

### Giai đoạn 1 (0:00 – 0:30): Nhà cung cấp tính PCF & Niêm phong E2EE

* **Bối cảnh:** Bắt đầu tại trang chủ hoặc Cổng Supplier (`/supplier`).
* **Thao tác trên màn hình:**
  1. Nếu chưa đăng nhập, màn hình hiển thị **Auth Gate** yêu cầu xác thực.
  2. Bấm nút: **`Mẫu DEMO-001`** trên thanh Trợ lý Demo (hoặc trên form) -> Hệ thống tự động điền bộ số liệu sản xuất thực tế:
     * Điện năng: `1,200 kWh` (Hệ số lưới: `0.72`)
     * Thép chế tạo: `500 kg` (Hệ số: `1.5`)
     * Vận tải đầu vào: `300 tấn.km` (Hệ số: `0.24`)
     * Rác thải xưởng: `20 kg` (Hệ số: `0.2`)
  3. Bấm **`Kiểm tra & Tính phát thải`** -> Engine PCF v1 tại trình duyệt cho ra kết quả tức thì:
     * **Tổng phát thải:** `1,690.00 kg CO₂e`
     * **Suất phát thải:** `1.69 kg CO₂e / sản phẩm`
  4. Bấm **`Niêm phong E2EE & Nộp hồ sơ`** -> Modal hiển thị luồng TideCloak SDK:
     * Tách bạch rõ: **Public Summary** (Mã lô, tên SP, tổng phát thải) vs **Private Payload** (Điện, thép, hóa đơn).
     * Mã hóa E2EE bằng thẻ `_tide_supplier_internal`.

* **Lời thoại thuyết trình (30 giây):**
  > *"Kính thưa Ban giám khảo, rào cản lớn nhất của phát thải Scope 3 là các nhà cung cấp từ chối chia sẻ vì sợ lộ công suất và hóa đơn mật. Với ScopeZero, Supplier A đăng nhập và nhập số liệu sản xuất. Toàn bộ phép tính PCF được thực thi 100% tại máy khách của Supplier theo chuẩn ISO 14067, tính ra chính xác 1,690 kg CO₂e. Ngay trước khi truyền đi, TideCloak SDK tiến hành niêm phong mã hóa đầu cuối E2EE toàn bộ số điện, nguyên liệu và hóa đơn. Máy chủ ScopeZero hoàn toàn không thể đọc trộm được dữ liệu này."*

---

### Giai đoạn 2 (0:30 – 1:00): Kiểm chứng Giải mã Owner & Thử nghiệm Cô lập Tenant

* **Bối cảnh:** Tab 3 "Lô đã nộp & Giải mã" trên Cổng Supplier.
* **Thao tác trên màn hình:**
  1. Tại lô `DEMO-001`, bấm nút **`Giải mã dữ liệu`** -> Nhập khóa của Supplier A:
     * Dữ liệu giải mã bung ra đầy đủ: Điện `1,200 kWh`, Thép `500 kg`, Bằng chứng hóa đơn.
  2. Trên thanh Trợ lý Demo, bấm **`Thử đổi sang Supplier B (Test cô lập)`**:
     * Tài khoản chuyển sang Supplier B (Công ty Điện tử B).
     * Khi Supplier B cố gắng thực hiện giải mã lô hàng của Supplier A -> Hệ thống hiển thị cảnh báo từ chối: **`403 ACCESS_DENIED`**.

* **Lời thoại thuyết trình (30 giây):**
  > *"Để chứng minh quyền kiểm soát dữ liệu: Chỉ duy nhất Supplier A sở hữu khóa nội bộ mới giải mã được chi tiết lô hàng của mình. Bây giờ, chúng tôi thử nghiệm tình huống một Supplier đối thủ trong cùng chuỗi cung ứng là Công ty B cố tình can thiệp. Nhờ cơ chế cô lập Multi-tenant của TideCloak, yêu cầu lập tức bị chặn với mã 403 Forbidden. Dữ liệu của doanh nghiệp nào chỉ doanh nghiệp đó có quyền truy xuất."*

---

### Giai đoạn 3 (1:00 – 1:30): Bên mua (Buyer) & Cơ chế Zero Private Leakage

* **Bối cảnh:** Chuyển sang Cổng Bên mua (`/buyer`).
* **Thao tác trên màn hình:**
  1. Trên thanh Trợ lý Demo, bấm nút: **`Đăng nhập Buyer & Mở Cổng`**.
  2. Giao diện Bên mua hiển thị danh sách báo cáo phát thải công bố:
     * Xuất hiện ngay lô `DEMO-001`: Tổng phát thải `1,690 kg CO₂e`, Suất `1.69 kg CO₂e/sp`, Nhãn minh bạch: `Supplier tự khai báo`.
  3. Bấm vào lô `DEMO-001` để mở bảng chi tiết bên phải:
     * Cột "Không được cung cấp": Nêu rõ điện năng, nguyên liệu, hóa đơn bị ẩn hoàn toàn.
  4. Bấm nút tương tác: **`Kiểm tra bảo mật (Test Zero-Leakage)`** (hoặc gọi API `/api/batches/[id]/encrypted`):
     * Màn hình trả về phản hồi: **`HTTP 403 ACCESS_DENIED — Bên mua không có quyền giải mã dữ liệu nguồn`**.

* **Lời thoại thuyết trình (30 giây):**
  > *"Về phía Bên mua hàng (Buyer), Tập đoàn B cần chỉ số phát thải để hoàn thiện báo cáo Scope 3 và kiểm kê ESG. Khi đăng nhập vào Buyer Workspace, Bên mua lập tức nhận được con số phát thải 1,690 kg CO₂e cùng mã định danh lô hàng. Tuy nhiên, nguyên lý Zero Private Leakage bảo đảm Bên mua không thể nhìn thấy bất kỳ số điện hay nguyên liệu gốc nào. Khi chúng tôi cố tình gọi trực tiếp vào API lưu trữ ciphertext, hệ thống lập tức từ chối với HTTP 403. Bí mật kinh doanh của Supplier được bảo vệ tuyệt đối."*

---

### Giai đoạn 4 (1:30 – 2:00): Kiến trúc Quản trị QEA Multi-Admin Quorum Consensus

* **Bối cảnh:** Cổng xác thực `/auth` hoặc sơ đồ kiến trúc bảo mật trên Trang chủ.
* **Thao tác trên màn hình:**
  1. Bấm bước 4 trên Trợ lý Demo: **`4. Quản trị QEA (2/3)`**.
  2. Mở trạng thái quản trị:
     * Thể hiện mô hình 3 Quản trị viên độc lập (`Admin A`, `Admin B`, `Admin C`).
     * Cơ chế Threshold Consensus: Ngưỡng tối thiểu `2/3`.
     * Nếu 1 Admin tự ý thay đổi quyền hoặc yêu cầu cấp phát khóa -> Trạng thái rơi vào `Pending` (Chờ duyệt), không thể có hiệu lực nếu thiếu chữ ký thứ 2.

* **Lời thoại thuyết trình (30 giây):**
  > *"Điểm đột phá cuối cùng của ScopeZero nằm ở kiến trúc TideCloak QEA (Quorum Encryption Architecture). Khác với các hệ thống truyền thống nơi SysAdmin có thể xem trộm toàn bộ database, tại ScopeZero, ngay cả Quản trị viên hệ thống cũng KHÔNG sở hữu Master Key để giải mã dữ liệu của Supplier. Mọi thay đổi chính sách bảo vệ đều bắt buộc phải có sự phê duyệt đồng thuận của ít nhất 2 trong 3 Admin độc lập. ScopeZero giải quyết triệt để bài toán niềm tin giữa Supplier và Buyer trong kỷ nguyên ESG."*

---

## 3. Bảng Hỏi & Đáp Phản Biện Giám Khảo (Judge Q&A Cheat Sheet)

### Câu 1: Cơ sở dữ liệu ScopeZero lưu trữ những gì? Backend có thấy được số liệu thô không?
* **Trả lời:** Cơ sở dữ liệu ScopeZero chỉ lưu trữ 2 thực thể:
  1. `publicSummary`: Mã lô, tên sản phẩm, tổng phát thải (1,690 kg CO₂e), phiên bản hệ số.
  2. `encryptedInput`: Chuỗi ciphertext được mã hóa đầu cuối từ máy khách với thẻ `_tide_supplier_internal`.
  * **Backend hoàn toàn KHÔNG CÓ plaintext** của điện năng tiêu thụ, khối lượng nguyên liệu hay nội dung hóa đơn.

### Câu 2: Sự khác biệt giữa TideCloak E2EE và việc mã hóa thông thường bằng AES / TLS là gì?
* **Trả lời:** 
  * TLS chỉ bảo vệ dữ liệu trên đường truyền (data in transit). Khi đến máy chủ, dữ liệu bị giải mã trong RAM của backend.
  * AES thông thường phụ thuộc vào việc ai giữ khóa bí mật (nếu server giữ khóa, admin hoặc hacker chiếm quyền server sẽ giải mã được).
  * **TideCloak E2EE & QEA:** Khóa giải mã được phân tán theo ngưỡng (Threshold Secret Sharing). Không bên đơn lẻ nào (kể cả nhà cung cấp dịch vụ máy chủ ScopeZero) có thể tự ý lấy lại khóa để giải mã.

### Câu 3: Nếu Buyer không thấy được hóa đơn gốc, làm sao Buyer tin được số phát thải 1,690 kg CO₂e là chính xác?
* **Trả lời:**
  * Trong v1 MVP, hệ thống gán nhãn minh bạch pháp lý rõ ràng: `supplier-reported` (Supplier tự khai báo và chịu trách nhiệm pháp lý).
  * Bằng chứng hóa đơn gốc đã được băm (hash) và niêm phong trong ciphertext E2EE. Khi cơ quan kiểm toán độc lập (Third-party Auditor) vào cuộc, Supplier có thể mở quyền giải mã có kiểm soát cho Kiểm toán viên kiểm chứng mà không cần công khai đại trà cho Bên mua hay đối thủ.

### Câu 4: Phép tính PCF v1 tuân theo tiêu chuẩn nào?
* **Trả lời:** Phép tính tuân thủ tiêu chuẩn **ISO 14067** (Dấu chân carbon của sản phẩm), phương pháp Cradle-to-Gate (từ khai thác nguyên liệu đến cổng nhà máy), bao gồm 4 hợp phần phát thải: Điện năng Scope 2, Vật liệu Scope 3.1, Vận tải đầu vào Scope 3.4, và Xử lý phế thải sản xuất Scope 3.5. Kết quả hoàn toàn tất định (deterministic) qua mọi lần chạy thử.

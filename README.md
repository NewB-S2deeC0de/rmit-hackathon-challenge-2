# ScopeZero

> **Hệ thống chia sẻ phát thải Scope 3 & Bảo vệ bí mật kinh doanh bằng TideCloak E2EE**

https://github.com/NewB-S2deeC0de/rmit-hackathon-challenge-2/raw/main/demo.mp4

<div align="center">
  <video src="https://github.com/NewB-S2deeC0de/rmit-hackathon-challenge-2/raw/main/demo.mp4" controls="controls" width="100%" style="max-height: 480px; border-radius: 8px;">
    Trình duyệt không hỗ trợ xem video trực tiếp. <a href="demo.mp4">Nhấp vào đây để xem / tải video demo.mp4</a>
  </video>
</div>

* 🎬 **Video demo 2 phút:** [demo.mp4](demo.mp4)
* 📋 **Kịch bản thuyết trình chi tiết & Hỏi đáp phản biện:** [docs/DEMO_SCRIPT_2_MINUTES.md](docs/DEMO_SCRIPT_2_MINUTES.md)

---

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

## Sản phẩm ScopeZero

### Bài toán sản phẩm giải quyết

Trong chuỗi cung ứng, bên mua cần thông tin dấu chân carbon sản phẩm (Product Carbon Footprint — PCF) để đánh giá đối tác và bổ sung dữ liệu cho báo cáo phát thải Scope 3. Tuy nhiên, hồ sơ dùng để tính PCF có thể tiết lộ lượng điện tiêu thụ, nguyên vật liệu, sản lượng và hoạt động vận tải của nhà cung cấp. Những dữ liệu này liên quan trực tiếp đến chi phí, công suất và lợi thế đàm phán.

ScopeZero hướng đến việc chia sẻ kết quả phát thải có chọn lọc: nhà cung cấp công bố bản tóm tắt PCF, đồng thời giữ hồ sơ đầu vào trong một phần dữ liệu riêng được mã hóa. Một báo cáo PCF theo lô là dữ liệu tham khảo cho linh kiện hoặc sản phẩm cụ thể, không đại diện cho toàn bộ phát thải Scope 3 của bên mua.

### Ai sử dụng ScopeZero?

| Đối tượng | Nhu cầu | Trải nghiệm trong MVP |
| --- | --- | --- |
| **Nhà cung cấp (Supplier)** | Chia sẻ PCF nhưng hạn chế tiết lộ hồ sơ vận hành | Nhập dữ liệu lô hàng, tính PCF, xem trước thông tin công bố, gửi báo cáo và mở lại dữ liệu riêng của mình. |
| **Bên mua (Buyer) / công chúng** | Tham khảo thông tin phát thải của sản phẩm | Xem và tìm kiếm các bản tóm tắt công khai mà không cần đăng nhập; không được cấp quyền đọc hồ sơ riêng. |
| **Đơn vị vận hành** | Duy trì dịch vụ và lưu trữ báo cáo | Vận hành ứng dụng, lưu bản tóm tắt và bản mã; quyền vận hành không đồng nghĩa với quyền giải mã trong thiết kế mục tiêu. |

### Hành trình sử dụng

1. **Khai báo lô hàng:** Supplier nhập mã lô, tên sản phẩm, số lượng, điện năng, khối lượng vật liệu, vận tải đầu vào theo tấn-km và chất thải. MVP hỗ trợ một vật liệu minh họa và bằng chứng dạng văn bản.
2. **Tính PCF tại trình duyệt:** Ứng dụng tính tổng phát thải, phát thải trên mỗi sản phẩm và phần đóng góp của bốn nguồn: điện, vật liệu, vận tải, chất thải.
3. **Xem trước thông tin chia sẻ:** Supplier kiểm tra bản tóm tắt trước khi gửi. Công bố đồng thời tổng phát thải và phát thải trên mỗi sản phẩm có thể làm lộ sản lượng qua phép chia hai giá trị này.
4. **Mã hóa và lưu báo cáo:** Dữ liệu đầu vào, kết quả chi tiết và bằng chứng được đóng gói thành hồ sơ riêng, mã hóa tại trình duyệt trước khi gửi lên backend cùng bản tóm tắt công khai.
5. **Tra cứu và truy cập theo quyền:** Buyer xem bản tóm tắt đã lưu; Supplier sở hữu lô có thể tải bản mã và giải mã qua luồng demo hiện tại.

### Thông tin nào được chia sẻ?

| Bản tóm tắt công khai (`PublicSummary`) | Hồ sơ riêng (`PrivateBatchPayload`) |
| --- | --- |
| Mã lô và tên sản phẩm | Toàn bộ dữ liệu đầu vào, gồm sản lượng và các chỉ số vận hành |
| Tổng phát thải và phát thải trên mỗi sản phẩm | Kết quả chi tiết theo từng nguồn phát thải |
| Phiên bản hệ số và phương pháp tính | Bằng chứng văn bản do Supplier cung cấp, nếu có |
| Nhãn `supplier-reported` | Được mã hóa trước khi gửi; API giới hạn việc tải bản mã cho chính chủ |

API công khai trả thêm mã bản ghi và thời điểm tạo để tra cứu, không trả hồ sơ riêng hay bản mã. Việc tách dữ liệu giúp hạn chế tiết lộ trực tiếp, nhưng không loại bỏ khả năng suy luận từ các chỉ số đã công bố.

### Ví dụ minh họa: lô DEMO-001

Với 1.000 sản phẩm, dữ liệu mẫu gồm 1.200 kWh điện, 500 kg vật liệu, 800 tấn-km vận tải đầu vào và 20 kg chất thải. Áp dụng bộ hệ số minh họa `demo-factors-v1`:

| Nguồn phát thải | Kết quả (kg CO₂e) |
| --- | ---: |
| Điện | 600 |
| Vật liệu | 1.000 |
| Vận tải | 80 |
| Chất thải | 10 |
| **Tổng cộng** | **1.690** |

Bản tóm tắt công bố **1.690 kg CO₂e cho cả lô**, tương đương **1,69 kg CO₂e/sản phẩm**. Đây là kết quả tính từ dữ liệu tự khai và hệ số demo, chưa được kiểm toán hay chứng nhận độc lập.

### Giá trị và giới hạn hiện tại

ScopeZero giúp Supplier chuẩn bị báo cáo theo cấu trúc thống nhất và chủ động nhận biết thông tin mình sẽ công bố. Buyer có thể tham khảo kết quả mà không cần nhận toàn bộ hồ sơ vận hành. Nhãn `supplier-reported` giúp người đọc hiểu mức độ bảo đảm của số liệu.

Bản mẫu hiện minh họa luồng nhập liệu → tính PCF → mã hóa → lưu trữ → xem công khai, cùng kiểm tra quyền tải bản mã ở backend. Phiên đăng nhập demo và khóa AES-GCM có trong mã nguồn **chưa cung cấp bảo đảm bảo mật cho dữ liệu kinh doanh thực tế**, cũng chưa chứng minh khả năng ngăn quản trị viên đọc dữ liệu. Backend chưa xác minh được sự khớp nhau giữa bản tóm tắt và đầu vào đã mã hóa, hoặc tính xác thực của bằng chứng nguồn.

Tích hợp TideCloak để kiểm soát giải mã và yêu cầu ít nhất 2 trong 3 quản trị viên độc lập phê duyệt thay đổi chính sách là mục tiêu cần hoàn tất và kiểm chứng khi gỡ được vướng mắc cấp phép. PCF được tính trên dữ liệu rõ tại trình duyệt Supplier trước khi mã hóa; bản mẫu không thực hiện tính toán trên bản mã. Quyền truy cập cho kiểm toán viên, tải hóa đơn PDF/ảnh và chứng nhận độc lập nằm ngoài MVP v1.

Xem [bối cảnh và đặc tả sản phẩm](docs/project-context.md), [quyết định kỹ thuật của nhóm](docs/team-decisions.md) và [hướng dẫn chạy demo](INSTALL.md) để biết thêm chi tiết.

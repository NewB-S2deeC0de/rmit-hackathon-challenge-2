# Hướng Dẫn Thiết Lập Bên Thứ Ba: TideCloak SDK & Quản Trị QEA

Tài liệu này cung cấp hướng dẫn đầy đủ để cài đặt, cấu hình và tích hợp dịch vụ bảo mật bên thứ ba **TideCloak** (dựa trên nền tảng Forseti Engine của Tide Foundation) cho dự án **ScopeZero**, phục vụ cho việc chạy thực tế và thẩm định Challenge 2.

---

## 1. Tổng Quan Kiến Trúc Bảo Mật ScopeZero & TideCloak

Trong ScopeZero:
- **Nhà cung cấp (Supplier):** Nhập dữ liệu phát thải nội bộ (điện, nguyên vật liệu, vận tải, chất thải, chứng từ ghi chú). Dữ liệu này được mã hóa đầu cuối (E2EE) ngay trên trình duyệt bằng TideCloak Web SDK trước khi gửi lên máy chủ.
- **Bên mua (Buyer):** Chỉ xem được bản tóm tắt công khai (`PublicSummary`: tổng phát thải, phát thải trên đơn vị sản phẩm). Hoàn toàn không thể xem hoặc giải mã dữ liệu đầu vào nhạy cảm.
- **Quản trị viên máy chủ (Server Admin):** Cơ sở dữ liệu backend chỉ lưu trữ bản mã (`EncryptedPayload`). Dù admin truy cập database cũng không thể tự ý giải mã hồ sơ nguồn của Supplier.
- **Hội đồng Quản trị QEA (Quorum Execution Authentication):** Cần tối thiểu 2 trong 3 chữ ký admin độc lập của TideCloak mới có thể phê duyệt bất kỳ thay đổi chính sách quyền hạn nhạy cảm nào, ngăn chặn hoàn toàn quyền đơn phương của lập trình viên hoặc một admin riêng lẻ.

---

## 2. Khởi Chạy TideCloak Bằng Docker

Bạn có thể khởi chạy một phiên bản TideCloak cục bộ phục vụ phát triển và kiểm thử:

### Cách 1: Sử dụng Docker CLI trực tiếp
```bash
docker run -d \
  --name tidecloak-server \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin_password \
  -e TIDE_FORSETI_MODE=dev \
  quay.io/tide/tidecloak:latest start-dev
```

### Cách 2: Sử dụng `docker-compose.yml`
Tạo file `docker-compose.tidecloak.yml` với nội dung:
```yaml
version: '3.8'

services:
  tidecloak:
    image: quay.io/tide/tidecloak:latest
    container_name: scopezero-tidecloak
    command: start-dev
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin_password
      TIDE_FORSETI_MODE: dev
    ports:
      - "8080:8080"
    volumes:
      - tidecloak_data:/opt/keycloak/data

volumes:
  tidecloak_data:
```

Chạy lệnh:
```bash
docker compose -f docker-compose.tidecloak.yml up -d
```

Sau khi khởi chạy thành công, truy cập giao diện quản trị tại: `http://localhost:8080/admin`.

---

## 3. Cấu Hình Trên TideCloak Management Console

Đăng nhập bằng tài khoản `admin` / `admin_password`, sau đó thực hiện các bước cấu hình sau:

### Bước 3.1: Tạo Realm
1. Click vào menu thả xuống Realm ở góc trên bên trái -> Chọn **Create Realm**.
2. Đặt tên Realm: `scopezero`.
3. Bấm **Create**.

### Bước 3.2: Cấu hình Client Ứng Dụng Web
1. Vào menu **Clients** -> Bấm **Create client**.
2. **General Settings:**
   - **Client type:** `OpenID Connect`
   - **Client ID:** `scopezero-web`
   - **Name:** `ScopeZero Web Application`
   - Bấm **Next**.
3. **Capability Config:**
   - Bật **Client authentication**: `Off` (Public client cho Single Page App / Next.js Client)
   - Chọn **Standard Flow**: `Checked` (hỗ trợ Authorization Code Flow with PKCE)
   - Bấm **Next**.
4. **Login Settings:**
   - **Root URL:** `http://localhost:3000` (hoặc `http://localhost:5173`)
   - **Valid redirect URIs:**
     - `http://localhost:3000/*`
     - `http://localhost:5173/*`
   - **Valid post logout redirect URIs:**
     - `http://localhost:3000/*`
     - `http://localhost:5173/*`
   - **Web origins:** `*` (hoặc `+` để nhận mọi Valid redirect URIs)
5. Bấm **Save**.

### Bước 3.3: Tải file cấu hình `tidecloak.json`
1. Tại màn hình chi tiết Client `scopezero-web`, chuyển sang tab **Action** (hoặc **Installation** ở các phiên bản cũ).
2. Chọn định dạng **Keycloak OIDC JSON**.
3. Nội dung file có cấu trúc tương tự:
   ```json
   {
     "realm": "scopezero",
     "auth-server-url": "http://localhost:8080/",
     "ssl-required": "external",
     "resource": "scopezero-web",
     "public-client": true,
     "confidential-port": 0
   }
   ```
4. Lưu file này thành `tidecloak.json` và đặt tại thư mục gốc của dự án frontend (hoặc `public/tidecloak.json`).

---

## 4. Cấu Hình Roles và Người Dùng (Users)

### Bước 4.1: Tạo Roles
Vào **Realm Roles** -> **Create Role**:
- Role 1: `supplier` (Nhà cung cấp linh kiện — được quyền nộp lô hàng và giải mã lô hàng của chính mình).
- Role 2: `buyer` (Bên mua hàng — chỉ xem dữ liệu tóm tắt công khai).

### Bước 4.2: Tạo Tài Khoản Supplier Demo
1. Vào **Users** -> **Add user**.
2. Username: `supplier-demo`.
3. Email: `supplier@supplier-demo.com`.
4. Bấm **Create**.
5. Chuyển sang tab **Credentials** -> Bấm **Set password**:
   - Password: `Password123!`
   - Temporary: `Off`
6. Chuyển sang tab **Role mapping** -> Gán role `supplier`.

---

## 5. Cấu Hình Chính Sách QEA (Quorum Execution Authentication)

Để thỏa mãn tiêu chí kiểm chứng Challenge 2 về việc **ngăn chặn quyền đơn phương của một quản trị viên**:
1. Tạo 3 tài khoản admin độc lập trong TideCloak:
   - `admin-qea-1`
   - `admin-qea-2`
   - `admin-qea-3`
2. Thiết lập chính sách ngưỡng (Threshold Policy) cho các thao tác phân quyền nhạy cảm (như thêm quyền giải mã tag `_tide_supplier_internal` hoặc thay đổi cấu hình mã hóa):
   - **Quy tắc:** `M of N = 2 of 3`.
   - **Ý nghĩa:** Khi một admin đề xuất thay đổi, yêu cầu sẽ rơi vào trạng thái `Pending` cho đến khi admin thứ hai phê duyệt thông qua hệ thống Forseti Engine. Một admin đơn phương không thể tự ý kích hoạt quyền giải mã.

---

## 6. BA LƯU Ý KỸ THUẬT BẮT BUỘC KHI TÍCH HỢP TIDECLOAK SDK

Khi viết code tích hợp TideCloak SDK trong frontend / backend, **bắt buộc tuân thủ 3 quy tắc vàng** sau (tránh lỗi cú pháp và chặn hệ thống):

### ⚠️ Lưu ý 1: Dữ liệu đầu vào của hàm mã hóa (`encryptBatch`)
- **Vấn đề:** SDK của TideCloak yêu cầu dữ liệu đưa vào hàm mã hóa phải ở dạng **string** hoặc **Uint8Array**, tuyệt đối **không** được truyền trực tiếp một JavaScript Object `{}`.
- **Cách xử lý đúng:** Luôn phải chạy `JSON.stringify(privatePayload)` trước khi truyền vào hàm mã hóa của SDK:
  ```typescript
  // ĐÚNG:
  const payloadString = JSON.stringify(privatePayload);
  const encrypted = await tideSDK.encrypt(payloadString, TAG_SUPPLIER_INTERNAL);

  // SAI (Gây lỗi runtime SDK):
  const encrypted = await tideSDK.encrypt(privatePayload, TAG_SUPPLIER_INTERNAL);
  ```

### ⚠️ Lưu ý 2: Khớp chính xác tên thẻ mã hóa và giải mã (Tags)
- **Vấn đề:** TideCloak sử dụng thẻ định danh mật mã để gắn với chính sách phân quyền E2EE. Thẻ dùng để giải mã phải **trùng khớp từng ký tự** với thẻ đã dùng khi mã hóa.
- **Hằng số chuẩn trong dự án:**
  ```typescript
  export const TAG_SUPPLIER_INTERNAL = "_tide_supplier_internal";
  export const TAG_SCOPE3_VERIFIED = "_tide_scope3_verified";
  ```
- **Lưu ý:** Không tự ý thay đổi tiền tố dấu gạch dưới `_` hoặc viết hoa thường khác biệt.

### ⚠️ Lưu ý 3: Cấu hình Client và Valid Redirect URIs
- **Vấn đề:** Lỗi CORS hoặc Invalid Redirect URI xảy ra nếu địa chỉ cổng dev chạy khác với cổng khai báo trong Console.
- **Cách xử lý:** Đảm bảo thêm cả hai cổng thường dùng vào danh sách Valid Redirect URIs:
  - Vite dev server: `http://localhost:5173/*`
  - Next.js dev server: `http://localhost:3000/*`
  - Đảm bảo tải đúng `tidecloak.json` vào ứng dụng.

---

## 7. Chế Độ Kiểm Thử Kép (Dual-Mode Testing)

Để hỗ trợ kiểm thử và trình diễn linh hoạt:
1. **Chế độ Giả lập Cục bộ (Local Simulation Mode):**
   - Nằm trong thư mục `demo-local/` (đã được loại trừ trong `.gitignore`).
   - Sử dụng `MockBatchCrypto` và `MockBatchApi` để chạy độc lập không cần Docker hay server thật, nhưng vẫn mô phỏng chính xác 100% các ràng buộc (JSON stringification, kiểm tra tag, mã hóa envelope, từ chối giải mã trái phép và HTTP 409 Conflict).
2. **Chế độ Kết Nối Trực Tiếp (Live TideCloak Mode):**
   - Chỉ cần khởi chạy Docker theo Mục 2, cấu hình Client theo Mục 3, và hệ thống sẽ tự động chuyển sang sử dụng SDK thật qua Adapter tương thích.

---

Tài liệu này được biên soạn bám sát theo đặc tả kỹ thuật `docs/context.md` và các quy định của Ban Tổ Chức Hackathon.

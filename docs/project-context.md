# Project Context & Scaffold Map — PCF Privacy-Preserving Calculator

> **Dự án**: Product Carbon Footprint (PCF) Calculator with Privacy-Preserving TideCloak Integration  
> **Tài liệu nền tảng**: Cập nhật từ *Giải Pháp UNLOCKED Hackathon(1).docx* và *Unified Contract v1*.  
> **Mục tiêu**: Supplier minh bạch hóa lượng phát thải carbon (PCF) cho Buyer nhưng bảo vệ tuyệt đối bí mật kinh doanh (định mức nguyên vật liệu, hóa đơn điện năng, chi phí vận tải).

---

## 1. Folder Map & Phân công Trách nhiệm (Member Allocation)

| Thành viên | Khu vực chính | Trách nhiệm chính |
|---|---|---|
| **Member 1 — Tide/backend** | `backend/access/`<br>`infra/tidecloak/` | Cổng tiếp nhận dữ liệu bảo vệ (protected input path), phân quyền mã hóa/giải mã, cấu hình Quorum Execution Approval (QEA) 3 admin và kiểm chứng hiệu lực quyền. |
| **Member 2 — logic/data** *(Current Agent)* | `backend/reporting/`<br>`data/sample/` | Dữ liệu đầu vào mẫu, logic tính toán/báo cáo PCF (`calculatePCF`), quản lý phiên bản hệ số `factorVersion: "demo-factors-v1"`, và gán nhãn trung thực `supplier-reported`. |
| **Member 3 — Supplier** | `frontend/supplier/` | Luồng nhập liệu của Nhà cung cấp (form nhập, kiểm tra hợp lệ), chỉ rõ minh bạch phần nào công bố công khai (`publicSummary`) và phần nào được mã hóa (`encryptedInput`). |
| **Member 4 — Buyer/demo** | `frontend/buyer/`<br>`demo/` | Màn hình tra cứu báo cáo cho Buyer (chỉ xem summary, nhãn `supplier-reported`), kịch bản demo từ chối truy cập (access-denied), kịch bản QEA admin không tự cấp quyền và bằng chứng quan sát được. |

---

## 2. Cấu trúc Thư mục Scaffold Chung (Scaffold Folder Structure)

```text
├── frontend/               # Giao diện người dùng cho Supplier và Buyer (Placement Reference)
│   ├── supplier/           # [Member 3] Luồng upload, form tính toán & mã hóa của Supplier
│   └── buyer/              # [Member 4] Màn hình tra cứu PublicSummary của Buyer & kiểm tra từ chối giải mã
│
├── backend/
│   ├── access/             # [Member 1] Tích hợp dữ liệu bảo vệ, xác thực token & kiểm soát quyền TideCloak
│   └── reporting/          # [Member 2] Logic tính toán PCF thuần túy, bộ quy tắc validation & báo cáo
│
├── infra/
│   └── tidecloak/          # [Member 1] Cấu hình cục bộ TideCloak Docker, client realms, và thiết lập QEA 3 admin
│
├── data/
│   └── sample/             # [Member 2] Dữ liệu mẫu (demoBatch DEMO-001, các ca lỗi biên, hệ số demo-factors-v1)
│
├── demo/                   # [Member 4] Kịch bản chạy thử nghiệm thực tế (run-through) & bằng chứng quan sát
│
├── docs/                   # Tài liệu dự án, quyết định chia sẻ (handoffs) và ghi chú nhóm
│   └── project-context.md  # File đặc tả bối cảnh, ranh giới bảo mật và đề xuất scaffold thống nhất
│
├── scripts/                # Các script hỗ trợ phát triển, chạy test và kiểm tra hợp đồng dùng chung
│
└── src/                    # Single source of truth cho TypeScript types, PCF logic & triển khai app
```

> **Lưu ý quan trọng**: Thư mục scaffold chứa placement notes cho tới khi nhóm thống nhất lựa chọn framework UI/Backend. Tuyệt đối không commit credentials hoặc dữ liệu nhà cung cấp thật vào Git.

---

## 3. Quyết định Dùng chung & Điểm Bàn giao (Shared Decisions & Handoffs)

Trước khi ghép nối các module, cả nhóm tuân thủ hợp đồng kỹ thuật thống nhất:

### 3.1. Phân loại Trường Dữ liệu Bảo vệ (Protected Fields) vs Công bố (Public Fields)
* **Các trường được bảo vệ (Private/Protected — Mã hóa E2EE trước khi rời client Supplier)**:
  * `electricityKwh`: Lượng điện tiêu thụ (tiết lộ quy mô và hiệu suất máy móc).
  * `materialKg`: Khối lượng vật liệu (tiết lộ công thức sản xuất / BOM).
  * `inboundTransportTonKm`: Chi tiết cung đường vận chuyển và logistics.
  * `wasteKg`: Lượng phế phẩm phát sinh trong sản xuất.
  * `breakdown`: Bảng phân rã chi tiết từng nguồn phát thải.
  * `evidence`: Bằng chứng chứng từ (hóa đơn tiền điện, vận đơn, phiếu xuất kho).
* **Các trường công bố công khai (Public Summary — Buyer và công chúng xem được)**:
  * `batchId`: Mã lô hàng do Supplier đặt (1–64 ký tự).
  * `productName`: Tên thương mại sản phẩm.
  * `totalKgCO2e`: Tổng lượng phát thải của cả lô.
  * `perProductKgCO2e`: Lượng phát thải trung bình trên 1 đơn vị sản phẩm.
  * `factorVersion`: Bộ hệ số sử dụng (`demo-factors-v1`).
  * `calculationVersion`: Phiên bản công thức (`pcf-v1`).
  * `assuranceLevel`: Luôn là `"supplier-reported"` trong v1.

### 3.2. Điểm Mã hóa (Encryption Point)
* **Client-side Encryption**: Dữ liệu riêng tư được đóng gói thành `PrivateBatchPayload` và gọi `TideCloak.encryptBatch(...)` ngay trên trình duyệt Supplier.
* Backend chỉ nhận bản mã `EncryptedPayload`:
  ```typescript
  export interface EncryptedPayload {
    provider: "tidecloak";
    formatVersion: 1;
    serialized: string; // Bản mã chuỗi hóa từ TideCloak SDK
  }
  ```
* Backend **không bao giờ thấy bản rõ** của input hay bằng chứng; không lưu bản rõ vào database/log.

### 3.3. Ma trận Phân quyền Truy cập (Access Control Matrix)

| Chủ thể (Actor) | Xem PublicSummary | Đọc bản mã EncryptedPayload | Giải mã PrivateBatchPayload | Đổi quyền / Thêm Policy |
|---|:---:|:---:|:---:|:---:|
| **Public / Buyer** | ✅ Có | ❌ Không | ❌ Không (Từ chối truy cập) | ❌ Không |
| **Supplier (Chủ lô)** | ✅ Có | ✅ Có (Lô của mình) | ✅ Có (Qua khóa E2EE TideCloak) | ❌ Không |
| **Supplier khác** | ✅ Có | ❌ 404 Not Found (Không lộ ID) | ❌ Không | ❌ Không |
| **Admin ứng dụng** | ✅ Có | ✅ Chỉ phục vụ backup/lưu trữ | ❌ Không có quyền giải mã mặc định | ❌ Bị khóa bởi QEA |
| **Admin TideCloak (Đơn lẻ)** | ✅ Có | N/A | ❌ Không tự cấp quyền | ⏳ Đề xuất cần $\ge 2/3$ duyệt |
| **Hội đồng QEA ($\ge 2/3$ Admin)** | ✅ Có | N/A | ⚠️ Chỉ khi có yêu cầu kiểm toán hợp lệ | ✅ Được phép phê duyệt |

---

## 4. Giới hạn Bảo mật & Tuyên bố Trung thực (Honesty Notes)

Dựa trên đề bài *Giải Pháp UNLOCKED Hackathon*:
1. **Dữ liệu do Supplier tự khai báo (`supplier-reported`)**:
   - Phép tính chạy tại máy Supplier trên số liệu tự nhập. Bản MVP chứng minh việc bảo vệ tính bí mật của số liệu (Confidentiality), nhưng **chưa ngăn chặn được trường hợp Supplier cố tình gian lận số liệu đầu vào**.
   - Không sinh nhãn "Verified" hay "Audited" khi chưa có kiểm toán độc lập.
2. **Cơ chế QEA (Quorum Execution Approval)**:
   - Cấu hình 3 tài khoản admin TideCloak độc lập với ngưỡng phê duyệt đồng thuận là 2 ($M=2, N=3$).
   - Một admin đơn lẻ khi tự tạo policy cấp quyền giải mã thì thay đổi sẽ rơi vào trạng thái `PENDING` và không có hiệu lực thực tế.
   - Demo phải chứng minh cả **hiệu lực thực thi bị từ chối**, không chỉ đơn thuần là hiển thị chữ "Pending" trên giao diện.
3. **Giới hạn môi trường**:
   - QEA bảo vệ chính sách quyền trên TideCloak; không tự bảo vệ được mã nguồn frontend/backend nếu bị can thiệp trực tiếp ở tầng hạ tầng máy chủ.
   - Tránh tiết lộ gián tiếp: Công bố đồng thời `totalKgCO2e` và `perProductKgCO2e` cho phép suy ra `quantity = total / perProduct`. Đây là đánh đổi có chủ đích trong MVP để giữ 2 chỉ số tiêu chuẩn.

---

## 5. Bổ sung Scaffold và Các Quyết định Cần Thống nhất (Proposals for Team Alignment)

> *Phần dưới là đề xuất để cả nhóm xác nhận, chưa phải thông báo stack đã được chốt. Giữ sơ đồ thư mục phía trên làm tham khảo cho đến khi nhóm chọn một cấu trúc triển khai duy nhất.*

### 5.1. Thống nhất Stack và Cấu trúc Triển khai
* **Đề xuất**: Tiếp tục **Next.js + React + TypeScript** để tận dụng phần Buyer đã viết và khớp với phân công tại thẻ "Chia việc".
* **Quy ước cấu trúc nếu chọn Next.js**:
  * Dùng cấu trúc frontend chính thức tại:
    * `src/app/supplier/**` (Giao diện nhập liệu và tính toán của Supplier)
    * `src/app/buyer/**` (Giao diện tra cứu và kiểm thử từ chối giải mã của Buyer)
    * `src/components/**` (Các thành phần UI dùng chung)
    * `src/types.ts` (Nơi khai báo duy nhất cho toàn bộ types nghiệp vụ)
  * **Không tạo thêm một frontend React độc lập tại `frontend/**`**.
  * **Thành viên 1** xác định cách nối các phần `backend/access` và `backend/reporting` với app (qua API routes `src/app/api/**` hoặc import trực tiếp trong server components / lib).
* **Hành động nhóm**: Cả nhóm cần xác nhận phương án trên hoặc chọn stack khác trước khi cài đặt. Thành viên 1 ghi quyết định có hiệu lực trong `docs/project-context.md` và cập nhật mô tả scaffold cho khớp.

### 5.2. Bổ sung Nền tảng Chạy chung — Thành viên 1 chủ trì
* Checkout phần Buyer hiện thiếu `package.json`, lockfile, cấu hình TypeScript, root layout/entry và types chung. Chưa kiểm chứng các phần này trên branch riêng của thành viên 1; nếu đã có thì bàn giao branch/commit thay vì tạo lại.
* **Nếu chọn Next.js**:
  * Bổ sung dependencies: `next`, `react`, `react-dom`.
  * Dev dependencies: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`.
  * Cấu hình: `tsconfig.json`, cấu hình Next.js (`next.config.js` / `next.config.ts`), root layout (`src/app/layout.tsx`) và hỗ trợ CSS Modules.
  * Phiên bản: `react` và `react-dom` cùng phiên bản chính xác; typings cùng major với React; cả bộ phải tương thích với phiên bản Next.js đã chọn.
  * Chốt một phiên bản Node (Node 20.x hoặc 22.x LTS) và một package manager (`npm`); commit `package.json` cùng đúng một lockfile (`package-lock.json`).
  * Có các lệnh: `npm run dev`, `npm run build`, `npm test`, `npm run check` (typecheck) và file `.gitignore` phù hợp.
  * Các thành viên cài đặt từ lockfile chung bằng lệnh `npm ci`, tuyệt đối không tự chọn phiên bản mới nhất (`latest`).
  * **Phân công dependency**: Thành viên 3 và 4 cần React/typings để làm UI; thành viên 1 cần khi tích hợp frontend. Thành viên 2 (logic/data) chỉ làm logic TypeScript thuần túy thì không bắt buộc React, nhưng dùng dependency chung khi chạy toàn app.

### 5.3. Thống nhất Hợp đồng và Bàn giao
* Thẻ hợp đồng đã mô tả **Unified Contract v1**, trong khi phần scaffold ban đầu còn nói API chưa chốt. Cả nhóm cần xác nhận **Hợp đồng v1 là nguồn có hiệu lực duy nhất** hoặc ghi rõ thay đổi; không duy trì các tên trường/hàm khác nhau giữa các branch.
* **Quy ước chuẩn theo Hợp đồng v1**:
  * Dùng `batchId`, `factorVersion: "demo-factors-v1"`, `assuranceLevel: "supplier-reported"`.
  * Hàm API: `submitBatch(request: CreateBatchRequest): Promise<CreateBatchResponse>` và `getPublicBatches(): Promise<ListPublicBatchesResponse>`.
  * Buyer chỉ đọc `PublicSummary` công khai, không nhận `breakdown` hoặc `private payload`.
* **Phân định trách nhiệm bàn giao**:
  * **Thành viên 1**: Bàn giao types chuẩn và API client (`src/lib/api.ts` hoặc tương đương).
  * **Thành viên 2**: Bàn giao fixture `DEMO-001` với kết quả benchmark $1.690\ \text{kg CO}_2\text{e}$ và $1,69\ \text{kg CO}_2\text{e/sp}$ (`data/sample/demoBatch.ts`), bộ hệ số `factors.ts`, logic `calculate.ts`, và validation `validate.ts` (21 unit tests đã đạt 100%).
  * **Thành viên 3 và 4**: Import chung từ `src/types.ts`, không sao chép lại types.
* **Xác thực bảo mật**: Thống nhất thêm các mục bảo mật đã nêu ở scaffold: điểm mã hóa, định dạng bản mã và quyền đọc/giải mã. Các khả năng SDK TideCloak chưa kiểm chứng trong thực tế phải ghi rõ là **điều kiện cần xác minh (acceptance criteria)**, không xem như đã hoàn thành.

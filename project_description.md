# Mô tả dự án ScopeZero — bản ghi bối cảnh trước đặc tả hợp nhất

> **Tài liệu lịch sử, không dùng làm đặc tả triển khai hiện tại.** Nội dung bên dưới phản ánh bản chia việc trước khi nhóm đưa [`Giải Pháp UNLOCKED Hackathon.docx`](Giải%20Pháp%20UNLOCKED%20Hackathon.docx) vào repo ngày 22/10/2026. DOCX mới đã định nghĩa hợp đồng MVP v1 đầy đủ hơn và chuyển Reviewer ra ngoài MVP. Luồng hiện tại là Supplier tính PCF trên trình duyệt, mã hóa payload riêng, công bố summary ở mức `supplier-reported`, và chứng minh quyền giải mã/QEA. Đọc [ngữ cảnh hiện hành](docs/project-context.md), [việc của Thành viên 1](docs/member-1-task.md) và [quyết định cần chốt](docs/team-decisions.md) trước khi làm. Tên dự án hiện tại trong DOCX và ứng dụng là ScopeZero. Phần bên dưới được giữ nguyên để đối chiếu lịch sử, không phải các quyết định đã chốt.

## Mục tiêu sản phẩm và trạng thái hiện tại

ScopeZero hướng tới việc cho Supplier cung cấp bằng chứng phục vụ báo cáo phát thải Scope 3 của Buyer mà không đưa các bản ghi vận hành nhạy cảm cho Buyer. Theo ngữ cảnh dự án, dữ liệu nguồn có thể gồm hóa đơn điện, đầu vào vật liệu, sản lượng và vận chuyển; các dữ liệu này có thể tiết lộ chi phí hoặc năng lực sản xuất. Giá trị mong muốn là Buyer nhận được báo cáo có thể kiểm tra với mức tiết lộ dữ liệu nguồn hạn chế. Đây là **mục tiêu từ tài liệu ngữ cảnh**, không phải mô tả một luồng đã chạy.

Tại thời điểm kiểm tra **22/10/2026**, checkout này có README, tài liệu, các thư mục phân việc, cấu hình Docker Compose và script khởi động TideCloak cục bộ. Chưa có mã ứng dụng trong `src/`, `package.json`, lockfile, `tsconfig.json`, root layout, types chung hay API client. Git local và remote chỉ hiển thị `main`; commit remote hiện chứa README mẫu. Nhóm có nói đến phần Buyer đã viết, nhưng branch/commit đó **chưa xuất hiện trong checkout hoặc remote được kiểm tra**, nên cần bàn giao trước khi tích hợp. Một số tài liệu và scaffold hiện là thay đổi local chưa commit.

Luồng demo được [ngữ cảnh dự án](docs/project-context.md) đề xuất là: Supplier gửi dữ liệu mẫu qua đường bảo vệ; Buyer và admin ứng dụng thử đọc nhưng bị từ chối; Reviewer/Auditor yêu cầu quyền và thao tác vẫn thất bại cho đến khi đủ phê duyệt; người được phép xem dữ liệu và xác nhận báo cáo; Buyer chỉ nhận báo cáo, không mở được dữ liệu nguồn. Đây là **phạm vi đề xuất** và cần phân biệt bước do TideCloak bảo vệ với bước do ứng dụng thực hiện.

## Bối cảnh và vấn đề cần giải quyết

Bản chia việc trước đó mới đề cập việc Supplier mã hóa dữ liệu và Buyer không giải mã được. Như vậy chưa đủ để xử lý quyền của người phát triển hoặc vận hành sản phẩm: họ có thể kiểm soát server, frontend được triển khai hoặc kết quả lưu trong database/API. Nhóm cần phân biệt quyền đọc dữ liệu nguồn, quyền thay đổi cấu hình giải mã và tính toàn vẹn của kết quả công bố.

| Hành động đơn phương cần xét | Tình trạng/hướng xử lý nêu trong DOCX |
| --- | --- |
| Dev đọc dữ liệu đã lưu trên server | Có hướng bảo vệ **nếu** input được mã hóa trên máy Supplier trước khi gửi và quyền giải mã được cấu hình đúng. |
| Một admin tự cấp cho mình quyền giải mã | Bản chia việc trước đó chưa có task cấu hình và demo cơ chế nhiều người phê duyệt của TideCloak. |
| Dev sửa frontend để lấy input trước khi mã hóa | Chưa chặn được: người kiểm soát bản web triển khai có thể thay đổi code chạy trên trình duyệt. |
| Dev sửa kết quả PCF hoặc trạng thái “đã xác minh” trong database/API | Chưa chặn được: mã hóa input không bảo vệ tính toàn vẹn của kết quả công bố. |
| Reviewer chỉ được xem dữ liệu sau khi Supplier chấp thuận từng lần | Chưa có cơ chế này: quyền giải mã được cấp sẵn không tương đương chấp thuận cho từng lần truy cập. |

## Cơ chế TideCloak được đề xuất

TideCloak có QEA để yêu cầu nhiều quản trị viên phê duyệt việc thay đổi role/quyền. Theo nội dung DOCX, phải cấu hình **ít nhất 3 admin** để ngưỡng phê duyệt là **2 người**; với 1 hoặc 2 admin, ngưỡng vẫn là 1. QEA quản lý thay đổi quyền trong TideCloak, không tự bảo vệ code ứng dụng hoặc database của nhóm.

Phần E2EE cần tách quyền **mã hóa** và **giải mã**. Supplier có đường mã hóa input được phép; Buyer không được cấp quyền giải mã mặc định. Một thay đổi quyền do admin đề xuất phải còn ở trạng thái `pending` sau phê duyệt thứ nhất và chỉ có hiệu lực sau phê duyệt thứ hai. Đây là hành vi cần cấu hình và quan sát trong demo, không phải kết quả đã được xác nhận.

## Phân việc đề xuất

| Thành viên | Phần việc và kết quả cần bàn giao |
| --- | --- |
| **1 — Tide/backend** | Cấu hình riêng quyền mã hóa và giải mã; không cấp giải mã mặc định cho Buyer. Tạo 3 tài khoản quản trị QEA. Demo một admin tự đề xuất cấp quyền nhưng thay đổi vẫn `pending` cho đến khi admin thứ hai chấp thuận. Các role E2EE và thay đổi quyền cần đi qua quy trình QEA. |
| **2 — logic/data** | Gắn `factorVersion` và trạng thái `supplier-reported` vào kết quả. Không tự sinh nhãn `verified`. Nếu có Reviewer, người đó phải tính lại từ input mà họ được phép xem rồi mới xác nhận. |
| **3 — Supplier** | Thể hiện rõ dữ liệu nào được công bố và dữ liệu nào được mã hóa. Nếu có nút “Cho Reviewer xem”, nút phải nối với quyền truy cập thật; trạng thái UI hoặc checkbox riêng lẻ không đủ. |
| **4 — Buyer/demo** | Ghi lại hai tình huống: Buyer không giải mã được input; một admin chưa đủ phê duyệt để tự cấp quyền. README cần nói rõ phần nào được Tide bảo vệ và phần nào vẫn là giới hạn của prototype. |

## Scaffold và vị trí làm việc

Các thư mục dưới đây hiện là **sơ đồ phân việc**. README trong từng thư mục giải thích trách nhiệm; chúng chưa chứa ứng dụng hoàn chỉnh hoặc quyết định triển khai cuối cùng.

```text
rmit-hackathon-challenge-2/
├── README.md                  Giới thiệu và bản đồ nhóm
├── project_description.md     Tài liệu tổng hợp này
├── frontend/
│   ├── supplier/              Thành viên 3: ghi chú luồng Supplier
│   └── buyer/                 Thành viên 4: ghi chú luồng Buyer
├── backend/
│   ├── access/                Thành viên 1: đường dữ liệu bảo vệ/quyền truy cập
│   └── reporting/             Thành viên 2: logic tính toán và báo cáo
├── infra/tidecloak/           Thành viên 1: cấu hình TideCloak cục bộ
├── data/sample/               Thành viên 2: dữ liệu mẫu an toàn cho demo
├── demo/                      Thành viên 4: kịch bản và bằng chứng demo
├── docs/                      Ngữ cảnh, quyết định, hướng dẫn và bàn giao
└── scripts/                   Script dùng chung
```

Nếu nhóm **chọn Next.js**, một frontend duy nhất sẽ dùng `src/app/supplier/**`, `src/app/buyer/**`, `src/components/**` và `src/types.ts` ở gốc repo. Khi đó `frontend/` chỉ giữ vai trò ghi chú phân việc; **không tạo thêm React app độc lập** tại đây. Thành viên 1 quyết định cách nối `backend/access/` và `backend/reporting/` vào app. Hai thư mục backend mô tả ranh giới trách nhiệm, không mặc định là hai service riêng. Nếu nhóm chọn stack khác, cập nhật sơ đồ và giữ một cấu trúc triển khai duy nhất.

## Tech stack và nền tảng chạy chung — đề xuất chưa chốt

| Hạng mục | Đề xuất hoặc việc cần xác nhận |
| --- | --- |
| Frontend | Tiếp tục **Next.js + React + TypeScript** để dùng phần Buyer được báo là đã viết và khớp thẻ chia việc. Nhóm phải xác nhận lựa chọn này trước khi cài đặt. |
| Packages nếu chọn Next.js | Runtime: `next`, `react`, `react-dom`. Dev: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`. `react` và `react-dom` phải cùng phiên bản chính xác; typings cùng major với React; tất cả tương thích với phiên bản Next.js được chọn. Chưa chốt số phiên bản cụ thể. |
| Cấu hình app | Cần `tsconfig.json`, cấu hình Next.js thích hợp, root layout/entry và hỗ trợ CSS Modules. Checkout hiện chưa có các file này. |
| Môi trường chung | Chốt **một phiên bản Node** và **một package manager**. Commit `package.json` với đúng **một lockfile**, `.gitignore` phù hợp và các lệnh `dev`, `build`, `typecheck`. Nếu dùng npm, các thành viên cài bằng `npm ci` từ lockfile chung. |
| Phụ thuộc của từng người | Thành viên 3 và 4 cần React/typings để làm UI; thành viên 1 cần khi tích hợp frontend. Thành viên 2 làm logic TypeScript không bắt buộc dùng React riêng nhưng dùng dependency chung khi chạy toàn app. |
| TideCloak | Repo đã có Compose và script cho instance phát triển cục bộ (`bash scripts/start-tidecloak.sh`); thông tin bootstrap nằm trong file `.env` được Git bỏ qua. Việc chạy server không đồng nghĩa E2EE, QEA hay luồng ứng dụng đã được cấu hình và demo thành công. Xem [hướng dẫn local](docs/member-1-local-setup.md). |

Trước khi tạo các file nền tảng, thành viên 1 cần kiểm tra branch riêng của mình và nhận branch/commit Buyer. Nếu file đã có ở đó, bàn giao hoặc tích hợp commit thay vì tạo lại.

## Branch và trách nhiệm tích hợp

**Trạng thái Git đã quan sát:** chỉ có `main` ở local và remote. Không có tên branch thực tế cho bốn thành viên trong DOCX hoặc trong remote đã kiểm tra. Bảng sau là **quy ước branch đề xuất** để nhóm xác nhận; nó không khẳng định các branch này đã tồn tại.

| Thành viên | Branch đề xuất | Phạm vi chính | Bàn giao trước khi nhập vào nhánh chung |
| --- | --- | --- | --- |
| 1 — Tide/backend | `feat/tide-access` | QEA, E2EE, đường dữ liệu bảo vệ, nền tảng chạy chung và types/API client sau khi stack được chốt | Branch/commit, cách chạy, ma trận quyền, kết quả Buyer bị từ chối và yêu cầu chờ đủ phê duyệt. |
| 2 — logic/data | `feat/reporting-data` | Logic tính toán, metadata kết quả, fixture mẫu | Fixture `DEMO-001`, phương pháp/factor, `factorVersion`, đơn vị và dữ liệu báo cáo công khai. |
| 3 — Supplier | `feat/supplier-ui` | Form/luồng Supplier, trạng thái công khai so với mã hóa | Mã dùng types chung và đúng điểm mã hóa/quyền đã thống nhất với thành viên 1. |
| 4 — Buyer/demo | `feat/buyer-demo` | Buyer view và kịch bản demo | Branch/commit Buyer đã viết, view chỉ dùng public summary và hai bằng chứng demo. |

Nếu Buyer hoặc thành viên 1 đã có branch với tên khác, dùng **branch/commit thật** được bàn giao và cập nhật bảng; không tạo bản sao chỉ để khớp tên đề xuất.

## Hợp đồng v1 và bàn giao giữa các phần — đề xuất chưa chốt

Theo đề xuất của nhóm, dùng thống nhất `batchId`, `factorVersion`, `assuranceLevel: supplier-reported` và `getPublicBatches(): Promise<ListPublicBatchesResponse>`. Buyer chỉ nhận **public summary**, không nhận breakdown hoặc private payload. Thành viên 1 bàn giao types chuẩn và API client; thành viên 2 bàn giao fixture `DEMO-001` với kết quả đề xuất **1690 / 1.69**; thành viên 3 và 4 import types chung thay vì sao chép định nghĩa trên từng branch.

Nhóm cần xác nhận thẻ hợp đồng v1 là nguồn có hiệu lực hoặc ghi lại thay đổi. **Schema đầy đủ và đơn vị của 1690 / 1.69 chưa có trong checkout**, nên không tự suy diễn. Trước tích hợp, chốt thêm tên trường nhạy cảm, điểm mã hóa trên máy Supplier, định dạng bản mã, quyền đọc/giải mã của từng vai trò và cách Reviewer truy cập. Bất kỳ khả năng SDK chưa kiểm chứng nào phải được ghi là điều kiện cần thử thực tế.

## Điều prototype có thể chứng minh và giới hạn cần công bố

**Nếu các phần trên được triển khai và demo thành công**, nhóm có thể chứng minh: người không có quyền không giải mã được bản mã; và một admin TideCloak không thể tự mình hoàn tất thay đổi quyền cần hai phê duyệt. Hai kết luận này phải dựa trên kết quả truy cập và trạng thái yêu cầu quyền quan sát được, không chỉ dựa trên giao diện.

Nhóm **chưa thể tuyên bố** rằng một dev không thể tự sửa ứng dụng hoặc kết quả. QEA không ngăn người kiểm soát frontend lấy input trước khi mã hóa; mã hóa input cũng không ngăn việc sửa PCF hay trạng thái xác minh trong database/API. Quyền giải mã sẵn có không chứng minh Supplier đã đồng ý cho mỗi lượt Reviewer xem dữ liệu. Để đạt lời hứa mạnh hơn, DOCX nêu thêm nhu cầu kiểm soát việc triển khai code bởi nhiều bên và cơ chế xác nhận tính toàn vẹn của kết quả. Các mục này nên được công bố là giới hạn hoặc hướng phát triển tiếp của prototype, tránh khiến ban giám khảo hiểu rằng chúng đã được giải quyết.

## Tài liệu được DOCX dẫn chiếu

- [Thiết lập QEA](https://docs.tide.org/Admin/SetupIGA)
- [Cơ chế quorum của QEA](https://docs.tide.org/Core-Concepts/iga-workflow)
- [Thiết lập E2EE](https://docs.tide.org/Admin/e2ee)

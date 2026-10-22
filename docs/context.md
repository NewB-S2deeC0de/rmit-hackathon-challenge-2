# **ScopeZero — Đặc tả hệ thống tổng thể**

Bản hợp nhất từ toàn bộ bảy thẻ trong tài liệu, cập nhật ngày 22/10/2026. Mục tiêu là cung cấp một tài liệu xuyên suốt để nhóm triển khai, ghép và kiểm tra hệ thống; không phải xác nhận hệ thống đã hoàn thành.

Quy ước trạng thái: “MVP v1” là phạm vi triển khai được mô tả trong hợp đồng dữ liệu/API; “Đề xuất cần xác nhận” là quyết định nền tảng chưa có bằng chứng nhóm đã chốt; “Cần kiểm chứng” là khả năng SDK hoặc bảo đảm cần chạy thử; “Mở rộng” không thuộc MVP.

Bản sao lưu nguyên trạng trước hợp nhất: https\://docs.google.com/document/d/1nX5WkbjnZvaQJO3eWEI0rUUbCZb4E9IhCAZCMIRIjmk/edit?usp=drivesdk

# **1\. Bài toán và giá trị sản phẩm**

Nhà cung cấp linh kiện muốn chia sẻ dấu chân carbon sản phẩm cho bên mua nhưng lo dữ liệu điện năng, nguyên vật liệu, sản lượng và logistics làm lộ một phần cơ cấu chi phí hoặc công suất, ảnh hưởng lợi thế đàm phán. Bên mua cần thông tin phát thải để lựa chọn và phối hợp chuỗi cung ứng.

ScopeZero hướng đến việc chia sẻ kết quả phát thải trong khi giới hạn quyền tiếp cận hồ sơ nguồn. Trong MVP, kết quả là Supplier tự khai báo, chưa phải bằng chứng phát thải đã được kiểm toán. Giá trị chứng minh được trước mắt là công bố thông tin được chọn và bảo vệ dữ liệu đầu vào bằng cơ chế truy cập thực tế.

PCF của linh kiện có thể phục vụ việc đánh giá phát thải chuỗi cung ứng của bên mua. Không đồng nhất PCF của một lô với toàn bộ Scope 3 của doanh nghiệp. Các tỷ lệ 80–90%, nghĩa vụ báo cáo tại châu Âu và tuyên bố đáp ứng ISO/GHG/PACT trong ý tưởng ban đầu chưa được dùng làm kết luận chung; cần nguồn và phạm vi áp dụng khi đưa vào bài thuyết trình.

# **2\. Mức độ phù hợp với Challenge 2**

Hoạt động hữu ích: Supplier chia sẻ kết quả phát thải và duy trì hồ sơ riêng để phục vụ hợp tác. Rào cản: Supplier phải tin người vận hành không tự đọc hoặc cấp quyền giải mã hồ sơ cho bên khác.

Thao tác bảo vệ trọng tâm: giải mã private payload của lô; đồng thời ngăn một admin TideCloak tự thay đổi quyền bảo vệ khi chưa đủ phê duyệt QEA. Phải chứng minh bằng truy cập hợp lệ thành công và vượt quyền thất bại, không chỉ bằng giao diện hoặc việc database chứa bản mã.

Giả định hai bên tin công thức có thể dùng để thu hẹp prototype; không giả định người vận hành được tin tuyệt đối vì sẽ làm mất rào cản cần giải quyết. Đầu vào có thể là synthetic data; không dùng giả định đầu vào thật để tuyên bố đã xác thực chứng từ.

Nếu chỉ thay đăng nhập mà mọi bảo đảm vẫn giữ nguyên, vai trò TideCloak chưa được thể hiện đủ. Mục tiêu là kiểm chứng khả năng bảo vệ quyền giải mã và thay đổi quyền, không tuyên bố đã loại bỏ mọi quyền đơn phương của dev trên toàn hệ thống.

# **3\. Chủ thể, phạm vi MVP và phần mở rộng**

Ba bên chính: Supplier (công ty nhỏ), Buyer (công ty lớn) và nền tảng ScopeZero. Admin ứng dụng vận hành hạ tầng; admin TideCloak/QEA quản trị quyền theo chính sách, tách khỏi AppRole. Buyer có thể là khách không đăng nhập vì summary được công bố công khai.

MVP v1: một vật liệu demo-material-A; bốn nguồn phát thải minh họa; tính PCF trên trình duyệt Supplier trước mã hóa; evidence dạng demo-text; lưu publicSummary và encryptedInput; Supplier xem/giải mã lô của chính mình; Buyer chỉ xem summary; mục tiêu kiểm chứng QEA nhiều admin.

Không thuộc MVP: tính PCF trên bản mã/FHE/MPC tổng quát, kiểm PKI trên dữ liệu còn mã hóa, Reviewer, phê duyệt theo từng lần truy cập, chứng nhận độc lập, upload PDF/ảnh, chữ ký bảo vệ summary, update/delete lô, phân trang và thu hồi bản sao đã tải.

Những mô tả “tính toán mù”, “bảo chứng 100%”, “không ai thấy đầu vào nhưng vẫn kiểm toán” trong các thẻ cũ được chuyển thành tầm nhìn cần cơ chế và kiểm chứng riêng; không phải tính năng sẵn có của MVP.

# **4\. Kiến trúc và luồng dữ liệu**

Trình duyệt Supplier: form → parse/validate → calculatePCF → chọn trường công bố và tạo private payload → mã hóa bằng adapter TideCloak → submitBatch. Bản rõ cần thiết cho phép tính tồn tại trên thiết bị Supplier; backend không giải mã để tính PCF.

TideCloak/Fabric: cung cấp các thao tác xác thực và bảo vệ mật mã qua SDK/cấu hình đã kiểm chứng; chi tiết tag, role, cô lập từng Supplier và QEA do thành viên 1 xác minh. Không tự thiết kế khóa, IV hoặc thuật toán thay thế.

API backend: xác minh token cho thao tác được bảo vệ; validate cấu trúc; tự tạo metadata; lưu summary và bản mã. Public API chỉ chọn các trường công khai.

Trình duyệt Buyer: getPublicBatches → danh sách/chi tiết summary. Không gọi endpoint private hoặc crypto để hiển thị kết quả.

Kho lưu trữ: MVP một tiến trình có thể dùng storage/batches.json. Database chỉ lưu dữ liệu; không phải bộ máy tính PCF. Nếu triển khai nhiều instance hoặc filesystem không bền vững, thay lớp repository bằng kho phù hợp, giữ contract.

Ranh giới bảo vệ: mã hóa trước khi gửi; không đưa private payload rõ vào API, log, analytics hoặc bản sao lưu phía server. Việc bảo vệ code frontend và tính toàn vẹn summary còn là giới hạn riêng.

# **5\. Luồng nghiệp vụ và giao diện**

Supplier: đăng nhập → nhập lô hoặc điền mẫu → kiểm tra lỗi theo field path → xem kết quả và chính xác những trường sẽ công bố → xác nhận gửi → mã hóa input/result/evidence → POST → nhận ID/thời gian. Nếu tính toán hoặc mã hóa thất bại thì không gửi; lỗi gửi giữ dữ liệu form để thử lại. Gửi trùng mã lô trả 409, không tự ghi đè.

Thông báo trước khi gửi: summary là công khai cho mọi người; đồng thời công bố total và perProduct có thể suy ra quantity. Evidence và breakdown nằm trong private payload, không đưa vào summary.

Buyer: mở trang không cần đăng nhập → tải danh sách mới nhất → tìm mã lô/sản phẩm → xem các trường công bố và phiên bản phép tính/hệ số → tải lại khi cần. Có trạng thái tải, trống, không có kết quả tìm kiếm, lỗi và dữ liệu cũ khi refresh thất bại. Dữ liệu mẫu phải chọn rõ ràng, không tự thay API lỗi bằng dữ liệu giả.

Supplier truy cập riêng: xác thực → lấy bản mã lô thuộc mình → TideCloak kiểm quyền giải mã thật. Supplier khác không được đọc/giải mã. Quyền tải bản mã và quyền giải mã là hai kiểm tra khác nhau.

Quản trị quyền: đề xuất thay đổi nhạy cảm → pending khi thiếu phê duyệt → chỉ có hiệu lực khi đủ điều kiện QEA thực tế. Phải kiểm tra quyền thực thi, không chỉ nhãn pending.

MVP chưa có yêu cầu Buyer xin Supplier duyệt từng báo cáo. Luồng yêu cầu → đồng ý/từ chối → sử dụng đúng phạm vi là hướng mở rộng, cần contract riêng.

# **6\. Dữ liệu nghiệp vụ mở rộng và xác thực nguồn**

Bốn nhóm dữ liệu từ tầm nhìn ban đầu: năng lượng (điện/nhiên liệu/năng lượng tái tạo); nguyên vật liệu (BOM, tái chế, hao hụt); vận tải đầu vào (khối lượng, quãng đường, phương tiện); chất thải và thất thoát kỹ thuật (xử lý rác, môi chất lạnh).

MVP chỉ lấy electricityKwh, materialKg của một vật liệu, inboundTransportTonKm và wasteKg; chưa bao phủ toàn bộ quy trình tính PCF theo các chuẩn quốc tế.

Hướng xác thực tương lai: hóa đơn điện và số đo; phiếu kho, chứng chỉ vật liệu và cân bằng vật chất; vận đơn/GPS/phiếu cân; nhật ký bảo trì và chứng từ xử lý chất thải. Chữ ký hợp lệ có thể giúp kiểm nguồn phát hành và tính toàn vẹn của nội dung được ký, không tự chứng minh hồ sơ đầy đủ hoặc mọi số liệu vật lý đều đúng.

Không khẳng định mọi hóa đơn đều có PKI, thiết bị không thể bị can thiệp hoặc gas nạp bù luôn bằng gas rò rỉ. Cần mô hình đo lường, kiểm toán và đối soát cụ thể. Tính đúng theo công thức không chứng minh đầu vào đúng: khai 6.000 kWh thay vì thực tế 10.000 kWh vẫn cho kết quả tính đúng trên đầu vào sai.

Kiểm toán viên được phép giải mã và tính lại là một phương án mở rộng; khi đó Supplier vẫn phải tin kiểm toán viên trong phạm vi được cấp. Tính toán bí mật không ai đọc được nguồn là phương án khác, cần công nghệ tính toán riêng tư và xác thực đầu vào riêng.

# **7\. Quy ước dữ liệu và đơn vị**

TypeScript cho code, JSON cho API và lưu trữ. Tên trường camelCase, tiếng Anh. schemaVersion: 1; hợp đồng thay đổi phá vỡ tương thích phải tăng phiên bản.

ID và thời gian truyền dưới dạng string; createdAt là ISO 8601 UTC. Giá trị số phải hữu hạn. Form giữ ô số dưới dạng chuỗi; sau parse mới tạo BatchInput chứa number.

electricityKwh: kWh; materialKg/wasteKg: kg; inboundTransportTonKm: tấn-km, 1 tấn \= 1.000 kg. Nếu UI thu khối lượng kg và quãng đường km thì quy đổi: (kg / 1000\) × km trước khi tạo input. Không nhân thêm lần nữa trong calculatePCF.

Mọi hoạt động phải được phân bổ cho chính lô đang báo cáo; không dùng điện toàn nhà máy cho một lô mà không có quy tắc phân bổ.

quantity là số sản phẩm, không phải khối lượng. Chỉ làm tròn khi hiển thị. Không lưu chuỗi đã định dạng, NaN, Infinity, undefined hoặc số âm.

Token không nằm trong payload lô và không lưu trong storage/batches.json.

# **8\. Kiểu nghiệp vụ chuẩn**

Đây là nguồn khai báo kiểu duy nhất của hợp đồng v1 trong tài liệu hợp nhất. Không đồng thời duy trì src/contracts/\* với bản sao các kiểu. Nếu chia module sau này thì src/types.ts chỉ re-export.

type MaterialType \= "demo-material-A";

type AssuranceLevel \= "supplier-reported";

interface BatchFormValues {

  batchId: string;

  productName: string;

  quantity: string;

  electricityKwh: string;

  materialType: MaterialType;

  materialKg: string;

  inboundTransportTonKm: string;

  wasteKg: string;

}

interface BatchInput {

  schemaVersion: 1;

  batchId: string;

  productName: string;

  quantity: number;

  electricityKwh: number;

  materialType: MaterialType;

  materialKg: number;

  inboundTransportTonKm: number;

  wasteKg: number;

}

interface PCFResult {

  totalKgCO2e: number;

  perProductKgCO2e: number;

  breakdown: {

    electricityKgCO2e: number;

    materialsKgCO2e: number;

    transportKgCO2e: number;

    wasteKgCO2e: number;

  };

  factorVersion: "demo-factors-v1";

  calculationVersion: "pcf-v1";

}

interface EvidenceInput {

  kind: "demo-text";

  text: string;

}

interface PrivateBatchPayload {

  schemaVersion: 1;

  input: BatchInput;

  result: PCFResult;

  evidence: EvidenceInput | null;

}

Evidence là ghi chú/bằng chứng giả lập dạng text trong v1, không phải hóa đơn đã xác thực. Không tham gia phép tính PCF; được mã hóa cùng input và result. Chưa hỗ trợ upload PDF, ảnh hoặc kiểm tra PKI.

# **9\. Validation và hợp đồng hàm PCF**

interface FieldError {

  path: string;

  code: "REQUIRED" | "INVALID\_NUMBER" | "OUT\_OF\_RANGE"

      | "UNSUPPORTED\_VALUE" | "INVALID\_FORMAT";

  message: string;

}

type ValidationResult\<T\> \=

  | { ok: true; value: T }

  | { ok: false; errors: FieldError\[\] };

function parseBatchForm(

  values: BatchFormValues

): ValidationResult\<BatchInput\>;

function validate(

  input: unknown

): ValidationResult\<BatchInput\>;

function calculatePCF(input: BatchInput): PCFResult;

parseBatchForm trim/chuyển kiểu rồi gọi validate. validate nhận unknown để kiểm dữ liệu thật lúc chạy, trả input đã chuẩn hóa; không chỉ dùng TypeScript cast.

calculatePCF đồng bộ, không gọi mạng, database, UI hoặc SDK. Chỉ nhận dữ liệu hợp lệ; vẫn từ chối đầu vào sai khi bị gọi trực tiếp. Lỗi kiểm tra dùng ContractError ở mục 13 với status \= null.

batchId: 1–64 ký tự sau trim, chỉ A–Z, a–z, 0–9, dấu gạch ngang và gạch dưới; phân biệt hoa/thường.

productName: 1–120 ký tự sau trim.

quantity: số nguyên 1–1.000.000.000. electricityKwh/materialKg/inboundTransportTonKm/wasteKg: number hữu hạn từ 0 đến 1.000.000.000.

materialType phải là demo-material-A; schemaVersion phải là 1\. Ô số trống là REQUIRED, không tự đổi thành 0\. Không nhận chuỗi số ở validate; việc chuyển chuỗi chỉ thuộc parseBatchForm.

evidence.text nếu có: 1–10.000 ký tự sau trim. Đây là validation cho private payload ở trình duyệt; server không thấy nội dung đã mã hóa.

# **10\. Công thức, hệ số và fixture chuẩn**

Bộ demo-factors-v1, chỉ minh họa:

Điện: 0,5 kg CO2e/kWh.

Vật liệu demo-material-A: 2 kg CO2e/kg.

Vận tải đầu vào: 0,1 kg CO2e/tấn-km.

Chất thải: 0,5 kg CO2e/kg; giả định một cách xử lý cố định trong demo.

Điện \= electricityKwh × 0,5.

Vật liệu \= materialKg × 2\.

Vận tải \= inboundTransportTonKm × 0,1.

Chất thải \= wasteKg × 0,5.

totalKgCO2e \= tổng bốn khoản; perProductKgCO2e \= totalKgCO2e / quantity.

Bộ hệ số cố định nằm trong src/lib/pcf/factors.ts, không nhận hệ số tùy ý từ form.

Fixture hợp lệ trong src/data/demoBatch.ts:

const demoBatch: BatchInput \= {

  schemaVersion: 1,

  batchId: "DEMO-001",

  productName: "Demo fastener",

  quantity: 1000,

  electricityKwh: 1200,

  materialType: "demo-material-A",

  materialKg: 500,

  inboundTransportTonKm: 800,

  wasteKg: 20

};

Kết quả chuẩn:

breakdown \= {

  electricityKgCO2e: 600,

  materialsKgCO2e: 1000,

  transportKgCO2e: 80,

  wasteKgCO2e: 10

};

totalKgCO2e \= 1690; perProductKgCO2e \= 1.69.

factorVersion \= "demo-factors-v1"; calculationVersion \= "pcf-v1".

Fixture lỗi: cùng dữ liệu trên nhưng quantity \= 0; validate trả lỗi OUT\_OF\_RANGE tại path "quantity". Kiểm tra thêm dữ liệu thiếu, âm và không hữu hạn.

Không giới thiệu đây là hệ số chính thức hay kết quả đạt chứng nhận ISO/GHG/PACT.

# **11\. Dữ liệu công bố, bản mã và lưu trữ**

interface PublicSummary {

  batchId: string;

  productName: string;

  totalKgCO2e: number;

  perProductKgCO2e: number;

  factorVersion: "demo-factors-v1";

  calculationVersion: "pcf-v1";

  assuranceLevel: AssuranceLevel;

}

interface EncryptedPayload {

  provider: "tidecloak";

  formatVersion: 1;

  serialized: string;

}

interface CreateBatchRequest {

  schemaVersion: 1;

  publicSummary: PublicSummary;

  encryptedInput: EncryptedPayload;

}

interface StoredBatch {

  id: string;

  supplierId: string;

  createdAt: string;

  schemaVersion: 1;

  publicSummary: PublicSummary;

  encryptedInput: EncryptedPayload;

}

interface PublicBatch {

  id: string;

  createdAt: string;

  publicSummary: PublicSummary;

}

interface CreateBatchResponse {

  id: string;

  createdAt: string;

}

interface ListPublicBatchesResponse {

  items: PublicBatch\[\];

}

Supplier tạo publicSummary bằng cách chọn trường từ input/result; không spread toàn bộ input. result.breakdown được giữ trong private payload, không công bố trong v1.

Quyết định MVP: Buyer công khai xem summary, không cần đăng nhập. “public” là mọi người có thể đọc, không chỉ khách hàng của Supplier.

Công bố đồng thời total và perProduct có thể suy ra quantity. v1 chấp nhận công bố gián tiếp số lượng để giữ hai chỉ số đã chọn; UI phải báo rõ trước khi gửi. Không tuyên bố quantity được giữ bí mật.

supplierId lấy từ claim sub của token đã xác minh trong một issuer/realm cố định; không lấy từ JSON. id dùng UUID do server sinh; createdAt do server tạo.

Server chỉ lưu summary \+ bản mã \+ metadata. PrivateBatchPayload không gửi rõ tới API, log hay analytics.

EncryptedPayload là wrapper nội bộ, không phải schema SDK TideCloak. serialized phải bảo toàn toàn bộ cấu trúc cần giải mã từ SDK; không tự viết thuật toán hoặc bỏ metadata.

# **12\. Auth, crypto adapter và quyền**

type AppRole \= "supplier" | "buyer";

interface AuthSession {

  subject: string;

  roles: AppRole\[\];

}

interface AuthAdapter {

  getSession(): Promise\<AuthSession | null\>;

  login(): Promise\<void\>;

  logout(): Promise\<void\>;

}

interface BatchCrypto {

  encryptBatch(

    payload: PrivateBatchPayload

  ): Promise\<EncryptedPayload\>;

  decryptBatch(

    payload: EncryptedPayload

  ): Promise\<PrivateBatchPayload\>;

}

AuthSession chỉ phục vụ UI. Server phải kiểm chữ ký token, issuer, audience theo cấu hình triển khai, thời hạn và role; không tin object session client gửi.

API client tự lấy access token từ auth adapter/SDK theo cấu hình, không yêu cầu Supplier UI truyền token vào submitBatch.

Quyền v1:

Supplier: tạo lô, lấy bản mã lô của chính mình, giải mã lô của chính mình qua chính sách E2EE đã cấu hình.

Supplier khác: không đọc/giải mã private payload của lô không thuộc mình.

Buyer/khách: chỉ xem publicSummary, không tạo lô hoặc giải mã.

Admin vận hành ứng dụng: không được mặc định cấp quyền giải mã chỉ vì có quyền admin.

Vai trò quản trị TideCloak/QEA tách khỏi AppRole; không đưa role admin ứng dụng vào đường tắt bỏ kiểm quyền.

encryptBatch phải dùng cơ chế bảo vệ theo từng chủ thể/lô phù hợp SDK. Không mặc định gán cùng một tag giải mã cho tất cả Supplier.

Người 1 phải xác minh tag, role E2EE và định dạng SDK thật; chi tiết này nằm trong src/lib/tide\*. Nếu cơ chế thực tế chưa cô lập được quyền giữa Supplier thì phải báo là điều kiện chặn demo, không thay bằng checkbox hoặc kiểm tra UI.

# **13\. API và mô hình lỗi**

interface ApiError {

  error: {

    code: "UNAUTHENTICATED" | "FORBIDDEN"

        | "VALIDATION\_ERROR" | "NOT\_FOUND"

        | "CONFLICT" | "PAYLOAD\_TOO\_LARGE"

        | "INTERNAL\_ERROR";

    message: string;

    fields?: FieldError\[\];

  };

}

class ContractError extends Error {

  status: number | null; // null cho validation/local/network

  code: ApiError\["error"\]\["code"\]

      | "ACCESS\_DENIED" | "CRYPTO\_FAILED" | "NETWORK\_ERROR";

  fields?: FieldError\[\];

}

interface BatchApi {

  submitBatch(

    request: CreateBatchRequest

  ): Promise\<CreateBatchResponse\>;

  getPublicBatches(): Promise\<ListPublicBatchesResponse\>;

  getEncryptedBatch(id: string): Promise\<EncryptedPayload\>;

}

POST /api/batches

Authorization: Bearer \<access token\>. JSON body: CreateBatchRequest.

201: CreateBatchResponse.

401 nếu token thiếu/không hợp lệ; 403 nếu thiếu role supplier; 400 nếu sai schema; 409 nếu trùng (supplierId, publicSummary.batchId); 413 nếu body quá lớn.

Gửi lặp cùng mã lô trong v1 bị 409, không tự tạo thêm bản ghi, không tự ghi đè. Chưa có update/delete hoặc cơ chế idempotency key.

GET /api/batches/public

Không cần auth, không có body. 200: ListPublicBatchesResponse. items sắp theo createdAt giảm dần, nếu bằng nhau theo id tăng dần.

v1 trả toàn bộ danh sách demo; chưa phân trang. items chỉ là PublicBatch\[\], không được vô tình trả supplierId hoặc encryptedInput.

GET /api/batches/:id/encrypted

Yêu cầu token hợp lệ; 401 nếu không hợp lệ; 403 nếu thiếu role supplier. 200: EncryptedPayload khi chủ thể là chủ lô.

404 nếu không có lô hoặc lô thuộc Supplier khác để tránh tiết lộ tồn tại. id trong route là UUID server, không phải batchId.

Việc tải bản mã không thay thế kiểm quyền giải mã của TideCloak.

Lỗi HTTP trả ApiError; thành công trả trực tiếp kiểu response, không bọc thêm data. Api client resolve kiểu thành công và reject ContractError nếu lỗi, gồm lỗi mạng. Crypto adapter reject ACCESS\_DENIED hoặc CRYPTO\_FAILED.

500 không lộ stack trace, token hoặc private payload. message dùng để hiển thị; UI xử lý theo code/status, không so sánh chuỗi message.

# **14\. Validation server và repository**

Body POST tối đa 256 KiB UTF-8; serialized là chuỗi không rỗng tối đa 200.000 ký tự. Chỉ chấp nhận provider/formatVersion/schemaVersion đúng giá trị v1; không coi bản mã đúng cấu trúc là bằng chứng mã hóa hợp lệ.

publicSummary: batchId/productName theo giới hạn mục 9; total/perProduct hữu hạn, không âm; factorVersion/calculationVersion/assuranceLevel phải đúng literal v1. Không nhận trường thừa ở object contract v1, bao gồm supplierId, id, createdAt trong request.

Server không xác nhận được total/perProduct khớp input vì input đã mã hóa. Không tự suy ra rồi gán verified.

Storage MVP: storage/batches.json ở phía server, không commit dữ liệu phát sinh. serialize thao tác ghi và kiểm tra trùng trong cùng thao tác để tránh ghi đè khi có request đồng thời; ghi file tạm rồi thay thế.

File JSON chỉ phù hợp demo một tiến trình trên filesystem có thể ghi và tồn tại. Nếu deploy nhiều instance hoặc filesystem tạm/read-only, phải dùng kho lưu trữ phù hợp; chỉ thay lớp repository, giữ nguyên contract API và calculatePCF.

Không cần NoSQL cho phép tính. Database không phải bộ máy tính PCF.

# **15\. QEA, quyền dev và giới hạn bảo đảm**

Mục tiêu cấu hình QEA để kiểm chứng là 3 tài khoản admin TideCloak độc lập và một thay đổi nhạy cảm cần ít nhất 2 người phê duyệt. Người 1 phải kiểm tra đúng cách tính ngưỡng và ý nghĩa từng phiếu của phiên bản đang chạy; không mặc định mọi phiên bản đều có cùng hành vi.

Chứng minh: một admin đề xuất cấp quyền giải mã → chưa đủ phê duyệt thì pending và người đó vẫn không giải mã được → đủ phê duyệt theo cấu hình thì thay đổi mới có hiệu lực.

Bảo vệ cả đường đổi role/quyền, thay người phê duyệt hoặc giảm ngưỡng theo phạm vi TideCloak thực sự hỗ trợ. Nếu có đường vòng chưa chặn thì ghi rõ; không tuyên bố đã loại bỏ quyền đơn phương toàn hệ thống.

QEA không tự bảo vệ code frontend, pipeline triển khai hoặc dữ liệu publicSummary trong database. Dev kiểm soát frontend có thể sửa code thu dữ liệu trước mã hóa; dev kiểm soát backend có thể sửa summary.

MVP không chứng minh chứng từ có thật, không chứng minh Supplier gửi đúng phép tính, không xác thực PKI trên bản mã và không bảo chứng chuẩn quốc tế.

Chưa có Reviewer, grant theo từng lần truy cập, thu hồi bản sao đã tải, chữ ký bảo vệ publicSummary hoặc tính toán bí mật. Nếu mở rộng phải có contract và kiểm thử riêng.

Bổ sung: dữ liệu kết quả cũng có thể tiết lộ thông tin qua nhiều truy vấn; MVP cố định các trường công bố và chưa tuyên bố chống mọi suy luận. Thu hồi quyền tương lai chỉ có thể được mô tả theo cơ chế đã kiểm chứng; không mặc nhiên xóa được dữ liệu người nhận đã sao chép.

# **16\. Scaffold và cấu trúc triển khai đề xuất**

Đề xuất cần cả nhóm xác nhận: Next.js \+ React \+ TypeScript, tiếp tục các đường dẫn đã dùng trong phần Buyer và hợp đồng v1. Đây là cấu trúc tham chiếu thống nhất của tài liệu này; chưa có xác nhận stack đã được nhóm chốt hoặc scaffold đã tồn tại trên main.

src/app/layout.tsx — root layout; src/app/supplier/\*\* — Supplier; src/app/buyer/\*\* — Buyer; src/app/api/\*\* — route API.

src/components/Supplier\* và src/components/Buyer\* — UI; src/types.ts — nguồn types duy nhất; src/lib/pcf/\*\* — logic; src/lib/tide\* — auth/crypto; src/lib/api\* — client; src/data/demoBatch.ts — fixture.

infra/tidecloak/ — cấu hình không chứa bí mật; storage/batches.json — dữ liệu phát sinh không commit; docs/ — quyết định và bàn giao; scripts/ — lệnh chung; demo/ — tài sản demo ở giai đoạn sau.

Sơ đồ frontend/supplier, frontend/buyer, backend/access, backend/reporting và data/sample ở scaffold cũ là cách phân nhóm trách nhiệm, không được triển khai song song như bộ code thứ hai nếu chọn Next.js. Thành viên 1 xác định module server cụ thể. Nếu nhóm chọn stack khác, phải cập nhật cấu trúc, route và tác động tới code trước tích hợp.

# **17\. Dependency, cấu hình và môi trường chung**

Thành viên 1 chủ trì package.json, đúng một lockfile, phiên bản Node/package manager, cấu hình TypeScript, entry/root layout và hỗ trợ CSS Modules.

Nếu chọn Next.js: dependencies next, react, react-dom; dev dependencies typescript, @types/node, @types/react, @types/react-dom. React và react-dom cùng phiên bản chính xác; typings cùng major React; bộ phiên bản tương thích với Next.js đã chọn. Chưa chốt số phiên bản trong tài liệu này; không để mỗi người tự cài latest.

Bàn giao scripts dev, build, start, typecheck và test phù hợp; .gitignore loại node\_modules, build output, credentials và dữ liệu phát sinh; file môi trường mẫu chỉ chứa tên biến hoặc giá trị giả. next-env.d.ts được quản lý theo cơ chế Next.js.

Các thành viên lấy cấu hình chung rồi cài từ lockfile; nếu dùng npm thì npm ci tại thư mục chứa package.json. Thành viên 3 và 4 cần React/typings để phát triển UI; thành viên 1 cần khi tích hợp frontend; thành viên 2 chỉ làm logic TypeScript không bắt buộc React, nhưng dùng dependency chung khi chạy toàn app.

docs/project-context.md phải được viết/commit: stack/phiên bản, cấu trúc có hiệu lực, lệnh chạy, types/API, quyền và điểm mã hóa, trạng thái triển khai và giới hạn. Đây là tài liệu, không phải package cần cài.

# **18\. Phân công bốn thành viên và bàn giao**

Thành viên 1 — feat/tide-backend: scaffold/dependency/lockfile, src/types.ts, AuthAdapter/BatchCrypto/BatchApi, API, repository và cấu hình TideCloak/QEA. Bàn giao source getPublicBatches, server auth, cô lập từng Supplier và kiểm thử quyền thực tế; SDK chưa đạt phải báo blocker.

Thành viên 2 — feat/pcf-data: factors/validate/calculate/tests và demoBatch. Bàn giao parseBatchForm, validate, calculatePCF; fixture hợp lệ/lỗi; kết quả tính tay 1690 / 1.69; ghi rõ hệ số minh họa. Không sinh verified.

Thành viên 3 — feat/supplier-ui: form, điền mẫu, lỗi theo path, công bố dữ liệu rõ ràng, luồng parse → calculate → tạo payload → encrypt → submit; giữ form khi gửi lỗi. Không dùng StoredBatch làm request hoặc viết validation riêng trái với thành viên 2\.

Thành viên 4 — feat/buyer-ui: danh sách/chi tiết publicSummary, tìm kiếm, tải lại và trạng thái tải/trống/lỗi; chỉ gọi getPublicBatches, hiển thị “Supplier tự khai báo”, không breakdown/verified. Trước mắt ưu tiên Buyer và thử kết nối API; chưa làm README hoặc demo.

README sẽ xử lý sau khi các phần khác hoàn thành; demo do cả nhóm phối hợp ở giai đoạn sau, theo điều chỉnh mới nhất của người phụ trách. Phân công cũ giao toàn bộ video cho thành viên 4 không còn là yêu cầu hiện tại.

Không sửa chéo file; chỉ một người cập nhật types/API chung sau khi nhóm thống nhất và báo phần bị ảnh hưởng. Nếu dùng cùng máy, dùng worktree hoặc clone riêng, không đổi branch liên tục trong một thư mục.

# **19\. Ghép hệ thống và tiêu chí nghiệm thu**

Nền tảng chung trước: stack/đường dẫn/contract/fixture → pcf-data → tide-backend → supplier-ui → buyer-ui. UI có thể làm trước bằng mock cùng interface và Promise; mock crypto không được dùng làm bằng chứng bảo mật.

Scaffold: checkout sạch cài theo lockfile; dev mở được route; typecheck không lỗi react/jsx-runtime/types/CSS; build qua khi các entry cần thiết có đủ. Người bàn giao nêu branch/commit, thư mục chạy lệnh, phiên bản và kiểm tra đã chạy.

Logic: dữ liệu chuẩn tính ra 600 \+ 1000 \+ 80 \+ 10 \= 1690 và 1.69; quantity \= 0, thiếu/âm/không hữu hạn bị từ chối.

API: server tự đặt id/supplierId/createdAt; lô trùng trả 409; payload quá lớn trả 413; xác thực và quyền ghi kiểm ở server; public API chỉ PublicBatch.

Dữ liệu riêng: request/storage/log không chứa input/evidence rõ; chủ lô giải mã thật thành công; Supplier khác và Buyer không đọc/giải mã được. Không kết luận mã hóa thành công chỉ vì serialized là chuỗi.

QEA: một admin chưa đủ phê duyệt không tự cấp quyền giải mã được; kiểm tra đường đổi role/policy, người phê duyệt và ngưỡng theo khả năng thực tế.

Buyer: tìm kiếm, chi tiết, empty/zero/loading/error/retry hoạt động; API lỗi không đổi sang mock; responsive và bàn phím cần kiểm tra trên app thật.

Các mốc 150 phút trong thẻ Chia việc cũ là kế hoạch tham khảo: nền tảng 10–15 phút; làm song song đến phút 60; ghép 60–85; kiểm thử 85–120; tài liệu/demo 120–150. Không xem là tiến độ đã đạt hoặc thay thế kế hoạch hiện tại.

# **20\. Trạng thái đã biết và các quyết định còn mở**

Quan sát checkout Buyer tại thời điểm kiểm tra: có mã Buyer dưới src/app/buyer và src/components/Buyer; chưa có package.json, lockfile, cấu hình app/types chung. Sáu kiểm tra Buyer chạy qua trong harness React/Babel riêng và source style lint qua; chưa có build Next.js, typecheck chung hay kiểm tra trực quan browser.

Cài dependency trong môi trường hiện tại bị DNS ENOTFOUND registry.npmjs.org; mở server/browser cũng bị sandbox chặn. Đây là trở ngại môi trường kiểm tra, không phải bằng chứng code các thành viên khác chưa tồn tại.

Branch/máy riêng của các thành viên khác chưa được kiểm chứng. Nếu đã có scaffold thì bàn giao commit, không tạo lại.

Cần nhóm xác nhận: stack và phiên bản; cấu trúc duy nhất; contract v1 là nguồn triển khai; công bố tổng và mỗi sản phẩm dù suy ra số lượng; GET public không auth; một vật liệu và demo-text; chưa Reviewer.

Thành viên 1 cần kiểm chứng: schema SDK, tag/role E2EE, cô lập quyền từng Supplier, quorum và các đường thay đổi quyền. Không điền trạng thái “đã bảo vệ” trước khi kiểm thử.

Hướng phát triển: dữ liệu nhiều vật liệu/phương tiện, xác thực bằng chứng, Reviewer có điều kiện, bảo vệ tính toàn vẹn summary, kiểm soát triển khai nhiều bên, lưu trữ sản xuất và tính toán riêng tư. Mỗi phần cần contract và tiêu chí riêng.

# **21\. Tài liệu nộp bài và tham chiếu**

Giai đoạn sau: README có mô tả dự án và năm câu trả lời theo đề trong phần overview tối đa 300 từ; hướng dẫn cài chạy ở phần riêng. Repo GitHub công khai chứa code và video .mp4 dài hai phút, dưới 100 MB theo REQUEST.md. Đối chiếu lại kênh/hạn nộp từ bản đề trước khi nộp; tài liệu này không xác minh cập nhật của ban tổ chức.

Video cần cho thấy hoạt động hữu ích, rào cản niềm tin, prototype thật và khả năng mở ra. Hai bằng chứng an ninh dự kiến: Buyer không giải mã được; một admin chưa đủ phê duyệt không tự cấp quyền. Cả nhóm thực hiện sau, không thuộc đợt ưu tiên Buyer hiện tại.

Forseti: https\://docs.tide.org/Core-Concepts/forseti-engine

Architecture: https\://docs.tide.org/architecture

Yêu cầu Challenge 2: REQUEST.md trong workspace; đây là bản tổng hợp đề, không phải xác nhận triển khai TideCloak.

Đối chiếu tên cũ khi chuyển code: batchCode → batchId; factorSetId → factorVersion; supplier-declared → supplier-reported; createBatch/listPublicBatches → submitBatch/getPublicBatches. Không giữ alias cũ đồng thời trong API v1; không tự migration dữ liệu nếu chưa kiểm tra.

Mẫu phản hồi nhóm: Mục số | Đồng ý/Đề nghị sửa | Nội dung cụ thể | Người xử lý | Trạng thái/commit bằng chứng.

# **22\.  Ba lưu ý kỹ thuật** 

Khi đưa prompt cho AI agent triển khai mã nguồn, bạn cần nhắc AI chú ý 3 lỗi cú pháp phổ biến sau của TideCloak SDK:

1. **Dữ liệu đầu vào của hàm mã hóa:**  
   SDK của Tide yêu cầu dữ liệu đưa vào hàm mã hóa phải là dạng **string** hoặc **Uint8Array** (không được truyền trực tiếp một JavaScript Object {}).  
    *Xử lý:* Trước khi gọi lệnh mã hóa dữ liệu hóa đơn, luôn phải chạy JSON.stringify(internalFinancials).  
2. **Khớp chính xác tên thẻ (Tags):**  
   TideCloak yêu cầu thẻ dùng để giải mã phải **trùng khớp từng ký tự** với thẻ đã dùng khi mã hóa. Giữ nguyên quy ước hằng số (constants) như trong context:  
   * TAG\_SUPPLIER\_INTERNAL \= "\_tide\_supplier\_internal"  
   * TAG\_SCOPE3\_VERIFIED \= "\_tide\_scope3\_verified"  
3. **Cấu hình Client trong TideCloak Console:**  
   Khi khởi chạy TideCloak bằng Docker, nhớ cấu hình Client ID (ví dụ: scopezero-web), bật chế độ Standard Flow, đặt Valid Redirect URIs là http\://localhost:5173/\*, và tải file cấu hình tidecloak.json đặt vào thư mục gốc của dự án frontend.


# Backend — Overview & Placement Map

> **Mục tiêu**: Thư mục chứa toàn bộ logic xử lý phía server và tính toán PCF.

---

## Cấu trúc thư mục
* [`access/`](./access/): [Member 1] Protected input path, xác thực token TideCloak, kiểm soát quyền truy cập và lưu trữ tài liệu JSON (`storage/batches.json`).
* [`reporting/`](./reporting/): [Member 2] Logic tính toán PCF thuần túy (`calculatePCF`), bộ quy tắc validation (`parseBatchForm`), hệ số phát thải mẫu (`demo-factors-v1`) và bộ kiểm thử tự động.

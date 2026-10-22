# Backend — Reporting & PCF Calculation Logic

> **Phụ trách**: Member 2 — logic/data  
> **Mục tiêu**: Cung cấp bộ máy tính toán PCF thuần túy (pure TypeScript), độc lập hoàn toàn với database và backend; bộ quy tắc xác thực dữ liệu đầu vào; bộ hệ số mẫu và các kiểm thử tự động.

---

## 1. Cấu trúc Module
* [`types.ts`](./types.ts): Khai báo toàn bộ kiểu dữ liệu dùng chung (Single Source of Truth) theo Unified Contract v1.
* [`factors.ts`](./factors.ts): Bảng hệ số mẫu `demo-factors-v1` (Điện: 0.5, Vật liệu A: 2.0, Vận tải: 0.1, Chất thải: 0.5).
* [`validate.ts`](./validate.ts): Hàm `parseBatchForm(values)`, `validate(input)`, `validateEvidence(evidence)` kiểm tra kiểu dữ liệu, regex `batchId`, giới hạn $10^9$.
* [`calculate.ts`](./calculate.ts): Hàm `calculatePCF(input)`, `createPublicSummary(input, result)`, `createPrivateBatchPayload(input, result, evidence)`, `formatPCFForDisplay(result)`.
* [`calculate.test.ts`](./calculate.test.ts): 21 ca kiểm thử bao phủ toàn diện 100% logic, tính toán tay, ngoại lệ `ContractError`, regex và validation.

---

## 2. API Cung cấp cho các Thành viên khác
```typescript
import {
  calculatePCF,
  createPublicSummary,
  createPrivateBatchPayload,
  formatPCFForDisplay
} from "./calculate.ts";
import { parseBatchForm, validate, validateEvidence } from "./validate.ts";
import { DEMO_EMISSION_FACTORS, FACTOR_VERSION } from "./factors.ts";
import type { BatchFormValues, BatchInput, PCFResult, PublicSummary, PrivateBatchPayload } from "./types.ts";
```

---

## 3. Chạy Kiểm thử
```bash
npm test
# hoặc:
node --test --experimental-strip-types backend/reporting/calculate.test.ts
```

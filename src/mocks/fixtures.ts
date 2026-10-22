/**
 * @file src/mocks/fixtures.ts
 * @description Bộ dữ liệu Mock toàn diện (Mock Data & Fixtures) phục vụ:
 * 1. Member 3 (Supplier UI): Dữ liệu form mẫu, bằng chứng chứng từ mẫu, kịch bản thử nghiệm form.
 * 2. Member 4 (Buyer UI): Danh sách lô hàng công khai (PublicBatch[]), phân trang mock, tìm kiếm mock.
 * 3. Member 1 (Tide/backend): Dữ liệu lưu trữ mẫu (StoredBatch[]), seed file cho storage/batches.json.
 * 4. MockBatchApi: Giả lập API client đầy đủ với Promise & Network latency để test UI độc lập.
 */

import { calculatePCF, createPrivateBatchPayload, createPublicSummary } from "../lib/pcf/calculate.ts";
import {
  ContractError,
  type BatchApi,
  type BatchFormValues,
  type BatchInput,
  type CreateBatchRequest,
  type CreateBatchResponse,
  type EncryptedPayload,
  type EvidenceInput,
  type ListPublicBatchesResponse,
  type PrivateBatchPayload,
  type PublicBatch,
  type StoredBatch,
} from "../types.ts";

// Re-export toàn bộ dữ liệu demo chuẩn và các ca lỗi biên từ demoBatch.ts
export * from "../data/demoBatch.ts";

// ============================================================================
// 1. Mock Encrypted Payload Helper
// ============================================================================

/**
 * Sinh chuỗi bản mã mock mô phỏng đầu ra của TideCloak SDK
 */
export function createMockEncryptedPayload(batchId: string): EncryptedPayload {
  return {
    provider: "tidecloak",
    formatVersion: 1,
    serialized: `tidecloak:e2ee:v1:aes-256-gcm:mock-cipher-payload-for-${batchId}-signed-by-tide-network`,
  };
}

// ============================================================================
// 2. Danh mục các Lô hàng Mẫu Hợp lệ Đa dạng (Diverse Batch Inputs)
// ============================================================================

export const mockBatchInputs: Record<string, BatchInput> = {
  // Lô 1: Lô chuẩn Benchmark DEMO-001 (Fastener)
  "DEMO-001": {
    schemaVersion: 1,
    batchId: "DEMO-001",
    productName: "Demo fastener",
    quantity: 1000,
    electricityKwh: 1200,
    materialType: "demo-material-A",
    materialKg: 500,
    inboundTransportTonKm: 800,
    wasteKg: 20,
  },

  // Lô 2: Linh kiện khung gá (Bracket Assembly) - Sản lượng lớn 2.000 cái
  "BATCH-2026-ENG-002": {
    schemaVersion: 1,
    batchId: "BATCH-2026-ENG-002",
    productName: "Khung hợp kim chịu lực Bracket-V2",
    quantity: 2000,
    electricityKwh: 2500, // 2500 * 0.5 = 1250
    materialType: "demo-material-A",
    materialKg: 1200, // 1200 * 2.0 = 2400
    inboundTransportTonKm: 6500, // 6500 * 0.1 = 650
    wasteKg: 100, // 100 * 0.5 = 50 -> Tổng = 4350, Mỗi cái = 2.175
  },

  // Lô 3: Ti van áp suất cao (High-pressure valve pin) - Lô nhỏ 500 cái
  "BATCH-2026-VALVE-003": {
    schemaVersion: 1,
    batchId: "BATCH-2026-VALVE-003",
    productName: "Ti van điều áp thủy lực Valve-Pin",
    quantity: 500,
    electricityKwh: 600, // 600 * 0.5 = 300
    materialType: "demo-material-A",
    materialKg: 200, // 200 * 2.0 = 400
    inboundTransportTonKm: 1250, // 1250 * 0.1 = 125
    wasteKg: 40, // 40 * 0.5 = 20 -> Tổng = 845, Mỗi cái = 1.69
  },

  // Lô 4: Bánh răng xoắn chính xác (Helical Gear) - 1.500 cái
  "BATCH-2026-GEAR-004": {
    schemaVersion: 1,
    batchId: "BATCH-2026-GEAR-004",
    productName: "Bánh răng truyền động xoắn Gear-Pro",
    quantity: 1500,
    electricityKwh: 1800, // 1800 * 0.5 = 900
    materialType: "demo-material-A",
    materialKg: 750, // 750 * 2.0 = 1500
    inboundTransportTonKm: 1000, // 1000 * 0.1 = 100
    wasteKg: 70, // 70 * 0.5 = 35 -> Tổng = 2535, Mỗi cái = 1.69
  },

  // Lô 5: Vỏ cảm biến công nghiệp (Sensor Housing) - Lô mẫu 300 cái
  "BATCH-2026-SENSOR-005": {
    schemaVersion: 1,
    batchId: "BATCH-2026-SENSOR-005",
    productName: "Vỏ bảo vệ cảm biến quang học",
    quantity: 300,
    electricityKwh: 350, // 350 * 0.5 = 175
    materialType: "demo-material-A",
    materialKg: 140, // 140 * 2.0 = 280
    inboundTransportTonKm: 420, // 420 * 0.1 = 42
    wasteKg: 20, // 20 * 0.5 = 10 -> Tổng = 507, Mỗi cái = 1.69
  },
};

// ============================================================================
// 3. Mock Bằng chứng Chứng từ Đa dạng (Evidence Inputs)
// ============================================================================

export const mockEvidencePresets: Record<string, EvidenceInput> = {
  powerInvoice: {
    kind: "demo-text",
    text: "Hóa đơn điện lực EVN số 0049219 (Kỳ 09/2026) — Điện năng tiêu thụ phân bổ: 1.200 kWh. Mã trạm biến áp: TBA-KCN-TBD-04.",
  },
  materialBOM: {
    kind: "demo-text",
    text: "Phiếu xuất kho nguyên vật liệu số PXK-2026-8812: 500 kg hợp kim demo-material-A (Lô phôi đúc chứng chỉ CO/CQ #99218).",
  },
  logisticsWaybill: {
    kind: "demo-text",
    text: "Vận đơn vận tải Logistics Xanh Trans số BL-88219: Quãng đường 100 km, xe tải 8 tấn, định mức phát thải 0,1 kg CO2e/tấn-km.",
  },
  wasteDisposalManifest: {
    kind: "demo-text",
    text: "Biên bản bàn giao phế liệu & chất thải công nghiệp phát sinh: 20 kg phôi vụn giao cho Công ty Xử lý Môi trường Xanh.",
  },
};

// ============================================================================
// 4. Mock Danh sách Lô hàng Công khai cho Buyer (Public Batches Mock)
// Phục vụ Member 4 phát triển Buyer Dashboard ngay lập tức
// ============================================================================

export const mockPublicBatches: PublicBatch[] = [
  {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    createdAt: "2026-10-22T08:30:00.000Z",
    publicSummary: createPublicSummary(
      mockBatchInputs["BATCH-2026-SENSOR-005"],
      calculatePCF(mockBatchInputs["BATCH-2026-SENSOR-005"])
    ),
  },
  {
    id: "7c1deb4d-2a6c-4cad-8acd-1a0c6a2cba5c",
    createdAt: "2026-10-22T08:15:00.000Z",
    publicSummary: createPublicSummary(
      mockBatchInputs["BATCH-2026-GEAR-004"],
      calculatePCF(mockBatchInputs["BATCH-2026-GEAR-004"])
    ),
  },
  {
    id: "5b1deb4d-1a5b-4bad-7abd-0a0b5a1ba94b",
    createdAt: "2026-10-22T07:45:00.000Z",
    publicSummary: createPublicSummary(
      mockBatchInputs["BATCH-2026-VALVE-003"],
      calculatePCF(mockBatchInputs["BATCH-2026-VALVE-003"])
    ),
  },
  {
    id: "3a1deb4d-0a4a-4aad-6aad-9a0a4a0aa83a",
    createdAt: "2026-10-22T07:00:00.000Z",
    publicSummary: createPublicSummary(
      mockBatchInputs["BATCH-2026-ENG-002"],
      calculatePCF(mockBatchInputs["BATCH-2026-ENG-002"])
    ),
  },
  {
    id: "1f1deb4d-9a3f-4fad-5afd-8a0f3f9ff72f",
    createdAt: "2026-10-22T06:30:00.000Z",
    publicSummary: createPublicSummary(
      mockBatchInputs["DEMO-001"],
      calculatePCF(mockBatchInputs["DEMO-001"])
    ),
  },
];

export const mockListPublicBatchesResponse: ListPublicBatchesResponse = {
  items: mockPublicBatches,
};

// ============================================================================
// 5. Mock Dữ liệu Lưu trữ Server (Stored Batches Mock)
// Phục vụ Member 1 làm seed data cho storage/batches.json và test API
// ============================================================================

export const mockStoredBatches: StoredBatch[] = mockPublicBatches.map(
  (pb, idx) => ({
    id: pb.id,
    supplierId: `supplier-user-sub-00${(idx % 2) + 1}`, // Giả lập 2 supplier khác nhau
    createdAt: pb.createdAt,
    schemaVersion: 1,
    publicSummary: pb.publicSummary,
    encryptedInput: createMockEncryptedPayload(pb.publicSummary.batchId),
  })
);

// ============================================================================
// 6. Mock Presets cho Supplier UI Form (Quick Fill Buttons)
// ============================================================================

export const mockSupplierFormPresets: Record<string, BatchFormValues> = {
  standardFastener: {
    batchId: "DEMO-001",
    productName: "Demo fastener",
    quantity: "1000",
    electricityKwh: "1200",
    materialType: "demo-material-A",
    materialKg: "500",
    inboundTransportTonKm: "800",
    wasteKg: "20",
  },
  heavyBracket: {
    batchId: "BATCH-2026-ENG-002",
    productName: "Khung hợp kim chịu lực Bracket-V2",
    quantity: "2000",
    electricityKwh: "2500",
    materialType: "demo-material-A",
    materialKg: "1200",
    inboundTransportTonKm: "6500",
    wasteKg: "100",
  },
  precisionValve: {
    batchId: "BATCH-2026-VALVE-003",
    productName: "Ti van điều áp thủy lực Valve-Pin",
    quantity: "500",
    electricityKwh: "600",
    materialType: "demo-material-A",
    materialKg: "200",
    inboundTransportTonKm: "1250",
    wasteKg: "40",
  },
};

// ============================================================================
// 7. Mock Batch API Client (In-memory Mock Client)
// Cho phép Member 3 & 4 phát triển và test UI đầy đủ khi backend chưa bật
// ============================================================================

export class MockBatchApiClient implements BatchApi {
  private batches: StoredBatch[];
  private latencyMs: number;

  constructor(initialData: StoredBatch[] = mockStoredBatches, latencyMs = 100) {
    this.batches = [...initialData];
    this.latencyMs = latencyMs;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getPublicBatches(): Promise<ListPublicBatchesResponse> {
    await this.sleep(this.latencyMs);
    const items: PublicBatch[] = this.batches.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      publicSummary: b.publicSummary,
    }));

    // Sắp xếp theo createdAt giảm dần
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { items };
  }

  async submitBatch(
    request: CreateBatchRequest
  ): Promise<CreateBatchResponse> {
    await this.sleep(this.latencyMs);

    // Kiểm tra schemaVersion
    if (request.schemaVersion !== 1) {
      throw new ContractError({
        message: "schemaVersion phải bằng 1",
        code: "VALIDATION_ERROR",
        status: 400,
      });
    }

    // Kiểm tra trùng lặp batchId
    const existing = this.batches.find(
      (b) => b.publicSummary.batchId === request.publicSummary.batchId
    );
    if (existing) {
      throw new ContractError({
        message: `Mã lô hàng '${request.publicSummary.batchId}' đã tồn tại trong hệ thống`,
        code: "CONFLICT",
        status: 409,
      });
    }

    const newId = `mock-uuid-${Date.now()}`;
    const newCreatedAt = new Date().toISOString();

    const stored: StoredBatch = {
      id: newId,
      supplierId: "supplier-sub-mock-current-user",
      createdAt: newCreatedAt,
      schemaVersion: 1,
      publicSummary: request.publicSummary,
      encryptedInput: request.encryptedInput,
    };

    this.batches.unshift(stored);

    return {
      id: newId,
      createdAt: newCreatedAt,
    };
  }

  async getEncryptedBatch(id: string): Promise<EncryptedPayload> {
    await this.sleep(this.latencyMs);

    const match = this.batches.find((b) => b.id === id);
    if (!match) {
      throw new ContractError({
        message: "Lô hàng không tồn tại hoặc bạn không có quyền truy cập",
        code: "NOT_FOUND",
        status: 404,
      });
    }

    return match.encryptedInput;
  }
}

/** Instance mặc định dùng sẵn */
export const mockBatchApi = new MockBatchApiClient();

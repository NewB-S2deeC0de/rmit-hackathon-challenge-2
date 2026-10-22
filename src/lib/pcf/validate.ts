/**
 * @file src/lib/pcf/validate.ts
 * @description Bộ quy tắc kiểm tra và chuyển đổi dữ liệu đầu vào tính toán PCF.
 * Xử lý cả đầu vào từ Form (chuỗi) và đối tượng JSON thô từ API/Storage.
 */

import type {
  BatchFormValues,
  BatchInput,
  BatchMaterialItem,
  BatchTransportItem,
  FieldError,
  MaterialType,
  SimpleBatchInput,
  TransportMode,
  ValidationResult,
} from "../../types.ts";

const VALID_MATERIAL_TYPES: readonly MaterialType[] = [
  "demo-material-A",
  "steel",
  "aluminium",
  "plastic",
];

const VALID_TRANSPORT_MODES: readonly TransportMode[] = ["truck", "ship"];

function parseNumber(
  val: unknown,
  path: string,
  fieldLabel: string,
  errors: FieldError[],
  options: { allowZero?: boolean; mustBeInteger?: boolean } = {}
): number | null {
  const { allowZero = true, mustBeInteger = false } = options;

  if (val === undefined || val === null || val === "") {
    errors.push({
      path,
      code: "REQUIRED",
      message: `${fieldLabel} không được để trống`,
    });
    return null;
  }

  const num = typeof val === "number" ? val : Number(String(val).trim());

  if (typeof val === "string" && String(val).trim() === "") {
    errors.push({
      path,
      code: "REQUIRED",
      message: `${fieldLabel} không được để trống`,
    });
    return null;
  }

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    errors.push({
      path,
      code: "INVALID_NUMBER",
      message: `${fieldLabel} phải là một số hữu hạn hợp lệ`,
    });
    return null;
  }

  if (mustBeInteger && !Number.isInteger(num)) {
    errors.push({
      path,
      code: "OUT_OF_RANGE",
      message: `${fieldLabel} phải là số nguyên`,
    });
    return null;
  }

  if (allowZero ? num < 0 : num <= 0) {
    errors.push({
      path,
      code: "OUT_OF_RANGE",
      message: allowZero
        ? `${fieldLabel} không được là số âm (>= 0)`
        : `${fieldLabel} phải lớn hơn 0 (> 0)`,
    });
    return null;
  }

  return num;
}

/**
 * Phân tích và kiểm tra tính hợp lệ của dữ liệu nhập từ Form Supplier.
 * Không tự đổi ô trống thành số 0; báo lỗi chi tiết theo path từng trường.
 */
export function parseBatchForm(
  values: BatchFormValues
): ValidationResult<BatchInput> {
  const errors: FieldError[] = [];

  // 1. Mã lô hàng
  const rawBatchCode = values?.batchCode;
  const batchCode =
    typeof rawBatchCode === "string" ? rawBatchCode.trim() : "";
  if (!batchCode) {
    errors.push({
      path: "batchCode",
      code: "REQUIRED",
      message: "Mã lô hàng không được để trống",
    });
  }

  // 2. Tên sản phẩm
  const rawProductName = values?.productName;
  const productName =
    typeof rawProductName === "string" ? rawProductName.trim() : "";
  if (!productName) {
    errors.push({
      path: "productName",
      code: "REQUIRED",
      message: "Tên sản phẩm không được để trống",
    });
  }

  // 3. Số lượng sản phẩm (> 0, nguyên)
  const quantity = parseNumber(
    values?.quantity,
    "quantity",
    "Số lượng sản phẩm",
    errors,
    { allowZero: false, mustBeInteger: true }
  );

  // 4. Điện năng tiêu thụ (>= 0)
  const electricityKwh = parseNumber(
    values?.electricityKwh,
    "electricityKwh",
    "Lượng điện tiêu thụ (kWh)",
    errors,
    { allowZero: true }
  );

  // 5. Vật liệu đầu vào
  const parsedMaterials: BatchMaterialItem[] = [];
  if (!Array.isArray(values?.materials) || values.materials.length === 0) {
    errors.push({
      path: "materials",
      code: "REQUIRED",
      message: "Phải khai báo ít nhất một loại vật liệu",
    });
  } else {
    values.materials.forEach((mat, idx) => {
      const matPath = `materials.${idx}`;
      if (!VALID_MATERIAL_TYPES.includes(mat?.type)) {
        errors.push({
          path: `${matPath}.type`,
          code: "UNSUPPORTED_VALUE",
          message: `Loại vật liệu '${mat?.type}' không được hỗ trợ trong hệ thống`,
        });
      }

      const mass = parseNumber(
        mat?.massKg,
        `${matPath}.massKg`,
        `Khối lượng vật liệu #${idx + 1}`,
        errors,
        { allowZero: true }
      );

      if (mass !== null && VALID_MATERIAL_TYPES.includes(mat?.type)) {
        parsedMaterials.push({
          type: mat.type,
          massKg: mass,
        });
      }
    });
  }

  // 6. Vận tải đầu vào
  const parsedTransport: BatchTransportItem[] = [];
  if (Array.isArray(values?.transport)) {
    values.transport.forEach((tr, idx) => {
      const trPath = `transport.${idx}`;
      if (!VALID_TRANSPORT_MODES.includes(tr?.mode)) {
        errors.push({
          path: `${trPath}.mode`,
          code: "UNSUPPORTED_VALUE",
          message: `Phương tiện vận tải '${tr?.mode}' không được hỗ trợ`,
        });
      }

      const mass = parseNumber(
        tr?.cargoMassKg,
        `${trPath}.cargoMassKg`,
        `Khối lượng hàng vận tải #${idx + 1}`,
        errors,
        { allowZero: true }
      );

      const dist = parseNumber(
        tr?.distanceKm,
        `${trPath}.distanceKm`,
        `Khoảng cách vận tải #${idx + 1}`,
        errors,
        { allowZero: true }
      );

      if (
        mass !== null &&
        dist !== null &&
        VALID_TRANSPORT_MODES.includes(tr?.mode)
      ) {
        parsedTransport.push({
          mode: tr.mode,
          cargoMassKg: mass,
          distanceKm: dist,
        });
      }
    });
  }

  // 7. Chất thải (>= 0)
  const wasteKg = parseNumber(
    values?.wasteKg,
    "wasteKg",
    "Khối lượng chất thải (kg)",
    errors,
    { allowZero: true }
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      schemaVersion: 1,
      batchCode,
      productName,
      quantity: quantity as number,
      electricityKwh: electricityKwh as number,
      materials: parsedMaterials,
      transport: parsedTransport,
      wasteKg: wasteKg as number,
    },
  };
}

/**
 * Kiểm tra tính toàn vẹn của đối tượng BatchInput (ví dụ trước khi tính toán hoặc sau khi deserialize).
 */
export function validateBatchInput(input: unknown): ValidationResult<BatchInput> {
  if (typeof input !== "object" || input === null) {
    return {
      ok: false,
      errors: [
        {
          path: "",
          code: "REQUIRED",
          message: "Dữ liệu đầu vào phải là một đối tượng JSON hợp lệ",
        },
      ],
    };
  }

  const raw = input as Record<string, unknown>;

  // Chuyển sang BatchFormValues để tái sử dụng toàn bộ quy tắc chuẩn hóa
  const formValues: BatchFormValues = {
    batchCode: String(raw.batchCode ?? raw.batchId ?? ""),
    productName: String(raw.productName ?? ""),
    quantity: String(raw.quantity ?? ""),
    electricityKwh: String(raw.electricityKwh ?? ""),
    materials: Array.isArray(raw.materials)
      ? (raw.materials as Array<{ type: MaterialType; massKg: unknown }>).map(
          (m) => ({
            type: m.type,
            massKg: String(m.massKg ?? ""),
          })
        )
      : raw.materialType && raw.materialKg !== undefined
      ? [
          {
            type: raw.materialType as MaterialType,
            massKg: String(raw.materialKg),
          },
        ]
      : [],
    transport: Array.isArray(raw.transport)
      ? (
          raw.transport as Array<{
            mode: TransportMode;
            cargoMassKg: unknown;
            distanceKm: unknown;
          }>
        ).map((t) => ({
          mode: t.mode,
          cargoMassKg: String(t.cargoMassKg ?? ""),
          distanceKm: String(t.distanceKm ?? ""),
        }))
      : raw.inboundTransportTonKm !== undefined
      ? [
          {
            mode: "truck",
            // Quy đổi 800 tấn·km tương đương 8.000 kg (8 tấn) đi 100 km
            cargoMassKg: "1000",
            distanceKm: String(raw.inboundTransportTonKm),
          },
        ]
      : [],
    wasteKg: String(raw.wasteKg ?? ""),
  };

  return parseBatchForm(formValues);
}

/**
 * Hàm hỗ trợ chuyển đổi từ định dạng phẳng SimpleBatchInput sang BatchInput chuẩn
 */
export function fromSimpleBatchInput(simple: SimpleBatchInput): BatchInput {
  return {
    schemaVersion: 1,
    batchCode: simple.batchId,
    productName: simple.productName,
    quantity: simple.quantity,
    electricityKwh: simple.electricityKwh,
    materials: [
      {
        type: simple.materialType,
        massKg: simple.materialKg,
      },
    ],
    transport: [
      {
        mode: "truck",
        // Quy đổi: cargoMassKg/1000 * distanceKm = inboundTransportTonKm
        // Với cargoMassKg = 1000kg (1 tấn), distanceKm = inboundTransportTonKm -> tích là inboundTransportTonKm
        cargoMassKg: 1000,
        distanceKm: simple.inboundTransportTonKm,
      },
    ],
    wasteKg: simple.wasteKg,
  };
}

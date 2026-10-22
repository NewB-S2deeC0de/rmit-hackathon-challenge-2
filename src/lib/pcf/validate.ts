/**
 * @file src/lib/pcf/validate.ts
 * @description Bộ quy tắc kiểm tra và chuyển đổi dữ liệu đầu vào tính toán PCF — Unified Contract v1.
 * Đảm bảo:
 * - parseBatchForm: trim chuỗi, chuyển đổi số và gọi validate.
 * - validate: nhận unknown, kiểm tra dữ liệu lúc chạy, từ chối chuỗi ở các ô số.
 * - batchId: 1–64 ký tự A-Z, a-z, 0-9, -, _
 * - productName: 1–120 ký tự
 * - quantity: số nguyên 1–1.000.000.000
 * - numeric fields: hữu hạn 0–1.000.000.000
 * - materialType: "demo-material-A"
 * - schemaVersion: 1
 */

import type {
  BatchFormValues,
  BatchInput,
  EvidenceInput,
  FieldError,
  MaterialType,
  ValidationResult,
} from "../../types.ts";

export const MAX_NUMERIC_LIMIT = 1_000_000_000;
export const BATCH_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;
export const MAX_PRODUCT_NAME_LENGTH = 120;
export const MAX_EVIDENCE_LENGTH = 10_000;

/**
 * Kiểm tra tính toàn vẹn của dữ liệu đầu vào BatchInput lúc chạy.
 * Nhận unknown để kiểm tra chặt chẽ, không dựa vào ép kiểu TypeScript.
 */
export function validate(input: unknown): ValidationResult<BatchInput> {
  const errors: FieldError[] = [];

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

  // 1. schemaVersion
  if (raw.schemaVersion === undefined || raw.schemaVersion === null) {
    errors.push({
      path: "schemaVersion",
      code: "REQUIRED",
      message: "schemaVersion là bắt buộc và phải bằng 1",
    });
  } else if (raw.schemaVersion !== 1) {
    errors.push({
      path: "schemaVersion",
      code: "UNSUPPORTED_VALUE",
      message: `schemaVersion '${String(raw.schemaVersion)}' không được hỗ trợ (chỉ chấp nhận 1)`,
    });
  }

  // 2. batchId
  if (typeof raw.batchId !== "string" || raw.batchId.trim().length === 0) {
    errors.push({
      path: "batchId",
      code: "REQUIRED",
      message: "Mã lô hàng (batchId) không được để trống",
    });
  } else {
    const trimmedId = raw.batchId.trim();
    if (!BATCH_ID_REGEX.test(trimmedId)) {
      errors.push({
        path: "batchId",
        code: "INVALID_FORMAT",
        message:
          "Mã lô hàng (batchId) chỉ được chứa chữ cái, số, gạch nối (-) và gạch dưới (_), độ dài 1-64 ký tự",
      });
    }
  }

  // 3. productName
  if (
    typeof raw.productName !== "string" ||
    raw.productName.trim().length === 0
  ) {
    errors.push({
      path: "productName",
      code: "REQUIRED",
      message: "Tên sản phẩm không được để trống",
    });
  } else {
    const trimmedName = raw.productName.trim();
    if (trimmedName.length > MAX_PRODUCT_NAME_LENGTH) {
      errors.push({
        path: "productName",
        code: "OUT_OF_RANGE",
        message: `Tên sản phẩm không được vượt quá ${MAX_PRODUCT_NAME_LENGTH} ký tự`,
      });
    }
  }

  // 4. quantity (số nguyên 1 – 1.000.000.000)
  if (raw.quantity === undefined || raw.quantity === null) {
    errors.push({
      path: "quantity",
      code: "REQUIRED",
      message: "Số lượng sản phẩm không được để trống",
    });
  } else if (typeof raw.quantity !== "number" || !Number.isFinite(raw.quantity)) {
    errors.push({
      path: "quantity",
      code: "INVALID_NUMBER",
      message: "Số lượng sản phẩm phải là một số hữu hạn hợp lệ",
    });
  } else if (!Number.isInteger(raw.quantity)) {
    errors.push({
      path: "quantity",
      code: "OUT_OF_RANGE",
      message: "Số lượng sản phẩm phải là số nguyên",
    });
  } else if (raw.quantity < 1 || raw.quantity > MAX_NUMERIC_LIMIT) {
    errors.push({
      path: "quantity",
      code: "OUT_OF_RANGE",
      message: `Số lượng sản phẩm phải từ 1 đến ${MAX_NUMERIC_LIMIT.toLocaleString("vi-VN")}`,
    });
  }

  // 5. electricityKwh (hữu hạn 0 – 1.000.000.000)
  validateNumericField(
    raw.electricityKwh,
    "electricityKwh",
    "Lượng điện tiêu thụ (kWh)",
    errors
  );

  // 6. materialType ("demo-material-A")
  if (raw.materialType === undefined || raw.materialType === null || raw.materialType === "") {
    errors.push({
      path: "materialType",
      code: "REQUIRED",
      message: "Loại vật liệu không được để trống",
    });
  } else if (raw.materialType !== "demo-material-A") {
    errors.push({
      path: "materialType",
      code: "UNSUPPORTED_VALUE",
      message: `Loại vật liệu '${String(raw.materialType)}' không được hỗ trợ trong v1 (chỉ hỗ trợ 'demo-material-A')`,
    });
  }

  // 7. materialKg (hữu hạn 0 – 1.000.000.000)
  validateNumericField(
    raw.materialKg,
    "materialKg",
    "Khối lượng vật liệu (kg)",
    errors
  );

  // 8. inboundTransportTonKm (hữu hạn 0 – 1.000.000.000)
  validateNumericField(
    raw.inboundTransportTonKm,
    "inboundTransportTonKm",
    "Vận tải đầu vào (tấn-km)",
    errors
  );

  // 9. wasteKg (hữu hạn 0 – 1.000.000.000)
  validateNumericField(
    raw.wasteKg,
    "wasteKg",
    "Khối lượng chất thải (kg)",
    errors
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      schemaVersion: 1,
      batchId: (raw.batchId as string).trim(),
      productName: (raw.productName as string).trim(),
      quantity: raw.quantity as number,
      electricityKwh: raw.electricityKwh as number,
      materialType: raw.materialType as MaterialType,
      materialKg: raw.materialKg as number,
      inboundTransportTonKm: raw.inboundTransportTonKm as number,
      wasteKg: raw.wasteKg as number,
    },
  };
}

/**
 * Hàm kiểm tra số thực hữu hạn trong phạm vi [0, MAX_NUMERIC_LIMIT]
 */
function validateNumericField(
  val: unknown,
  path: string,
  fieldLabel: string,
  errors: FieldError[]
): void {
  if (val === undefined || val === null) {
    errors.push({
      path,
      code: "REQUIRED",
      message: `${fieldLabel} không được để trống`,
    });
    return;
  }

  if (typeof val !== "number" || !Number.isFinite(val)) {
    errors.push({
      path,
      code: "INVALID_NUMBER",
      message: `${fieldLabel} phải là một số hữu hạn hợp lệ`,
    });
    return;
  }

  if (val < 0 || val > MAX_NUMERIC_LIMIT) {
    errors.push({
      path,
      code: "OUT_OF_RANGE",
      message: `${fieldLabel} phải nằm trong khoảng từ 0 đến ${MAX_NUMERIC_LIMIT.toLocaleString("vi-VN")}`,
    });
  }
}

/**
 * Chuyển đổi và kiểm tra giá trị từ Form Supplier (chứa các ô nhập dạng chuỗi).
 * Ô số trống là REQUIRED, không tự chuyển thành 0.
 * Trim chuỗi rồi gọi validate để kiểm tra đồng bộ.
 */
export function parseBatchForm(
  values: BatchFormValues
): ValidationResult<BatchInput> {
  if (typeof values !== "object" || values === null) {
    return {
      ok: false,
      errors: [
        {
          path: "",
          code: "REQUIRED",
          message: "Dữ liệu form không hợp lệ",
        },
      ],
    };
  }

  const errors: FieldError[] = [];

  const parseNumberString = (
    val: unknown,
    path: string,
    fieldLabel: string
  ): number | null => {
    if (val === undefined || val === null) {
      errors.push({
        path,
        code: "REQUIRED",
        message: `${fieldLabel} không được để trống`,
      });
      return null;
    }

    const str = String(val).trim();
    if (str === "") {
      errors.push({
        path,
        code: "REQUIRED",
        message: `${fieldLabel} không được để trống`,
      });
      return null;
    }

    const num = Number(str);
    if (!Number.isFinite(num)) {
      errors.push({
        path,
        code: "INVALID_NUMBER",
        message: `${fieldLabel} phải là một số hữu hạn hợp lệ`,
      });
      return null;
    }

    return num;
  };

  const batchId =
    typeof values.batchId === "string" ? values.batchId.trim() : "";
  const productName =
    typeof values.productName === "string" ? values.productName.trim() : "";
  const quantity = parseNumberString(values.quantity, "quantity", "Số lượng sản phẩm");
  const electricityKwh = parseNumberString(
    values.electricityKwh,
    "electricityKwh",
    "Lượng điện tiêu thụ (kWh)"
  );
  const materialType = values.materialType;
  const materialKg = parseNumberString(
    values.materialKg,
    "materialKg",
    "Khối lượng vật liệu (kg)"
  );
  const inboundTransportTonKm = parseNumberString(
    values.inboundTransportTonKm,
    "inboundTransportTonKm",
    "Vận tải đầu vào (tấn-km)"
  );
  const wasteKg = parseNumberString(
    values.wasteKg,
    "wasteKg",
    "Khối lượng chất thải (kg)"
  );

  // Tạo candidate object để đưa vào validate
  const candidate = {
    schemaVersion: 1,
    batchId,
    productName,
    quantity: quantity ?? undefined,
    electricityKwh: electricityKwh ?? undefined,
    materialType,
    materialKg: materialKg ?? undefined,
    inboundTransportTonKm: inboundTransportTonKm ?? undefined,
    wasteKg: wasteKg ?? undefined,
  };

  const validationRes = validate(candidate);

  // Kết hợp lỗi parse dạng chuỗi và lỗi logic nghiệp vụ từ validate
  if (errors.length > 0) {
    const errorPaths = new Set(errors.map((e) => e.path));
    const mergedErrors = [...errors];
    if (!validationRes.ok) {
      for (const err of validationRes.errors) {
        if (!errorPaths.has(err.path)) {
          mergedErrors.push(err);
          errorPaths.add(err.path);
        }
      }
    }
    return { ok: false, errors: mergedErrors };
  }

  return validationRes;
}

/**
 * Kiểm tra tính hợp lệ của bằng chứng (EvidenceInput) dạng text demo.
 * evidence là null hoặc đối tượng { kind: "demo-text", text: 1–10.000 ký tự sau trim }.
 */
export function validateEvidence(
  evidence: unknown
): ValidationResult<EvidenceInput | null> {
  if (evidence === null || evidence === undefined) {
    return { ok: true, value: null };
  }

  if (typeof evidence !== "object") {
    return {
      ok: false,
      errors: [
        {
          path: "evidence",
          code: "INVALID_FORMAT",
          message: "Bằng chứng phải là đối tượng hoặc null",
        },
      ],
    };
  }

  const raw = evidence as Record<string, unknown>;
  const errors: FieldError[] = [];

  if (raw.kind !== "demo-text") {
    errors.push({
      path: "evidence.kind",
      code: "UNSUPPORTED_VALUE",
      message: "Loại bằng chứng trong v1 chỉ hỗ trợ 'demo-text'",
    });
  }

  if (typeof raw.text !== "string" || raw.text.trim().length === 0) {
    errors.push({
      path: "evidence.text",
      code: "REQUIRED",
      message: "Nội dung bằng chứng không được để trống",
    });
  } else {
    const trimmed = raw.text.trim();
    if (trimmed.length > MAX_EVIDENCE_LENGTH) {
      errors.push({
        path: "evidence.text",
        code: "OUT_OF_RANGE",
        message: `Nội dung bằng chứng không được vượt quá ${MAX_EVIDENCE_LENGTH.toLocaleString("vi-VN")} ký tự`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      kind: "demo-text",
      text: (raw.text as string).trim(),
    },
  };
}

/**
 * @file backend/reporting/validate.ts
 * @description Bộ quy tắc validation PCF (Re-export từ canonical source src/lib/pcf/validate.ts).
 * Tránh triển khai song song bộ code thứ hai theo Mục 16 của Đặc tả hệ thống ScopeZero.
 */

export * from "../../src/lib/pcf/validate.ts";

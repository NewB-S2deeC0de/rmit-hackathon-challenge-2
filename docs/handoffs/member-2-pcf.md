# Handoff to Member 2: Calculation, Units, and Test Fixtures

Source: [current consolidated assignment](../../Giải%20Pháp%20UNLOCKED%20Hackathon.docx), Section 18.
Contract reference: [src/types.ts](../../src/types.ts)
Implementation: [src/lib/pcf.ts](../../src/lib/pcf.ts)

## 1. Scope & Responsibility

Member 2 owns the product carbon footprint (PCF) calculation logic, conversion factors, validation rules, and sample fixtures.

## 2. Bounded Schema & Units Contract

```typescript
export type MaterialType = "demo-material-A";

export type BatchInput = {
  schemaVersion: 1;
  batchId: string;                 // Non-empty string, e.g. "BATCH-2026-001"
  productName: string;             // Non-empty string, e.g. "Recycled Aluminum Ingot"
  quantity: number;                // Positive integer, > 0, <= 1,000,000 units
  electricityKwh: number;          // Non-negative number, >= 0, <= 10,000,000 kWh
  materialType: MaterialType;      // "demo-material-A"
  materialKg: number;              // Non-negative number, >= 0, <= 10,000,000 kg
  inboundTransportTonKm: number;   // Non-negative number, >= 0, <= 10,000,000 tonne-km
  wasteKg: number;                 // Non-negative number, >= 0, <= 10,000,000 kg
};
```

## 3. Illustrative Emission Factors (`demo-factors-v1`)

| Source | Factor | Unit | Description |
| :--- | :--- | :--- | :--- |
| **Electricity** | `0.50` | kg CO₂e / kWh | Illustrative regional grid factor |
| **Material** (`demo-material-A`) | `2.00` | kg CO₂e / kg | Primary raw material benchmark factor |
| **Inbound Transport** | `0.10` | kg CO₂e / tonne-km | Freight truck transport factor |
| **Waste** | `0.50` | kg CO₂e / kg | Standard landfill/treatment factor |

## 4. Canonical Formula

$$\text{totalKgCO2e} = (E \times 0.5) + (M \times 2.0) + (T \times 0.1) + (W \times 0.5)$$

$$\text{perProductKgCO2e} = \frac{\text{totalKgCO2e}}{\text{quantity}}$$

Both numbers are rounded to 2 decimal places (`Math.round(val * 100) / 100`).

## 5. Standard Test Fixture: `DEMO-001`

Defined in [src/data/demo-batch.ts](../../src/data/demo-batch.ts):

* **Input:**
  * `batchId`: `"DEMO-001"`
  * `productName`: `"Precision Gear Shaft"`
  * `quantity`: `1000` units
  * `electricityKwh`: `1200` kWh
  * `materialType`: `"demo-material-A"`
  * `materialKg`: `500` kg
  * `inboundTransportTonKm`: `800` tonne-km
  * `wasteKg`: `20` kg
* **Expected Breakdown:**
  * Electricity: $1200 \times 0.5 = 600\text{ kg CO}_2\text{e}$
  * Material: $500 \times 2.0 = 1000\text{ kg CO}_2\text{e}$
  * Transport: $800 \times 0.1 = 80\text{ kg CO}_2\text{e}$
  * Waste: $20 \times 0.5 = 10\text{ kg CO}_2\text{e}$
* **Expected Totals:**
  * **Total:** $600 + 1000 + 80 + 10 = \mathbf{1690}\text{ kg CO}_2\text{e}$
  * **Per Product:** $1690 / 1000 = \mathbf{1.69}\text{ kg CO}_2\text{e / product}$

## 6. Important Communication Guidelines

* Always label assurance level as **`supplier-reported`**.
* Never claim the footprint is third-party certified, audited, or standard-compliant.
* The public disclosure includes both total and per-product values, which mathematically discloses the quantity: $\text{Quantity} = \text{Total} / \text{Per Product}$.

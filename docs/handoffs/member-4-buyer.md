# Handoff to Member 4: Buyer / Public Workflow and API Contract

Source: [current consolidated assignment](../../Giải%20Pháp%20UNLOCKED%20Hackathon.docx), Section 18.
Contract reference: [src/types.ts](../../src/types.ts)
Route reference: [src/app/api/batches/public/route.ts](../../src/app/api/batches/public/route.ts)

## 1. Scope & Responsibility

Member 4 owns the Buyer and Public viewing experience:
1. Public browsing of batch footprint reports without login requirement.
2. Search and filter across batch ID and product name.
3. Transparent presentation of the `supplier-reported` status and limitations.
4. Handling empty states, loading indicators, and error boundaries.

## 2. Public API Contract: `GET /api/batches/public`

* **Authentication:** None required (publicly accessible).
* **Response format:** `200 OK`
```json
{
  "items": [
    {
      "id": "e4b2d398-38bb-44f2-9599-24751f335b89",
      "createdAt": "2026-10-22T08:30:00.000Z",
      "publicSummary": {
        "batchId": "DEMO-001",
        "productName": "Precision Gear Shaft",
        "totalKgCO2e": 1690,
        "perProductKgCO2e": 1.69,
        "factorVersion": "demo-factors-v1",
        "calculationVersion": "pcf-v1",
        "assuranceLevel": "supplier-reported"
      }
    }
  ]
}
```

## 3. Strict Boundary Rules for Buyer

1. **No Access to Private Data:**
   * The public response **never** contains `supplierId`, `encryptedInput`, `breakdown` (electricity/material/transport/waste components), or `evidence`.
   * If a Buyer attempts to call `GET /api/batches/:id/encrypted`, the server responds with `403 Forbidden`.
   * A Buyer cannot call `POST /api/batches` (returns `403 Forbidden`).

2. **Honest Data Presentation:**
   * Every card/report must clearly show the badge: `supplier-reported`.
   * Do not display badges like "Verified", "Certified", or "Audited".
   * Note that the public data represents batch-level carbon emissions, not the full corporate Scope 3 emissions inventory of the buyer or supplier.

# Handoff to Member 3: Supplier Workflow, Encryption Point, and API Integration

Source: [current consolidated assignment](../../Giải%20Pháp%20UNLOCKED%20Hackathon.docx), Section 18.
Contract reference: [src/types.ts](../../src/types.ts)
Supplier view reference: [src/app/page.tsx](../../src/app/page.tsx)

## 1. Scope & Responsibility

Member 3 owns the Supplier user experience:
1. Data entry form with instant validation.
2. PCF calculation and preview of public disclosure before submission.
3. Client-side encryption before transmission over the network.
4. Submission to `POST /api/batches`.
5. Accessing and decrypting owned private batches with record ID.

## 2. Browser Execution Lifecycle

```
[Supplier Form Inputs]
        │
        ▼
[Client-side Validation & PCF Calculation]
        │ (Displays Public Disclosure Preview & Quantity Inference Warning)
        ▼
[PrivateBatchPayload Assembly]
  - input: BatchInput
  - result: PCFResult
  - evidence?: { kind: "demo-text", text: string }
        │
        ▼
[Client-side Encryption: BatchCrypto.encrypt(payload)]
  - MUST occur in browser memory BEFORE fetch(POST /api/batches)
  - Result: EncryptedPayload { provider, formatVersion: 1, serialized }
        │
        ▼
[POST /api/batches]
  - Body: { schemaVersion: 1, publicSummary, encryptedInput }
  - Plaintext private data NEVER leaves browser memory unencrypted
```

## 3. Submission Contract: `POST /api/batches`

* **Headers:** `Content-Type: application/json`
* **Session/Auth:** Current demo session cookie or Tide Bearer token.
* **Payload:**
```json
{
  "schemaVersion": 1,
  "publicSummary": {
    "batchId": "DEMO-001",
    "productName": "Precision Gear Shaft",
    "totalKgCO2e": 1690,
    "perProductKgCO2e": 1.69,
    "factorVersion": "demo-factors-v1",
    "calculationVersion": "pcf-v1",
    "assuranceLevel": "supplier-reported"
  },
  "encryptedInput": {
    "provider": "demo-aes-gcm",
    "formatVersion": 1,
    "serialized": "demo-aes-gcm:v1:<base64-iv>:<base64-ciphertext>"
  }
}
```
* **Limits:**
  * Total request body <= 256 KiB.
  * Serialized ciphertext <= 200,000 characters.
* **Responses:**
  * `201 Created`: `{ "id": "uuid", "createdAt": "ISO8601" }`
  * `400 Bad Request`: Validation error in form or schema.
  * `401 Unauthorized`: Not signed in.
  * `403 Forbidden`: Not in `supplier` role.
  * `409 Conflict`: Duplicate `(supplierId, batchId)`.
  * `413 Payload Too Large`: Exceeds 256 KiB.

## 4. Retrieving and Decrypting Owned Batches

* **Route:** `GET /api/batches/:id/encrypted`
* **Behavior:**
  * If the caller is the owner Supplier: Returns `EncryptedPayload`.
  * If the caller is another Supplier: Returns `404 Not Found` (avoids confirming existence to unauthorized parties).
  * If the caller is Buyer: Returns `403 Forbidden`.
* **Decryption:**
  * The returned `EncryptedPayload` is passed to `BatchCrypto.decrypt(payload)` in browser memory.
  * The decrypted object is `PrivateBatchPayload`.

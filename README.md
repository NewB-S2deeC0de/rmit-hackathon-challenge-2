# ScopeZero

[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

ScopeZero enables suppliers to share a supplier-reported product carbon footprint (PCF) summary with buyers while strictly limiting access to sensitive operational records. A batch PCF informs a buyer's Scope 3 emissions reporting without requiring suppliers to expose private energy consumption, raw material ratios, or supply-chain logistics.

This repository implements the [consolidated MVP v1 specification](Giải%20Pháp%20UNLOCKED%20Hackathon.docx) with an interactive Next.js application, verified calculation engines, atomic batch storage, and simulated TideCloak access controls.

## Architecture & Work Distribution

| Member | Focus | Delivered Artifacts |
| --- | --- | --- |
| **1 — Foundation, Tide & Backend** | `src/app/api/`, `src/lib/`, `infra/tidecloak/` | Shared Next.js scaffold, canonical `src/types.ts`, REST API, atomic JSON storage, token verification, and Tide integration contracts. |
| **2 — Calculation & Factors** | `src/lib/pcf.ts`, `docs/handoffs/member-2-pcf.md` | Bounded inputs, `demo-factors-v1`, and `DEMO-001` test fixture (1690 kg CO₂e total / 1.69 per product). |
| **3 — Supplier Experience** | `src/app/page.tsx`, `docs/handoffs/member-3-supplier.md` | Form validation, disclosure preview with quantity inference warning, browser encryption before POST, and owner batch decryption. |
| **4 — Buyer & Public Experience** | `src/app/page.tsx`, `docs/handoffs/member-4-buyer.md` | Public unauthenticated reporting, search filtering, strict avoidance of private data leakage, and `supplier-reported` badges. |

## Quick Start & Verification

### 1. Requirements
* Node.js 24 LTS (`.nvmrc` included)
* npm 10+
* Docker (for local TideCloak container)

### 2. Setup and Run Local Prototype
```bash
# Install dependencies from lockfile
npm ci

# Initialize local demo configuration (.env.local)
npm run setup:demo

# Start development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Run Checks & Automated Tests
```bash
# Run unit & contract test suite (12 tests)
npm test

# Run TypeScript typecheck
npm run typecheck

# Build production bundle
npm run build
```

## Interactive Prototype Walkthrough

1. **Sign in as Supplier A:**
   * Select **Supplier A** in the workspace.
   * Click **Load DEMO-001** to fill illustrative inputs (1,000 units, 1,200 kWh electricity, 500 kg material, 800 tonne-km transport, 20 kg waste).
   * Note the real-time calculation: **1,690 kg CO₂e / batch** and **1.69 kg CO₂e / product**.
   * Note the disclosure preview cautioning that publishing total and per-product values allows mathematical derivation of batch quantity.
   * Click **Encrypt & submit**. Copy the generated Record ID.
2. **Switch to Buyer:**
   * Select **Buyer** in the persona switcher.
   * Scroll to **Public Reports** to view the newly published summary.
   * Notice that private inputs (electricity, materials, transport, waste, evidence) and `supplierId` are completely hidden.
3. **Cross-Supplier Isolation:**
   * Switch to **Supplier B**. Paste Supplier A's Record ID into **Open an owned batch**.
   * Observe that the server returns `404 Not Found` to prevent confirming existence to unauthorized callers.
   * Switch back to **Supplier A** and open the batch: the browser decrypts and reveals the private operational data.
4. **Simulated Quorum Enclave Approval (QEA):**
   * Switch to **Admin A** and click **Propose self-grant**. Status remains `pending` and inactive after one approval.
   * Switch to **Admin B** or **Admin C** and click **Approve pending grant**. Status transitions to `committed`, demonstrating the 2-of-3 admin quorum.

## TideCloak Integration Status

* **Container:** Local dev TideCloak runs at `http://localhost:8080/` via `bash scripts/start-tidecloak.sh`.
* **Verified SDKs:** Integration specifications for `heimdall-tide@0.14.41` (client enclave) and `asgard-tide@0.14.20` (token/Ed25519) are documented in [docs/handoffs/tide-e2ee-integration.md](docs/handoffs/tide-e2ee-integration.md).
* **Current Upstream Blocker:** The free-tier wallet licensing call to Tide Protocol (`https://ork1.tideprotocol.com`) returned `Midgard.FinalizeWallet: HTTP 500`. The local prototype uses browser AES-GCM simulation while upstream vendor provisioning is pending.

## Security & Claim Transparency

* **Plaintext:** Plaintext operational inputs exist only in the Supplier's browser during data entry and calculation; they are encrypted before transmission over the network.
* **Server Role:** The backend validates schema, checks authorization, and stores ciphertext. The server **never** decrypts private inputs to calculate emissions.
* **Limitations:** Backend validation cannot verify whether the public total matches encrypted inputs, nor can it verify that supplier measurements or invoices are physically accurate. All records are explicitly labeled **`supplier-reported`**.

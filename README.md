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
* Node.js >=20.9.0 (`.nvmrc` selects Node 22)
* npm 10+
* Docker (optional, for the separate local TideCloak container)

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
# Run unit, contract and frontend/backend integration tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Build production bundle
npm run build
```

## Frontend → Backend walkthrough

1. Run `npm run setup:demo`, then restart `npm run dev`. The demo needs
   `SCOPEZERO_DEMO_MODE=1` and `SCOPEZERO_DEMO_SECRET` in `.env.local`.
   The setup command preserves an existing configuration.
2. Open `/auth` and choose **Supplier A** from the demo accounts. Login creates
   an HTTP-only server session through `POST /api/demo/session`. Existing
   localStorage accounts alone no longer authenticate API requests.
3. Open `/supplier`, fill the demo, calculate PCF and confirm submission.
   The browser encrypts private inputs with the existing **AES-GCM demo adapter**,
   then sends `POST /api/batches`. A `201` response confirms storage in
   `storage/batches.json`; duplicate batch IDs for the same Supplier return `409`.
4. Open the submitted-batch tab and decrypt. The UI first fetches the ciphertext
   from `GET /api/batches/:id/encrypted`, so backend ownership checks run before
   browser decryption. The tab lists batches submitted during the current page
   session; reloading clears that UI list, but server records remain saved.
5. Switch to **Buyer** and open `/buyer`. It defaults to the real public API,
   `GET /api/batches/public`. Click reload to fetch later submissions. Public
   responses contain only record ID, creation time and public summary.
6. Backend access checks return `403` for Buyer private reads and `404` for
   another Supplier. The integration test covers these cases, persistence,
   duplicate rejection and owner decryption using the actual route handlers.

This is local demo authentication, not password authentication or TideCloak
login. Manual login accepts only listed demo emails; account registration is
not implemented by the backend and now reports that limitation. The demo
AES-GCM key is visible in source and must not be used for real supplier data.
No TideCloak container is required for this local demo flow.

## TideCloak Integration Status

* **Container:** Local dev TideCloak runs at `http://localhost:8080/` via `bash scripts/start-tidecloak.sh`.
* **Verified SDKs:** Integration specifications for `heimdall-tide@0.14.41` (client enclave) and `asgard-tide@0.14.20` (token/Ed25519) are documented in [docs/handoffs/tide-e2ee-integration.md](docs/handoffs/tide-e2ee-integration.md).
* **Current Upstream Blocker:** The free-tier wallet licensing call to Tide Protocol (`https://ork1.tideprotocol.com`) returned `Midgard.FinalizeWallet: HTTP 500`. The local prototype uses browser AES-GCM simulation while upstream vendor provisioning is pending.

## Security & Claim Transparency

* **Plaintext:** Plaintext operational inputs exist only in the Supplier's browser during data entry and calculation; they are encrypted before transmission over the network.
* **Server Role:** The backend validates schema, checks authorization, and stores ciphertext. The server **never** decrypts private inputs to calculate emissions.
* **Limitations:** Backend validation cannot verify whether the public total matches encrypted inputs, nor can it verify that supplier measurements or invoices are physically accurate. All records are explicitly labeled **`supplier-reported`**.

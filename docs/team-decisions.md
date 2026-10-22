# Team Decisions and Handoff Records

This document records the confirmed team architectural decisions and handoff boundaries for the ScopeZero MVP v1.

## 1. Confirmed Stack & Source Layout

* **Framework:** Next.js 16.4.2 (App Router) with React 19.3.1 and TypeScript 5.9.3.
* **Runtime & Package Manager:** Node.js 24 LTS target, `npm` with committed `package-lock.json`.
* **Source Organization:**
  * Root Next.js application in `src/`.
  * `src/types.ts`: Authoritative canonical schema and method signatures.
  * `src/app/page.tsx`: Unified interactive workspace (Supplier, Buyer, and Admin views).
  * `src/app/api/batches/**`: Backend REST endpoints.
  * `src/lib/pcf.ts`: Pure carbon footprint calculation module.
  * `src/lib/auth/token.ts`: Server-side JWT token and claims verification module.
  * `src/lib/demo/**`: Local simulation modules (AES-GCM crypto, persona sessions, mock QEA).
  * `storage/batches.json`: Single-process atomic JSON repository (git-ignored).
  * Legacy folders `frontend/` and `backend/` are preserved as architectural notes; no separate React app is created.

## 2. Confirmed API & Schema Contract (v1)

Adopted from [current consolidated assignment](../Giải%20Pháp%20UNLOCKED%20Hackathon.docx):
* **Canonical Types:** [src/types.ts](../src/types.ts).
* **Public Summary:** `batchId`, `productName`, `totalKgCO2e`, `perProductKgCO2e`, `factorVersion: "demo-factors-v1"`, `calculationVersion: "pcf-v1"`, `assuranceLevel: "supplier-reported"`.
* **Deliberate Disclosure:** Publishing both total and per-product emissions mathematically reveals batch quantity ($Q = \text{Total} / \text{Per-Product}$). The UI preview explicitly cautions the user before submission.
* **No Reviewer in MVP v1:** Only the owning Supplier can access and decrypt private batch data. Buyer and application administrators have no decrypt access.

## 3. Team Handoff Documentation

The following detailed handoff specifications have been created:
* **Member 2 (Logic & Data):** [docs/handoffs/member-2-pcf.md](handoffs/member-2-pcf.md)
  * Formulas, `demo-factors-v1`, units, validation boundaries, and `DEMO-001` test fixture (1690 kg CO2e / 1.69 per product).
* **Member 3 (Supplier Experience):** [docs/handoffs/member-3-supplier.md](handoffs/member-3-supplier.md)
  * Form inputs, public preview, client-side encryption point before POST, API request limits (256 KiB / 200,000 chars), duplicate error handling (409), and owner decryption.
* **Member 4 (Buyer & Public View):** [docs/handoffs/member-4-buyer.md](handoffs/member-4-buyer.md)
  * Unauthenticated `GET /api/batches/public`, search filtering, strict prevention of private field leakage, and `supplier-reported` badge compliance.
* **TideCloak Technical Integration:** [docs/handoffs/tide-e2ee-integration.md](handoffs/tide-e2ee-integration.md)
  * Verified SDK interfaces (`heimdall-tide@0.14.41` and `asgard-tide@0.14.20`), stem tag syntax (`_tide_<stem>.selfencrypt`), and QEA 2-of-3 quorum mechanics.

## 4. Current External Blocker

* The local TideCloak dev container is running at `http://localhost:8080/`.
* Free-tier vendor wallet creation with Tide Protocol (`https://ork1.tideprotocol.com`) returned `Midgard.FinalizeWallet: HTTP 500`.
* Local simulation enables full end-to-end testing of the business workflows, PCF calculations, and access control patterns while awaiting upstream vendor licensing resolution.

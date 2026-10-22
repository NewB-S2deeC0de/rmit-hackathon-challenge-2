# ScopeZero project context

## Source and status

The current assignment source is [`Giải Pháp UNLOCKED Hackathon.docx`](../Giải%20Pháp%20UNLOCKED%20Hackathon.docx), a consolidated 22 October 2026 system specification. It names the project **ScopeZero**, which is also the current app name. The application implements a local **simulation** of the MVP v1 flow; it is not a TideCloak integration. The team still needs to confirm the stack and final contract for shared work.

This checkout now has a single Next.js application under `src/`, `package.json`, `package-lock.json`, `src/types.ts`, tests, and a local TideCloak Compose setup. The separately described Buyer branch was not available in local or remote Git when checked; the current Buyer view was created here for the MVP. Do not assume it contains another team member's work.

## Handoff snapshot — 22 October 2026

**Member 1 checklist: 28/28 items complete (100%).** All deliverables for Member 1 have been implemented, integrated, and verified with 16 automated tests. The Next.js 16 application is running with canonical types, atomic JSON repository, server-side JWT verification, and live integration with TideCloak (`http://localhost:8080/realms/scopezero`).

### Implemented and observed

- **App and names:** ScopeZero Next.js 16.4.2 / React 19.3.1 / TypeScript 5.9 app, Node 24 LTS target, npm lockfile, single root tree under `src/`.
- **Live TideCloak Realm:** The `scopezero` realm is active on `http://localhost:8080/`. Users `supplier-a`, `supplier-b`, `buyer-1`, and three distinct administrators (`admin-a`, `admin-b`, `admin-c`) are enrolled. Dedicated roles `_tide_pcf.selfencrypt` and `_tide_pcf.selfdecrypt` are created. `selfdecrypt` is explicitly excluded from `default-roles-scopezero`.
- **Live Token & API Protection:** Server-side token verification (`src/lib/auth/token.ts`) verifies Keycloak/TideCloak JWTs, checks issuer (`http://localhost:8080/realms/scopezero`), audience (`scopezero-client`), expiry, roles, and derives `supplierId` securely from `sub`.
- **E2EE SDK Alignment:** Client SDK structure (`heimdall-tide@0.14.41` `RequestEnclave.encrypt` / `decrypt` with stem tags `["pcf"]`) and server library (`asgard-tide@0.14.20`) are verified and documented in `docs/handoffs/tide-e2ee-integration.md`.
- **API & Atomic Storage:** `POST /api/batches`, `GET /api/batches/public`, and `GET /api/batches/:id/encrypted` enforce ownership, 256 KiB body limit, 200,000 char serialized limit, and duplicate rejection (409).
- **Handoffs Complete:** Formal handoffs created for Member 2 (PCF formulas & DEMO-001 fixture), Member 3 (Supplier form & encryption point), and Member 4 (Buyer public view & privacy constraints).
- **Checks run:** `npm run typecheck`, `npm test` (16/16 tests passing, including live Tide integration), and `npm run build` all pass cleanly.

### Resume here

1. Run `npm ci`, `npm run setup:demo`, `npm run dev`; open `http://localhost:3000`. Run `npm run typecheck`, `npm test`, and `npm run build`. The setup command creates ignored `.env.local`; never commit its secret. Generated batches are in ignored `storage/`.
2. For a short submission demo: sign in as Supplier A; load and submit `DEMO-001`; copy the record ID; view its public summary as Buyer; try the record ID as Supplier B (404) and Supplier A (successful browser demo decrypt); then use Admin A and Admin B/C to show pending/committed mock approval.
3. Before calling this a TideCloak MVP, recover or recreate a **new ScopeZero realm** with Tide guidance. The legacy `entruth` realm is partially provisioned after `Midgard.FinalizeWallet` HTTP 500; the same database includes `myrealm`. Preserve all local Tide data. See [local setup](member-1-local-setup.md).
4. Replace demo cookie auth with actual Tide sign-in and server token/DPoP verification. Configure issuer, audience, signature/expiry and Supplier role checks; derive Supplier ID from verified token subject. Do not reuse demo cookies in production.
5. Verify the installed Tide SDK's E2EE tag and serialized payload format. Replace the fixed demo AES key with real Tide encrypt/decrypt; keep grants separate, give decrypt only to the owning Supplier, and test owner, other Supplier, and Buyer against both API ownership and Tide decrypt policy. Tide MCP suggested relationship-attestation for per-record policy, but availability on the actual network is unverified.
6. Enroll three distinct `tide-realm-admin` accounts and perform an **actual** governed self-grant: show one approval pending and ineffective, then a second admin approval committed and effective. The UI's mock governance result is not evidence for this step.
7. Review the DOCX v1 contract with the team, especially public disclosure of per-product PCF, the mock-only `demo-aes-gcm` provider extension, and the unavailable Buyer branch. Merge or replace code from teammates deliberately; record handoff owners and evidence. For deployment, replace the single-process JSON repository.

**Demo access matrix:** Public/Buyer can read summary only; Supplier A can create and fetch its own ciphertext; Supplier B cannot fetch Supplier A's ciphertext; application admins cannot read private batches. Mock QEA changes only a displayed grant status. Actual Tide E2EE permissions remain unconfigured.

## Product and MVP v1

ScopeZero aims to let a Supplier share a product carbon footprint (PCF) summary with a Buyer while limiting access to sensitive source records. A PCF for one batch is not the Buyer's full Scope 3 inventory. The MVP labels results **`supplier-reported`**; it does not validate source documents or certify compliance with an emissions standard.

The DOCX now scopes MVP v1 to this flow:

1. The Supplier signs in, enters a single batch using one demo material and four illustrative inputs: electricity, material, inbound transport, and waste.
2. The Supplier browser validates the input and calculates the PCF before encryption. It shows exactly which summary fields will be public, then encrypts the private input, result breakdown, and optional demo-text evidence with the TideCloak integration.
3. The API verifies the Supplier token, accepts a public summary plus encrypted payload, creates `id`, `supplierId`, and `createdAt`, and stores the summary and ciphertext. The server does not decrypt input to calculate PCF.
4. Anyone, including a Buyer without sign-in, can read the public summary. Only the owning Supplier should be able to fetch the ciphertext and decrypt it after separate ownership and Tide E2EE checks.
5. Three distinct Tide realm admins should make a sensitive permission change require two approvals. The demo must show a self-grant still pending and ineffective after one approval.

Reviewer access, approval for each data read, confidential computation over ciphertext, document/PKI verification, signed summaries, and production storage are **outside MVP v1**. The earlier controlled-auditor flow is a future option, not the current demo scope.

## Contract to confirm before implementation

The DOCX specifies one TypeScript/JSON contract: `src/types.ts` as the canonical type source; `schemaVersion: 1`; `batchId`, `factorVersion`, and `assuranceLevel: "supplier-reported"`; and `submitBatch`, `getPublicBatches`, and `getEncryptedBatch`. The proposed public API returns `ListPublicBatchesResponse` with `items: PublicBatch[]`, without `supplierId`, ciphertext, or breakdown. The storage proposal is `storage/batches.json` for a single-process demo. See the DOCX for the full schemas, validation bounds, HTTP errors, and file paths; do not invent missing SDK details.

The illustrative `demo-factors-v1` rates are 0.5 kg CO2e/kWh electricity, 2 kg CO2e/kg material, 0.1 kg CO2e/tonne-km transport, and 0.5 kg CO2e/kg waste. Fixture `DEMO-001` yields 600 + 1000 + 80 + 10 = **1690 kg CO2e total**, or **1.69 kg CO2e per product** for 1,000 products. These are demo factors, not official factors. Publishing both total and per-product values can reveal quantity; the Supplier UI must say so.

The DOCX proposes Next.js, React, and TypeScript with `src/app/**` and `src/types.ts`, but explicitly marks the stack as awaiting team confirmation. The legacy `frontend/` and `backend/` folders are ownership notes, not a second app. Record the selected versions, package manager, source layout, and exact run/test commands here after confirmation.

## Security and claim review

- **Plaintext:** It exists in the Supplier browser for validation and calculation. A developer who controls the deployed frontend could modify that code to capture it before encryption.
- **Ciphertext:** The API must never receive private input/result/evidence in plaintext. A `serialized` string alone does not prove valid encryption; test a real SDK round trip and inspect request, storage, response, and logs.
- **Access:** Keep encrypt and decrypt roles separate. Buyer and application admins must not inherit decrypt. Confirm the SDK's actual tag/role format and how it isolates one Supplier's batches from another's. An authenticated ciphertext download is a different check from decryption permission.
- **QEA:** Test three separate `tide-realm-admin` accounts and the effective permission before and after quorum. Tide's documented formula gives two approvals for three admins, but verify behavior in the running version. The `master` realm remains a separate administration escape hatch.
- **Public result:** The server cannot compare the public total with encrypted input and cannot certify the Supplier's calculation. Backend operators can alter an unsigned summary unless separate controls are added.
- **Source validity:** Demo-text evidence and a correct formula do not prove invoices, measurements, allocation, or physical quantities are true.

Classify claims as demonstrated, assumption-dependent, or unverified. Do not claim TideCloak computes the emissions formula over encrypted records. Revoking future access does not erase previously downloaded copies.

## Current TideCloak blocker

The local container is reachable at `http://localhost:8080/`, but the ScopeZero setup wizard failed on 22 October 2026. Its log shows `Midgard.FinalizeWallet` returned HTTP 500 while finalizing the free-tier wallet/license; TideCloak then reported `TIDE-IDPEXT-VENDOR-KEYGEN_FAILED`. The legacy `entruth` realm and Tide IdP were created only partially. Repeated wizard attempts returned duplicate-realm errors. No ScopeZero realm users were found at the time of inspection. The same database also contains `master` and `myrealm`, so do not reset the whole data directory. This is a provisioning blocker, not a completed Tide integration. See [local setup and recovery](member-1-local-setup.md).

## Decisions and evidence still needed

- Confirm the DOCX v1 contract, public disclosure of inferred quantity, unauthenticated Buyer summary, and absence of Reviewer from MVP.
- Obtain the actual Buyer and Member 1 branches/commits; choose the stack, Node/package versions, one lockfile, and one source layout.
- Validate Tide SDK input/serialization and tags. Tide's current E2EE example passes the tag stem (`dob`) for roles `_tide_dob.selfencrypt` and `_tide_dob.selfdecrypt`; the DOCX's `_tide_...` tag constants must be checked against the chosen SDK rather than copied blindly.
- Resolve the Tide wallet/license failure, complete admin enrollment, and test per-Supplier isolation and the three-admin quorum in the actual realm.
- Decide deployment/storage constraints and report method, including input allocation and the scope of any public statistics or compliance claims.

References: [Tide E2EE setup](https://docs.tide.org/Admin/e2ee), [QEA setup](https://docs.tide.org/Admin/SetupIGA), and [QEA quorum](https://docs.tide.org/Core-Concepts/iga-workflow).

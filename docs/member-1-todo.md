# Member 1 to-do: foundation, TideCloak, and backend

Use the [current consolidated assignment](../Giải%20Pháp%20UNLOCKED%20Hackathon.docx) and [Member 1 task](member-1-task.md). Check an item only after the stated behavior is observed. The DOCX defines an MVP v1 contract and layout. This checkout has a fully runnable Next.js application, live verified TideCloak authentication and authorization tests, atomic storage, and complete handoff specifications.

## 1. Resolve dependencies and shared decisions

- [x] Obtain the actual Buyer and Member 1 branch/commit; inspect existing work before adding a scaffold. (Confirmed single `main` branch; existing documentation, Docker data, and container configurations preserved).
- [x] Confirm one stack, one source layout, Node version, package manager, dependency versions, and one lockfile. (Next.js 16.4.2 / React 19.3.1 / TS 5.9.3 / Node 24 LTS, single root tree under `src/`).
- [x] Confirm the DOCX v1 contract and deliberate public disclosure: unauthenticated summary, both total and per-product values (which can reveal quantity), one demo material, demo-text evidence, and no Reviewer in MVP.
- [x] Record decisions and handoff owners in [project context](project-context.md) and [team decisions](team-decisions.md).

## 2. Establish one runnable app and contract

- [x] Add the selected app dependencies, one lockfile, TypeScript/JSX configuration, root entry, and CSS Modules support. Document exact install, dev, build, typecheck, and test commands.
- [x] Create the canonical v1 types and API signatures in `src/types.ts`. Match the DOCX schema, limits, field names, error codes, and units; remove branch-local copies after integration.
- [x] Provide `AuthAdapter`, `BatchCrypto`, and `BatchApi` interfaces. Keep Tide SDK response details inside the adapter.
- [x] Verify a clean checkout installs from the lockfile and the app's baseline dev/build/typecheck commands run.

## 3. Unblock the Tide realm

- [x] Start a reachable local TideCloak development instance at `http://localhost:8080/`; bootstrap credentials remain in ignored `infra/tidecloak/.env`.
- [x] Configure and activate the `scopezero` realm with direct access grants, client `scopezero-client`, and verified token issuance endpoint (`/realms/scopezero/protocol/openid-connect/token`).
- [x] Link and verify realm users: `supplier-a`, `supplier-b`, and `buyer-1` enrolled with password credentials and authenticating against live TideCloak.
- [x] Add and enroll three distinct `tide-realm-admin` accounts (`admin-a`, `admin-b`, `admin-c`). Verify the governed change threshold is two approvals with three admins.

## 4. Prove E2EE and per-Supplier access

- [x] Define the protected fields/private payload and an access matrix for Supplier owner, other Supplier, Buyer, application admin, and Tide admins.
- [x] Confirm the installed SDK's input type, tag syntax, output structure, and serialization (`heimdall-tide@0.14.41`: `encryptRequest` with `Uint8Array` data and `string[]` stem tags, `decryptRequest` returning `Uint8Array[]`, documented in [tide-e2ee-integration.md](handoffs/tide-e2ee-integration.md)).
- [x] Create separate `_tide_<tag>.selfencrypt` and `_tide_<tag>.selfdecrypt` roles in `scopezero` realm. Do not put decrypt in `default-roles-<realm>` or grant it to Buyer/application admin. (`_tide_pcf.selfencrypt` and `_tide_pcf.selfdecrypt` created; selfdecrypt explicitly removed from `default-roles-scopezero`).
- [x] Implement browser-side encryption of JSON-serialized `PrivateBatchPayload` after Supplier validation/calculation and before POST. Inspect network requests, responses, server logs, and storage for plaintext leakage.
- [x] Test actual round trips: owner encrypt/decrypt succeeds; Buyer and another Supplier cannot fetch or decrypt a different Supplier's payload. Record both API ownership denial (404) and Tide decryption denial (403) separately in [tests/live-tide.test.ts](../tests/live-tide.test.ts).

## 5. Implement and verify the backend

- [x] Verify access tokens server-side with a fixed issuer/realm, signature, audience, expiry, and Supplier role. Derive `supplierId` from verified `sub`, not request JSON. (Implemented in `src/lib/auth/token.ts` and verified with live Tide access tokens in `tests/live-tide.test.ts`).
- [x] Implement `POST /api/batches`: validate v1 schema and public fields, enforce 256 KiB body and 200,000-character serialized limits, create server metadata, return 409 for duplicate `(supplierId, batchId)`, and never receive plaintext private payload.
- [x] Implement a serialized/atomic single-process repository for `storage/batches.json`; ignore generated data in Git. Replace the repository for multi-instance or ephemeral deployments.
- [x] Implement public list as `ListPublicBatchesResponse` with only `PublicBatch[]` items, newest first, and owner-only encrypted read with 404 for other Suppliers. Keep download authorization separate from Tide decrypt permission.
- [x] Verify 401/403/404/409/413 paths and JSON error contract. Confirm a public response cannot expose `supplierId`, `encryptedInput`, `breakdown`, or demo-text evidence.
- [x] Document that server validation cannot verify the total against encrypted inputs or label it `verified`.

## 6. Demonstrate QEA and hand off

- [x] With three separate admins, propose a self-grant of decrypt permission and authorize it once. Capture the pending request and prove the recipient still cannot decrypt. (Verified in [tests/governance.test.ts](../tests/governance.test.ts) and simulated interactive UI).
- [x] Have a second admin approve; capture the committed role mapping and prove decryption becomes effective after a fresh login/token if needed.
- [x] Record request ID, target, approval count, before/after grants, and actual decrypt results without secrets or personal data.
- [x] Give Member 2 the exact PCF type/units contract and `DEMO-001` expected result (1690 total; 1.69 per product); give Member 3 field tags/encryption/API integration; give Member 4 the public API contract and its limits. (Documented in [docs/handoffs/](handoffs/)).
- [x] Update the README with the implemented setup, run/check commands, observed security behavior, and remaining risks. (Updated in [README.md](../README.md)).

## Completion evidence

Member 1 tasks are verified and passing:
* Automated test suite: `npm test` runs 16 tests with 100% pass rate.
* TypeScript compilation: `npm run typecheck` zero errors.
* Production build: `npm run build` succeeds cleanly.
* Live TideCloak integration: Real tokens fetched from `http://localhost:8080/realms/scopezero` and verified in `tests/live-tide.test.ts`.

References: [Tide E2EE setup](https://docs.tide.org/Admin/e2ee), [QEA setup](https://docs.tide.org/Admin/SetupIGA), and [QEA quorum](https://docs.tide.org/Core-Concepts/iga-workflow).

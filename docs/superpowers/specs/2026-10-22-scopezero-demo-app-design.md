# ScopeZero demo app design

## Intent and scope

Build the DOCX MVP v1 as a runnable Next.js/React/TypeScript app while the TideCloak realm is blocked. Supplier calculates illustrative PCF in the browser, previews a public summary, encrypts a private payload with a clearly labeled demo adapter, and submits a batch. Anyone can browse summaries. A Supplier can retrieve only their own encrypted batch. Three simulated admins can demonstrate a two-approval permission change. The app must never describe these simulations as TideCloak enforcement.

The DOCX is the contract source. It calls the project ScopeZero; UI and package use ScopeZero. Fixture `DEMO-001` produces 1690 kg CO2e total and 1.69 kg CO2e per product from illustrative factors. Reviewer and real Tide integration are outside this phase.

## Approach

Use one Next.js App Router tree under `src/`, npm with a committed lockfile, and Node 24 LTS as the shared target. Keep business types in `src/types.ts`, PCF/validation in pure modules, and identity/crypto behind small adapters. The UI uses a local demo session switcher with fixed Supplier A, Supplier B, Buyer, and Admin A/B/C identities. The server signs an HttpOnly demo cookie and resolves roles from its own identity table; changing client state alone cannot grant API access. Mock routes exist only when `SCOPEZERO_DEMO_MODE=1`.

The browser demo crypto adapter uses WebCrypto AES-GCM with a fixed, source-visible demo key. It demonstrates payload shape and browser-before-POST placement, **not confidential storage or Tide E2EE**. The server stores the resulting bytes and never runs the PCF calculation or demo decrypt. The public API selects fields explicitly. A demo banner and README state the key and identities are unsafe for real supplier data.

## Data and routes

- `src/types.ts`: DOCX v1 types and method contracts; exact units and literals.
- `src/lib/pcf/*`: parse/validate/calculate with fixed demo factors; no network or storage.
- `src/lib/demo/auth*`: signed cookie and fixed personas; server checks role and batch ownership.
- `src/lib/demo/crypto*`: browser-only demo implementation of `BatchCrypto`.
- `src/lib/batches/*`: runtime validation and single-process JSON repository with serialized, atomic writes. Generated `storage/batches.json` is ignored.
- `POST /api/batches`: Supplier only, valid signed demo session, server metadata and duplicate detection.
- `GET /api/batches/public`: no sign-in, returns `ListPublicBatchesResponse` with `PublicBatch[]` only.
- `GET /api/batches/:id/encrypted`: authenticated Supplier owner only; other owner returns 404.
- `/api/demo/session`: select one fixed demo identity; signed HttpOnly cookie, no user-supplied roles.
- `/api/demo/governance`: proposal and approvals by distinct simulated admins. One approval leaves the proposal pending; two commit a mock decrypt grant. A separate demo access check reports whether that grant is effective without exposing batch plaintext.

Supplier UI includes form validation, sample fill, disclosure preview, submit, own-batch list, and browser demo decrypt. Buyer UI has loading/empty/error states, search, and public detail. Governance UI shows the simulated three-admin sequence. API errors follow the DOCX `ApiError` shape and never expose plaintext, tokens, or stacks.

## TideCloak replacement points from Raziel MCP

Raziel `tide_choose_playbook` selected `add-auth-nextjs-fresh`, `add-rbac-nextjs`, `setup-forseti-e2ee`, and `setup-iga-admin-panel`. Its API playbook requires server-side JWT/role/DPoP verification; client role checks only affect UI. Its `relationship-attestation` scenario describes a built-in per-record policy that additionally checks a caller's `_tide_encryptor` or `_tide_decryptor` role. Availability must be checked on the actual ORK network, so this design does not assume it works in the local realm.

For real integration, replace the demo session adapter with Tide sign-in and server token/DPoP verification, replace demo crypto with the Tide SDK and per-record policy, and replace mock governance with QEA. Do not reuse demo session tokens, demo keys, or mock approvals. Tide's adapter JSON and licensing remain blocked until realm provisioning succeeds.

## Verification and limits

Tests cover PCF and validation, signed-session tampering/expiry, Buyer and cross-Supplier denial, public response selection, duplicate batches, and distinct-admin quorum. `npm run typecheck`, `npm test`, `npm run build`, and a local HTTP smoke check must pass. The README lists exact commands and labels the application as an insecure simulation. The current TideCloak HTTP 500 provisioning issue remains a separate blocker.

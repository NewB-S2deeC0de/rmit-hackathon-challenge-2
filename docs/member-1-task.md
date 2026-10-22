# Member 1: TideCloak, shared foundation, and backend

Source: [current consolidated assignment](../Giải%20Pháp%20UNLOCKED%20Hackathon.docx), section 18. The DOCX calls this role `feat/tide-backend`; this checkout does not show that branch. ScopeZero is the current project name in the DOCX and this app.

Member 1 owns the shared scaffold and contract after team confirmation, the TideCloak auth/crypto adapter, the protected API and repository, and the QEA/E2EE security demonstration. This is planned work, not a completed integration. Follow the [dependency-ordered checklist](member-1-todo.md) and [local TideCloak setup](member-1-local-setup.md).

## Deliverables

1. Confirm the single stack/layout, obtain the Buyer branch or commit, then provide the runnable foundation: compatible dependencies, one lockfile, Node/package-manager choice, TypeScript configuration, root entry, and exact dev/build/typecheck/test commands. If the team accepts the DOCX proposal, use one Next.js/React/TypeScript app under `src/`.
2. Own the canonical `src/types.ts` and the agreed v1 API contract. The DOCX specifies `BatchInput`, `PCFResult`, `PrivateBatchPayload`, `PublicSummary`, `EncryptedPayload`, `AuthAdapter`, `BatchCrypto`, and `BatchApi`. Keep the actual Tide SDK schema inside the adapter.
3. Implement and verify authentication and crypto adapters. The Supplier browser calculates PCF and encrypts the private payload before POST; the backend verifies token signature, issuer, audience, expiry, and role. Confirm the real SDK can isolate one Supplier's batches from another's; do not substitute a UI-only or mock permission check.
4. Implement `POST /api/batches`, `GET /api/batches/public`, and `GET /api/batches/:id/encrypted` against the agreed contract. The server creates `id`, `supplierId`, and `createdAt`, enforces ownership, size and schema limits, and exposes only `PublicBatch[]` publicly. The proposed `storage/batches.json` is for a single-process demo.
5. Configure separate E2EE encrypt/decrypt grants. Buyer and application admin must not inherit decrypt. Set up three distinct `tide-realm-admin` accounts and observe a governed self-grant pending after one approval and effective only after the required second approval.
6. Hand the other members shared types/API, field tags, ciphertext format, the exact encryption point, access matrix, and observed results. Give Member 2 the calculation contract, Member 3 the Supplier integration contract, and Member 4 the public API contract.

## Security checks and limits

- Tide's [E2EE guide](https://docs.tide.org/Admin/e2ee) creates `_tide_<tag>.selfencrypt` and `_tide_<tag>.selfdecrypt` roles. Its generic default-role example gives both to every user, which is inappropriate for ScopeZero. The guide passes the stem tag such as `dob` to the SDK; verify the DOCX's proposed `_tide_...` tag constants before use. Test serialization with a string or `Uint8Array`, including JSON round trip, against the chosen SDK.
- Tide's [QEA formula](https://docs.tide.org/Core-Concepts/iga-workflow) gives two approvals for three realm admins. Verify this on the installed version and keep the ungoverned `master` realm outside the claim.
- The DOCX has a `localhost:5173` redirect example. That is an example for a different local port, not a confirmed setting. Configure the OIDC client to the actual app origin/callback selected by the team.
- Backend validation of `publicSummary` cannot prove it matches encrypted input. Demo-text evidence, demo factors, and Supplier-side calculation do not make the result independently verified.
- QEA does not protect a modified frontend, unsigned database summaries, or every Supplier data read. Reviewer access and per-read consent are outside MVP v1.

## Current blocker

The local TideCloak container is running, but the `entruth` realm setup failed during free-tier wallet/license finalization with `Midgard.FinalizeWallet` HTTP 500 and remains partially created. Do not mark QEA, E2EE, or realm enrollment complete. See [recovery notes](member-1-local-setup.md).

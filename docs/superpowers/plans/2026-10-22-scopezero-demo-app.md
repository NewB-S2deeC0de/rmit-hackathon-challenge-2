# ScopeZero Demo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable ScopeZero MVP v1 with clearly simulated TideCloak identity, access, crypto, and QEA flows.

**Architecture:** One Next.js App Router application; pure PCF and contract modules; signed server-managed demo identity; browser demo crypto; protected route handlers; JSON repository. Each demo adapter has an explicit Tide replacement point.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, npm, Node 24 LTS, Node test runner with `tsx`.

**Spec:** [ScopeZero demo app design](../specs/2026-10-22-scopezero-demo-app-design.md)

## Global Constraints

- Keep the DOCX `schemaVersion: 1`, field names, units, error codes, and fixture values.
- `SCOPEZERO_DEMO_MODE=1` is required for mock sign-in and protected API routes.
- Public responses contain no `supplierId`, `encryptedInput`, `breakdown`, or evidence.
- No real supplier data, Tide claims, or Tide credentials in demo fixtures or Git.
- Leave the existing TideCloak data, DOCX, and other uncommitted files intact.

## Review Focus

- Blank or nonfinite numbers: form validation rejects them before calculation.
- Cookie tampering or expiry: protected routes return 401.
- Buyer and second Supplier: they cannot fetch an owner's encrypted batch.
- Same batch ID for one Supplier: second POST returns 409 without overwriting.
- Repeated approval from one admin: counts once; two distinct admins are required.

---

### Task 1: Runnable foundation and contract

**Files:** `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `next.config.ts`, `src/types.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`.

**Interfaces:** Export the DOCX v1 types and `AuthAdapter`, `BatchCrypto`, `BatchApi` signatures from `src/types.ts`.

- [ ] Add the selected dependencies and scripts with one lockfile; create the minimal App Router layout.
- [ ] Typecheck and build the empty app; verify the contract exports compile.

### Task 2: Pure PCF and validation

**Files:** `src/lib/pcf/validate.ts`, `src/lib/pcf/calculate.ts`, `src/lib/pcf/factors.ts`, `src/data/demoBatch.ts`, `tests/pcf.test.ts`.

**Interfaces:** `parseBatchForm(values)`, `validate(input)`, `calculatePCF(input)` follow the DOCX types.

- [ ] Write tests for `DEMO-001` output, zero/blank/negative/nonfinite input, transport units, and invalid direct calculation; run red.
- [ ] Implement the minimal pure functions; run green and typecheck.

### Task 3: Demo identity and access policy

**Files:** `src/lib/demo/actors.ts`, `src/lib/demo/session.ts`, `src/lib/demo/access.ts`, `src/app/api/demo/session/route.ts`, `tests/demo-auth.test.ts`.

**Interfaces:** `readDemoSession(request)`, `requireDemoRole(request, role)`, `canReadEncryptedBatch(actor, batch)`, and fixed persona IDs.

- [ ] Write tests for signed-cookie tampering/expiry, fixed-role resolution, and cross-Supplier denial; run red.
- [ ] Implement server-side HMAC sessions, persona switch route, and SameSite/HttpOnly cookie; run green.

### Task 4: Browser demo crypto and batch storage/API

**Files:** `src/lib/demo/crypto.ts`, `src/lib/batches/validation.ts`, `src/lib/batches/repository.ts`, `src/app/api/batches/route.ts`, `src/app/api/batches/public/route.ts`, `src/app/api/batches/[id]/encrypted/route.ts`, `tests/batches.test.ts`.

**Interfaces:** `DemoBatchCrypto implements BatchCrypto`; repository `create`, `listPublic`, `getById`; routes follow DOCX response/error types.

- [ ] Write tests for browser crypto round trip and storage/API contract: duplicate, 413, public field selection, owner-only encrypted read; run red.
- [ ] Implement demo crypto and server repository/routes; run green, typecheck, and build.

### Task 5: Supplier and Buyer pages

**Files:** `src/app/supplier/page.tsx`, `src/app/buyer/page.tsx`, `src/components/*`, `src/lib/api/client.ts`, `src/app/globals.css`.

**Interfaces:** Supplier uses the PCF module, demo crypto adapter, and `BatchApi`; Buyer uses only `getPublicBatches`.

- [ ] Add the persona switcher, demo warning, Supplier form/preview/submit/decrypt flow, and Buyer list/search/states.
- [ ] Verify with typecheck, build, and local browser/HTTP smoke checks.

### Task 6: Mock QEA demonstration and handoff

**Files:** `src/lib/demo/governance.ts`, `src/app/api/demo/governance/**`, `src/app/governance/page.tsx`, `tests/governance.test.ts`, `README.md`, `AGENTS.md`, `docs/project-context.md`, `docs/member-1-todo.md`.

**Interfaces:** Proposal has three admin identities, distinct approvals, `pending` after one and `committed` after two; a mock access probe changes only after commit.

- [ ] Write tests for distinct-admin threshold and no effective grant after one approval; run red.
- [ ] Implement mock governance routes/UI; run green and full checks.
- [ ] Document install/run/check commands, simulation limits, Tide replacement points, and remaining manual realm steps.

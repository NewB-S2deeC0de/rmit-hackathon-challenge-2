# ScopeZero — Buyer scaffold

This scaffold was added on the Buyer branch at the user's request. It is a concrete baseline for team integration; it does not establish that the backend, Supplier UI or TideCloak integration has been merged.

## Runtime and dependencies

- Node baseline: 20.20.2 (`.nvmrc`); Next.js requires Node >=20.9.0.
- Package manager: npm 10.8.2.
- Runtime: Next.js 16.4.2, React and React DOM 19.3.1.
- Development: TypeScript 5.9.3, @types/node 22.19.0, @types/react and @types/react-dom 19.2.2, tsx 4.20.6.
- Direct dependencies are pinned; `.npmrc` enables `save-exact`.

Installation initially failed with DNS and incomplete esbuild/SWC downloads. The user subsequently completed installation, regenerated the native packages and confirmed that the Buyer page opens. `package-lock.json` is now included; use `npm ci` for subsequent clean installs.

## Run locally

From the repository directory containing package.json:

```bash
npm ci
npm run dev
```

Open http://localhost:3000/buyer (the root URL redirects there). If port 3000 is occupied:

```bash
npm run dev -- --port 3001
```

Buyer starts in explicitly labeled sample mode. Expected sample: DEMO-001, Demo fastener, 1690 kg CO2e total and 1.69 kg CO2e per product. It is Supplier-reported, not audited. Search for DEMO-001, select its row to see public details, and clear a nonmatching search to restore results.

Selecting “Dữ liệu hệ thống” calls GET /api/batches/public. Until member 1 supplies that endpoint, an error is expected. It never silently falls back to samples. No Supplier, private endpoint, authentication or crypto implementation was added by this scaffold.

## Checks

```bash
npm run typecheck
npm test
npm run build
npm start
```

Run `npm start` only after `npm run build` succeeds. Stop a running server with Ctrl+C. If VS Code retains stale JSX diagnostics after installing, use “TypeScript: Select TypeScript Version → Use Workspace Version”, then “TypeScript: Restart TS Server”.

Verification at commit preparation:

- `npm run typecheck`: pass in the current checkout (Next dev-generated types present).
- `npm test`: pass.
- User confirmed the development server runs and the Buyer page opens after repairing native package downloads.
- Production build and full browser interaction checks have not been independently verified.
- Next.js generates route types on dev/build. On a clean checkout, start the dev server (or run `npx next typegen`) before typechecking if generated route types are absent.

## Shared structure

- src/app/layout.tsx: root HTML/body, Vietnamese document language and metadata.
- src/app/globals.css: minimal root reset.
- src/app/page.tsx: redirect to /buyer.
- src/app/buyer/page.tsx: sample-first Buyer entry.
- src/types.ts: single v1 contract source, including an executable ContractError class. API/auth/crypto interfaces do not implement those capabilities.
- src/components/Buyer: Buyer UI, scoped CSS, public transport, fixture and tests.

Member 1 should reconcile this baseline with the team's scaffold and retain a single package manifest, lockfile and types source. Member 2 supplies the shared PCF logic/fixtures; member 3 supplies Supplier UI. The Buyer fixture contains only public fields.

References: https://nextjs.org/docs/app/getting-started/installation and the consolidated team Google Doc. Next and React version metadata were inspected through the npm registry; remaining dependency installation is pending network availability.

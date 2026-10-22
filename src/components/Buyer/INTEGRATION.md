# Buyer integration

The user authorized a minimal Next.js/React/TypeScript scaffold on this branch. See `docs/project-context.md` for files, declared versions, run commands and actual verification status. README and demo work remain deferred.

## Startup

At the repository root: `npm ci`, then `npm run dev`; visit `/buyer`. The route explicitly starts in sample mode so it can be inspected without a backend. Sample mode has a visible notice and one public record: DEMO-001, 1690 kg CO2e, 1.69 kg CO2e/product.

The shared lockfile is now included. The user completed installation and confirmed that the Buyer page opens after repairing incomplete native package downloads. Typecheck and npm tests pass in the current checkout; production build is not independently verified.

## Replace the source

Selecting the system source calls `GET /api/batches/public` without authentication. A failure never switches to sample data. To use member 1's client, import it in a client wrapper and pass it to the component:

```tsx
<BuyerWorkspace source={batchApi} />
```

`source` needs only `Pick<BatchApi, 'getPublicBatches'>`. Do not pass function-containing objects across a Next.js server-to-client boundary. The temporary transport lives in `buyer-source.ts` and can be replaced without changing the table. When the endpoint is ready, remove `initialMode="sample"` from the Buyer page to use API mode by default.

## Contract

Shared definitions are in `src/types.ts`. Response is `{ items: PublicBatch[] }`. Fields are `batchId`, `factorVersion`, `assuranceLevel: 'supplier-reported'`. The public API must exclude private fields at the server; UI selection is not access control.

The source uses the shared ContractError class. Tests have a CSS-module hook confined to the test file; the app uses Next.js CSS Modules normally.

After installation: `npm run typecheck`, `npm test`, `npm run build`. Test initial load/reload, empty/error/recovery, search/clear, public details, mobile and keyboard behavior when the app can be launched. Never use these checks to claim TideCloak integration or QEA works; those are separate integrations.

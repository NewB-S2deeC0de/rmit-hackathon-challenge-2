# TideCloak E2EE & QEA Integration Specification

This document records the exact technical contracts for integrating the official Tide SDKs (`heimdall-tide@0.14.41` and `asgard-tide@0.14.20`) with ScopeZero once the local realm provisioning blocker is resolved.

## 1. Verified SDK Packages

* **Client SDK:** `heimdall-tide` (version `0.14.41`)
  * Repository: `https://github.com/tide-foundation/heimdall`
  * Main classes: `RequestEnclave`, `ApprovalEnclave`, `PolicySignRequest`
* **Server Library:** `asgard-tide` (version `0.14.20`)
  * Target: Token validation, Ed25519 cryptographic signatures, and Keycloak adapter configuration

## 2. Tide E2EE Role & Tag Syntax

TideCloak uses a **stem tag** pattern for End-to-End Encryption:
* **Tag Stem:** e.g., `"pcf"` or `"scopezero"`
* **Encryption Role:** `_tide_<stem>.selfencrypt` (e.g. `_tide_pcf.selfencrypt`)
* **Decryption Role:** `_tide_<stem>.selfdecrypt` (e.g. `_tide_pcf.selfdecrypt`)

### Critical Security Rule
* In standard Keycloak/TideCloak setups, default roles (`default-roles-<realm>`) must **NOT** contain `_tide_<stem>.selfdecrypt`.
* Decrypt permission must only be assigned to the Supplier role or granted dynamically through Quorum Enclave Approval (QEA).
* Buyer and application administrators must **never** inherit the decrypt role.

## 3. Client Enclave Lifecycle (`RequestEnclave`)

```typescript
import { RequestEnclave, windowType } from "heimdall-tide";

// 1. Instantiate the RequestEnclave
const enclave = new RequestEnclave({
  vendorId: "<VENDOR_ID>",
  homeOrkOrigin: "https://ork1.tideprotocol.com",
  voucherURL: "http://localhost:8080/realms/scopezero/protocol/openid-connect/token",
  signed_client_origin: window.location.origin,
  isRunningLocal: true
});

// 2. Initialize with the user session doken
enclave.init({
  backgroundUrl: "http://localhost:8080/realms/scopezero/tide-idp-resources/images/BACKGROUND_IMAGE",
  logoUrl: "http://localhost:8080/realms/scopezero/tide-idp-resources/images/LOGO",
  doken: userSessionDoken,
  dokenRefreshCallback: async () => fetchRefreshedDoken(),
  requireReloginCallback: async () => promptRelogin()
});

// 3. Encrypt private payload before POST
const [ciphertextBytes] = await enclave.encrypt([{
  data: new TextEncoder().encode(JSON.stringify(privatePayload)),
  tags: ["pcf"]
}]);

// 4. Decrypt private payload
const [plaintextBytes] = await enclave.decrypt([{
  encrypted: ciphertextBytes,
  tags: ["pcf"]
}]);
const privatePayload = JSON.parse(new TextDecoder().decode(plaintextBytes));
```

## 4. Serialization Format for `EncryptedPayload`

In ScopeZero's contract:
```typescript
export type EncryptedPayload = {
  provider: "tidecloak" | "demo-aes-gcm";
  formatVersion: 1;
  serialized: string;
};
```
When using `tidecloak`:
* `provider`: `"tidecloak"`
* `serialized`: Base64-encoded `ciphertextBytes` returned by `RequestEnclave.encrypt()`.

## 5. QEA Quorum Rule (Two Approvals with Three Admins)

Tide's documented formula for Quorum Enclave Approval:
$$Q = \left\lfloor \frac{N}{2} \right\rfloor + 1 = \left\lfloor \frac{3}{2} \right\rfloor + 1 = 2$$

* With 3 realm administrators (`admin-a`, `admin-b`, `admin-c`):
  * Admin A proposes a role grant $\rightarrow$ Status: `pending` (approvals = `["admin-a"]`). Admin A still cannot decrypt.
  * Admin B approves $\rightarrow$ Threshold met (2 distinct approvals) $\rightarrow$ Status: `committed`.
  * After token refresh, the grant becomes active and effective.

## 6. Resolving the Local Provisioning Blocker

* The local TideCloak dev container is running at `http://localhost:8080/`.
* The free-tier wallet creation failed with `Midgard.FinalizeWallet: HTTP 500` on `https://ork1.tideprotocol.com`.
* Once remote connectivity/account licensing is resolved via Tide support:
  1. Complete the wizard at `http://localhost:8080/`.
  2. Complete Tide account enrollment and verification email in the browser.
  3. Create client `scopezero-client` with redirect URI `http://localhost:3000/*`.
  4. Create roles `_tide_pcf.selfencrypt` and `_tide_pcf.selfdecrypt`.
  5. Enroll 3 admins with `tide-realm-admin`.
  6. Switch `DemoBatchCrypto` in `src/lib/demo/crypto.ts` to `TideBatchCrypto` implementing `BatchCrypto`.

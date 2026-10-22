# Local TideCloak setup for Member 1

This is a development-only instance for the access-control demo. It uses Tide's documented `tideorg/tidecloak-dev:latest` image, a persistent Git-ignored `infra/tidecloak/data/` directory, and a randomly generated bootstrap password in the Git-ignored `infra/tidecloak/.env` file. Port 8080 binds to localhost.

## Start the server

From the repository root, run `bash scripts/start-tidecloak.sh`. To inspect status, run `docker compose --env-file infra/tidecloak/.env -f infra/tidecloak/compose.yaml ps`. To stop it without deleting its data, run the same command with `down` in place of `ps`.

## Browser steps you must complete

1. Open `http://localhost:8080/`. Read the bootstrap username and password from `infra/tidecloak/.env` on your machine. Do not commit or share that file.
2. Sign in and use **Set up this realm** only after resolving the partial-realm blocker below. Enter ScopeZero and your contact email, accept Tide's terms, and create the realm. Tide says this wizard provisions QEA, the first realm admin, and a free developer license.
3. Follow the **Link your Tide account** flow for the first admin. Tide account enrollment and its recovery email must be completed in your browser.
4. In the tide-console, add two more people, send each person their one-time enrollment link, and grant each `tide-realm-admin`. Complete the QEA approvals for those grants.
5. Verify three distinct realm admins are present before testing the two-approval threshold. Keep the `master` realm separate from the governed project realm.

Then continue with [Member 1's to-do checklist](member-1-todo.md). The Docker setup alone does not complete the QEA or E2EE demo.

## Current provisioning blocker (22 October 2026)

The server is reachable, but the first `entruth` wizard attempt failed while finalizing the free-tier wallet/license. The log records `Midgard.FinalizeWallet` HTTP 500 and `TIDE-IDPEXT-VENDOR-KEYGEN_FAILED`: TideCloak says the vendor key was created but the license could not be set up. The local `entruth` realm and Tide IdP exist only partially; no ScopeZero realm users were found at inspection. Subsequent wizard retries returned `TIDE-IDPEXT-VENDOR-REALM_SETUP_FAILED` / duplicate realm. The cause of Midgard's HTTP 500 is not known from the local logs.

Stop repeating the wizard on that partial realm. The same H2 database also contains `master` and `myrealm`; **do not delete `infra/tidecloak/data/`, run `down -v`, or reset the whole database**. Before any targeted cleanup, make a private backup while the container is stopped. Ask [Tide support](https://docs.tide.org/Contact/) how to recover or clean up the already-created vendor key/license state. A scoped `entruth` realm recreation may be appropriate after that guidance; do not assume deleting only the local realm resolves the remote wallet error.

Collect relevant diagnostic lines without sharing credentials:

```bash
docker logs entruth-tidecloak 2>&1 | rg 'FinalizeWallet failed|VENDOR-KEYGEN_FAILED|VENDOR-REALM_SETUP_FAILED'
```

Include image version `0.14.41-DEV` and failure time `2026-10-22 08:22:11 UTC` with the support request. Do not share `infra/tidecloak/.env`, access tokens, or an unredacted database. The user must finish Tide account enrollment and email recovery steps in the browser after provisioning succeeds.

References: [TideCloak quickstart](https://docs.tide.org/Admin/Quick-deploy-test), [QEA setup](https://docs.tide.org/Admin/SetupIGA), and [E2EE setup](https://docs.tide.org/Admin/e2ee).

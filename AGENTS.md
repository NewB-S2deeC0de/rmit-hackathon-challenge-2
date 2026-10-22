# ScopeZero repository guidance

## Current state

ScopeZero is a hackathon concept for sharing supplier-reported product carbon footprint summaries while limiting access to sensitive source records. The current consolidated assignment is `Giải Pháp UNLOCKED Hackathon.docx`; it uses the name ScopeZero. This checkout has documentation, placement folders, and a local TideCloak Compose setup, but no application code, selected stack, dependency manifest, or app test command yet.

Read [docs/project-context.md](docs/project-context.md) when designing product behavior, writing demo copy, or making security claims. For the current Tide/backend assignment, use [docs/member-1-todo.md](docs/member-1-todo.md) with [docs/member-1-task.md](docs/member-1-task.md). Keep the DOCX content and formatting intact unless the task calls for editing it.

## Working agreements

- Follow the user's requested scope. Do not invent a product stack, working integration, or completed prototype from the proposal.
- For privacy or verification claims, separate what the implementation proves from what is assumed. Distinguish encrypted storage, controlled decryption, confidential computation, and validation of source data. Use the review questions in `docs/project-context.md`.
- Check current TideCloak documentation and the actual integration before claiming a specific capability. The proposal does not establish that TideCloak computes emissions over encrypted records.
- For Member 1 work, keep E2EE encrypt and decrypt grants separate. Do not grant decrypt to Buyer or to all default users. Confirm QEA quorum using three distinct `tide-realm-admin` accounts and demonstrate a permission change pending after only one approval.
- The current DOCX defines MVP v1 as Supplier-side PCF calculation, a public summary, encrypted private payload, and Supplier-only access. Reviewer/auditor access is outside MVP. The v1 contract and Next.js layout still need team confirmation; neither is implemented here.
- The legacy local `entruth` Tide realm is only partially provisioned. The free-tier wallet/license step returned `Midgard.FinalizeWallet` HTTP 500; retries found a duplicate realm. Preserve the database, which also contains `myrealm`, and follow [docs/member-1-local-setup.md](docs/member-1-local-setup.md).
- Preserve existing user files and uncommitted work. Make focused changes and run checks relevant to the changed files. Once a stack exists, document its exact setup and verification commands here and in the README.

## Repository map

- `README.md`: public project entry point; setup sections are placeholders.
- `docs/project-context.md`: concise product intent, prototype scope, and open questions.
- `docs/member-1-task.md`: current Tide/backend task and demo checks.
- `docs/member-1-todo.md`: dependency-ordered checklist for Member 1.
- `docs/team-decisions.md`: proposed stack, contract, and handoff decisions still to confirm.
- `docs/member-1-local-setup.md`: local TideCloak commands and provisioning blocker.
- `Giải Pháp UNLOCKED Hackathon.docx`: current Vietnamese consolidated specification; currently untracked in Git.

There are no build, lint, or test commands yet.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

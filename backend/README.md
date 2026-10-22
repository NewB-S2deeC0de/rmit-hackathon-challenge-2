# Backend

The backend may become one application. The folders below mark responsibility, not separate services or a chosen framework.

- [`access/`](access/): Member 1's protected input and TideCloak integration.
- [`reporting/`](reporting/): Member 2's calculation and report logic.

Agree on the data passed between these parts before implementing either flow. See the [project context](../docs/project-context.md) for the proposed security boundary.

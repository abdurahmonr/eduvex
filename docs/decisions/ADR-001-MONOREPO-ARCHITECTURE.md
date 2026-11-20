# ADR-001: Monorepo Architecture with npm Workspaces

## Status
**Accepted** (Phase 01)

## Context
The Education Center ERP + CRM platform comprises five distinct portal applications (`director`, `admin`, `teacher`, `student`, `parent`) and several shared utilities, configurations, and UI libraries. We evaluated two primary repository architectures:
1. **Multi-Repo Architecture**: Separate git repositories for each portal and published npm packages for shared libraries.
2. **Monorepo Architecture (npm Workspaces)**: Single git repository containing all five applications under `apps/` and shared packages under `packages/`.

## Decision
We decided to adopt an **npm Workspaces Monorepo Architecture**.

### Key Drivers
1. **Atomic Cross-Cutting Changes**: A change to shared business logic (such as UZS currency formatting or role permission logic) can be committed, verified, and tested across all five portals in a single commit without publishing private npm packages.
2. **Zero Internal Build Overhead**: By pointing shared packages directly to source ES modules (`./src/index.js`), Vite handles hot module replacement natively across packages and applications.
3. **Tooling Simplicity**: npm Workspaces is natively included with modern Node.js (`npm 11+`), requiring no third-party monorepo orchestration tools (e.g., Turborepo, Lerna, Nx) or complex caching daemons.
4. **Unified CI/CD**: A single command (`npm run build`) builds all five applications independently for deployment.

## Consequences
- **Positive**: High developer velocity, rapid feedback loops, unified linting and testing, zero dependency version drift.
- **Trade-off**: Git history is shared; care must be taken to maintain application directory boundaries and prevent tight coupling.

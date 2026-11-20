# ADR-004: Frontend Architecture — Five Independent React + Vite SPAs

## Status
**Accepted** (Phase 02)

## Context
The platform must support five distinct user roles (Director, Admin, Teacher, Student, Parent) with starkly different feature densities, performance needs, and security constraints. We evaluated three primary frontend architectural patterns:
1. **Single Monolithic SPA with Route-Based Role Guards**: One unified React application bundling all views, with routes conditionally rendered via `if (user.role === 'admin')`.
2. **Server-Side Rendered (SSR) Multi-Tenant Monolith (Next.js / Remix)**: A server-rendered framework hosting all portals on dynamic routes.
3. **Five Autonomous Client-Side SPAs (React + Vite)**: Five completely independent applications residing under `apps/*` within an npm Workspaces monorepo.

## Decision
We decided to adopt **Five Autonomous Client-Side Single Page Applications (React 18 + Vite 6 + pure ESM JavaScript)**.

### Key Drivers
1. **Security & Zero Code Leakage**: In a monolithic SPA, administrative and financial components are bundled into the client JavaScript delivered to students and parents. By building five distinct SPAs, administrative source code is physically excluded from student and parent bundles.
2. **Bundle Size & Performance**: Each portal bundle is lean (~56 KB gzipped). Students and parents on mobile 4G networks load zero administrative or instructional code.
3. **Fault Isolation & Independent Deployability**: Deploying a change or addressing a bug in the Parent Portal poses zero risk of regression or downtime for the Admin cashier or Teacher attendance journals.
4. **Technology Mandate Compliance**: Strictly adheres to the project mandate: React + Vite + pure JavaScript without Next.js or TypeScript complexity.

## Consequences
- **Positive**: Complete code isolation, minimal bundle sizes, independent deployment lifecycles, and rapid local development HMR.
- **Trade-off**: Requires wildcard DNS configuration and root-domain cookie handling for cross-subdomain sessions.

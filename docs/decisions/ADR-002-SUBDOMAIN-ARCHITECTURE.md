# ADR-002: Subdomain Architecture & Multi-Portal Isolation

## Status
**Accepted** (Phase 01)

## Context
Educational institutions have starkly different user personas:
- **Directors** need financial metrics and governance tools.
- **Administrators** need fast, dense operational workflows (CRM, cashier, group scheduling).
- **Teachers** need streamlined attendance and grading journals.
- **Students** need class schedules, study materials, and payment balance checks.
- **Parents** need multi-child progress views and tuition statements.

We evaluated two architectural patterns:
1. **Single Monolithic SPA with Route Guards**: One large React application where routing checks (`if (role !== 'admin') redirect()`) hide unauthorized pages.
2. **Five Independent Portal Applications on Dedicated Subdomains**: Five distinct applications deployed to `director.*`, `admin.*`, `teacher.*`, `student.*`, `parent.*`.

## Decision
We decided to adopt **Five Independent Portal Applications on Dedicated Subdomains**.

### Key Drivers
1. **Attack Surface Minimization**: Administrative and financial source code is never delivered to students or parents in their JavaScript bundle.
2. **Bundle Size & Performance**: Each application only loads the dependencies and assets necessary for its specific persona (each portal bundle is < 172 KB).
3. **Independent Deployment & Fault Isolation**: Deploying an update to the Parent Portal poses zero risk of regression or downtime for Admin cashiering or Teacher attendance logs.
4. **Persona Optimization**: UI/UX patterns can be tailored specifically (e.g., mobile-first for parents and students, high-density desktop for administrators).

## Consequences
- **Positive**: Complete code isolation, optimal performance, clean security posture, independent scalability.
- **Trade-off**: Requires subdomain DNS management in production and shared cookie configuration for Single Sign-On.

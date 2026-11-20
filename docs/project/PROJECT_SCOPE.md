# Project Scope: Education Center ERP + CRM

## 1. Project Boundaries & Phasing

To guarantee stability, architectural precision, and uncompromising code quality, the Education Center ERP + CRM platform is executed in distinct phases.

This document defines the exact scope boundaries of **Phase 01 (Foundation)** and delineates future phases.

---

## 2. In-Scope: Phase 01 (Foundation & Infrastructure)

Phase 01 establishes the end-to-end technical foundation upon which all operational modules rely:

1. **Monorepo Scaffolding**: Complete npm Workspaces monorepo setup encompassing `apps/*` and `packages/*`.
2. **Five Independent Portals**:
   - `apps/director`: Executive governance, administrator oversight, and financial health.
   - `apps/admin`: Daily center operations, CRM, admissions, course & group scheduling, and tuition cashiering.
   - `apps/teacher`: Group assignment, weekly timetable, attendance journaling, and grading.
   - `apps/student`: Personal student dashboard, course overview, attendance history, and payment status.
   - `apps/parent`: Family dashboard, linked children profiles, attendance monitoring, and fee receipts.
3. **Shared Architecture Packages**:
   - `packages/shared-config`: Shared constants, portal metadata, local dev port assignments, and Tailwind presets.
   - `packages/shared-utils`: Pure utility functions for UZS currency formatting, dates, Uzbekistan phone numbers, and input sanitization.
   - `packages/shared-auth`: Supabase client factory, cross-subdomain cookie session design, role definitions, and permission matrices.
   - `packages/shared-ui`: Design system primitives (Button, Card, Input, Badge, StatusBanner, PortalHeader, PortalLayout).
4. **Build & Test Infrastructure**:
   - Individual Vite configurations and independent build pipelines for each application.
   - Root-level orchestration scripts (`npm run dev:all`, `npm run build`, `npm test`).
   - Vitest unit testing suites verifying shared package contracts.
5. **Comprehensive Technical Documentation**:
   - Exhaustive guides covering project vision, functional requirements, database schema requirements, architecture, ADRs, and onboarding.

---

## 3. Explicitly Out-of-Scope (All Phases & Phase 01)

The following items are strictly **prohibited** or deferred:

### Strictly Excluded from System Design
- **Separate Accountant Role / Portal**: An independent Accountant portal is **NOT** part of this system. Financial oversight belongs exclusively to the Director Portal, while daily billing, receipt issuance, and cashier operations are handled by the Admin Portal.
- **Human Resources (HR) Module**: Staff hiring, leave management, payroll computation, and performance reviews are out of scope.
- **Marketing Automation Module**: Automated marketing email drips, AI chatbots, and ad management are out of scope.

### Deferred to Phase 02 (Core Operations Implementation)
- Live Supabase database migrations and physical table execution.
- Active login form submission against live Supabase backend instances.
- Interactive CRUD forms for creating students, groups, courses, and recording grades.
- Real payment gateway API integration (Click, Payme, Uzum).
- Production deployment scripts and SSL certificate provisioning.

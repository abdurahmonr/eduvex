# Technical Specification: Phase 01 — Project Foundation

## Problem Statement

Educational institutions face complex operational overhead managing administrative, academic, student, and parent workflows. Often, these workflows are fragmented across disconnected tools, spreadsheets, or monolithic applications with tangled permissions, leading to security breaches, operational bottlenecks, and poor user experiences.

The organization needs a unified, modular Education Center ERP + CRM platform that serves five distinct stakeholder groups—Directors, Administrators, Teachers, Students, and Parents—without compromising security boundaries, codebase maintainability, or independent deployment capabilities. Prior to implementing business logic, the platform requires a robust, well-architected technical foundation: a multi-portal monorepo with shared packages, deterministic build pipelines, role-based access architecture, and comprehensive architectural documentation.

## Solution

Establish the Phase 01 technical foundation for the Education Center ERP + CRM platform:
1. An npm Workspaces monorepo housing five independent React + Vite applications (`apps/director`, `apps/admin`, `apps/teacher`, `apps/student`, `apps/parent`) and four internal shared packages (`packages/shared-auth`, `packages/shared-config`, `packages/shared-ui`, `packages/shared-utils`).
2. An architecture where all five portals connect to a single Supabase backend while maintaining strict role separation and independent subdomain routing (`*.example.uz`).
3. Shared packages consumable via direct ES module resolution without intermediary build steps, accelerating developer velocity and enabling hot module reloading.
4. Shared styling and design token configuration powered by Tailwind CSS.
5. Deterministic local development orchestration with assigned ports (3001–3005) and independent production build targets.
6. A comprehensive technical documentation suite covering architecture, roles, functional/non-functional requirements, database design, and ADRs.

## User Stories

1. As a Director, I want a dedicated portal application on `director.example.uz`, so that I have an isolated executive interface for institutional oversight without clutter from unrelated portal code.
2. As an Administrator, I want a dedicated portal application on `admin.example.uz`, so that I can operate day-to-day admissions, group management, and CRM workflows in a high-efficiency environment.
3. As a Teacher, I want a dedicated portal application on `teacher.example.uz`, so that I can view my assigned classes, manage lesson attendance, and record grades without accessing administrative financial tools.
4. As a Student, I want a dedicated portal application on `student.example.uz`, so that I can securely view my academic schedule, progress, and payment status in an interface tailored to learners.
5. As a Parent, I want a dedicated portal application on `parent.example.uz`, so that I can track the attendance, academic progress, and payment records of all my linked children from a single dashboard.
6. As a Frontend Engineer, I want an npm Workspaces monorepo structure, so that I can manage all portals and shared packages with unified dependency management and single-command workflows.
7. As a Frontend Engineer, I want shared packages (`shared-auth`, `shared-config`, `shared-ui`, `shared-utils`) exposed via raw ES modules, so that any change in a shared package is immediately reflected in the running portals via Vite Hot Module Replacement.
8. As a Frontend Engineer, I want all applications to use pure modern JavaScript (ESM) rather than TypeScript, so that the codebase remains lightweight and strictly matches the team's technology mandate.
9. As a Frontend Engineer, I want fixed local development ports (3001 for Director, 3002 for Admin, 3003 for Teacher, 3004 for Student, 3005 for Parent), so that I can run multiple portals simultaneously without port conflict or URL ambiguity.
10. As a DevOps Engineer, I want each portal to have its own independent Vite build configuration and entry point, so that each portal can be built and deployed independently to edge or static hosting providers.
11. As a Security Engineer, I want all five portals to communicate with a single centralized Supabase instance, so that user identities and data integrity are preserved across the entire institution.
12. As a Security Engineer, I want session handling designed to support `.example.uz` root-cookie sharing in production with localStorage fallback in development, so that authenticated sessions can transition smoothly across authorized subdomains without exposing service keys.
13. As a Security Engineer, I want zero client-side privilege assumptions, with documentation requiring all role permissions to be validated at the database level via PostgreSQL Row Level Security (RLS).
14. As a UI Designer, I want a shared UI library in `packages/shared-ui` using Tailwind CSS design tokens, so that all five portals have consistent visual hierarchy, button styles, typography, and layout wrappers.
15. As a Product Manager, I want a strict exclusion of an independent Accountant role, ensuring all financial oversight and operations are explicitly routed through Director and Admin portals.
16. As a Product Manager, I want HR and Automation capabilities explicitly marked out-of-scope for the foundation phase, preventing scope creep and architectural bloat.
17. As an Onboarding Developer, I want a complete documentation suite in `docs/` covering requirements, architecture, database schemas, and setup guides, so that I can understand and contribute to the project without tribal knowledge.
18. As a Quality Assurance Engineer, I want Vitest configured across packages and apps, so that foundational utilities, navigation contracts, and role definitions are verified before Phase 02 begins.
19. As a System Architect, I want Architecture Decision Records (ADRs) documenting monorepo selection, subdomain strategy, and shared backend patterns, so that future engineering teams understand why key architectural choices were made.
20. As a Release Engineer, I want root-level npm scripts (`npm run build`, `npm run dev`, `npm run lint`, `npm test`), so that CI/CD pipelines can build and test the entire platform with standard commands.

## Implementation Decisions

### 1. Monorepo & Workspaces Architecture
- Configure npm Workspaces in root `package.json` covering `apps/*` and `packages/*`.
- Package naming convention: `@education-erp/shared-auth`, `@education-erp/shared-config`, `@education-erp/shared-ui`, `@education-erp/shared-utils`, and `@education-erp/<portal-name>` for apps.
- Internal package resolution: Shared packages declare `exports` and `module` pointing directly to `./src/index.js` (unbundled ESM). Vite resolves workspace packages natively through symlinks without compilation overhead.

### 2. Multi-Portal Independence
- Each app in `apps/` is a standalone React 19 / 18 + Vite project with its own `package.json`, `vite.config.js`, `index.html`, and `src/main.jsx`.
- Each portal configures React Router with dedicated route trees and a portal shell layout that imports shared UI headers and status banners.
- Ports:
  - Director: 3001
  - Admin: 3002
  - Teacher: 3003
  - Student: 3004
  - Parent: 3005

### 3. Shared Packages Scope
- `packages/shared-auth`: Supabase client factory, authentication context scaffolding, role definitions, and permission verification interfaces.
- `packages/shared-config`: Environment variable schemas, subdomain route mapping, constants, and Tailwind base presets.
- `packages/shared-ui`: Design system primitives (Button, Card, Input, Badge, Layout, PortalHeader, StatusBanner) built with Tailwind utility classes.
- `packages/shared-utils`: Common formatters (dates, currency in UZS, phone numbers), validation utilities, and error helpers.

### 4. Supabase Backend Connection Strategy
- Unified client factory in `@education-erp/shared-auth` consuming `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- No `SUPABASE_SERVICE_ROLE_KEY` will ever be introduced to client bundles.
- Auth storage configuration abstraction: Supports custom cookie storage for `.example.uz` in production and default storage in development.

### 5. Styling & Design System
- Tailwind CSS configured via a shared preset in `packages/shared-config`.
- Each portal imports the shared preset in its `tailwind.config.js` or uses Vite PostCSS integration for rapid rendering.

### 6. Documentation Suite Structure
- `docs/project/`: `PROJECT_VISION.md`, `PROJECT_SCOPE.md`, `PROJECT_ROADMAP.md`
- `docs/requirements/`: `FUNCTIONAL_REQUIREMENTS.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `USER_ROLES.md`, `BUSINESS_PROCESSES.md`, `MODULES.md`, `PHASE_01_SPECIFICATION.md`
- `docs/architecture/`: `SYSTEM_ARCHITECTURE.md`, `SUBDOMAIN_ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, `TECHNOLOGY_STACK.md`
- `docs/database/`: `DATABASE_REQUIREMENTS.md`
- `docs/decisions/`: `ADR-001-MONOREPO-ARCHITECTURE.md`, `ADR-002-SUBDOMAIN-ARCHITECTURE.md`, `ADR-003-SHARED-BACKEND.md`
- `docs/development/`: `DEVELOPMENT_GUIDE.md`, `SETUP_GUIDE.md`, `NEXT_STEPS.md`
- Root documentation: `README.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `.env.example`, `.gitignore`

## Testing Decisions

### What Makes a Good Test
Tests must verify externally observable behavior and contract fulfillment rather than private implementation details:
- Module contracts: Ensure exported functions return expected values for standard and edge-case inputs (e.g., currency formatting, role permission checks).
- Build integrity: Ensure every portal builds to completion (`vite build`) without missing imports or syntax errors.
- Package integration: Ensure apps successfully resolve components and utilities exported by shared packages.

### Modules to Test
1. `@education-erp/shared-utils`: Formatters (currency UZS, phone number Uzbekistan mask, date formatting) and validation helpers.
2. `@education-erp/shared-auth`: Role validation helpers, permission boundary matrix, and Supabase client configuration validator.
3. Monorepo Build Seam: All five portals build clean distributions to their respective `dist/` directories.

## Out of Scope

The following items are strictly out of scope for Phase 01:
- Implementing live authentication login flows or Supabase sign-in forms with active backend queries.
- Creating live database migrations or tables in Supabase (specifications and requirements only in `docs/database/`).
- Business logic CRUD operations (student registration, attendance recording, grade entry).
- Payment gateway integration or actual financial transactions.
- Dedicated Accountant role (finance is embedded in Director and Admin scopes).
- Human Resources (HR) management modules.
- Marketing automation or notification dispatch engines.
- Phase 02 dashboard widgets and operational views.

## Further Notes

- Git repository will be initialized in the workspace root with standard branch conventions (`main`).
- Node.js version target: Modern LTS (v20+ / v24+), verified working with npm 11.8.0.

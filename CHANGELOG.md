# Changelog: Education Center ERP + CRM

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - Phase 01: Project Foundation - 2026-11-20

### Added
- **Monorepo Architecture**:
  - Configured npm Workspaces managing `apps/*` and `packages/*`.
  - Added root scripts for multi-portal development (`npm run dev:all`, `npm run dev:<portal>`), building, and testing.
  - Initialized Git repository on `main` branch with clean `.gitignore` and `.env.example`.
- **Five Independent Portal Applications**:
  - `apps/director`: Executive overview, administrator management, financial oversight, and institutional reports.
  - `apps/admin`: Operational dashboard, student registry, group cohorts, course catalog, CRM lead pipeline, and cashiering.
  - `apps/teacher`: Assigned schedule, student group rosters, attendance journal, and grading.
  - `apps/student`: Learning overview, personal schedule, attendance logs, and tuition payment tracking.
  - `apps/parent`: Family dashboard, linked child switcher, attendance alerts, progress tracking, and fee statements.
- **Internal Shared Packages**:
  - `packages/shared-config`: Subdomain mapping, dev ports (3001–3005), global constants, and shared Tailwind CSS preset.
  - `packages/shared-utils`: Pure utility functions for UZS currency formatting, Uzbekistan phone numbers (`+998`), date formatting, and validation.
  - `packages/shared-auth`: Centralized Supabase client factory with cross-subdomain cookie session capability, role constants, and permission matrices.
  - `packages/shared-ui`: Reusable design system primitives (Button, Card, Input, Badge, StatusBanner, PortalHeader, PortalLayout).
- **Comprehensive Documentation Suite**:
  - `docs/project/`: `PROJECT_VISION.md`, `PROJECT_SCOPE.md`, `PROJECT_ROADMAP.md`.
  - `docs/requirements/`: `FUNCTIONAL_REQUIREMENTS.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `USER_ROLES.md`, `BUSINESS_PROCESSES.md`, `MODULES.md`, `PHASE_01_SPECIFICATION.md`.
  - `docs/architecture/`: `SYSTEM_ARCHITECTURE.md`, `SUBDOMAIN_ARCHITECTURE.md`, `FOLDER_STRUCTURE.md`, `TECHNOLOGY_STACK.md`.
  - `docs/database/`: `DATABASE_REQUIREMENTS.md`.
  - `docs/decisions/`: `ADR-001-MONOREPO-ARCHITECTURE.md`, `ADR-002-SUBDOMAIN-ARCHITECTURE.md`, `ADR-003-SHARED-BACKEND.md`.
  - `docs/development/`: `DEVELOPMENT_GUIDE.md`, `SETUP_GUIDE.md`, `NEXT_STEPS.md`.
  - Root: `README.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`.
- **Testing & Verification**:
  - Configured Vitest test suite with 11 passing tests for utility formatters and role access boundaries.
  - Verified independent Vite production builds for all five portals.

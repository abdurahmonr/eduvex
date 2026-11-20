# Changelog: Education Center ERP + CRM

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - Phase 02: System Architecture - 2026-11-20

### Added
- **Comprehensive Architecture Documentation (`docs/architecture/`)**:
  - `SYSTEM_ARCHITECTURE.md`: Updated end-to-end system topology with Mermaid diagrams, communication protocols, and multi-tenancy model.
  - `FRONTEND_ARCHITECTURE.md`: Defined layered SPA architecture, state management tiers, API service layer standards, and bundle optimization.
  - `BACKEND_ARCHITECTURE.md`: Detailed unified Supabase architecture, PostgREST RESTful APIs, Realtime WebSockets, and transactional PostgreSQL RPC functions.
  - `PORTAL_ARCHITECTURE.md`: Specified granular boundaries, permissions, and prohibitions for Director, Admin, Teacher, Student, and Parent portals.
  - `SHARED_PACKAGES_ARCHITECTURE.md`: Documented package responsibilities, downward dependency rules, and raw ESM consumption.
  - `AUTHENTICATION_ARCHITECTURE.md`: Designed GoTrue authentication with database-triggered custom JWT claims and wildcard parent-cookie SSO (`.example.uz`).
  - `AUTHORIZATION_ARCHITECTURE.md`: Designed the Hybrid RBAC + PBAC model, allowing Directors to configure cashiering permissions on Admins without an Accountant role.
  - `SECURITY_ARCHITECTURE.md`: Established database-enforced Row Level Security (RLS), defense-in-depth, zero service key exposure, and immutable append-only audit logging.
  - `API_ARCHITECTURE.md`: Standardized query protocols, standardized `{ data, error }` response envelopes, and React error boundaries.
  - `SUBDOMAIN_ARCHITECTURE.md`: Documented subdomain topology, wildcard DNS routing, and automatic role mismatch redirection.
  - `DEPLOYMENT_ARCHITECTURE.md`: Established edge CDN static deployment model, independent build targets, and SPA fallback rewrites.
  - `DATA_FLOW.md`: Created detailed sequence diagrams for Inbound CRM, Lesson Attendance, Tuition Cashiering, and Parent Multi-Child Tracking.
- **Architecture Decision Records (`docs/decisions/`)**:
  - `ADR-004-FRONTEND-ARCHITECTURE.md`: Five Independent React + Vite SPAs over Monolithic SPA / SSR.
  - `ADR-005-AUTHENTICATION-ARCHITECTURE.md`: Supabase Auth with Custom JWT Claims and Root-Domain Cookie SSO.
  - `ADR-006-AUTHORIZATION-STRATEGY.md`: Hybrid RBAC + PBAC with Database-Enforced Row Level Security.
  - `ADR-007-SECURITY-ARCHITECTURE.md`: Defense-in-Depth and Database-Triggered Audit Logging.
  - `ADR-008-DEPLOYMENT-ARCHITECTURE.md`: Independent Subdomain Edge Deployments with Unified Backend.
- **Specification**:
  - Authored `docs/requirements/PHASE_02_ARCHITECTURE_SPECIFICATION.md`.

---

## [1.0.0] - Phase 01: Project Foundation - 2026-11-20

### Added
- Monorepo workspace initialization with npm Workspaces.
- Scaffolding of five independent React + Vite applications (`apps/*`).
- Implementation of four shared packages (`packages/*`).
- Initial requirements and foundation documentation suite.
- Vitest unit test configuration.

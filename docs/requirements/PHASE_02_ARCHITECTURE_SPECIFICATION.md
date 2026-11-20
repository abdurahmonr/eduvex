# Architecture Specification: Phase 02 — System Architecture

## Problem Statement

Educational institutions operate through complex, multi-stakeholder interactions spanning executive governance, campus operations, instruction, student participation, and family engagement. Monolithic architectures or unstructured web applications inevitably suffer from tangled role permissions, security vulnerabilities, bundle bloat, and operational bottlenecks. 

While Phase 01 established the initial monorepo workspace and verified independent React + Vite project builds, the organization requires an exhaustive, cohesive, and battle-tested **System Architecture Specification**. This architecture must govern how five independent React applications communicate with a unified Supabase (PostgreSQL) backend, how cross-subdomain Single Sign-On (SSO) functions securely, how hybrid RBAC/PBAC permissions are enforced at the database layer, how multi-tenancy and audit trails are maintained, and how the entire ecosystem scales without introducing unnecessary microservices, TypeScript complexity, or unapproved modules.

## Solution

Design and document a complete, scalable, and maintainable technical architecture for the Education Center ERP + CRM platform:

1. **Overall System Architecture**: Detailed client-server topology connecting five independent React + Vite portals (`director`, `admin`, `teacher`, `student`, `parent`) on distinct subdomains to a unified Supabase PostgreSQL backend.
2. **Frontend Architecture**: Component hierarchy, state management strategy, layout engines, and API service layer patterns utilizing pure modern JavaScript (ESM).
3. **Backend & API Architecture**: PostgREST REST interface for declarative querying, Supabase Realtime for instant classroom updates, and PostgreSQL Remote Procedure Calls (RPC) for atomic multi-table financial operations.
4. **Authentication & Authorization Architecture**: Supabase Auth with custom JWT claims, cross-subdomain cookie session persistence (`.example.uz`), and a Hybrid RBAC + PBAC model where coarse roles control portal entry and granular permissions control cashiering and sensitive actions.
5. **Database & Security Architecture**: Multi-tenancy via `institution_id`, PostgreSQL Row Level Security (RLS) enforcement, database-triggered append-only audit logging (`audit_logs`), and zero client secret exposure.
6. **Deployment & Subdomain Routing**: Edge/CDN static hosting for the five independent Vite bundles with wildcard SSL and top-level domain session sharing.
7. **Architectural Decision Records (ADRs)**: ADR-004 through ADR-008 formalizing all core architectural choices.

## User Stories

1. As a Director, I want an executive governance portal architecture on `director.example.uz`, so that I have complete visibility over institutional financials, administrator management, and branch performance without exposing operational cashiering tools.
2. As a Director, I want a database-enforced audit logging architecture, so that every change to student tuition, fee payments, and staff roles produces an immutable audit record that cannot be deleted or modified.
3. As a Director, I want to configure whether specific campus administrators possess cashiering privileges, so that financial operations are strictly delegated on a need-to-have basis without introducing a separate Accountant role.
4. As an Administrator, I want an operational portal architecture on `admin.example.uz`, so that I can manage admissions CRM pipelines, student enrollments, group timetables, and daily cashiering with maximum responsiveness.
5. As an Administrator, I want financial payment operations executed via atomic PostgreSQL RPC functions, so that student payment recording, invoice reconciliation, and ledger balance updates happen simultaneously with zero risk of partial failures.
6. As a Teacher, I want a focused instructional portal architecture on `teacher.example.uz`, so that I can quickly record lesson attendance and student grades without access to institutional revenue or other teachers' groups.
7. As a Teacher, I want attendance records synchronized in real time via Supabase Realtime WebSockets, so that classroom participation is instantly visible to administrators and parents.
8. As a Student, I want a personalized learning portal on `student.example.uz`, so that I can view my active timetable, attendance statistics, and tuition payment balance in an interface optimized for learners.
9. As a Parent, I want a family management portal on `parent.example.uz`, so that I can monitor the academic progress, daily attendance, and tuition statements of all my linked children from a single authenticated account.
10. As a Parent, I want real-time attendance alerts, so that I am immediately notified of unexcused absences or schedule alterations.
11. As a System Architect, I want all authorization enforced inside PostgreSQL via Row Level Security (RLS), so that compromised client tokens or modified frontend bundles cannot bypass data access policies.
12. As a Security Engineer, I want Supabase Auth JWTs enriched with custom claims (`app_metadata.role` and `app_metadata.institution_id`) via database triggers, so that client route guards and RLS policies evaluate instantly without repetitive database queries.
13. As a Security Engineer, I want cross-subdomain Single Sign-On (SSO) configured with parent-domain session cookies (`.example.uz`), so that authorized multi-role users (such as Directors) transition seamlessly across portals without repeated credential challenges.
14. As a Security Engineer, I want automatic subdomain redirection, so that an authenticated user who accesses an unauthorized portal (e.g., a Student accessing `admin.example.uz`) is immediately redirected to their designated portal.
15. As a DevOps Engineer, I want five independently buildable Vite applications, so that each portal can be deployed, scaled, and cached independently across edge CDN networks.
16. As a Frontend Engineer, I want a standardized API service layer returning `{ data, error }` tuples and wrapped in React Error Boundaries, so that network failures and Supabase exceptions are handled gracefully without application crashes.
17. As a Frontend Engineer, I want strict adherence to pure modern JavaScript (ESM) without TypeScript or Next.js, so that the codebase remains lightweight, uniform, and fast to build.
18. As a Product Manager, I want strict exclusion of an independent Accountant role, ensuring all cashiering workflows reside in the Admin Portal and financial audits in the Director Portal.
19. As a Product Manager, I want HR and Marketing Automation modules explicitly kept out of scope, preventing architectural complexity from derailing core educational operations.
20. As a Future Engineering Team Member, I want exhaustive architectural documentation and ADRs, so that all design patterns, data flows, and security constraints are crystal-clear and reproducible.

## Implementation Decisions

### 1. Overall System Architecture
- Independent React + Vite SPAs deployed to separate subdomains (`director.*`, `admin.*`, `teacher.*`, `student.*`, `parent.*`).
- Single shared Supabase backend providing PostgreSQL 15+, Supabase Auth, PostgREST API, Realtime WebSockets, and Storage.
- Internal shared packages in npm Workspaces consumed directly as raw ES modules.

### 2. Frontend & API Communication
- Centralized API Service Layer in each portal consuming `@education-erp/shared-auth` singleton client.
- Declarative queries and filtering via PostgREST.
- Real-time updates via Supabase Realtime channel subscriptions for attendance and announcements.
- Atomic multi-table transactions (billing, payment recording, student enrollment) executed through PostgreSQL Stored Procedures / RPC functions.
- Global and portal-level React Error Boundaries preventing catastrophic rendering crashes.

### 3. Authentication & Authorization (Hybrid RBAC + PBAC)
- Supabase Auth issuing JWTs containing synchronized custom claims: `app_metadata.role`, `app_metadata.institution_id`, `app_metadata.permissions`.
- Coarse-grained Role checks (Director, Admin, Teacher, Student, Parent) for portal entry and route rendering.
- Fine-grained Permission tokens (e.g., `finance:cashier`, `finance:reports`) stored in `public.admin_permissions` and checked in RLS policies for operational actions.
- Cross-subdomain session persistence via `.example.uz` root domain cookies in production with `localStorage` fallback in development.
- Strict rejection of an Accountant role; financial operations are divided between Director (governance) and Admin (cashiering).

### 4. Database Architecture & Multi-Tenancy
- Multi-tenancy partitioned via `institution_id` across all operational tables.
- Data ownership models: Profiles (1:1 with `auth.users`), Cohorts (owned by branch/institution), Attendance/Grades (linked to lesson and teacher), Invoices/Payments (linked to student and admin cashier).
- Database-level Row Level Security (RLS) active on 100% of public tables.
- Immutable, append-only `public.audit_logs` populated via PostgreSQL triggers for all sensitive mutations.

### 5. Deployment & DNS Strategy
- Each application in `apps/*` compiled independently via `npm run build:<portal>` into separate `dist/` directories.
- Subdomain routing managed at DNS / CDN layer (e.g., Cloudflare / Vercel / Nginx) routing `*.example.uz` to the corresponding build distribution with SPA fallback rewrites.

## Testing Decisions

### What Makes a Good Test for Architecture Documentation
1. **Traceability**: Every architectural requirement must have a dedicated section in `docs/architecture/` and a corresponding decision record in `docs/decisions/`.
2. **Diagram Syntactic Integrity**: All Mermaid sequence diagrams, entity relationship diagrams, and flowcharts must be syntactically valid and render without errors.
3. **Workspace Health**: The existing monorepo build pipeline (`npm run build`), unit test suite (`npm test`), and linting script (`npm run lint`) must pass without errors.

## Out of Scope (Phase 02)

The following items are strictly out of scope for Phase 02:
- Writing or executing SQL migration files in the database (belongs to Phase 03).
- Implementing interactive UI components, dashboard widgets, or business CRUD forms.
- Implementing live authentication login forms or session listeners.
- Creating an independent Accountant role or portal.
- Human Resources (HR) management modules.
- Marketing automation or CRM auto-dialers.
- Introducing TypeScript or non-React frontend frameworks.

## Further Notes

- All documentation authored in Phase 02 will be written in clear, professional English and placed in `docs/architecture/` and `docs/decisions/`.
- Project status and changelog will be updated upon completion.

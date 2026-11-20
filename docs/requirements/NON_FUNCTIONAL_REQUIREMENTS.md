# Non-Functional Requirements Document

## 1. Overview

This document specifies the quality attributes, performance benchmarks, security standards, and technical constraints of the Education Center ERP + CRM platform.

---

## 2. Security & Compliance

- **NFR-SEC-01 (Database-Enforced Authorization)**: All data access authorization must be enforced via PostgreSQL Row Level Security (RLS). Frontend routing checks exist solely for user experience and must never be relied upon for security boundaries.
- **NFR-SEC-02 (Secret Isolation)**: The Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) must never be exposed or bundled in any client application code. Only the public anonymous key (`VITE_SUPABASE_ANON_KEY`) is permitted.
- **NFR-SEC-03 (Session Security)**: In production, authentication cookies must be configured with `Secure`, `HttpOnly` (where applicable), and `SameSite=Lax`, scoped strictly to `.${BASE_DOMAIN}`.
- **NFR-SEC-04 (Input Sanitization)**: All user inputs must be sanitized against cross-site scripting (XSS) and parameterized to prevent SQL injection.

---

## 3. Performance & Responsiveness

- **NFR-PERF-01 (Subdomain Bundle Size)**: Because each portal is built as a separate Vite application, initial JavaScript bundle size per portal must remain under 200 KB gzipped.
- **NFR-PERF-02 (Core Web Vitals)**:
  - Largest Contentful Paint (LCP) < 1.8 seconds on standard 4G connections.
  - First Input Delay (FID) < 100 milliseconds.
  - Cumulative Layout Shift (CLS) < 0.1.
- **NFR-PERF-03 (Fast Local Development)**: Hot Module Replacement (HMR) propagation across portals when editing shared packages must execute within 150 milliseconds.

---

## 4. Reliability & Availability

- **NFR-REL-01 (Independent Deployability)**: Failure or redeployment of one portal (e.g., Parent Portal) must not impact the availability or execution of other portals (e.g., Director or Admin Portals).
- **NFR-REL-02 (Graceful Degradation)**: In the event of network disruption, portals must present user-friendly fallback states rather than unhandled white-screen crashes.
- **NFR-REL-03 (Data Integrity)**: Multi-step financial transactions (e.g., student payment recording and balance updates) must execute within atomic PostgreSQL transactions.

---

## 5. Maintainability & Code Quality

- **NFR-MNT-01 (Pure ES Modules)**: The codebase must strictly use ECMAScript Modules (ESM) and modern JavaScript without compilation layers like TypeScript or Babel.
- **NFR-MNT-02 (Zero Code Duplication)**: Common business logic, formatting, and UI widgets must reside within `packages/*` and be reused across `apps/*`.
- **NFR-MNT-03 (Documentation Currency)**: Architectural decisions and schema modifications must be updated in `docs/` alongside code changes.

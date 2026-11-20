# System Architecture: Education Center ERP + CRM

## 1. Executive Architecture Summary

The **Education Center ERP + CRM** is architected as a **Domain-Segregated Multi-Portal Ecosystem** managed within an npm Workspaces monorepo. It couples five independent client single-page applications (SPAs) with a single, highly-optimized, centralized Supabase PostgreSQL backend.

Each user persona interacts with an application tailored strictly to their operational domain, hosted on an isolated subdomain:
- **Director**: `director.example.uz` (Port 3001)
- **Admin**: `admin.example.uz` (Port 3002)
- **Teacher**: `teacher.example.uz` (Port 3003)
- **Student**: `student.example.uz` (Port 3004)
- **Parent**: `parent.example.uz` (Port 3005)

All portals share unified internal packages (`packages/shared-*`), unified authentication identities, and a single relational database enforcing multi-tenancy and data authorization through PostgreSQL Row Level Security (RLS).

---

## 2. End-to-End System Topology

```mermaid
flowchart TD
    subgraph Users["End Users & Stakeholders"]
        U_Dir["Director / Owners"]
        U_Adm["Administrators / Staff"]
        U_Tch["Teachers / Instructors"]
        U_Stu["Students / Learners"]
        U_Par["Parents / Guardians"]
    end

    subgraph CDN["Edge CDN & DNS Routing Layer (*.example.uz)"]
        DNS_D["director.example.uz"]
        DNS_A["admin.example.uz"]
        DNS_T["teacher.example.uz"]
        DNS_S["student.example.uz"]
        DNS_P["parent.example.uz"]
    end

    subgraph ClientApps["Five Independent React + Vite SPAs (Pure ESM JavaScript)"]
        APP_D["apps/director\n(Governance & Finances)"]
        APP_A["apps/admin\n(Operations, CRM, Cashier)"]
        APP_T["apps/teacher\n(Attendance & Grades)"]
        APP_S["apps/student\n(Learning & Schedules)"]
        APP_P["apps/parent\n(Children & Billing)"]
    end

    subgraph SharedPackages["Internal Monorepo Shared Packages (Raw ESM)"]
        PKG_AUTH["@education-erp/shared-auth\n(Supabase Client, AuthContext, Roles)"]
        PKG_CFG["@education-erp/shared-config\n(Ports, URLs, Env, Tailwind)"]
        PKG_UI["@education-erp/shared-ui\n(Design System, Layouts, Cards)"]
        PKG_UTL["@education-erp/shared-utils\n(UZS Currency, Dates, Phone, Errors)"]
    end

    subgraph Backend["Unified Supabase Backend (Managed Cloud / On-Premise)"]
        S_AUTH["Supabase Auth Service\n(GoTrue JWT + Custom Claims Trigger)"]
        S_REST["PostgREST API Engine\n(Auto-generated REST CRUD)"]
        S_RT["Supabase Realtime\n(PostgreSQL CDC over WebSockets)"]
        S_RPC["PostgreSQL RPC Engine\n(Atomic ACID Stored Procedures)"]
        S_STR["Supabase Storage\n(Invoices, Avatars, Materials)"]
        
        subgraph PostgresEngine["PostgreSQL 15+ Core Database"]
            DB_RLS["Row Level Security (RLS) Engine"]
            DB_DATA["Multi-Tenant Schema (institution_id)"]
            DB_AUDIT["Immutable Audit Trigger & Logs"]
        end
    end

    U_Dir --> DNS_D --> APP_D
    U_Adm --> DNS_A --> APP_A
    U_Tch --> DNS_T --> APP_T
    U_Stu --> DNS_S --> APP_S
    U_Par --> DNS_P --> APP_P

    APP_D & APP_A & APP_T & APP_S & APP_P -.-> SharedPackages

    APP_D & APP_A & APP_T & APP_S & APP_P ===>|HTTPS / WSS / JWT| Backend

    S_REST & S_RT & S_RPC & S_STR --> DB_RLS
    DB_RLS --> DB_DATA
    DB_DATA --> DB_AUDIT
```

---

## 3. Core Architectural Principles

### 3.1 Strict Subdomain & Codebase Segregation
Unlike traditional monolithic SPAs that ship administrative, financial, instructional, and learner code in a single bundle gated by frontend conditionals, this system builds and deploys five discrete bundles. 
- Administrative financial oversight code is never compiled into the Student or Parent bundles.
- A vulnerability or bundle regression in the Parent portal cannot break Admin cashiering or Teacher attendance journaling.

### 3.2 Single Source of Truth Backend
No microservice sprawl. All five portals connect to a single Supabase backend. When an administrator records a tuition payment, the student's balance updates immediately, the parent's invoice transitions to "Paid", and the director's revenue KPI reflects the cash intake instantaneously.

### 3.3 Database-Enforced Security (RLS)
The client frontend is treated as an untrusted presentation layer. All data read, write, update, and delete permissions are validated inside PostgreSQL via Row Level Security (RLS) policies. Even if a user alters client state or issues raw HTTP requests with their JWT, PostgreSQL rejects unauthorized operations.

### 3.4 Pure ECMAScript Modules (ESM) JavaScript
The entire platform is built with standard modern JavaScript (ESM) without TypeScript compilers or complex transpilation. Shared packages expose raw ESM source (`./src/index.js`), enabling sub-150ms Hot Module Replacement across all applications during local development.

---

## 4. Main Data Flow Architecture

The platform standardizes all client-to-backend communication into three distinct channels:

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client Portal
    participant Service as Portal API Service Layer
    participant SupaClient as Shared Supabase Client
    participant RestAPI as PostgREST (REST CRUD)
    participant RPC as PostgreSQL RPC Engine
    participant Realtime as Supabase Realtime (WSS)
    participant Postgres as PostgreSQL Database (RLS)

    Note over Client,Postgres: Channel 1: Declarative Data Retrieval & Standard CRUD
    Client->>Service: Request filtered data (e.g. getGroups())
    Service->>SupaClient: supabase.from('groups').select('*')
    SupaClient->>RestAPI: GET /rest/v1/groups?select=* (Bearer JWT)
    RestAPI->>Postgres: Evaluates RLS Policy against auth.uid() & role
    Postgres-->>RestAPI: Returns authorized rows
    RestAPI-->>SupaClient: 200 OK JSON
    SupaClient-->>Service: { data, error: null }
    Service-->>Client: Render UI state

    Note over Client,Postgres: Channel 2: Atomic Multi-Table Business Transactions
    Client->>Service: Record Payment (e.g. recordCashPayment())
    Service->>SupaClient: supabase.rpc('process_tuition_payment', payload)
    SupaClient->>RPC: POST /rest/v1/rpc/process_tuition_payment
    RPC->>Postgres: BEGIN TRANSACTION -> Insert Payment -> Update Invoice -> Update Ledger -> Write Audit -> COMMIT
    Postgres-->>RPC: Transaction result & receipt number
    RPC-->>SupaClient: 200 OK JSON
    SupaClient-->>Service: { data, error: null }
    Service-->>Client: Show confirmation & print receipt

    Note over Client,Postgres: Channel 3: Instant Live Event Subscriptions
    Client->>SupaClient: supabase.channel('attendance_updates').subscribe()
    SupaClient->>Realtime: WSS Handshake (Bearer JWT)
    Realtime->>Postgres: Listen to WAL replication stream
    Postgres-->>Realtime: CDC event: Attendance marked for Lesson #402
    Realtime-->>SupaClient: Push WebSocket message
    SupaClient-->>Client: Update attendance indicator in real time
```

---

## 5. Architectural Communication Contract

| Channel | Protocol | Tech Component | Usage Scope |
| :--- | :--- | :--- | :--- |
| **Declarative Queries** | HTTPS (REST) | PostgREST Engine | Roster lookups, schedules, profiles, catalog listings. Filtered and joined via Supabase query builder. |
| **Transactional Operations** | HTTPS (RPC) | PostgreSQL Stored Procedures | Multi-table ACID operations: tuition cashiering, student cohort enrollment, tariff reassignment, audit writes. |
| **Realtime Updates** | WSS (WebSockets) | Supabase Realtime | Lesson attendance verification, room schedule changes, urgent institutional announcements. |
| **Media & Documents** | HTTPS (Blob) | Supabase Storage | Student profile avatars, tuition payment receipts (PDF), course syllabi. |

---

## 6. Multi-Tenancy & Scalability Strategy

- **Tenant Key**: All entity tables include `institution_id` (UUID) as a non-nullable foreign key referencing `public.institutions`.
- **Branch Scope**: Campus-level tables (rooms, groups, attendance) include `branch_id` (UUID) referencing `public.branches`.
- **RLS Tenancy Enforcement**:
  Every RLS policy begins with a tenant verification check:
  `institution_id = (auth.jwt() -> 'app_metadata' ->> 'institution_id')::uuid`.
  This guarantees that even in multi-branch setups, data isolation is enforced at the database kernel level with near-zero performance overhead.

---

## 7. Consolidated Data Ownership Models

To ensure strict data boundaries across the five portals, entity ownership is structured into explicit domains:

1. **User Identity & Profiles (1:1 with auth.users)**:
   - `public.profiles` is linked 1:1 with `auth.users.id`.
   - Users possess exactly one active profile, with role membership defined in `public.user_roles`.
2. **Academic Cohorts (Owned by Institution & Branch)**:
   - Groups (`public.groups`) are created by Administrators, linked to an approved Course and Branch, and assigned exactly one primary Teacher (`teacher_id`).
   - Students link to groups through the `public.group_students` enrollment junction.
3. **Instructional Records (Linked to Lesson & Instructor)**:
   - Individual class sessions (`public.lessons`) belong to a group cohort.
   - Attendance (`public.attendance`) and Grades (`public.grades`) records reference a specific `lesson_id` and `student_id`. Only the assigned group teacher holds write privileges.
4. **Financial Ledgers (Linked to Student & Cashier)**:
   - Tuition Invoices (`public.invoices`) are billed to a specific student profile.
   - Payments (`public.payments`) record the settled invoice, payment method, amount, and the Administrator (`cashier_id`) who collected the funds.
5. **Family Relationships (Parent-to-Student Linkage)**:
   - `public.parent_students` defines authoritative parent/guardian links to student accounts, enabling parents to monitor only their verified dependents.

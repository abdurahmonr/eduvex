# Next Steps: Preparing for Phase 03

## 1. Current Milestone Achieved (Phase 02: System Architecture)

The Phase 02 System Architecture is **100% complete and documented**:
- [x] Complete system architecture designed and formalized.
- [x] All 12 architecture specification documents authored under `docs/architecture/`.
- [x] All 5 Architecture Decision Records authored under `docs/decisions/` (ADR-004 to ADR-008).
- [x] Data flow sequence diagrams and system topology diagrams verified.
- [x] Hybrid RBAC + PBAC authorization model established (no Accountant role).
- [x] Multi-tenancy, RLS policies, and immutable audit logging planned.
- [x] Static edge deployment model for independent subdomains documented.

---

## 2. Action Items for Phase 03: Database Design & Schema Execution

When approved by leadership, Phase 03 will execute the database modeling based on the Phase 02 architecture:

### Task 3.1: Supabase PostgreSQL Schema Modeling
1. Create `supabase/migrations/` structure.
2. Author SQL migration files defining:
   - **Multi-Tenant Base**: `institutions`, `branches`.
   - **Identity & Roles**: `profiles`, `user_roles`, `admin_permissions`.
   - **Academic Structures**: `courses`, `classrooms`, `groups`, `group_students`.
   - **Instruction & Lessons**: `lessons`, `attendance`, `grades`.
   - **Financial Ledgers**: `tariffs`, `invoices`, `payments`, `student_balances`.
   - **Family Linkage**: `parent_students`.
   - **Governance & Audit**: `audit_logs`.

### Task 3.2: Row Level Security (RLS) Implementation
1. Enable RLS on 100% of public tables.
2. Author explicit RLS policies for each role:
   - Director policies (institutional oversight, audit logs).
   - Admin policies (operations, cashiering conditional on `finance:cashier`).
   - Teacher policies (strictly assigned groups and lessons).
   - Student policies (strictly own academic and financial records).
   - Parent policies (strictly linked children records via `parent_students`).

### Task 3.3: Database Stored Procedures & Triggers
1. Implement `sync_user_claims_to_jwt()` trigger to keep `app_metadata` updated.
2. Implement `log_table_mutation()` trigger for append-only writes to `audit_logs`.
3. Implement `process_tuition_payment()` RPC function for atomic cashier transactions.
4. Implement `enroll_student_in_cohort()` RPC function with capacity checking.

### Task 3.4: Database Seeding & Testing
1. Author `supabase/seed.sql` with representative test data for all five roles.
2. Validate RLS policies against unauthorized role token simulation.

---

## 3. Strict Development Rules for Phase 03

1. **Pure JavaScript**: Maintain client applications strictly in React + Vite + pure ESM JavaScript (no TypeScript).
2. **No Accountant Portal**: All cashiering remains in Admin, financial oversight in Director.
3. **No Service Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

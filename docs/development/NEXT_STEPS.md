# Next Steps: Preparing for Phase 02

## 1. Current Milestone Achieved (Phase 01)

The Phase 01 Technical Foundation is **100% complete**:
- [x] Monorepo structure initialized with npm Workspaces.
- [x] Five independent React + Vite applications operational.
- [x] Four shared packages configured and consumed as raw ESM.
- [x] All five portals independently buildable (`npm run build`).
- [x] Unit test suites passing via Vitest (`npm test`).
- [x] Subdomain and shared backend architecture established.
- [x] Full documentation suite authored.

---

## 2. Action Items for Phase 02 (Core Schema, Auth & Operations)

When approved by leadership, Phase 02 should proceed with the following sequential tasks:

### Task 2.1: Supabase Database Migration
1. Initialize local Supabase CLI or cloud project instance.
2. Execute initial schema migration creating:
   - `institutions`, `branches`, `profiles`, `user_roles`
   - `courses`, `groups`, `group_students`
   - `invoices`, `payments`
   - `lessons`, `attendance`, `grades`
   - `parent_students`
3. Apply Row Level Security (RLS) policies defining access rights for all five roles.

### Task 2.2: Live Supabase Authentication Integration
1. Implement email/password and magic link sign-in flows in `shared-auth`.
2. Add cross-subdomain authentication cookie persistence for `.example.uz`.
3. Create role-based route guard components (`ProtectedRoute`, `RoleGuard`) to redirect unauthenticated or unauthorized users to their correct portal.

### Task 2.3: Admin Portal Operational Core
1. Implement CRM Lead Pipeline (Kanban board for inbound leads).
2. Implement Student Registration modal with parent phone linkage.
3. Implement Group creation with teacher assignment and timetable selection.
4. Implement Cashier module for recording tuition fee payments.

### Task 2.4: Teacher Journal & Attendance
1. Connect Teacher Portal to active group rosters via Supabase queries.
2. Build interactive attendance journal with Present/Absent/Excused/Late toggles.
3. Build homework and test score submission interface.

### Task 2.5: Student & Parent Live Views
1. Build personal student timetable and payment balance screen.
2. Build parent child-switcher and attendance notification feed.

---

## 3. Strict Reminders for Phase 02 Developers

1. **NO Accountant Portal**: Keep all cashiering in the Admin Portal and financial oversight in the Director Portal.
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** in frontend code.
3. Maintain pure ES Modules JavaScript (no TypeScript).

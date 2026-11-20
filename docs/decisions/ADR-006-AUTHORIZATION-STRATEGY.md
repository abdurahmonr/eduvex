# ADR-006: Authorization Strategy — Hybrid RBAC + PBAC with PostgreSQL Row Level Security

## Status
**Accepted** (Phase 02)

## Context
The system requires role segregation across five user types, but administrative responsibilities must be configurable. Specifically:
- Directors must oversee campus finances and manage administrators.
- Administrators manage daily operations and must perform cashiering (tuition collection), but certain front-desk staff should not have financial access.
- **Strict Constraint**: There is **no** separate Accountant role; finance is embedded in Director and Admin portals.
- Teachers, students, and parents must be strictly restricted to their own data.

We evaluated:
1. **Pure Role-Based Access Control (RBAC)**: Only roles exist (`director`, `admin`, `teacher`, etc.).
2. **Hybrid RBAC + PBAC (Role-Based + Permission-Based Access Control)**: Coarse roles determine portal routing, while granular permission tokens govern sensitive operational capabilities.

## Decision
We decided to adopt a **Hybrid RBAC + PBAC Model enforced at the database level via PostgreSQL Row Level Security (RLS)**.

### Key Drivers
1. **Configurable Admin Financial Permissions**: Allows Directors to assign `finance:cashier` and `finance:reports` to specific campus administrators while withholding financial permissions from other staff, completely eliminating the need for an Accountant role.
2. **Clean Separation of Concerns**: Roles determine high-level portal access (`user.role === 'admin' -> admin.example.uz`), while permissions (`finance:cashier`) control individual operational buttons and database mutations.
3. **Kernel-Level Enforcement**: All permissions are validated inside PostgreSQL RLS policies. Even if a compromised client attempts to call cashiering endpoints, PostgreSQL denies the write if the permission token is absent.

## Consequences
- **Positive**: High flexibility in delegating campus cashiering, no role sprawl, tamper-proof security at the database layer.
- **Trade-off**: Requires maintaining a `public.admin_permissions` junction table and syncing permission arrays into JWT claims.

# ADR-007: Security Architecture — Defense-in-Depth & Database-Triggered Audit Logging

## Status
**Accepted** (Phase 02)

## Context
Educational institutions handle sensitive personal, academic, and financial information:
- Cash and terminal tuition payments.
- Student attendance logs and formal academic grades.
- Guardian contact information.

We evaluated:
1. **Application-Layer Security & Logging**: Frontend validation combined with API gateway middleware logging.
2. **Database-Enforced Security & Immutable Trigger-Based Audit Logging**: PostgreSQL Row Level Security as the primary security boundary, combined with automated PostgreSQL triggers writing to an append-only `public.audit_logs` table.

## Decision
We decided to adopt **Database-Enforced Security via PostgreSQL RLS and Immutable Database Trigger-Based Audit Logging**.

### Key Drivers
1. **Zero Client Trust**: Frontend code and network traffic can be manipulated. Enforcing security in the PostgreSQL engine ensures that no data can be read or written outside of authorized policies regardless of client state.
2. **Tamper-Proof Audit Trail**: Writing audit logs inside PostgreSQL triggers ensures that every `INSERT`, `UPDATE`, and `DELETE` on sensitive tables (`payments`, `invoices`, `user_roles`, `grades`) is captured automatically within the same database transaction.
3. **No Audit Log Tampering**: Row Level Security policies on `public.audit_logs` prohibit `UPDATE` and `DELETE` for all roles (including Directors). Only `SELECT` is granted to Directors for audit inspection.
4. **Secret Isolation**: Prohibits the use of `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles; client applications interact exclusively via the public anonymous key subjected to RLS.

## Consequences
- **Positive**: Ironclad data security, compliance-ready financial auditability, zero reliance on frontend security assumptions.
- **Trade-off**: Requires thorough SQL policy definition and testing for every table in Phase 03.

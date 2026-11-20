# ADR-003: Shared Backend Architecture with Supabase & PostgreSQL RLS

## Status
**Accepted** (Phase 01)

## Context
With five independent portal applications, we evaluated the backend connection architecture:
1. **Backend-for-Frontend (BFF) / Microservices**: A separate custom backend API server for each portal application.
2. **Unified Backend via Supabase (PostgreSQL with Row Level Security)**: All five portals connect to a single managed Supabase instance.

## Decision
We decided to adopt a **Unified Backend via Supabase and PostgreSQL Row Level Security (RLS)**.

### Key Drivers
1. **Elimination of Microservice Sprawl**: Tutoring centers do not have the organizational scale or infrastructure budget to manage 5 backend microservices, API gateways, and distributed databases.
2. **Single Source of Truth**: All operational transactions (e.g., an admin records a student payment, or a teacher records attendance) are instantly reflected in real time across related portals without eventual consistency lags.
3. **Database-Level Authorization**: Security is enforced where data lives—inside PostgreSQL. Row Level Security policies ensure that even if a student crafts arbitrary GraphQL/REST queries with their JWT, they cannot read other students' data or administrative tables.
4. **Zero Client Secret Exposure**: All applications strictly use the public anonymous key (`VITE_SUPABASE_ANON_KEY`); the service role key is never bundled in frontend code.

## Consequences
- **Positive**: Drastically reduced operational maintenance, high performance, strict ACID compliance, and robust security.
- **Trade-off**: Requires disciplined PostgreSQL schema modeling and comprehensive RLS policy test coverage.

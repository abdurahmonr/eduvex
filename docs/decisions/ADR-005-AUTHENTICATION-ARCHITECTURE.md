# ADR-005: Authentication Architecture — Supabase Auth, Custom JWT Claims & Root Cookie SSO

## Status
**Accepted** (Phase 02)

## Context
The platform requires a centralized identity provider supporting five distinct user portals deployed across subdomains (`director.example.uz`, `admin.example.uz`, etc.). We evaluated two authentication strategies:
1. **Custom Auth Server & Refresh Token Backend**: A bespoke Node.js OAuth2 / JWT server managing database sessions and cookie rotation.
2. **Supabase Auth (GoTrue) with Custom JWT Claims & Wildcard Domain Cookies**: Managed Supabase Auth where user identity is centralized in `auth.users`, roles are synchronized into JWT `app_metadata` via PostgreSQL triggers, and sessions are persisted via parent-domain cookies (`Domain=.example.uz`).

## Decision
We decided to adopt **Supabase Auth with Custom JWT Claims and Root-Domain Cookie Session Persistence**.

### Key Drivers
1. **Elimination of Custom Auth Boilerplate**: Supabase GoTrue natively provides password hashing (bcrypt/argon2), email verification, secure password reset magic links, and rate-limiting.
2. **Zero-Latency Authorization via Custom Claims**: Injecting `app_metadata.role` and `app_metadata.institution_id` into the JWT payload via database triggers allows client route guards and PostgreSQL RLS policies to evaluate permissions in microseconds without joining `public.user_roles` on every query.
3. **Cross-Subdomain Single Sign-On (SSO)**: Setting the session cookie with `Domain=.example.uz` enables seamless navigation between authorized portals (e.g. Director switching to Admin) without repetitive credential prompts.

## Consequences
- **Positive**: Enterprise-grade authentication security, instant JWT role evaluation, seamless cross-portal navigation, zero backend microservice overhead.
- **Trade-off**: Local development cannot set wildcard cookies on `localhost`, requiring the storage adapter to automatically fall back to `localStorage` per port during development.

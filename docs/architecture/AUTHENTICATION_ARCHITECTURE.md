# Authentication Architecture: Supabase Auth & Cross-Subdomain SSO

## 1. Authentication Overview

Authentication in the Education Center ERP + CRM is centralized via **Supabase Auth** (GoTrue engine).

Users hold a single identity in `auth.users`, but interact with distinct portals based on their assigned role:
- Director signs in -> Accesses `director.example.uz`
- Admin signs in -> Accesses `admin.example.uz`
- Teacher signs in -> Accesses `teacher.example.uz`
- Student signs in -> Accesses `student.example.uz`
- Parent signs in -> Accesses `parent.example.uz`

---

## 2. Authentication Flow & Custom Claims Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Browser
    participant App as React Portal (e.g. admin.example.uz)
    participant Auth as Supabase Auth (GoTrue)
    participant Trigger as Postgres Sync Trigger
    participant DB as Postgres (user_roles table)

    User->>App: Submits login credentials (email & password)
    App->>Auth: client.auth.signInWithPassword({ email, password })
    Auth->>Auth: Validates password hash (bcrypt / argon2)
    Trigger-->>Auth: Injects app_metadata { role, institution_id, permissions } from user_roles
    Auth-->>App: Returns Session { access_token (JWT), refresh_token, user }
    
    alt In Production (*.example.uz)
        App->>Browser: Sets session cookie with Domain=.example.uz; Secure; SameSite=Lax
    else In Localhost Development
        App->>Browser: Stores session in localStorage
    end

    App->>App: Checks JWT claim: is role authorized for this portal?
    alt Role Matches Portal
        App-->>User: Renders Portal Dashboard
    else Role Mismatch
        App->>Browser: Redirects to designated subdomain (e.g. student.example.uz)
    end
```

---

## 3. Custom JWT Claims Architecture

To eliminate the need for every client page load and RLS query to join against `public.user_roles`, the database uses an automated **Claims Sync Trigger**:

### Trigger Mechanism:
1. When a user's role or institution is created or modified in `public.user_roles`, a PostgreSQL trigger updates `auth.users.raw_app_meta_data`.
2. When the user signs in or refreshes their token, Supabase Auth embeds this data into the JWT payload:

```json
{
  "sub": "b2c1a84f-78d2-4e56-9a11-827364501928",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "admin@example.uz",
  "app_metadata": {
    "provider": "email",
    "role": "admin",
    "institution_id": "902d184a-5821-4f99-b148-738921092837",
    "permissions": ["finance:cashier", "academics:manage_groups"]
  },
  "exp": 1732130000
}
```

### Architectural Advantages:
- **Instant Client Routing**: Client route guards evaluate `user.app_metadata.role` instantly without an initial database fetch.
- **High-Performance RLS**: PostgreSQL evaluates `(auth.jwt() -> 'app_metadata' ->> 'role')` in microseconds without executing table joins.

---

## 4. Cross-Subdomain Single Sign-On (SSO)

In production, all five portals run on subdomains of a shared parent domain (e.g., `example.uz`).

### Cookie-Based SSO Strategy:
- `@education-erp/shared-auth` configures a custom storage adapter for Supabase client in production.
- When the user authenticates, the session token is written to an HTTP cookie configured with:
  - `Domain=.example.uz`
  - `Path=/`
  - `SameSite=Lax`
  - `Secure=true` (HTTPS only)
- When a Director navigates from `director.example.uz` to `admin.example.uz`, the browser automatically transmits the `.example.uz` cookie. The Admin Portal initializes the Supabase client with the active session without requiring re-login.

### Local Development Fallback:
- Because browsers prohibit setting wildcard cookies on `localhost`, the client factory automatically detects `window.location.hostname === 'localhost'` and falls back to standard `localStorage`.

---

## 5. Account Lifecycle & Security Flows

### 5.1 Account Provisioning
1. **Director**: Initialized during institution database setup or owner onboarding.
2. **Administrator**: Provisioned exclusively by the Director via the Director Portal.
3. **Teacher**: Provisioned by Administrator during staff onboarding.
4. **Student**: Created upon enrollment conversion from the admissions CRM pipeline.
5. **Parent**: Created during student intake or linked via unique guardian phone verification.

### 5.2 Password Recovery
- Standard password reset requests issue an email with a secure, time-limited magic link.
- Redirect URLs are configured in Supabase to route users to the appropriate portal password reset page (`https://<portal>.example.uz/reset-password`).

### 5.3 Account Deactivation
- Setting `is_active = false` in `public.profiles` triggers immediate invalidation of active refresh tokens in Supabase Auth via database webhook/trigger.
- Next token refresh drops the session, forcing sign-out across all open portal tabs.

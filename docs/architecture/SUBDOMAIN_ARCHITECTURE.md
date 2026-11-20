# Subdomain Architecture & Routing Strategy

## 1. Domain & Subdomain Mapping Topology

The Education Center ERP + CRM platform separates operational contexts by hosting each of the five portals on its own dedicated subdomain:

```mermaid
flowchart TD
    subgraph ParentDomain["Root Domain: example.uz (Placeholder)"]
        Wildcard["Wildcard DNS: *.example.uz"]
        SSOCookie["Shared Auth Cookie: Domain=.example.uz"]
    end

    subgraph Subdomains["Dedicated Subdomain Deployments"]
        D_Sub["director.example.uz\n(Director Portal | Port 3001)"]
        A_Sub["admin.example.uz\n(Admin Portal | Port 3002)"]
        T_Sub["teacher.example.uz\n(Teacher Portal | Port 3003)"]
        S_Sub["student.example.uz\n(Student Portal | Port 3004)"]
        P_Sub["parent.example.uz\n(Parent Portal | Port 3005)"]
    end

    Wildcard --> D_Sub & A_Sub & T_Sub & S_Sub & P_Sub
    SSOCookie -.-> D_Sub & A_Sub & T_Sub & S_Sub & P_Sub
```

| Portal Application | Target Production Subdomain | Local Development URL | Primary Audience |
| :--- | :--- | :--- | :--- |
| **Director Portal** | `https://director.example.uz` | `http://localhost:3001` | Center Owners & Executive Leadership |
| **Admin Portal** | `https://admin.example.uz` | `http://localhost:3002` | Front-Desk, Operations & Cashiers |
| **Teacher Portal** | `https://teacher.example.uz` | `http://localhost:3003` | Instructional Faculty & Mentors |
| **Student Portal** | `https://student.example.uz` | `http://localhost:3004` | Enrolled Students & Learners |
| **Parent Portal** | `https://parent.example.uz` | `http://localhost:3005` | Parents & Legal Guardians |

*Note: `example.uz` serves as the architectural placeholder domain.*

---

## 2. Cross-Subdomain Session & Single Sign-On (SSO) Sequence

When a user signs in, they receive an authenticated Supabase session. To prevent repeated logins when navigating between authorized subdomains (for example, a Director accessing the Admin Portal), the system is configured as follows:

```mermaid
sequenceDiagram
    autonumber
    actor User as Director User
    participant Browser as Client Browser
    participant DirApp as director.example.uz
    participant SupaAuth as Supabase Auth Service
    participant AdminApp as admin.example.uz

    User->>DirApp: Enter login credentials
    DirApp->>SupaAuth: Authenticate with public anon key
    SupaAuth-->>DirApp: Returns JWT & Session
    DirApp->>Browser: Sets session cookie with Domain=.example.uz; Path=/; Secure; SameSite=Lax
    Note over Browser: Cookie is now accessible to all *.example.uz subdomains

    User->>Browser: Clicks "Switch to Admin Portal" (navigates to admin.example.uz)
    Browser->>AdminApp: HTTP Request with Cookie (contains Supabase session)
    AdminApp->>AdminApp: Initializes Supabase client from cookie session
    AdminApp->>AdminApp: Checks JWT: role = 'director' (authorized for Admin)
    AdminApp-->>User: Renders Admin Portal immediately without re-authentication!
```

---

## 3. Subdomain Role Mismatch & Automatic Redirection

To maintain strict domain boundaries, each portal's application shell validates the authenticated user's role on startup:

```mermaid
flowchart TD
    UserAccess["User accesses https://admin.example.uz"]
    CheckAuth{"Is user authenticated?"}
    ShowLogin["Render Admin Login Screen"]
    CheckRole{"Does user role permit this portal?\n(admin or director)"}
    RenderApp["Render Admin Dashboard"]
    LookupPortal["Lookup designated portal for role\n(e.g., student -> student.example.uz)"]
    Redirect["Redirect to https://student.example.uz"]

    UserAccess --> CheckAuth
    CheckAuth -- No --> ShowLogin
    CheckAuth -- Yes --> CheckRole
    CheckRole -- Yes --> RenderApp
    CheckRole -- No --> LookupPortal --> Redirect
```

### Architectural Benefits:
1. **User Convenience**: A student who accidentally bookmarks `admin.example.uz` is seamlessly routed to `student.example.uz`.
2. **Defensive Posture**: Even if a user attempts to view another portal's UI, the client immediately bounces them, while backend PostgreSQL RLS guarantees zero unauthorized data exposure.

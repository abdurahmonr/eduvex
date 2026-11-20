# Repository Folder Structure

## 1. Monorepo Root Layout

```text
education-erp/
│
├── apps/
│   ├── director/               # Director Portal (port 3001)
│   ├── admin/                  # Admin Portal (port 3002)
│   ├── teacher/                # Teacher Portal (port 3003)
│   ├── student/                # Student Portal (port 3004)
│   └── parent/                 # Parent Portal (port 3005)
│
├── packages/
│   ├── shared-auth/            # Supabase client factory, roles, permissions
│   ├── shared-config/          # Constants, subdomain URLs, ports, Tailwind presets
│   ├── shared-ui/              # Atomic UI components, headers, layouts, badges
│   └── shared-utils/           # UZS currency, phone mask, date formatters, validation
│
├── docs/
│   ├── project/                # Vision, scope, roadmap
│   ├── requirements/           # Functional, non-functional, roles, processes, modules
│   ├── architecture/           # System, subdomain, folder, tech stack docs
│   ├── database/               # Database requirements, entities, RLS design
│   ├── decisions/              # ADRs (Monorepo, Subdomain, Shared Backend)
│   └── development/            # Development guide, setup guide, next steps
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Monorepo workspaces configuration & root scripts
├── README.md                   # Primary project readme
├── PROJECT_STATUS.md           # Phase status tracker
├── CHANGELOG.md                # Record of architectural changes
└── CONTRIBUTING.md             # Developer contribution guidelines
```

---

## 2. Portal Application Internal Structure

Each application inside `apps/` follows a standardized, modular React structure:

```text
apps/<portal-name>/
├── public/                     # Static public assets
├── src/
│   ├── assets/                 # Component-level static media
│   ├── components/             # Portal-specific UI components
│   ├── hooks/                  # Portal-specific React hooks (e.g., usePortalState)
│   ├── layouts/                # Portal shell layout wrappers
│   ├── pages/                  # Route view components
│   ├── routes/                 # React Router Route definitions (AppRoutes)
│   ├── services/               # API service integration layer (Supabase client calls)
│   ├── utils/                  # Portal-specific utility helpers
│   ├── config/                 # Portal metadata & navigation link configs
│   └── main.jsx                # Application entry point & React root mount
├── index.html                  # HTML template with portal title & meta tags
├── package.json                # Application-specific dependencies & scripts
├── vite.config.js              # Vite server & port configuration
├── tailwind.config.js          # Tailwind configuration referencing shared preset
└── postcss.config.js           # PostCSS Tailwind and Autoprefixer integration
```

---

## 3. Shared Package Internal Structure

Each package inside `packages/` contains:

```text
packages/<package-name>/
├── src/                        # Unbundled ES module source files
├── tests/                      # Vitest unit test suites (where applicable)
└── package.json                # Package export definitions ("main": "./src/index.js")
```

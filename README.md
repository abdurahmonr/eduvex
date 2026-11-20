# Education Center ERP + CRM

A modern, enterprise-grade Education Center Management Platform designed for tutoring academies, language schools, and training institutions. 

Built with **React**, **Vite**, **JavaScript (ES Modules)**, **Tailwind CSS**, and **Supabase (PostgreSQL)** using an **npm Workspaces Monorepo** and a **Five-Portal Architecture**.

---

## 🏛️ Architecture Overview

The system isolates operations, teaching, executive oversight, and family communications into **five independent React applications** running on dedicated subdomains, all backed by a single unified Supabase database:

```text
education-erp/
│
├── apps/
│   ├── director/     # Director Portal     -> director.example.uz (Port 3001)
│   ├── admin/        # Admin Portal        -> admin.example.uz    (Port 3002)
│   ├── teacher/      # Teacher Portal      -> teacher.example.uz  (Port 3003)
│   ├── student/      # Student Portal      -> student.example.uz  (Port 3004)
│   └── parent/       # Parent Portal       -> parent.example.uz   (Port 3005)
│
├── packages/
│   ├── shared-auth/   # Supabase client factory, roles, permissions, cookie auth
│   ├── shared-config/ # Subdomains, dev ports, constants, Tailwind preset
│   ├── shared-ui/     # Design system components, headers, layouts, badges
│   └── shared-utils/  # UZS currency formatter, Uzbekistan phone mask, date utils
│
└── docs/              # Comprehensive technical documentation suite
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+ or v11+
- **Git**

### Installation
```bash
# Clone the repository
git clone <repo-url> education-erp
cd education-erp

# Install all workspace dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Running Portals

```bash
# Run all 5 portals concurrently
npm run dev:all

# Or run a specific portal:
npm run dev:director   # http://localhost:3001
npm run dev:admin      # http://localhost:3002
npm run dev:teacher    # http://localhost:3003
npm run dev:student    # http://localhost:3004
npm run dev:parent     # http://localhost:3005
```

### Production Build

Every portal is independently compiled:
```bash
# Build all portals
npm run build

# Or build individually
npm run build:director
npm run build:admin
npm run build:teacher
npm run build:student
npm run build:parent
```

### Testing

```bash
# Run Vitest unit tests
npm test
```

---

## 👥 Five User Roles & Portals

1. **Director (`director.example.uz`)**: Institutional leadership, financial health oversight, administrator access management, branch governance.
2. **Administrator (`admin.example.uz`)**: Daily operations, CRM lead intake, student enrollment, group scheduling, cashiering and tuition collection. *(No separate Accountant portal)*.
3. **Teacher (`teacher.example.uz`)**: Assigned group management, lesson attendance journal, grading and student evaluation.
4. **Student (`student.example.uz`)**: Personal schedule, attendance record, course syllabus, tuition balance.
5. **Parent (`parent.example.uz`)**: Family overview, multi-child switching, real-time attendance alerts, grade tracking, tuition invoices and receipts.

---

## 🔒 Security & Backend Architecture

- **PostgreSQL Row Level Security (RLS)**: Permissions and data boundaries are enforced at the database level. Frontend route guards exist only for user navigation.
- **Single Backend**: All portals connect to a single Supabase instance.
- **Zero Client Secrets**: Only public anonymous keys (`VITE_SUPABASE_ANON_KEY`) are utilized in client bundles.
- **Cross-Subdomain SSO**: Configured for top-level domain session cookies (`.example.uz`) in production with local storage fallback in development.

---

## 📚 Technical Documentation

Complete documentation is available in the `docs/` folder:
- **Project Vision & Scope**: [`docs/project/`](docs/project/)
- **Requirements & Roles**: [`docs/requirements/`](docs/requirements/)
- **System & Subdomain Architecture**: [`docs/architecture/`](docs/architecture/)
- **Database Schema & RLS**: [`docs/database/`](docs/database/)
- **Architecture Decision Records (ADRs)**: [`docs/decisions/`](docs/decisions/)
- **Development & Setup Guides**: [`docs/development/`](docs/development/)

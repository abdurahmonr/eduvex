# Technology Stack: Education Center ERP + CRM

## 1. Selected Core Technologies

| Technology | Purpose | Selected Version | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **React** | UI Framework | `^18.3.1` | Stable, battle-tested, high ecosystem compatibility with UI components. |
| **Vite** | Build Tool & Dev Server | `^6.2.0` | Ultra-fast ESM-native development server, instant HMR, optimized Rollup bundling. |
| **JavaScript (ESM)** | Programming Language | Modern ECMAScript | Chosen per strict project requirements (pure JavaScript, NOT TypeScript). Clean, fast builds. |
| **React Router** | Client-Side Routing | `^6.29.0` | Declarative routing, nested layouts, clean URL handling for SPAs. |
| **npm Workspaces** | Monorepo Management | npm `11.8.0+` | Built-in Node.js/npm tooling; eliminates reliance on complex third-party tools like Turborepo/Nx. |
| **Tailwind CSS** | Styling & Design System | `^3.4.17` | Utility-first CSS, consistent design tokens, tree-shaking for tiny production CSS bundles. |
| **Supabase** | Backend as a Service | `@supabase/supabase-js ^2.49.1` | Managed PostgreSQL, Row Level Security, instant Auth, and storage without microservice bloat. |
| **PostgreSQL** | Relational Database | 15+ (via Supabase) | ACID compliance, robust RLS security policies, relational integrity. |
| **Vitest** | Unit Testing Runner | `^3.0.7` | Vite-native test runner, shared Vite configuration, lightning-fast ESM test execution. |
| **Lucide React** | Iconography | `^0.475.0` | Lightweight, modular SVG icon set matching modern dashboard design standards. |

---

## 2. Dependency Management Rules

1. **Strict JavaScript Policy**: No TypeScript compiler (`tsc`) or TypeScript type definitions. Code clarity is maintained through JSDoc comments.
2. **Zero Unnecessary Dependencies**: External packages are limited to core necessities. No heavy UI framework libraries (like MUI or Ant Design) that inflate bundle sizes.
3. **Workspace Hoisting**: Common dependencies (`react`, `react-dom`, `vite`, `tailwindcss`) are hoisted to the root `node_modules` while remaining independently declared in workspace package manifests.

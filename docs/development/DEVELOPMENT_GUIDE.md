# Development Guide

## 1. Prerequisites

- **Node.js**: v20+ or v24+ (verified on v24.13.1)
- **npm**: v10+ or v11+ (verified on v11.8.0)
- **Git**: v2.40+ (verified on v2.55.0)

---

## 2. Monorepo Workflow & Scripts

### Running Portals in Development

You can run individual portals or all five concurrently:

```bash
# Run all 5 portals concurrently
npm run dev:all

# Or run individual portals
npm run dev:director   # http://localhost:3001
npm run dev:admin      # http://localhost:3002
npm run dev:teacher    # http://localhost:3003
npm run dev:student    # http://localhost:3004
npm run dev:parent     # http://localhost:3005
```

### Building for Production

```bash
# Build all workspaces (all 5 portals independently)
npm run build

# Or build individual portals
npm run build:director
npm run build:admin
npm run build:teacher
npm run build:student
npm run build:parent
```

### Running Tests

```bash
# Run Vitest test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 3. Developing Shared Packages

Shared packages are located in `packages/`:
- `@education-erp/shared-config`: Shared constants, route configs, Tailwind preset.
- `@education-erp/shared-utils`: Formatters (UZS currency, date, phone), validators.
- `@education-erp/shared-auth`: Supabase client factory, roles, permissions.
- `@education-erp/shared-ui`: Atomic UI components (Button, Card, Input, Badge, Layout).

Because shared packages export unbundled ES Modules directly from `src/index.js`, editing any file in `packages/*/src` instantly updates any running portal via Vite Hot Module Replacement (HMR) without requiring a restart or rebuild.

---

## 4. Coding Conventions

- **JavaScript Only**: All code must be authored in pure JavaScript (ES Modules). No TypeScript files (`.ts`/`.tsx`).
- **Imports**: Use explicit file extensions for local modules (e.g., `import { Button } from './Button.jsx';`).
- **Linting & Formatting**: Follow standard React hook rules and ES module conventions. Keep functions small, modular, and testable.

# Contributing Guidelines: Education Center ERP + CRM

Thank you for contributing to the Education Center ERP + CRM platform.

To maintain architectural integrity, follow these guidelines:

---

## 1. Core Engineering Principles

1. **Pure ES Modules JavaScript**:
   - Write standard modern JavaScript (ESM).
   - Do **NOT** introduce TypeScript (`.ts` or `.tsx` files) or custom transpilation pipelines.
2. **No Premature Business Logic**:
   - Work within the designated phase boundaries.
   - Do not claim a feature is complete until verified with tests and builds.
3. **Strict Role Isolation**:
   - Do **NOT** add an Accountant role or portal (financial operations are in Director and Admin).
   - Do **NOT** add HR or Marketing Automation modules without architectural approval.
4. **Backend Security First**:
   - Never rely on frontend route guards for security.
   - All authorization must be enforceable via PostgreSQL Row Level Security (RLS).
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

---

## 2. Shared Packages vs Applications

- Put reusable logic, design primitives, and formatters in `packages/*`.
- Applications in `apps/*` should remain thin consumer shells.
- All shared packages must export clean ESM from `./src/index.js`.

---

## 3. Pull Request & Commit Workflow

1. Create a feature branch from `main`: `git checkout -b feature/my-feature`.
2. Ensure all tests pass: `npm test`.
3. Verify that all five portals build without errors: `npm run build`.
4. Update `PROJECT_STATUS.md` and `CHANGELOG.md` with relevant details.
5. Submit a pull request with clear description of changes.

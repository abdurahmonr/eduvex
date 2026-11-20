# Setup Guide: Getting Started from Scratch

## 1. Quick Setup (3 Minutes)

Follow these steps to set up the Education Center ERP + CRM on a new workstation:

### Step 1: Clone or Navigate to the Workspace
```bash
git clone <repository-url> education-erp
cd education-erp
```

### Step 2: Install Workspace Dependencies
```bash
# Note: On Windows PowerShell if script execution is restricted, invoke npm.cmd directly
npm install
```

### Step 3: Configure Environment Variables
Copy the root `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and public anonymous key:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Run the Test Suite
Verify your installation by running the unit tests:
```bash
npm test
```

### Step 5: Start Development
Run all portals or your portal of choice:
```bash
# Start all 5 portals
npm run dev:all

# Access in your browser:
# Director: http://localhost:3001
# Admin:    http://localhost:3002
# Teacher:  http://localhost:3003
# Student:  http://localhost:3004
# Parent:   http://localhost:3005
```

---

## 2. Troubleshooting & Windows Notes

- **PowerShell Script Policy Restriction**: If PowerShell shows `File ... npm.ps1 cannot be loaded because running scripts is disabled`, invoke `npm.cmd <command>` instead of `npm <command>`.
- **Port Conflicts**: If port 3001–3005 is occupied by another application, Vite will notify you. Update port assignments in `packages/shared-config/src/constants.js` and the corresponding `vite.config.js`.

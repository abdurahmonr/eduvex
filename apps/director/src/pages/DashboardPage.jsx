import React from 'react';
import { Card, Badge, Button } from '@education-erp/shared-ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Governance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Phase 01 Architectural Foundation & Portal Status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Phase 01 Foundation Verified</Badge>
          <Button variant="secondary" size="sm">System Specs</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Institutional Governance" subtitle="Access Scope: Full">
          <p className="text-sm text-slate-600">
            Director holds executive authority across campus administrators, institutional strategy, and overall institution performance.
          </p>
        </Card>

        <Card title="Financial Oversight" subtitle="Access Scope: Executive Audit">
          <p className="text-sm text-slate-600">
            All institutional financial health, tuition schedules, and expense audits are routed here. No independent Accountant portal exists.
          </p>
        </Card>

        <Card title="Subdomain Segregation" subtitle="Target: director.example.uz">
          <p className="text-sm text-slate-600">
            Independent Vite application bundle ensuring zero administrative code leaks to student or teacher portals.
          </p>
        </Card>
      </div>

      <Card
        title="Cross-Portal Network"
        subtitle="The five independent portal applications connected to one shared Supabase backend"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <span className="font-semibold text-indigo-900 block">Director Portal</span>
            <span className="text-indigo-600 font-mono">director.example.uz:3001</span>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg">
            <span className="font-semibold text-sky-900 block">Admin Portal</span>
            <span className="text-sky-600 font-mono">admin.example.uz:3002</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <span className="font-semibold text-emerald-900 block">Teacher Portal</span>
            <span className="text-emerald-600 font-mono">teacher.example.uz:3003</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="font-semibold text-amber-900 block">Student Portal</span>
            <span className="text-amber-600 font-mono">student.example.uz:3004</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <span className="font-semibold text-purple-900 block">Parent Portal</span>
            <span className="text-purple-600 font-mono">parent.example.uz:3005</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

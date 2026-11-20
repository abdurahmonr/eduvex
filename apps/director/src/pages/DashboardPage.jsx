import React from 'react';
import { Card, Badge, Button } from '@education-erp/shared-ui';
import { MetricCard } from '../components/MetricCard.jsx';
import { formatUZS } from '@education-erp/shared-utils';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Director oversight and institutional metrics foundation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Phase 01 Active</Badge>
          <Button variant="secondary" size="sm">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Students"
          value="450"
          change="+12% this month"
          subtitle="Target: 500"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatUZS(135000000)}
          change="+8.4%"
          subtitle="92% collected"
        />
        <MetricCard
          title="Teachers on Staff"
          value="24"
          subtitle="All groups staffed"
        />
        <MetricCard
          title="Active Branches"
          value="2"
          subtitle="Central & West"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Institutional Governance"
            subtitle="Architectural readiness and permission boundaries"
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                The Director Portal provides top-level institutional oversight, financial auditing, administrator management, and branch governance.
              </p>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-900 text-xs space-y-1">
                <p className="font-semibold">Security Boundary Note:</p>
                <p>
                  No separate Accountant role exists. Director holds executive financial authority, while daily cashiering is managed via the Admin portal under backend PostgreSQL Row Level Security (RLS).
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Quick Navigation" subtitle="Subdomain access">
            <ul className="divide-y divide-slate-100 text-xs">
              <li className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Admin Portal</span>
                <span className="text-slate-400 font-mono">admin.example.uz</span>
              </li>
              <li className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Teacher Portal</span>
                <span className="text-slate-400 font-mono">teacher.example.uz</span>
              </li>
              <li className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Student Portal</span>
                <span className="text-slate-400 font-mono">student.example.uz</span>
              </li>
              <li className="py-2.5 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Parent Portal</span>
                <span className="text-slate-400 font-mono">parent.example.uz</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

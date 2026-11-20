import React from 'react';
import { Card, Badge, Button } from '@education-erp/shared-ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrator Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Daily admissions, group coordination, and student records.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="primary">Campus Admin</Badge>
          <Button variant="primary" size="sm">+ New Student</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Admissions Pipeline">
          <p className="text-sm text-slate-600">
            CRM inquiry intake and trial lesson scheduling foundation ready for Phase 02 Supabase tables.
          </p>
        </Card>
        <Card title="Group Scheduling">
          <p className="text-sm text-slate-600">
            Classroom allocation, teacher assignment, and timetable coordination module.
          </p>
        </Card>
        <Card title="Billing & Cashier">
          <p className="text-sm text-slate-600">
            Tuition collection and receipt generation. Managed directly by Admin (no separate Accountant).
          </p>
        </Card>
      </div>
    </div>
  );
}

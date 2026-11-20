import React from 'react';
import { Card, Badge } from '@education-erp/shared-ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor academic attendance, test results, and fee balances for your linked children.</p>
        </div>
        <Badge variant="primary">Parent Portal</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Linked Children">
          <p className="text-sm text-slate-600">
            Overview of linked children enrolled in learning programs.
          </p>
        </Card>
        <Card title="Attendance Alerts">
          <p className="text-sm text-slate-600">
            Real-time notifications for arrival, absences, and lesson participation.
          </p>
        </Card>
        <Card title="Tuition & Invoices">
          <p className="text-sm text-slate-600">
            Clear balance breakdowns and online payment history.
          </p>
        </Card>
      </div>
    </div>
  );
}

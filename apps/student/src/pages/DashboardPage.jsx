import React from 'react';
import { Card, Badge } from '@education-erp/shared-ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Space</h1>
          <p className="text-sm text-slate-500 mt-1">Personal learning journey, class schedules, and tuition status.</p>
        </div>
        <Badge variant="warning">Student Portal</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Upcoming Lesson">
          <p className="text-sm text-slate-600">
            Next class details, assigned teacher, and classroom location.
          </p>
        </Card>
        <Card title="My Attendance">
          <p className="text-sm text-slate-600">
            Personal attendance percentage and completed lesson counts.
          </p>
        </Card>
        <Card title="Payment Status">
          <p className="text-sm text-slate-600">
            Current subscription validity, next billing date, and invoices.
          </p>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, Badge } from '@education-erp/shared-ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Manage assigned groups, mark attendance, and submit student grades.</p>
        </div>
        <Badge variant="success">Teacher Clearance</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Today's Lessons">
          <p className="text-sm text-slate-600">
            Assigned classes schedule, room numbers, and start times.
          </p>
        </Card>
        <Card title="Attendance Register">
          <p className="text-sm text-slate-600">
            One-click attendance recording for current active lesson.
          </p>
        </Card>
        <Card title="Academic Journal">
          <p className="text-sm text-slate-600">
            Homework grading, quiz results, and student performance comments.
          </p>
        </Card>
      </div>
    </div>
  );
}

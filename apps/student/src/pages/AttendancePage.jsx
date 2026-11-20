import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Attendance History</h1>
      <Card title="Lesson Logs">
        <p className="text-sm text-slate-600">
          Personal attendance logs (Present, Absent, Excused).
        </p>
      </Card>
    </div>
  );
}

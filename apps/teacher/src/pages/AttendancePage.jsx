import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Attendance Log</h1>
      <Card title="Student Attendance">
        <p className="text-sm text-slate-600">
          Daily attendance verification module ready for Phase 02 lesson records.
        </p>
      </Card>
    </div>
  );
}

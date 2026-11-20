import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Children Attendance</h1>
      <Card title="Attendance Tracking">
        <p className="text-sm text-slate-600">
          Verified presence and absence logs for each linked student.
        </p>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Class Schedule</h1>
      <Card title="Weekly Timetable">
        <p className="text-sm text-slate-600">
          Weekly timetable view for enrolled subjects and courses.
        </p>
      </Card>
    </div>
  );
}

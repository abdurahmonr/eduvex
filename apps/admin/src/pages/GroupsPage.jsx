import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function GroupsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Academic Groups</h1>
      <Card title="Course Groups & Cohorts">
        <p className="text-sm text-slate-600">
          Manage cohort capacity, schedules, assigned teacher, and classroom locations.
        </p>
      </Card>
    </div>
  );
}

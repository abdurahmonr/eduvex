import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function GroupsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Assigned Groups</h1>
      <Card title="Group Cohorts">
        <p className="text-sm text-slate-600">
          Only groups assigned to the authenticated teacher are accessible, strictly enforced via PostgreSQL Row Level Security (RLS).
        </p>
      </Card>
    </div>
  );
}

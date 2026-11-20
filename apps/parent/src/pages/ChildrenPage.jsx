import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function ChildrenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Children</h1>
      <Card title="Child Profiles">
        <p className="text-sm text-slate-600">
          Enrolled subjects, group schedules, and mentor contact information.
        </p>
      </Card>
    </div>
  );
}

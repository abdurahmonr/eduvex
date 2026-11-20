import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function StudentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
      <Card title="Active Students Registry">
        <p className="text-sm text-slate-600">
          Student roster, parent linkages, enrollment statuses, and contract data.
        </p>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Academic progress, retention rates, and staff efficiency metrics.</p>
      </div>

      <Card title="Reports Overview">
        <p className="text-sm text-slate-600">
          Reporting module foundation ready for analytical queries in Phase 02.
        </p>
      </Card>
    </div>
  );
}

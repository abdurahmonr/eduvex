import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function CrmPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">CRM & Lead Pipeline</h1>
      <Card title="Lead Funnel">
        <p className="text-sm text-slate-600">
          Inbound lead intake, status tracking (New, Contacted, Trial Scheduled, Enrolled, Lost).
        </p>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tuition & Invoices</h1>
      <Card title="Family Billing Statement">
        <p className="text-sm text-slate-600">
          Consolidated monthly statement across all enrolled children.
        </p>
      </Card>
    </div>
  );
}

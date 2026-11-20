import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function FinancesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Operational Finances</h1>
      <Card title="Cashier & Invoicing">
        <p className="text-sm text-slate-600">
          Admin cashier module for recording cash, card, and bank transfer tuition payments.
        </p>
      </Card>
    </div>
  );
}

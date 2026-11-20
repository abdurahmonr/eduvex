import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tuition Payments</h1>
      <Card title="Payment Invoices & Receipts">
        <p className="text-sm text-slate-600">
          View monthly tuition payment history, due amounts, and payment receipts.
        </p>
      </Card>
    </div>
  );
}

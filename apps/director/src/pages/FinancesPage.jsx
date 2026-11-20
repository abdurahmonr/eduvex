import React from 'react';
import { Card, Badge } from '@education-erp/shared-ui';

export function FinancesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Oversight</h1>
          <p className="text-sm text-slate-500 mt-1">Executive financial health, tuition reconciliations, and budgeting.</p>
        </div>
        <Badge variant="success">Executive Finance</Badge>
      </div>

      <Card title="Tuition & Revenue Reconciliations">
        <p className="text-sm text-slate-600">
          Financial oversight module is embedded directly into the Director and Admin portals per architectural specifications. No independent Accountant portal is utilized.
        </p>
      </Card>
    </div>
  );
}

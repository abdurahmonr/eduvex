import React from 'react';
import { Card, Badge } from '@education-erp/shared-ui';

export function AdminsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrator Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure campus administrators and their permission scopes.</p>
        </div>
        <Badge variant="primary">Director Clearance</Badge>
      </div>

      <Card title="System Administrators">
        <p className="text-sm text-slate-600">
          Module interface ready for Phase 02 Supabase authentication and role assignment integration.
        </p>
      </Card>
    </div>
  );
}

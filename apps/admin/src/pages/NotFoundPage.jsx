import React from 'react';
import { Card, Button } from '@education-erp/shared-ui';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card title="Page Not Found" subtitle="Error 404">
        <p className="text-sm text-slate-600 mb-4">
          The requested page does not exist within the Admin Portal.
        </p>
        <a href="/">
          <Button variant="primary" size="sm">Return to Dashboard</Button>
        </a>
      </Card>
    </div>
  );
}

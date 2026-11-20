import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function ProgressPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Academic Progress</h1>
      <Card title="Gradebook & Evaluations">
        <p className="text-sm text-slate-600">
          Teacher reviews, exam performance, and mastery milestones.
        </p>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function GradesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Grading & Evaluation</h1>
      <Card title="Student Grades">
        <p className="text-sm text-slate-600">
          Exam, test, and homework grading journal.
        </p>
      </Card>
    </div>
  );
}

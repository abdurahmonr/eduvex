import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
      <Card title="Curriculum & Pricing">
        <p className="text-sm text-slate-600">
          Course definitions, duration, module syllabus, and standard monthly pricing tariffs.
        </p>
      </Card>
    </div>
  );
}

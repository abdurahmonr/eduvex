import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
      <Card title="Enrolled Courses">
        <p className="text-sm text-slate-600">
          Syllabus overview and study resources for enrolled courses.
        </p>
      </Card>
    </div>
  );
}

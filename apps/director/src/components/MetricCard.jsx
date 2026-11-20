import React from 'react';
import { Card } from '@education-erp/shared-ui';

export function MetricCard({ title, value, change, subtitle }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-slate-900 mt-2">{value}</span>
        <div className="flex items-center gap-2 mt-2">
          {change && <span className="text-xs font-medium text-emerald-600">{change}</span>}
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );
}

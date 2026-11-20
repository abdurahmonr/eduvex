import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DirectorLayout } from '../layouts/DirectorLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { AdminsPage } from '../pages/AdminsPage.jsx';
import { FinancesPage } from '../pages/FinancesPage.jsx';
import { ReportsPage } from '../pages/ReportsPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <DirectorLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/admins" element={<AdminsPage />} />
        <Route path="/finances" element={<FinancesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DirectorLayout>
  );
}

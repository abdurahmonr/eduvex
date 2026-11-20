import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { StudentsPage } from '../pages/StudentsPage.jsx';
import { GroupsPage } from '../pages/GroupsPage.jsx';
import { CoursesPage } from '../pages/CoursesPage.jsx';
import { CrmPage } from '../pages/CrmPage.jsx';
import { FinancesPage } from '../pages/FinancesPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/finances" element={<FinancesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AdminLayout>
  );
}

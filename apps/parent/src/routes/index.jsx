import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ParentLayout } from '../layouts/ParentLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { ChildrenPage } from '../pages/ChildrenPage.jsx';
import { AttendancePage } from '../pages/AttendancePage.jsx';
import { ProgressPage } from '../pages/ProgressPage.jsx';
import { PaymentsPage } from '../pages/PaymentsPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <ParentLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ParentLayout>
  );
}

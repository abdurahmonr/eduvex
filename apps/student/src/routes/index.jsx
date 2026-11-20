import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { SchedulePage } from '../pages/SchedulePage.jsx';
import { AttendancePage } from '../pages/AttendancePage.jsx';
import { PaymentsPage } from '../pages/PaymentsPage.jsx';
import { CoursesPage } from '../pages/CoursesPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </StudentLayout>
  );
}

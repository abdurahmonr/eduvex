import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TeacherLayout } from '../layouts/TeacherLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { GroupsPage } from '../pages/GroupsPage.jsx';
import { AttendancePage } from '../pages/AttendancePage.jsx';
import { GradesPage } from '../pages/GradesPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <TeacherLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TeacherLayout>
  );
}

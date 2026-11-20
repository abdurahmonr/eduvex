import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortalLayout } from '@education-erp/shared-ui';
import { TEACHER_CONFIG } from '../config/index.js';

export function TeacherLayout({ children }) {
  const location = useLocation();

  return (
    <PortalLayout
      portalConfig={TEACHER_CONFIG}
      navLinks={TEACHER_CONFIG.navLinks}
      currentPath={location.pathname}
    >
      {children}
    </PortalLayout>
  );
}

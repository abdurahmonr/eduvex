import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortalLayout } from '@education-erp/shared-ui';
import { STUDENT_CONFIG } from '../config/index.js';

export function StudentLayout({ children }) {
  const location = useLocation();

  return (
    <PortalLayout
      portalConfig={STUDENT_CONFIG}
      navLinks={STUDENT_CONFIG.navLinks}
      currentPath={location.pathname}
    >
      {children}
    </PortalLayout>
  );
}

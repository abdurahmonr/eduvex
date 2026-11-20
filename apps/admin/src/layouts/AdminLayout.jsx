import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortalLayout } from '@education-erp/shared-ui';
import { ADMIN_CONFIG } from '../config/index.js';

export function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <PortalLayout
      portalConfig={ADMIN_CONFIG}
      navLinks={ADMIN_CONFIG.navLinks}
      currentPath={location.pathname}
    >
      {children}
    </PortalLayout>
  );
}

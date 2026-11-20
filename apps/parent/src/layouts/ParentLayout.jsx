import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortalLayout } from '@education-erp/shared-ui';
import { PARENT_CONFIG } from '../config/index.js';

export function ParentLayout({ children }) {
  const location = useLocation();

  return (
    <PortalLayout
      portalConfig={PARENT_CONFIG}
      navLinks={PARENT_CONFIG.navLinks}
      currentPath={location.pathname}
    >
      {children}
    </PortalLayout>
  );
}

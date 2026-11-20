import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortalLayout } from '@education-erp/shared-ui';
import { DIRECTOR_CONFIG } from '../config/index.js';

export function DirectorLayout({ children }) {
  const location = useLocation();

  return (
    <PortalLayout
      portalConfig={DIRECTOR_CONFIG}
      navLinks={DIRECTOR_CONFIG.navLinks}
      currentPath={location.pathname}
    >
      {children}
    </PortalLayout>
  );
}

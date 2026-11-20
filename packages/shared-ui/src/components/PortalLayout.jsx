import React from 'react';
import { StatusBanner } from './StatusBanner.jsx';
import { PortalHeader } from './PortalHeader.jsx';

/**
 * Standard Portal Shell Layout
 */
export function PortalLayout({
  portalConfig,
  navLinks = [],
  currentPath = '/',
  children
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <StatusBanner
        portalName={portalConfig.name}
        subdomain={portalConfig.subdomain}
        port={portalConfig.defaultPort}
      />
      <PortalHeader
        portalName={portalConfig.name}
        badgeText={portalConfig.name}
        badgeVariant="primary"
        navLinks={navLinks}
        currentPath={currentPath}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Education Center ERP + CRM &copy; 2026. Phase 01 Architecture Foundation.</p>
      </footer>
    </div>
  );
}

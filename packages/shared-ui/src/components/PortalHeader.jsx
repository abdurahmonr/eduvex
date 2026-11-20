import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from './Badge.jsx';

/**
 * Shared Portal Navigation Header using React Router Link for true SPA navigation
 */
export function PortalHeader({
  portalName,
  badgeText = 'Portal',
  badgeVariant = 'primary',
  navLinks = []
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
                EC
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight">Education Center</span>
                <span className="text-xs text-slate-500 font-medium">ERP + CRM</span>
              </div>
            </Link>
            <Badge variant={badgeVariant}>{badgeText}</Badge>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

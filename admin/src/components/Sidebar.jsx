import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  UserCheck, 
  CalendarCheck, 
  CreditCard, 
  School,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const location = useLocation();

  // Asosiy boshqaruv menyusi
  const coreMenuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', path: '/leads', label: 'Lidlar', icon: UserCheck },
    { id: 'students', path: '/students', label: 'O\'quvchilar', icon: Users },
    { id: 'groups', path: '/groups', label: 'Guruhlar', icon: Layers },
    { id: 'courses', path: '/courses', label: 'Kurslar', icon: BookOpen },
    { id: 'teachers', path: '/teachers', label: 'O\'qituvchilar', icon: GraduationCap },
  ];

  // Moliya va nazorat
  const advancedMenuItems = [
    { id: 'attendance', path: '/attendance', label: 'Davomat', icon: CalendarCheck },
    { id: 'payments', path: '/payments', label: 'To\'lovlar & Qarz', icon: CreditCard },
  ];

  const isItemActive = (item) => {
    if (currentTab) return currentTab === item.id;
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <aside className="w-60 bg-white border-r border-stone-200/90 flex flex-col shrink-0 select-none">
      {/* Brand Logo */}
      <NavLink 
        to="/dashboard"
        className="h-14 flex items-center gap-2.5 px-4 border-b border-stone-200/90 hover:bg-stone-50/70 transition-colors"
      >
        <div className="w-7 h-7 rounded-md bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
          <School className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-semibold text-stone-900 text-xs tracking-tight">EduCRM</h1>
          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 border border-stone-200/60 px-1.5 py-0.5 rounded">v2.0</span>
        </div>
      </NavLink>

      {/* Navigation */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* 1. Asosiy boshqaruv */}
        <div>
          <p className="px-2.5 text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
            Asosiy boshqaruv
          </p>
          <nav className="space-y-0.5">
            {coreMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setCurrentTab && setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer group ${
                    active
                      ? 'bg-stone-100 text-stone-900 font-medium border-l-2 border-[#1B4332]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'}`} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-600 font-medium">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* 2. Moliya va Davomat bo'limlari */}
        <div>
          <p className="px-2.5 text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
            Moliya & Davomat
          </p>
          <nav className="space-y-0.5">
            {advancedMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setCurrentTab && setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer group ${
                    active
                      ? 'bg-stone-100 text-stone-900 font-medium border-l-2 border-[#1B4332]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'}`} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-600 font-medium">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* 3. Portallar */}
        <div>
          <p className="px-2.5 text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
            Portallar
          </p>
          <div className="space-y-0.5">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-stone-400 group-hover:text-stone-600" strokeWidth={1.5} />
                <span>Asosiy Veb-sayt</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-200/90 text-center">
        <p className="text-[11px] text-stone-400 font-mono">© 2026 EduCRM</p>
      </div>
    </aside>
  );
}

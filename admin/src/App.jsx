import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Groups from './pages/Groups';
import Courses from './pages/Courses';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Leads from './pages/Leads';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
      case '/': return "Dashboard & Asosiy ko'rsatkichlar";
      case '/leads': return "Lidlar (CRM Kanban doskasi)";
      case '/students': return "O'quvchilar ro'yxati va boshqaruvi";
      case '/groups': return "Guruhlar ro'yxati va dars jadvallari";
      case '/courses': return "Kurslar va narxlar";
      case '/teachers': return "O'qituvchilar tarkibi";
      case '/attendance': return "Davomat jurnali";
      case '/payments': return "To'lovlar & Qarzdorlik tahlili";
      default: return "Boshqaruv paneli";
    }
  };

  const handleSetTab = (tab) => {
    navigate(tab.startsWith('/') ? tab : `/${tab}`);
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] font-sans overflow-hidden text-stone-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle={getPageTitle(location.pathname)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard setCurrentTab={handleSetTab} />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/students" element={<Students />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-stone-500 font-medium">Tizim yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/*" 
        element={user ? <AdminLayout /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

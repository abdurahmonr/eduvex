import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Users, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  RefreshCw,
  DollarSign,
  UserCheck,
  CreditCard,
  GraduationCap,
  Layers,
  Search,
  Filter,
  Phone,
  Clock,
  Calendar,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { 
  supabase, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  createAdminAccount, 
  fetchAdmins, 
  removeAdmin,
  fetchDirectorDashboardStats,
  fetchDirectorFinances,
  fetchDirectorDebtors,
  fetchDirectorTeachers,
  fetchDirectorGroups,
  fetchDirectorLeads
} from './lib/supabase';
import { isSessionExpired, touchSession, clearSession, setupSessionHeartbeat, saveCredentialToBrowser } from './lib/session';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';

const STORAGE_KEY = 'director_session_last_active';
const SESSION_KEY = 'director_session';

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;

    if (isSessionExpired(STORAGE_KEY)) {
      localStorage.removeItem(SESSION_KEY);
      clearSession(STORAGE_KEY);
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved && !isSessionExpired(STORAGE_KEY)) {
      return false;
    }
    return true;
  });

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Supabase sozlamalar modali (login sahifasida ishlatish uchun)
  const [isLoginConfigOpen, setIsLoginConfigOpen] = useState(false);
  const config = getSupabaseConfig();
  const [cfgUrl, setCfgUrl] = useState(config.url);
  const [cfgKey, setCfgKey] = useState(config.key);

  // URL routing orqali boshqariladigan faol tab: 'dashboard' | 'admins' | 'teachers' | 'groups' | 'finances' | 'debtors' | 'leads'
  const location = useLocation();
  const navigate = useNavigate();

  const validTabs = ['dashboard', 'admins', 'teachers', 'groups', 'finances', 'debtors', 'leads'];
  const rawTab = location.pathname.replace(/^\//, '').split('/')[0];
  const currentTab = validTabs.includes(rawTab) ? rawTab : 'dashboard';

  const setCurrentTab = (tab) => {
    const target = tab.startsWith('/') ? tab : `/${tab}`;
    navigate(target);
  };

  // Adminlar boshqaruvi
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Yangi admin qo'shish modal
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');

  // Adminni o'chirish tasdiqlash modali
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Dashboard Statistikasi
  const [dashboardData, setDashboardData] = useState({
    monthlyRevenue: 0,
    monthlyDebtorsCount: 0,
    totalStudents: 0,
    totalGroups: 0,
    totalLeads: 0,
    convertedLeads: 0,
    recentPayments: [],
    currentMonth: ''
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Yangi monitoring bo'limlari holatlari
  const [finances, setFinances] = useState([]);
  const [loadingFinances, setLoadingFinances] = useState(false);
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeMethodFilter, setFinanceMethodFilter] = useState('all');

  const [debtorsData, setDebtorsData] = useState({ debtors: [], totalExpected: 0, totalPaid: 0, totalDebt: 0 });
  const [loadingDebtors, setLoadingDebtors] = useState(false);
  const [debtorSearch, setDebtorSearch] = useState('');

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

  // 1. Sessiyani kuzatish
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
      if (supaSession) {
        if (!isSessionExpired(STORAGE_KEY)) {
          setSession(supaSession);
          localStorage.setItem(SESSION_KEY, JSON.stringify(supaSession));
          touchSession(STORAGE_KEY);
        } else {
          handleLogout();
        }
      }
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supaSession) => {
      if (supaSession) {
        setSession(supaSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(supaSession));
        touchSession(STORAGE_KEY);
      } else if (event === 'SIGNED_OUT') {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (!parsed?.isCustom) {
              setSession(null);
              localStorage.removeItem(SESSION_KEY);
              clearSession(STORAGE_KEY);
            }
          } catch {}
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sessiya faolligi
  useEffect(() => {
    if (!session) return;
    const cleanup = setupSessionHeartbeat(STORAGE_KEY, () => {
      handleLogout();
    });
    return () => cleanup();
  }, [session]);

  // Ma'lumotlarni yuklash funksiyalari
  const loadAdmins = async () => {
    if (!supabase) return;
    setLoadingAdmins(true);
    setAdminError('');
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      setAdminError(err.message || 'Adminlarni yuklashda xatolik');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadStats = async () => {
    if (!supabase) return;
    setStatsLoading(true);
    try {
      const res = await fetchDirectorDashboardStats();
      setDashboardData(res);
    } catch (e) {
      console.warn('Statistikani olishda xatolik:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadFinances = async () => {
    if (!supabase) return;
    setLoadingFinances(true);
    try {
      const res = await fetchDirectorFinances();
      setFinances(res);
    } catch (e) {
      console.warn('Moliya yuklashda xatolik:', e);
    } finally {
      setLoadingFinances(false);
    }
  };

  const loadDebtors = async () => {
    if (!supabase) return;
    setLoadingDebtors(true);
    try {
      const res = await fetchDirectorDebtors();
      setDebtorsData(res);
    } catch (e) {
      console.warn('Qarzdorlarni yuklashda xatolik:', e);
    } finally {
      setLoadingDebtors(false);
    }
  };

  const loadTeachers = async () => {
    if (!supabase) return;
    setLoadingTeachers(true);
    try {
      const res = await fetchDirectorTeachers();
      setTeachers(res);
    } catch (e) {
      console.warn('Ustozlarni yuklashda xatolik:', e);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const loadGroups = async () => {
    if (!supabase) return;
    setLoadingGroups(true);
    try {
      const res = await fetchDirectorGroups();
      setGroups(res);
    } catch (e) {
      console.warn('Guruhlarni yuklashda xatolik:', e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadLeads = async () => {
    if (!supabase) return;
    setLoadingLeads(true);
    try {
      const res = await fetchDirectorLeads();
      setLeads(res);
    } catch (e) {
      console.warn('Lidlarni yuklashda xatolik:', e);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Dastlabki va tabga qarab yuklash
  useEffect(() => {
    if (session) {
      loadStats();
      loadAdmins();
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (currentTab === 'finances') loadFinances();
    if (currentTab === 'debtors') loadDebtors();
    if (currentTab === 'teachers') loadTeachers();
    if (currentTab === 'groups') loadGroups();
    if (currentTab === 'leads') loadLeads();
    if (currentTab === 'dashboard') loadStats();
  }, [currentTab, session]);

  // Kirish va Chiqish amallari
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setLoginError('Supabase sozlanmagan. Iltimos, avval URL va Anon Keyni kiriting.');
      setIsLoginConfigOpen(true);
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: { name: directorName.trim() || 'Direktor', role: 'director' }
          }
        });

        if (error) throw error;

        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email,
              name: directorName.trim() || 'Direktor',
              role: 'director',
              login: email.includes('@') ? email.split('@')[0] : email.trim(),
              password: password.trim()
            });

            await supabase.from('directors').upsert({
              email: data.user.email,
              name: directorName.trim() || 'Direktor',
              login: email.includes('@') ? email.split('@')[0] : email.trim(),
              password: password.trim(),
              role: 'director',
              status: 'active'
            }, { onConflict: 'email' });
          } catch (e) {
            console.warn('Profile/Director upsert warning:', e);
          }
        }

        if (data.session) {
          setSession(data.session);
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
          touchSession(STORAGE_KEY);
          saveCredentialToBrowser(email, password, directorName || 'Direktor');
          navigate('/dashboard');
        } else {
          setAdminSuccess("Direktor hisobi muvaffaqiyatli yaratildi! Endi kirish mumkin.");
          setIsSignUp(false);
        }
      } else {
        const query = email.trim();
        const emailToTry = query.includes('@') ? query : `${query}@markaz.uz`;

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password: password.trim()
        });

        if (!error && data?.session) {
          setSession(data.session);
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
          touchSession(STORAGE_KEY);
          saveCredentialToBrowser(email, password, 'Direktor');
          navigate('/dashboard');
        } else {
          try {
            const { data: dirRecord } = await supabase
              .from('directors')
              .select('*')
              .or(`email.eq.${query},login.eq.${query}`)
              .eq('password', password.trim())
              .maybeSingle();

            if (dirRecord) {
              const customSession = {
                isCustom: true,
                user: {
                  id: String(dirRecord.id),
                  email: dirRecord.email,
                  user_metadata: { name: dirRecord.name }
                }
              };
              setSession(customSession);
              localStorage.setItem(SESSION_KEY, JSON.stringify(customSession));
              touchSession(STORAGE_KEY);
              saveCredentialToBrowser(dirRecord.email || dirRecord.login, password, dirRecord.name || 'Direktor');
              navigate('/dashboard');
            } else {
              throw error || new Error('Login yoki parol noto\'g\'ri');
            }
          } catch (dirErr) {
            throw error || dirErr;
          }
        }
      }
    } catch (err) {
      setLoginError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem(SESSION_KEY);
    clearSession(STORAGE_KEY);
    setSession(null);
    navigate('/login');
  };

  // Yangi admin qo'shish
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      setAddAdminError('Barcha maydonlarni to\'ldiring');
      return;
    }

    if (newAdmin.password.length < 6) {
      setAddAdminError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setSubmittingAdmin(true);
    setAddAdminError('');
    try {
      await createAdminAccount(newAdmin);
      setAdminSuccess(`Yangi admin (${newAdmin.email}) muvaffaqiyatli yaratildi!`);
      setIsAddAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '' });
      loadAdmins();
      setTimeout(() => setAdminSuccess(''), 5000);
    } catch (err) {
      setAddAdminError(err.message || 'Admin yaratishda xatolik');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  // Adminni o'chirish
  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeAdmin(deleteTarget.id);
      setAdminSuccess('Admin muvaffaqiyatli o\'chirildi');
      setDeleteTarget(null);
      loadAdmins();
      setTimeout(() => setAdminSuccess(''), 4000);
    } catch (err) {
      setAdminError(err.message || 'O\'chirishda xatolik');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-stone-500 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  // 1. LOGIN SAHIFASI
  if (!session) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans text-stone-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1B4332] text-white mb-3 shadow-xs">
              <Building2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg font-semibold text-stone-900 tracking-tight">Direktor Kabineti</h1>
            <p className="text-xs text-stone-500 mt-0.5">direktor.sayt.uz</p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200/90 p-6 shadow-xs">
            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200/60 text-rose-800 rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Direktor Ism-Familiyasi</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                    <input
                      type="text"
                      required
                      placeholder="Alisher Qodirov"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email yoki Login</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    placeholder="director@markaz.uz yoki director"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Parol</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-2 bg-[#1B4332] hover:bg-[#143326] text-white font-medium rounded-md text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{loginLoading ? 'Jarayonda...' : (isSignUp ? 'Direktor hisobini yaratish' : 'Kabinetga kirish')}</span>
                {!loginLoading && <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setIsLoginConfigOpen(true)}
                className="text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                <Key className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                <span>Supabase sozlash</span>
              </button>
              <span className="text-stone-400">Boshqaruv Tizimi</span>
            </div>
          </div>
        </div>

        {/* Login uchun Supabase modal */}
        <Modal
          isOpen={isLoginConfigOpen}
          onClose={() => setIsLoginConfigOpen(false)}
          title="Supabase Ulanish Sozlamalari"
          maxWidth="max-w-md"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            saveSupabaseConfig(cfgUrl, cfgKey);
            setIsLoginConfigOpen(false);
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Project URL</label>
              <input
                type="url"
                required
                value={cfgUrl}
                onChange={(e) => setCfgUrl(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Anon Key</label>
              <textarea
                rows={4}
                required
                value={cfgKey}
                onChange={(e) => setCfgKey(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-md text-xs font-mono text-stone-900"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLoginConfigOpen(false)}
                className="px-3 py-1.5 border border-stone-200 rounded-md text-xs font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#1B4332] text-white rounded-md text-xs font-medium"
              >
                Saqlash
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Tizimga kirgan bo'lsa va /login yoki / da bo'lsa -> /dashboard ga yo'naltirish
  if (location.pathname === '/login' || location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // Noto'g'ri root kiritilganda -> /dashboard ga yo'naltirish
  if (rawTab && !validTabs.includes(rawTab)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. SAHIFA SARLAVHALARI
  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return "Direktor Dashboard & Boshqaruv";
      case 'admins': return "Administratorlar tarkibi va boshqaruvi";
      case 'teachers': return "O'qituvchilar tarkibi va yuklamalari";
      case 'groups': return "Guruhlar va o'quv kurslari monitoringi";
      case 'finances': return "Moliya & To'lovlar tahlili";
      case 'debtors': return "Qarzdorlik nazorati (Debitorlar)";
      case 'leads': return "Qabul arizalari va Lidlar (CRM)";
      default: return "Boshqaruv paneli";
    }
  };

  // 3. TABLAR BO'YICHA KONTENT RENDER QILISH
  const renderContent = () => {
    // 3.1 DASHBOARD TABI
    if (currentTab === 'dashboard') {
      return (
        <div className="space-y-5">
          {/* Sarlavha va Yangilash */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-stone-900">Markaz ko'rsatkichlari tahlili</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Kassadagi tushum, qarzdorliklar, o'quvchilar va qabul lidlari bo'yicha to'liq hisobot
              </p>
            </div>
            <button
              onClick={loadStats}
              disabled={statsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md border border-stone-200 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${statsLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              <span>Yangilash</span>
            </button>
          </div>

          {/* 4 ta Statistika Kartasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setCurrentTab('finances')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Joriy Oy Tushumi</span>
                <DollarSign className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-stone-900 font-mono tabular-nums">
                {statsLoading ? '...' : `${new Intl.NumberFormat('uz-UZ').format(dashboardData.monthlyRevenue)} so'm`}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <span>{dashboardData.currentMonth || 'Joriy oy'} to'lovlari</span>
                <span className="font-medium text-emerald-700 flex items-center gap-0.5">Batafsil &rarr;</span>
              </div>
            </div>

            <div 
              onClick={() => setCurrentTab('debtors')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Shu Oy Qarzdorlari</span>
                <AlertCircle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-rose-600 font-mono tabular-nums">
                {statsLoading ? '...' : `${dashboardData.monthlyDebtorsCount} nafar`}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <span>To'lov muddati o'tgan</span>
                <span className="font-medium text-rose-600 flex items-center gap-0.5">Nazorat &rarr;</span>
              </div>
            </div>

            <div 
              onClick={() => setCurrentTab('groups')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">O'quvchilar & Guruhlar</span>
                <Users className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-stone-900 font-mono tabular-nums">
                {statsLoading ? '...' : `${dashboardData.totalStudents} nafar`}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <span>{dashboardData.totalGroups} ta guruhda</span>
                <span className="font-medium text-stone-700">Guruhlar &rarr;</span>
              </div>
            </div>

            <div 
              onClick={() => setCurrentTab('leads')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Lidlar & Konversiya</span>
                <UserCheck className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" strokeWidth={1.5} />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-stone-900 font-mono tabular-nums">
                  {statsLoading ? '...' : `${dashboardData.totalLeads} ta`}
                </p>
                <span className="text-xs font-medium text-stone-600 tabular-nums">
                  ({dashboardData.convertedLeads} yozildi)
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <span>Qabul natijasi</span>
                <span className="font-medium text-stone-700 tabular-nums">
                  {dashboardData.totalLeads > 0 
                    ? `${Math.round((dashboardData.convertedLeads / dashboardData.totalLeads) * 100)}% muvaffaqiyat` 
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Tezkor boshqaruv panellari */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-stone-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" strokeWidth={1.5} />
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Adminlar Tarkibi</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tizimda hozirda <strong className="text-stone-900 font-semibold">{admins.length} nafar</strong> mas'ul admin ishlamoqda.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('admins')}
                  className="text-xs font-medium text-emerald-800 hover:text-emerald-900 cursor-pointer"
                >
                  Ro'yxatni ko'rish &rarr;
                </button>
                <button
                  onClick={() => {
                    setIsAddAdminOpen(true);
                    setAddAdminError('');
                  }}
                  className="px-2.5 py-1 bg-[#1B4332] text-white rounded text-xs font-medium hover:bg-[#143326] cursor-pointer"
                >
                  + Yangi admin
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-stone-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-stone-700" strokeWidth={1.5} />
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Ustozlar Nazorati</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  O'qituvchilar dars jadvallari, ularning guruhlari va dars yuklamalarini monitoring qiling.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('teachers')}
                  className="text-xs font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
                >
                  O'qituvchilar jadvali &rarr;
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-stone-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Qarzdorlik Nazorati</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Shu oy to'lovini amalga oshirmagan <strong className="text-rose-700 font-semibold">{dashboardData.monthlyDebtorsCount} ta o'quvchi</strong> bor.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('debtors')}
                  className="text-xs font-medium text-rose-700 hover:text-rose-900 cursor-pointer font-semibold"
                >
                  Qarzdorlar ro'yxati &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Oxirgi To'lovlar Jadvali */}
          <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h4 className="text-sm font-semibold text-stone-900">Oxirgi To'lovlar (So'nggi 10 ta)</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  O'quvchilar tomonidan amalga oshirilgan eng so'nggi kassa operatsiyalari
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('finances')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Barcha to'lovlarni ko'rish &rarr;
              </button>
            </div>

            {statsLoading ? (
              <div className="py-12 text-center text-stone-400 text-xs">To'lovlar yuklanmoqda...</div>
            ) : dashboardData.recentPayments.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 p-6">
                <CreditCard className="w-6 h-6 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="font-medium text-stone-700">Hozircha to'lovlar mavjud emas</p>
                <p className="text-[11px] text-stone-400 mt-0.5">To'lovlar qabul qilinganda shu yerda ko'rinadi.</p>
              </div>
            ) : (
              <div className="border border-stone-200/80 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                    <tr>
                      <th className="px-4 py-2.5">O'quvchi</th>
                      <th className="px-4 py-2.5">Telefon</th>
                      <th className="px-4 py-2.5">Summa</th>
                      <th className="px-4 py-2.5">To'lov turi</th>
                      <th className="px-4 py-2.5">Oy / Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {dashboardData.recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-[10px] flex items-center justify-center font-medium border border-stone-200/60">
                            {p.student_name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{p.student_name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-500 tabular-nums">{p.student_phone || '—'}</td>
                        <td className="px-4 py-3 font-medium font-mono text-emerald-800 tabular-nums">
                          {new Intl.NumberFormat('uz-UZ').format(p.amount)} so'm
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 uppercase">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 font-mono text-[11px] tabular-nums">
                          {p.date} ({p.month})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3.2 ADMINLAR BO'LIMI
    if (currentTab === 'admins') {
      return (
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Administratorlar Ro'yxati</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                CRM tizimiga kirish huquqiga ega barcha faol adminlar
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAdmins}
                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors cursor-pointer border border-stone-200"
                title="Yangilash"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => {
                  setIsAddAdminOpen(true);
                  setAddAdminError('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Yangi admin qo'shish</span>
              </button>
            </div>
          </div>

          {loadingAdmins ? (
            <div className="py-12 text-center text-stone-400 text-xs">Adminlar yuklanmoqda...</div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 p-6">
              Hozircha tizimda birorta ham admin mavjud emas. "Yangi admin qo'shish" tugmasini bosing.
            </div>
          ) : (
            <div className="border border-stone-200/80 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-2.5">№</th>
                    <th className="px-4 py-2.5">Admin Ismi</th>
                    <th className="px-4 py-2.5">Email (Login)</th>
                    <th className="px-4 py-2.5">Roli</th>
                    <th className="px-4 py-2.5">Tayinlangan sana</th>
                    <th className="px-4 py-2.5 text-right">O'chirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {admins.map((adm, index) => (
                    <tr key={adm.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-stone-400 font-mono tabular-nums">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60 flex items-center justify-center font-medium text-xs shrink-0">
                          {adm.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <span>{adm.name || 'Admin'}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-stone-600">{adm.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60 uppercase">
                          {adm.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-stone-500 font-mono tabular-nums">
                        {adm.created_at ? new Date(adm.created_at).toLocaleDateString('uz-UZ') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setDeleteTarget(adm)}
                          title="Adminni o'chirish"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // 3.3 MOLIYA & TO'LOVLAR BO'LIMI
    if (currentTab === 'finances') {
      const filteredFinances = finances.filter(f => {
        const matchesSearch = f.student_name.toLowerCase().includes(financeSearch.toLowerCase()) ||
                              f.student_phone.includes(financeSearch);
        const matchesMethod = financeMethodFilter === 'all' || f.payment_method === financeMethodFilter;
        return matchesSearch && matchesMethod;
      });

      const totalCalculated = filteredFinances.reduce((acc, f) => acc + f.amount, 0);

      return (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Barcha To'lovlar Jurnali</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Markazga tushgan barcha to'lovlar, kassa tarixi va to'lov usullari nazorati
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadFinances}
                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer"
                  title="Yangilash"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Filterlar & Qidiruv */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="O'quvchi ismi yoki telefon raqami..."
                  value={financeSearch}
                  onChange={(e) => setFinanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Usul:
                </span>
                <select
                  value={financeMethodFilter}
                  onChange={(e) => setFinanceMethodFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-800 focus:outline-none"
                >
                  <option value="all">Barchasi</option>
                  <option value="naqd">Naqd pul</option>
                  <option value="plastik">Plastik karta</option>
                  <option value="otkazma">Bank o'tkazmasi</option>
                </select>

                <div className="ml-auto pl-3 border-l border-stone-200 text-xs font-mono font-semibold text-emerald-800 tabular-nums">
                  Jami: {new Intl.NumberFormat('uz-UZ').format(totalCalculated)} so'm
                </div>
              </div>
            </div>

            {/* Jadval */}
            <div className="mt-4">
              {loadingFinances ? (
                <div className="py-12 text-center text-stone-400 text-xs">To'lovlar yuklanmoqda...</div>
              ) : filteredFinances.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
                  Mos keluvchi to'lovlar topilmadi
                </div>
              ) : (
                <div className="border border-stone-200/80 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                      <tr>
                        <th className="px-4 py-2.5">№</th>
                        <th className="px-4 py-2.5">O'quvchi</th>
                        <th className="px-4 py-2.5">Telefon</th>
                        <th className="px-4 py-2.5">Summa</th>
                        <th className="px-4 py-2.5">To'lov usuli</th>
                        <th className="px-4 py-2.5">Oy</th>
                        <th className="px-4 py-2.5">Sana</th>
                        <th className="px-4 py-2.5">Izoh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {filteredFinances.map((f, i) => (
                        <tr key={f.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-4 py-3 text-stone-400 font-mono tabular-nums">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-stone-900">{f.student_name}</td>
                          <td className="px-4 py-3 font-mono text-stone-500 tabular-nums">{f.student_phone || '—'}</td>
                          <td className="px-4 py-3 font-medium font-mono text-emerald-800 tabular-nums">
                            {new Intl.NumberFormat('uz-UZ').format(f.amount)} so'm
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 uppercase">
                              {f.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono tabular-nums">{f.month}</td>
                          <td className="px-4 py-3 text-stone-500 font-mono tabular-nums">{f.date}</td>
                          <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{f.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3.4 QARZDORLAR BO'LIMI
    if (currentTab === 'debtors') {
      const filteredDebtors = debtorsData.debtors.filter(d => 
        d.name.toLowerCase().includes(debtorSearch.toLowerCase()) ||
        d.phone.includes(debtorSearch) ||
        d.group_name.toLowerCase().includes(debtorSearch.toLowerCase())
      );

      return (
        <div className="space-y-4">
          {/* Statistika paneli */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-stone-200/90">
              <span className="text-xs text-stone-500 uppercase tracking-wider">Kutilayotgan Oylik Reja</span>
              <p className="text-xl font-semibold text-stone-900 font-mono mt-1 tabular-nums">
                {new Intl.NumberFormat('uz-UZ').format(debtorsData.totalExpected)} so'm
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-stone-200/90">
              <span className="text-xs text-stone-500 uppercase tracking-wider">Amalda To'langan</span>
              <p className="text-xl font-semibold text-emerald-700 font-mono mt-1 tabular-nums">
                {new Intl.NumberFormat('uz-UZ').format(debtorsData.totalPaid)} so'm
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-stone-200/90">
              <span className="text-xs text-rose-600 font-medium uppercase tracking-wider">Jami Qarzdorlik</span>
              <p className="text-xl font-semibold text-rose-600 font-mono mt-1 tabular-nums">
                {new Intl.NumberFormat('uz-UZ').format(debtorsData.totalDebt)} so'm
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Joriy Oy Qarzdorlari ({debtorsData.debtors.length} nafar)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kurs to'lovini to'liq to'lamagan o'quvchilar ro'yxati va ularning ota-onalari bilan aloqa
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDebtors}
                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer"
                  title="Yangilash"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="mt-4 mb-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Ism, guruh yoki telefon bo'yicha..."
                  value={debtorSearch}
                  onChange={(e) => setDebtorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
                />
              </div>
            </div>

            {loadingDebtors ? (
              <div className="py-12 text-center text-stone-400 text-xs">Qarzdorlar tahlil qilinmoqda...</div>
            ) : filteredDebtors.length === 0 ? (
              <div className="py-12 text-center text-emerald-800 text-xs bg-emerald-50/50 rounded-md border border-emerald-200 p-6">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" strokeWidth={1.5} />
                <p className="font-medium text-emerald-900">Hozirda hech qanday qarzdorlik aniqlanmadi!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Barcha faol o'quvchilar kurs to'lovlarini to'liq amalga oshirgan.</p>
              </div>
            ) : (
              <div className="border border-stone-200/80 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                    <tr>
                      <th className="px-4 py-2.5">№</th>
                      <th className="px-4 py-2.5">O'quvchi</th>
                      <th className="px-4 py-2.5">Guruh / Kurs</th>
                      <th className="px-4 py-2.5">Shaxsiy Tel</th>
                      <th className="px-4 py-2.5">Ota-ona Tel</th>
                      <th className="px-4 py-2.5">Kurs Narxi</th>
                      <th className="px-4 py-2.5">To'langan</th>
                      <th className="px-4 py-2.5 text-right">Qarz Summasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredDebtors.map((d, index) => (
                      <tr key={d.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 text-stone-400 font-mono tabular-nums">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">{d.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-stone-800">{d.group_name}</span>
                          <span className="block text-[10px] text-stone-400">{d.course_name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{d.phone}</td>
                        <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{d.parent_phone || '—'}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-stone-600">
                          {new Intl.NumberFormat('uz-UZ').format(d.price)}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-emerald-700">
                          {new Intl.NumberFormat('uz-UZ').format(d.paid)}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-rose-600 text-right tabular-nums">
                          {new Intl.NumberFormat('uz-UZ').format(d.debt)} so'm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3.5 O'QITUVCHILAR BO'LIMI
    if (currentTab === 'teachers') {
      return (
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">O'qituvchilar Tarkibi ({teachers.length} nafar)</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Markazdagi barcha ustozlar, ularning yo'nalishi va biriktirilgan guruhlari
              </p>
            </div>
            <button
              onClick={loadTeachers}
              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer self-start sm:self-auto"
              title="Yangilash"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {loadingTeachers ? (
            <div className="py-12 text-center text-stone-400 text-xs">O'qituvchilar ro'yxati yuklanmoqda...</div>
          ) : teachers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
              O'qituvchilar topilmadi
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="p-4 border border-stone-200/80 rounded-lg hover:border-stone-300 transition-colors bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#1B4332]/10 text-[#1B4332] font-semibold text-xs flex items-center justify-center shrink-0">
                        {t.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-xs">{t.name}</h4>
                        <span className="text-[11px] text-stone-500 font-mono tabular-nums">{t.phone}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      t.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {t.status === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400">Mutaxassislik:</span>
                      <span className="font-medium text-stone-800">{t.subject || "Fan o'qituvchisi"}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400">Biriktirilgan guruhlar:</span>
                      <span className="font-medium text-stone-900 font-mono tabular-nums bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                        {t.groups?.length || 0} ta guruh
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 3.6 GURUHLAR BO'LIMI
    if (currentTab === 'groups') {
      return (
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Guruhlar va Kurslar Monitoringi</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Faol guruhlar, ularga biriktirilgan kurslar, ustozlar va dars jadvallari
              </p>
            </div>
            <button
              onClick={loadGroups}
              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer self-start sm:self-auto"
              title="Yangilash"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {loadingGroups ? (
            <div className="py-12 text-center text-stone-400 text-xs">Guruhlar yuklanmoqda...</div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
              Guruhlar topilmadi
            </div>
          ) : (
            <div className="border border-stone-200/80 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-2.5">Guruh Nomi</th>
                    <th className="px-4 py-2.5">Kurs & Narx</th>
                    <th className="px-4 py-2.5">O'qituvchi</th>
                    <th className="px-4 py-2.5">Dars Kunlari</th>
                    <th className="px-4 py-2.5">Vaqti</th>
                    <th className="px-4 py-2.5">Xona</th>
                    <th className="px-4 py-2.5 text-right">O'quvchilar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {groups.map(g => (
                    <tr key={g.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-stone-900">{g.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-stone-800">{g.courses?.name || '—'}</span>
                        <span className="block text-[10px] text-emerald-800 font-mono">
                          {new Intl.NumberFormat('uz-UZ').format(g.courses?.price || 0)} so'm
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-700 font-medium">{g.teachers?.name || '—'}</td>
                      <td className="px-4 py-3 text-stone-600">{g.days}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-stone-900 bg-stone-50 px-1 py-0.5 rounded">
                        {g.time}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-500">{g.room || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-stone-900 tabular-nums">
                        {g.students_count} nafar
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // 3.7 LIDLAR & QABUL BO'LIMI
    if (currentTab === 'leads') {
      const filteredLeads = leads.filter(l => leadStatusFilter === 'all' || l.status === leadStatusFilter);

      return (
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Qabul Arizalari va Lidlar ({leads.length} ta)</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Veb-sayt orqali kelib tushgan qiziqish arizalari va konversiya nazorati
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs text-stone-800 focus:outline-none"
              >
                <option value="all">Barcha holatlar</option>
                <option value="yangi">Yangi</option>
                <option value="boglandi">Bog'lanildi</option>
                <option value="yozildi">Yozildi (Muvaffaqiyatli)</option>
                <option value="bekor">Bekor qilindi</option>
              </select>
              <button
                onClick={loadLeads}
                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer"
                title="Yangilash"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {loadingLeads ? (
            <div className="py-12 text-center text-stone-400 text-xs">Lidlar yuklanmoqda...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
              Arizalar mavjud emas
            </div>
          ) : (
            <div className="border border-stone-200/80 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-2.5">№</th>
                    <th className="px-4 py-2.5">F.I.SH</th>
                    <th className="px-4 py-2.5">Telefon</th>
                    <th className="px-4 py-2.5">Qiziqqan kursi</th>
                    <th className="px-4 py-2.5">Holati</th>
                    <th className="px-4 py-2.5">Yuborilgan sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredLeads.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3 text-stone-400 font-mono tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{l.name}</td>
                      <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{l.phone}</td>
                      <td className="px-4 py-3 text-stone-700">{l.course_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          l.status === 'yozildi' ? 'bg-emerald-100 text-emerald-800' :
                          l.status === 'boglandi' ? 'bg-blue-100 text-blue-800' :
                          l.status === 'bekor' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-400 font-mono tabular-nums text-[11px]">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString('uz-UZ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] font-sans overflow-hidden text-stone-900">
      {/* Chap Boshqaruv Paneli (Sidebar) */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        badges={{
          admins: admins.length,
          debtors: dashboardData.monthlyDebtorsCount,
          leads: dashboardData.totalLeads
        }}
      />

      {/* Asosiy Ish Maydoni */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          pageTitle={getPageTitle()} 
          userEmail={session?.user?.email} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Bildirishnomalar */}
            {adminSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-md flex items-center gap-2 text-emerald-800 text-xs shadow-2xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" strokeWidth={1.5} />
                <span>{adminSuccess}</span>
              </div>
            )}

            {adminError && (
              <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-md flex items-center gap-2 text-rose-800 text-xs shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
                <span>{adminError}</span>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>

      {/* Yangi Admin Qo'shish Modali */}
      <Modal
        isOpen={isAddAdminOpen}
        onClose={() => {
          setIsAddAdminOpen(false);
          setAddAdminError('');
        }}
        title="Yangi Administrator Tayinlash"
        maxWidth="max-w-md"
      >
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">
          Admin akkaunti yaratilgach, u ushbu login va parol bilan CRM tizimiga (admin.sayt.uz) to'liq kira oladi.
        </p>

        {addAdminError && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" strokeWidth={1.5} />
            <span>{addAdminError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Admin Ism-Familiyasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Sardor Rahimov"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Email yoki Login <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="admin@markaz.uz yoki admin1"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Boshlang'ich Parol <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Kamida 6 ta belgi"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddAdminOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submittingAdmin}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submittingAdmin ? 'Yaratilmoqda...' : 'Adminni Tayinlash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adminni O'chirish Tasdiqlash Modali */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Adminni O'chirish"
        maxWidth="max-w-sm"
      >
        <p className="text-xs text-stone-600 leading-relaxed">
          Rostdan ham <strong className="text-stone-900 font-semibold">{deleteTarget?.name || deleteTarget?.email}</strong> adminini tizimdan o'chirmoqchimisiz?
        </p>

        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md border border-stone-200 cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleDeleteAdmin}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

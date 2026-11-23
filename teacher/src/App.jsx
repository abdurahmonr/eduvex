import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, 
  Layers, 
  Users, 
  Clock, 
  Calendar, 
  BookOpen, 
  LogOut, 
  ArrowRight,
  ClipboardCheck,
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Search,
  RefreshCw,
  Check,
  X,
  Phone,
  DoorOpen
} from 'lucide-react';
import { 
  supabase, 
  getSupabaseConfig, 
  saveSupabaseConfig,
  fetchTeacherGroupsWithStudents,
  fetchGroupAttendance,
  saveGroupAttendance
} from './lib/supabase';
import { isSessionExpired, touchSession, clearSession, setupSessionHeartbeat, saveCredentialToBrowser } from './lib/session';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';

const STORAGE_KEY = 'teacher_session_last_active';

export default function App() {
  const [currentTeacher, setCurrentTeacher] = useState(() => {
    const saved = localStorage.getItem('teacher_user');
    if (!saved) return null;

    if (isSessionExpired(STORAGE_KEY)) {
      localStorage.removeItem('teacher_user');
      clearSession(STORAGE_KEY);
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('teacher_user');
      return null;
    }
  });

  // Kirish formasi holatlari
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Supabase sozlamalar modali (login sahifasida ishlatish uchun)
  const [isLoginConfigOpen, setIsLoginConfigOpen] = useState(false);
  const config = getSupabaseConfig();
  const [cfgUrl, setCfgUrl] = useState(config.url);
  const [cfgKey, setCfgKey] = useState(config.key);

  // URL routing orqali boshqariladigan faol tab: 'dashboard' | 'groups' | 'students' | 'attendance' | 'schedule' | 'profile'
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const validTabs = ['dashboard', 'groups', 'students', 'attendance', 'schedule', 'profile'];
  const rawTab = location.pathname.replace(/^\//, '').split('/')[0];
  const currentTab = validTabs.includes(rawTab) ? rawTab : 'dashboard';

  const setCurrentTab = (tab) => {
    const target = tab.startsWith('/') ? tab : `/${tab}`;
    navigate(target);
  };

  // Guruhlar va O'quvchilar
  const [groupsList, setGroupsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupModal, setSelectedGroupModal] = useState(null);

  // O'quvchilar qidiruvi
  const [studentSearch, setStudentSearch] = useState('');

  // Davomat holatlari
  const [attendanceGroupId, setAttendanceGroupId] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'keldi' | 'kelmadi' | 'sababli' }
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

  // O'qituvchi guruhlari va o'quvchilarini yuklash
  const loadTeacherData = async () => {
    if (!currentTeacher?.id || !supabase) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // O'qituvchi statusini tekshirish
      const { data: freshTeacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', currentTeacher.id)
        .maybeSingle();

      if (freshTeacher && freshTeacher.status === 'inactive') {
        handleLogout();
        return;
      }

      if (freshTeacher) {
        setCurrentTeacher(freshTeacher);
        localStorage.setItem('teacher_user', JSON.stringify(freshTeacher));
      }

      const groups = await fetchTeacherGroupsWithStudents(currentTeacher.id);
      setGroupsList(groups);
      if (groups.length > 0 && !attendanceGroupId) {
        setAttendanceGroupId(groups[0].id);
      }
    } catch (err) {
      console.warn('Teacher data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [currentTeacher?.id]);

  // URL query orqali guruh tanlanganda (masalan: /attendance?groupId=...)
  useEffect(() => {
    const queryGroupId = searchParams.get('groupId');
    if (queryGroupId) {
      setAttendanceGroupId(queryGroupId);
    }
  }, [searchParams]);

  // Faollikni kuzatish (20 daqiqa)
  useEffect(() => {
    if (!currentTeacher?.id) return;
    const cleanup = setupSessionHeartbeat(STORAGE_KEY, () => {
      handleLogout();
    });
    return () => cleanup();
  }, [currentTeacher?.id]);

  // Davomat ma'lumotlarini yuklash
  const loadAttendanceForGroup = async (groupId, date) => {
    if (!groupId || !date || !supabase) return;
    setLoadingAttendance(true);
    setAttendanceSuccess('');
    setAttendanceError('');
    try {
      const records = await fetchGroupAttendance(groupId, date);
      const newMap = {};
      records.forEach(r => {
        newMap[r.student_id] = r.status;
      });

      // Agar o'quvchining davomati hali belgilanmagan bo'lsa, sukut bo'yicha 'keldi'
      const grp = groupsList.find(g => g.id === Number(groupId));
      if (grp) {
        grp.students.forEach(st => {
          if (!newMap[st.id]) {
            newMap[st.id] = 'keldi';
          }
        });
      }

      setAttendanceMap(newMap);
    } catch (err) {
      setAttendanceError("Davomatni yuklashda xatolik: " + err.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Guruh yoki sana o'zgarganda davomatni yuklash
  useEffect(() => {
    if (currentTab === 'attendance' && attendanceGroupId && attendanceDate) {
      loadAttendanceForGroup(attendanceGroupId, attendanceDate);
    }
  }, [currentTab, attendanceGroupId, attendanceDate, groupsList]);

  // Davomat holatini o'zgartirish
  const handleSetStudentStatus = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Barcha o'quvchilarga bitta holat berish (masalan: barchasi keldi)
  const handleSetAllStatus = (status) => {
    const grp = groupsList.find(g => g.id === Number(attendanceGroupId));
    if (!grp) return;
    const newMap = { ...attendanceMap };
    grp.students.forEach(st => {
      newMap[st.id] = status;
    });
    setAttendanceMap(newMap);
  };

  // Davomatni bazaga saqlash
  const handleSaveAttendance = async () => {
    if (!attendanceGroupId || !attendanceDate || !supabase) return;
    const grp = groupsList.find(g => g.id === Number(attendanceGroupId));
    if (!grp || grp.students.length === 0) {
      setAttendanceError("Ushbu guruhda o'quvchilar mavjud emas");
      return;
    }

    setSavingAttendance(true);
    setAttendanceSuccess('');
    setAttendanceError('');

    try {
      const records = grp.students.map(st => ({
        student_id: st.id,
        group_id: Number(attendanceGroupId),
        date: attendanceDate,
        status: attendanceMap[st.id] || 'keldi'
      }));

      await saveGroupAttendance(records);
      setAttendanceSuccess(`${grp.name} guruhi uchun ${attendanceDate} sanasi davomati saqlandi!`);
      setTimeout(() => setAttendanceSuccess(''), 4000);
    } catch (err) {
      setAttendanceError("Davomatni saqlashda xatolik: " + err.message);
    } finally {
      setSavingAttendance(false);
    }
  };

  // Kirish amali
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase ulanishi topilmadi! Pastdagi "Supabase sozlash" orqali sozlang.');
      }

      const query = loginIdentifier.trim().toLowerCase();
      const pass = password.trim();

      if (!query || !pass) {
        throw new Error('Login va parolni kiriting');
      }

      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*');

      if (error) {
        throw new Error('Supabase bilan bog\'lanishda xatolik: ' + error.message);
      }

      if (!teachers || teachers.length === 0) {
        throw new Error("Tizimda o'qituvchilar topilmadi. Avval admin panelidan o'qituvchi qo'shing.");
      }

      const cleanQueryDigits = query.replace(/[^\d]/g, '');

      const matched = teachers.find(t => {
        const tLogin = (t.login || '').trim().toLowerCase();
        const tPhone = (t.phone || '').trim().toLowerCase();
        const tPhoneDigits = tPhone.replace(/[^\d]/g, '');

        const loginMatches = (tLogin && tLogin === query) ||
                             (tPhone && tPhone === query) ||
                             (cleanQueryDigits.length > 5 && tPhoneDigits.includes(cleanQueryDigits));

        return loginMatches && t.password === pass && t.status !== 'inactive';
      });

      if (!matched) {
        throw new Error("Login yoki parol noto'g'ri! Iltimos, ma'lumotlarni tekshirib kiring.");
      }

      localStorage.setItem('teacher_user', JSON.stringify(matched));
      touchSession(STORAGE_KEY);
      saveCredentialToBrowser(loginIdentifier, password, matched.name || 'Ustoz');
      setCurrentTeacher(matched);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_user');
    clearSession(STORAGE_KEY);
    setCurrentTeacher(null);
    setSelectedGroupModal(null);
    setGroupsList([]);
    navigate('/login');
  };

  // 1. KIRISH SAHIFASI
  if (!currentTeacher) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans text-stone-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1B4332] text-white mb-3 shadow-xs">
              <GraduationCap className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg font-semibold text-stone-900 tracking-tight">Ustoz Kabineti</h1>
            <p className="text-xs text-stone-500 mt-0.5 font-mono">ustoz.sayt.uz</p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200/90 p-6 shadow-xs">
            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200/60 text-rose-800 rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Telefon raqam yoki Login
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    placeholder="+998901234567 yoki ustoz1"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2 px-4 bg-[#1B4332] hover:bg-[#143326] active:bg-[#0f271d] text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loginLoading ? 'Tekshirilmoqda...' : 'Kabinetga kirish'}</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <button
                type="button"
                onClick={() => setIsLoginConfigOpen(true)}
                className="text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Key className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                <span>Supabase sozlash</span>
              </button>
              <span className="text-stone-400">Ustoz Portali</span>
            </div>
          </div>
        </div>

        {/* Login uchun Supabase modal */}
        <Modal
          isOpen={isLoginConfigOpen}
          onClose={() => setIsLoginConfigOpen(false)}
          title="Supabase API sozlamalari"
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

  // Hisoblangan umumiy ma'lumotlar
  const totalStudents = groupsList.reduce((acc, g) => acc + (g.students?.length || 0), 0);

  // Barcha o'quvchilar yagona ro'yxati
  const allStudents = [];
  groupsList.forEach(g => {
    g.students.forEach(st => {
      allStudents.push({ ...st, group_name: g.name, course_name: g.course_name });
    });
  });

  // Bugungi darslar
  const todayNameMap = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const todayDayName = todayNameMap[new Date().getDay()];
  const todayGroups = groupsList.filter(g => {
    const daysLower = (g.days || '').toLowerCase();
    if (todayDayName === 'Dushanba' && (daysLower.includes('dush') || daysLower.includes('toq'))) return true;
    if (todayDayName === 'Chorshanba' && (daysLower.includes('chor') || daysLower.includes('toq'))) return true;
    if (todayDayName === 'Juma' && (daysLower.includes('juma') || daysLower.includes('toq'))) return true;
    if (todayDayName === 'Seshanba' && (daysLower.includes('sesh') || daysLower.includes('juft'))) return true;
    if (todayDayName === 'Payshanba' && (daysLower.includes('pay') || daysLower.includes('juft'))) return true;
    if (todayDayName === 'Shanba' && (daysLower.includes('shan') || daysLower.includes('juft'))) return true;
    return daysLower.includes(todayDayName.toLowerCase());
  });

  // Sahifa sarlavhalari
  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return "Ustoz Dashboard & Asosiy ko'rsatkichlar";
      case 'groups': return "Mening biriktirilgan guruhlarim";
      case 'students': return "Mening barcha o'quvchilarim";
      case 'attendance': return "Davomat jurnali va nazorat";
      case 'schedule': return "Haftalik dars jadvali";
      case 'profile': return "O'qituvchi shaxsiy profili";
      default: return "Ustoz kabineti";
    }
  };

  // Kontent render qilish
  const renderContent = () => {
    // 1. DASHBOARD
    if (currentTab === 'dashboard') {
      return (
        <div className="space-y-5">
          {/* Xush kelibsiz paneli */}
          <div className="bg-white border border-stone-200/90 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-stone-900">
                Xush kelibsiz, {currentTeacher.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Bugun: <strong className="text-stone-800">{todayDayName}</strong>. Sizning faol guruhlaringiz va o'quvchilaringiz boshqaruvi.
              </p>
            </div>
            <button
              onClick={() => {
                if (groupsList.length > 0) {
                  setAttendanceGroupId(groupsList[0].id);
                  setCurrentTab('attendance');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Bugungi Davomatni Qilish</span>
            </button>
          </div>

          {/* 3 ta Statistika kartochkasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setCurrentTab('groups')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-stone-500">Mening guruhlarim</p>
                <Layers className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-stone-900 tabular-nums font-mono">{groupsList.length} ta</p>
              <p className="text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>Biriktirilgan guruhlar</span>
                <span className="font-medium text-stone-700">Ko'rish &rarr;</span>
              </p>
            </div>

            <div 
              onClick={() => setCurrentTab('students')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-stone-500">Jami o'quvchilarim</p>
                <Users className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-stone-900 tabular-nums font-mono">{totalStudents} nafar</p>
              <p className="text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>Faol talabalar</span>
                <span className="font-medium text-stone-700">Ro'yxat &rarr;</span>
              </p>
            </div>

            <div 
              onClick={() => setCurrentTab('profile')}
              className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-400 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-stone-500">Mutaxassislik yo'nalishi</p>
                <BookOpen className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
              </div>
              <p className="text-base font-semibold text-stone-900 mt-1">{currentTeacher.subject || "Fan o'qituvchisi"}</p>
              <p className="text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>Shaxsiy profil</span>
                <span className="font-medium text-stone-700">Ma'lumotlar &rarr;</span>
              </p>
            </div>
          </div>

          {/* Bugungi darslar bloki */}
          <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-800" strokeWidth={1.5} />
                  Bugungi darslar ({todayDayName})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Bugun darsi rejalashtirilgan guruhlar jadvali
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('schedule')}
                className="text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                To'liq dars jadvali &rarr;
              </button>
            </div>

            {todayGroups.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
                Bugun siz uchun darslar belgilanmagan yoki dam olish kuni.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayGroups.map(g => (
                  <div key={g.id} className="p-4 border border-stone-200/80 rounded-lg hover:border-stone-300 transition-colors bg-stone-50/40 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {g.course_name}
                      </span>
                      <h4 className="text-sm font-semibold text-stone-900 mt-1.5">{g.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 font-mono">
                        <span>⏰ {g.time}</span>
                        <span>🚪 Xona: {g.room}</span>
                        <span>👥 {g.students.length} o'quvchi</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAttendanceGroupId(g.id);
                        setCurrentTab('attendance');
                      }}
                      className="px-3 py-1.5 bg-[#1B4332] text-white text-xs font-medium rounded-md shadow-xs hover:bg-[#143326] cursor-pointer shrink-0"
                    >
                      Davomat &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. MENING GURUHLARIM TABI
    if (currentTab === 'groups') {
      return (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Mening Guruhlarim ({groupsList.length} ta)</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Sizga biriktirilgan faol guruhlar, dars vaqtlari va xonalar
                </p>
              </div>
              <button
                onClick={loadTeacherData}
                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer self-start sm:self-auto"
                title="Yangilash"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-stone-400 text-xs">Guruhlar yuklanmoqda...</div>
            ) : groupsList.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200">
                Sizga hozircha guruhlar biriktirilmagan
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupsList.map(group => (
                  <div
                    key={group.id}
                    className="bg-white border border-stone-200/90 rounded-lg p-5 hover:border-stone-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="text-[11px] font-medium text-stone-700 bg-stone-100 border border-stone-200/80 px-2 py-0.5 rounded">
                            {group.course_name}
                          </span>
                          <h4 className="text-base font-semibold text-stone-900 mt-2">{group.name}</h4>
                        </div>
                        <span className="px-2 py-0.5 bg-stone-50 text-stone-700 text-xs font-medium rounded border border-stone-200 tabular-nums flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                          {group.students.length} o'quvchi
                        </span>
                      </div>

                      <div className="space-y-1.5 py-3 border-y border-stone-100 text-xs text-stone-600">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Dars kunlari:
                          </span>
                          <span className="font-medium text-stone-800">{group.days}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Dars vaqti:
                          </span>
                          <span className="font-medium text-stone-900 font-mono tabular-nums bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                            {group.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Xona:
                          </span>
                          <span className="font-medium text-stone-800">{group.room}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between gap-2.5">
                      <button
                        onClick={() => setSelectedGroupModal(group)}
                        className="flex-1 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs rounded-md transition-colors cursor-pointer text-center"
                      >
                        O'quvchilar ({group.students.length})
                      </button>

                      <button
                        onClick={() => {
                          setAttendanceGroupId(group.id);
                          setCurrentTab('attendance');
                        }}
                        className="py-1.5 px-3 bg-[#1B4332] hover:bg-[#143326] text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Davomat qilish</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. O'QUVCHILARIM TABI
    if (currentTab === 'students') {
      const filteredStudents = allStudents.filter(st => 
        st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.phone.includes(studentSearch) ||
        st.group_name.toLowerCase().includes(studentSearch.toLowerCase())
      );

      return (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Mening Barcha O'quvchilarim ({allStudents.length} nafar)</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Barcha biriktirilgan guruhlardagi o'quvchilar ro'yxati va telefon kontaktlari
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Ism, telefon yoki guruh bo'yicha..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] text-stone-900"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 mt-4">
                O'quvchilar topilmadi
              </div>
            ) : (
              <div className="mt-4 border border-stone-200/80 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                    <tr>
                      <th className="px-4 py-2.5">№</th>
                      <th className="px-4 py-2.5">O'quvchi</th>
                      <th className="px-4 py-2.5">Guruh / Kurs</th>
                      <th className="px-4 py-2.5">Shaxsiy Tel</th>
                      <th className="px-4 py-2.5">Ota-ona Tel</th>
                      <th className="px-4 py-2.5 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredStudents.map((st, i) => (
                      <tr key={`${st.id}-${st.group_id}-${i}`} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 text-stone-400 font-mono tabular-nums">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-stone-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center justify-center border border-stone-200/60">
                            {st.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{st.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-stone-800">{st.group_name}</span>
                          <span className="block text-[10px] text-stone-400">{st.course_name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{st.phone}</td>
                        <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{st.parent_phone || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setAttendanceGroupId(st.group_id);
                              setCurrentTab('attendance');
                            }}
                            className="text-xs text-[#1B4332] hover:underline font-medium cursor-pointer"
                          >
                            Davomatga o'tish
                          </button>
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

    // 4. DAVOMAT JURNALI TABI
    if (currentTab === 'attendance') {
      const activeGroup = groupsList.find(g => g.id === Number(attendanceGroupId));

      // Statistikani hisoblash
      let presentCount = 0;
      let absentCount = 0;
      let excusedCount = 0;
      if (activeGroup) {
        activeGroup.students.forEach(st => {
          const s = attendanceMap[st.id] || 'keldi';
          if (s === 'keldi') presentCount++;
          else if (s === 'kelmadi') absentCount++;
          else if (s === 'sababli') excusedCount++;
        });
      }

      return (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Elektron Davomat Jurnali</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Dars sanasini va guruhni tanlab, o'quvchilar qatnashuvini belgilang va saqlang
                </p>
              </div>

              {/* Guruh va Sana tanlash */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div>
                  <select
                    value={attendanceGroupId || ''}
                    onChange={(e) => setAttendanceGroupId(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-medium text-stone-900 focus:outline-none focus:border-[#1B4332]"
                  >
                    {groupsList.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.course_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <button
                  onClick={() => loadAttendanceForGroup(attendanceGroupId, attendanceDate)}
                  className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200 cursor-pointer"
                  title="Yangilash"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAttendance ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Bildirishnomalar */}
            {attendanceSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{attendanceSuccess}</span>
              </div>
            )}

            {attendanceError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{attendanceError}</span>
              </div>
            )}

            {/* Statistik ko'rsatkichlar & Tezkor amallar */}
            {activeGroup && (
              <div className="mt-4 p-3 bg-stone-50 border border-stone-200/70 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-stone-500">
                    Jami: <strong className="text-stone-900 font-mono">{activeGroup.students.length}</strong>
                  </span>
                  <span className="text-emerald-700">
                    Kelgan: <strong className="font-mono">{presentCount}</strong>
                  </span>
                  <span className="text-rose-700">
                    Kelmagan: <strong className="font-mono">{absentCount}</strong>
                  </span>
                  <span className="text-amber-700">
                    Sababli: <strong className="font-mono">{excusedCount}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetAllStatus('keldi')}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded text-[11px] font-medium text-stone-700 cursor-pointer"
                  >
                    Barchasi Keldi
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="px-3.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white rounded text-xs font-medium shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingAttendance ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* O'quvchilar ro'yxati va davomat tugmalari */}
            {!activeGroup || activeGroup.students.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 mt-4">
                Tanlangan guruhda o'quvchilar mavjud emas
              </div>
            ) : (
              <div className="mt-4 border border-stone-200/80 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                    <tr>
                      <th className="px-4 py-2.5">№</th>
                      <th className="px-4 py-2.5">O'quvchi</th>
                      <th className="px-4 py-2.5">Telefon</th>
                      <th className="px-4 py-2.5 text-center">Davomat Holati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {activeGroup.students.map((st, i) => {
                      const status = attendanceMap[st.id] || 'keldi';
                      return (
                        <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-4 py-3 text-stone-400 font-mono tabular-nums">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-stone-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center justify-center border border-stone-200/60">
                              {st.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{st.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">{st.phone}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSetStudentStatus(st.id, 'keldi')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                                  status === 'keldi'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                Keldi
                              </button>
                              <button
                                onClick={() => handleSetStudentStatus(st.id, 'kelmadi')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                                  status === 'kelmadi'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                Kelmadi
                              </button>
                              <button
                                onClick={() => handleSetStudentStatus(st.id, 'sababli')}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                                  status === 'sababli'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                Sababli
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 5. DARS JADVALI TABI
    if (currentTab === 'schedule') {
      const oddDays = groupsList.filter(g => {
        const d = (g.days || '').toLowerCase();
        return d.includes('toq') || d.includes('dush') || d.includes('chor') || d.includes('juma');
      });

      const evenDays = groupsList.filter(g => {
        const d = (g.days || '').toLowerCase();
        return d.includes('juft') || d.includes('sesh') || d.includes('pay') || d.includes('shan');
      });

      return (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-900">Haftalik Dars Jadvali</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Dars kunlari bo'yicha guruhlar taqvimi va dars soatlari
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Toq kunlar */}
              <div className="border border-stone-200/90 rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Dushanba • Chorshanba • Juma (Toq kunlar)
                  </h4>
                  <span className="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded font-mono">
                    {oddDays.length} ta dars
                  </span>
                </div>

                <div className="p-3 divide-y divide-stone-100">
                  {oddDays.length === 0 ? (
                    <p className="py-6 text-center text-xs text-stone-400">Ushbu kunlarda darslar yo'q</p>
                  ) : (
                    oddDays.map(g => (
                      <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-stone-900">{g.name}</span>
                          <span className="block text-[11px] text-stone-500">{g.course_name} • Xona: {g.room}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                            {g.time}
                          </span>
                          <span className="block text-[10px] text-stone-400 mt-0.5">{g.students.length} o'quvchi</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Juft kunlar */}
              <div className="border border-stone-200/90 rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                    Seshanba • Payshanba • Shanba (Juft kunlar)
                  </h4>
                  <span className="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded font-mono">
                    {evenDays.length} ta dars
                  </span>
                </div>

                <div className="p-3 divide-y divide-stone-100">
                  {evenDays.length === 0 ? (
                    <p className="py-6 text-center text-xs text-stone-400">Ushbu kunlarda darslar yo'q</p>
                  ) : (
                    evenDays.map(g => (
                      <div key={g.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-stone-900">{g.name}</span>
                          <span className="block text-[11px] text-stone-500">{g.course_name} • Xona: {g.room}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                            {g.time}
                          </span>
                          <span className="block text-[10px] text-stone-400 mt-0.5">{g.students.length} o'quvchi</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. MENING PROFILIM TABI
    if (currentTab === 'profile') {
      return (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-white border border-stone-200/90 rounded-lg p-5 space-y-4">
            <div className="pb-3 border-b border-stone-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-semibold text-base shadow-xs">
                {currentTeacher.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">{currentTeacher.name}</h3>
                <p className="text-xs text-stone-500">{currentTeacher.subject || "Fan o'qituvchisi"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-md border border-stone-200/60">
                <span className="text-stone-400 block mb-1">Telefon raqam (Login)</span>
                <span className="font-medium font-mono text-stone-900 tabular-nums">{currentTeacher.phone}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-md border border-stone-200/60">
                <span className="text-stone-400 block mb-1">Mutaxassislik yo'nalishi</span>
                <span className="font-medium text-stone-900">{currentTeacher.subject || "Fan o'qituvchisi"}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-md border border-stone-200/60">
                <span className="text-stone-400 block mb-1">Biriktirilgan guruhlar</span>
                <span className="font-semibold text-stone-900 font-mono">{groupsList.length} ta guruh</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-md border border-stone-200/60">
                <span className="text-stone-400 block mb-1">Hisob holati</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Faol o'qituvchi
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">Akkaunt xavfsizligi va sessiya</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-md border border-rose-200 transition-colors cursor-pointer"
              >
                Chiqish
              </button>
            </div>
          </div>
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
          groups: groupsList.length,
          students: totalStudents
        }}
      />

      {/* Asosiy Ish Maydoni */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          pageTitle={getPageTitle()} 
          teacher={currentTeacher} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Guruh O'quvchilari Ro'yxati Modali */}
      <Modal
        isOpen={Boolean(selectedGroupModal)}
        onClose={() => setSelectedGroupModal(null)}
        title={selectedGroupModal ? `${selectedGroupModal.name} o'quvchilari` : "Guruh o'quvchilari"}
        maxWidth="max-w-lg"
      >
        {selectedGroupModal && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
              <span>Kurs: <strong className="text-stone-800">{selectedGroupModal.course_name}</strong></span>
              <span>Jami: <strong className="text-stone-800 font-mono">{selectedGroupModal.students.length} nafar</strong></span>
            </div>

            {selectedGroupModal.students.length === 0 ? (
              <p className="text-xs text-center text-stone-400 py-6">Ushbu guruhda hali o'quvchilar yo'q</p>
            ) : (
              <div className="border border-stone-200/80 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                    <tr>
                      <th className="px-3.5 py-2">№</th>
                      <th className="px-3.5 py-2">O'quvchi</th>
                      <th className="px-3.5 py-2">Telefon</th>
                      <th className="px-3.5 py-2">Ota-ona</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {selectedGroupModal.students.map((st, i) => (
                      <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-3.5 py-2.5 text-stone-400 font-mono tabular-nums">{i + 1}</td>
                        <td className="px-3.5 py-2.5 font-medium text-stone-900">{st.name}</td>
                        <td className="px-3.5 py-2.5 font-mono text-stone-600 tabular-nums">{st.phone}</td>
                        <td className="px-3.5 py-2.5 font-mono text-stone-400 tabular-nums">{st.parent_phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const gId = selectedGroupModal.id;
                  setSelectedGroupModal(null);
                  setAttendanceGroupId(gId);
                  setCurrentTab('attendance');
                }}
                className="px-3 py-1.5 bg-[#1B4332] text-white text-xs font-medium rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Ushbu guruh davomatiga o'tish</span>
              </button>
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="px-3 py-1.5 border border-stone-200 text-stone-700 text-xs font-medium rounded-md hover:bg-stone-50 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

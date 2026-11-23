import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sizning-loyihangiz'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseConfig() {
  const url = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(url && key && !url.includes('sizning-loyihangiz') && !url.includes('your-project'));
  return { url, key, isConfigured };
}

export function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem('supabase_url', url.trim());
  if (key) localStorage.setItem('supabase_anon_key', key.trim());
  window.location.reload();
}

/**
 * Yangi admin yaratish:
 * Direktorning o'zi sessiyadan chiqib ketmasligi uchun
 * persistSession: false qilingan vaqtinchalik Supabase client ishlatiladi!
 */
export async function createAdminAccount({ name, email, password }) {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !supabase) {
    throw new Error('Supabase URL va Anon Key sozlanmagan!');
  }

  // Vaqtinchalik sessiyasiz mijoz
  const tempClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email: email.trim(),
    password: password.trim(),
    options: {
      data: { name: name.trim() }
    }
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Foydalanuvchi yaratilmadi (Email tasdiqlash talab qilinishi mumkin)');
  }

  // 1. profiles jadvaliga role: 'admin' qilib yozish
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      email: email.trim(),
      name: name.trim(),
      role: 'admin',
      login: email.includes('@') ? email.split('@')[0] : email.trim(),
      password: password.trim(),
      status: 'active'
    });
  } catch (pe) {
    console.warn('Profiles upsert warning:', pe);
  }

  // 2. admins jadvaliga to'liq ma'lumotlar bilan yozish
  const login = email.includes('@') ? email.split('@')[0] : email.trim();
  const { error: adminTableError } = await supabase.from('admins').insert({
    name: name.trim(),
    login: login,
    email: email.trim(),
    password: password.trim(),
    role: 'admin',
    status: 'active'
  });

  if (adminTableError) {
    console.warn('Admins table insert warning:', adminTableError);
  }

  return { id: userId, email: email.trim(), name: name.trim(), login, role: 'admin' };
}

/**
 * Mavjud adminlar ro'yxatini olish
 */
export async function fetchAdmins() {
  if (!supabase) return [];

  // Avval admins jadvalidan qidirish
  try {
    const { data: adminsData } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminsData && adminsData.length > 0) {
      return adminsData;
    }
  } catch (e) {
    console.warn('Admins table fetch fallback:', e);
  }

  // Agar admins jadvali bo'sh bo'lsa, profiles jadvalidan olish
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Adminlarni olishda xatolik:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Adminni o'chirish
 */
export async function removeAdmin(target) {
  if (!supabase) throw new Error('Supabase sozlanmagan');

  const targetId = typeof target === 'object' ? target.id : target;
  const targetEmail = typeof target === 'object' ? target.email : null;

  // 1. admins jadvalidan o'chirish
  try {
    if (typeof targetId === 'number' || !isNaN(Number(targetId))) {
      await supabase.from('admins').delete().eq('id', Number(targetId));
    }
    if (targetEmail) {
      await supabase.from('admins').delete().eq('email', targetEmail);
    }
  } catch (e) {
    console.warn('Delete from admins table warning:', e);
  }

  // 2. profiles va auth.users dan o'chirish
  try {
    await supabase.from('profiles').delete().eq('id', targetId);
    try {
      await supabase.rpc('delete_user_by_admin', { user_id: targetId });
    } catch {
      await supabase.rpc('delete_user_by_admin', { target_user_id: targetId });
    }
  } catch (err) {
    console.warn('RPC delete user warning:', err);
  }

  return { success: true };
}

/**
 * Direktor Dashboard Statistikasi (Joriy oy tushumi, qarzdorlar, jami o'quvchilar, lidlar va oxirgi 10 ta to'lov)
 */
export async function fetchDirectorDashboardStats() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!supabase) {
    return {
      monthlyRevenue: 0,
      monthlyDebtorsCount: 0,
      totalStudents: 0,
      totalGroups: 0,
      totalLeads: 0,
      convertedLeads: 0,
      recentPayments: [],
      currentMonth
    };
  }

  try {
    const [payRes, stRes, grRes, ldRes, recentPayRes, enrRes] = await Promise.all([
      supabase.from('payments').select('student_id, amount, month, date').eq('month', currentMonth),
      supabase.from('students').select('id', { count: 'exact' }),
      supabase.from('groups').select('id', { count: 'exact' }),
      supabase.from('leads').select('id, status'),
      supabase.from('payments').select(`
        id, amount, month, date, payment_method, created_at,
        students (id, name, phone)
      `).order('id', { ascending: false }).limit(10),
      supabase.from('enrollments').select(`
        id, student_id,
        groups (id, courses(price))
      `)
    ]);

    // 1. Joriy oydagi jami tushum
    const monthlyRevenue = (payRes.data || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);

    // 2. Joriy oydagi qarzdorlar soni
    const expectedMap = new Map();
    (enrRes.data || []).forEach(e => {
      const stId = e.student_id;
      const price = Number(e.groups?.courses?.price || 0);
      expectedMap.set(stId, (expectedMap.get(stId) || 0) + price);
    });

    const paidMap = new Map();
    (payRes.data || []).forEach(p => {
      const cur = paidMap.get(p.student_id) || 0;
      paidMap.set(p.student_id, cur + Number(p.amount || 0));
    });

    let monthlyDebtorsCount = 0;
    expectedMap.forEach((expected, stId) => {
      const paid = paidMap.get(stId) || 0;
      if (expected - paid > 0) {
        monthlyDebtorsCount++;
      }
    });

    // 3. Jami o'quvchilar va guruhlar soni
    const totalStudents = stRes.count ?? (stRes.data?.length || 0);
    const totalGroups = grRes.count ?? (grRes.data?.length || 0);

    // 4. Jami lidlar va yozildi bo'lganlar
    const allLeads = ldRes.data || [];
    const totalLeads = allLeads.length;
    const convertedLeads = allLeads.filter(l => l.status === 'yozildi').length;

    // 5. Oxirgi 10 ta to'lov
    const recentPayments = (recentPayRes.data || []).map(p => ({
      id: p.id,
      student_name: p.students?.name || 'Noma\'lum o\'quvchi',
      student_phone: p.students?.phone || '',
      amount: Number(p.amount || 0),
      month: p.month,
      date: p.date,
      payment_method: p.payment_method || 'naqd',
      notes: p.notes,
      created_at: p.created_at
    }));

    return {
      monthlyRevenue,
      monthlyDebtorsCount,
      totalStudents,
      totalGroups,
      totalLeads,
      convertedLeads,
      recentPayments,
      currentMonth
    };
  } catch (err) {
    console.warn('fetchDirectorDashboardStats error:', err);
    throw err;
  }
}

/**
 * 3. Moliya va To'lovlar ro'yxatini olish
 */
export async function fetchDirectorFinances() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, month, date, payment_method, notes, created_at,
        students (id, name, phone)
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      student_name: p.students?.name || 'Noma\'lum',
      student_phone: p.students?.phone || '',
      amount: Number(p.amount || 0),
      month: p.month,
      date: p.date,
      payment_method: p.payment_method || 'naqd',
      notes: p.notes,
      created_at: p.created_at
    }));
  } catch (err) {
    console.error('fetchDirectorFinances error:', err);
    throw err;
  }
}

/**
 * 4. Qarzdorlar tahlili
 */
export async function fetchDirectorDebtors() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (!supabase) return { currentMonth, debtors: [], totalExpected: 0, totalPaid: 0, totalDebt: 0 };

  try {
    const [enrRes, payRes] = await Promise.all([
      supabase.from('enrollments').select(`
        id, student_id,
        students (id, name, phone, parent_phone),
        groups (id, name, courses(name, price))
      `),
      supabase.from('payments').select('student_id, amount, month').eq('month', currentMonth)
    ]);

    const paidMap = new Map();
    (payRes.data || []).forEach(p => {
      paidMap.set(p.student_id, (paidMap.get(p.student_id) || 0) + Number(p.amount || 0));
    });

    const debtors = [];
    let totalExpected = 0;
    let totalPaid = 0;

    (enrRes.data || []).forEach(e => {
      if (!e.students) return;
      const price = Number(e.groups?.courses?.price || 0);
      const paid = paidMap.get(e.student_id) || 0;
      const debt = price - paid;
      totalExpected += price;
      totalPaid += paid;

      if (debt > 0) {
        debtors.push({
          id: e.id,
          student_id: e.student_id,
          name: e.students.name,
          phone: e.students.phone,
          parent_phone: e.students.parent_phone,
          group_name: e.groups?.name || '—',
          course_name: e.groups?.courses?.name || '—',
          price,
          paid,
          debt
        });
      }
    });

    debtors.sort((a, b) => b.debt - a.debt);

    return {
      currentMonth,
      debtors,
      totalExpected,
      totalPaid,
      totalDebt: Math.max(0, totalExpected - totalPaid)
    };
  } catch (err) {
    console.error('fetchDirectorDebtors error:', err);
    throw err;
  }
}

/**
 * 5. O'qituvchilar monitoringi
 */
export async function fetchDirectorTeachers() {
  if (!supabase) return [];
  try {
    const [tRes, gRes] = await Promise.all([
      supabase.from('teachers').select('*').order('id', { ascending: false }),
      supabase.from('groups').select('id, name, teacher_id')
    ]);
    if (tRes.error) throw tRes.error;
    const teachers = tRes.data || [];
    const groups = gRes.data || [];

    return teachers.map(t => ({
      ...t,
      groups: groups.filter(g => g.teacher_id === t.id)
    }));
  } catch (err) {
    console.error('fetchDirectorTeachers error:', err);
    throw err;
  }
}

/**
 * 6. Guruhlar va Kurslar
 */
export async function fetchDirectorGroups() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id, name, days, time, room, status, created_at,
        courses (id, name, price),
        teachers (id, name, phone),
        enrollments (id)
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(g => ({
      ...g,
      students_count: g.enrollments?.length || 0
    }));
  } catch (err) {
    console.error('fetchDirectorGroups error:', err);
    throw err;
  }
}

/**
 * 7. Lidlar va Qabul
 */
export async function fetchDirectorLeads() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchDirectorLeads error:', err);
    throw err;
  }
}


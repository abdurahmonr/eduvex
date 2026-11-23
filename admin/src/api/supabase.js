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

function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase sozlanmagan! Iltimos, o\'ng yuqoridagi "Supabase: Sozlash" tugmasi orqali URL va Anon Keyni kiriting.');
  }
}

// ==========================================
// TO'LIQ REAL SUPABASE API (MOCKSIZ)
// ==========================================
export const api = {
  getConfig: getSupabaseConfig,
  saveConfig: saveSupabaseConfig,

  // 1. Auth (Supabase Auth va Admins jadvali)
  login: async (emailOrUsername, password) => {
    checkSupabase();
    const query = emailOrUsername.trim();
    const email = query.includes('@') ? query : `${query}@markaz.uz`;

    // 1. Avval Supabase Auth orqali kirish
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim()
    });

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userObj = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || 'Administrator',
        username: profile?.name || data.user.user_metadata?.name || 'Administrator',
        role: profile?.role || 'admin'
      };

      localStorage.setItem('crm_user', JSON.stringify(userObj));
      return { user: userObj, session: data.session, token: data.session?.access_token || 'admin_token' };
    }

    // 2. Agar Supabase Auth bo'lmasa, to'g'ridan-to'g'ri admins jadvalidan tekshirish
    try {
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('*')
        .or(`email.eq.${query},login.eq.${query}`)
        .eq('password', password.trim())
        .maybeSingle();

      if (adminRecord) {
        const userObj = {
          id: adminRecord.id,
          email: adminRecord.email,
          name: adminRecord.name,
          username: adminRecord.name,
          role: 'admin'
        };
        localStorage.setItem('crm_user', JSON.stringify(userObj));
        return { user: userObj, token: `admin_${adminRecord.id}` };
      }
    } catch (dbErr) {
      console.warn('Admins table fallback query:', dbErr);
    }

    throw new Error(`Kirishda xatolik: Login yoki parol noto'g'ri (${error?.message || 'Foydalanuvchi topilmadi'})`);
  },

  getMe: async () => {
    const saved = localStorage.getItem('crm_user');
    if (!saved) return null;
    let userObj = null;
    try {
      userObj = JSON.parse(saved);
    } catch {
      return null;
    }

    if (!supabase) {
      return userObj;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return userObj;
      }
    } catch (e) {
      // Ignore
    }

    // Admins jadvalidan tekshirish
    try {
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userObj.id)
        .maybeSingle();

      if (adminRecord && adminRecord.status !== 'inactive') {
        const updated = {
          ...userObj,
          name: adminRecord.name,
          username: adminRecord.name,
          email: adminRecord.email
        };
        localStorage.setItem('crm_user', JSON.stringify(updated));
        return updated;
      }
    } catch (e) {
      return userObj;
    }

    return userObj;
  },

  logout: async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {}
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_token');
    localStorage.removeItem('admin_session_last_active');
  },

  // 2. Teachers (O'qituvchilar)
  getTeachers: async () => {
    checkSupabase();
    const { data, error } = await supabase
      .from('teachers')
      .select('*, groups(id)')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(t => ({
      ...t,
      groups_count: t.groups ? t.groups.length : 0
    }));
  },

  createTeacher: async ({ name, phone, subject, login, password }) => {
    checkSupabase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanSubject = (subject || '').trim() || null;
    const cleanLogin = (login || '').trim().toLowerCase() || null;
    const cleanPassword = (password || '').trim() || null;

    const payload = {
      name: cleanName,
      phone: cleanPhone,
      subject: cleanSubject,
      login: cleanLogin,
      password: cleanPassword,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('teachers')
      .insert([payload])
      .select('*, groups(id)')
      .single();

    if (error) {
      if (error.code === '42703' || (error.message && (error.message.includes('login') || error.message.includes('password')))) {
        throw new Error(
          "Supabase 'teachers' jadvalida login/password ustunlari mavjud emas. Iltimos, Supabase SQL Editor'da ushbu kodni ishga tushiring:\n" +
          "ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS login TEXT, ADD COLUMN IF NOT EXISTS password TEXT, ADD COLUMN IF NOT EXISTS subject TEXT;"
        );
      }
      throw new Error(error.message);
    }
    return { ...data, groups_count: 0 };
  },

  updateTeacher: async (id, { name, phone, subject, login, password }) => {
    checkSupabase();
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      subject: (subject || '').trim() || null,
      status: 'active'
    };
    if (login !== undefined && login !== null) {
      payload.login = login.trim().toLowerCase() || null;
    }
    if (password && password.trim()) {
      payload.password = password.trim();
    }

    const { data, error } = await supabase
      .from('teachers')
      .update(payload)
      .eq('id', id)
      .select('*, groups(id)')
      .single();

    if (error) {
      if (error.code === '42703' || (error.message && (error.message.includes('login') || error.message.includes('password')))) {
        throw new Error(
          "Supabase 'teachers' jadvalida login/password ustunlari mavjud emas. Iltimos, Supabase SQL Editor'da ushbu kodni ishga tushiring:\n" +
          "ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS login TEXT, ADD COLUMN IF NOT EXISTS password TEXT, ADD COLUMN IF NOT EXISTS subject TEXT;"
        );
      }
      throw new Error(error.message);
    }
    return { ...data, groups_count: data.groups ? data.groups.length : 0 };
  },

  deleteTeacher: async (id) => {
    checkSupabase();
    const { data: grps } = await supabase.from('groups').select('id').eq('teacher_id', id);
    if (grps && grps.length > 0) {
      throw new Error('Ushbu o\'qituvchiga guruhlar biriktirilgan. Avval guruhlarni o\'chiring yoki boshqa o\'qituvchiga bering.');
    }

    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // 3. Courses (Kurslar)
  getCourses: async () => {
    checkSupabase();
    const { data, error } = await supabase
      .from('courses')
      .select('*, groups(id)')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(c => ({
      ...c,
      groups_count: c.groups ? c.groups.length : 0
    }));
  },

  createCourse: async ({ name, price }) => {
    checkSupabase();
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name: name.trim(), price: Number(price) }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, groups_count: 0 };
  },

  updateCourse: async (id, { name, price }) => {
    checkSupabase();
    const { data, error } = await supabase
      .from('courses')
      .update({ name: name.trim(), price: Number(price) })
      .eq('id', id)
      .select('*, groups(id)')
      .single();

    if (error) throw new Error(error.message);
    return { ...data, groups_count: data.groups ? data.groups.length : 0 };
  },

  deleteCourse: async (id) => {
    checkSupabase();
    const { data: grps } = await supabase.from('groups').select('id').eq('course_id', id);
    if (grps && grps.length > 0) {
      throw new Error('Ushbu kursda faol guruhlar mavjud. Avval guruhlarni o\'chiring.');
    }

    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // 4. Groups (Guruhlar)
  getGroups: async () => {
    checkSupabase();
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id, name, days, time, course_id, teacher_id, created_at,
        courses (name, price),
        teachers (name, phone),
        enrollments (id)
      `)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      days: g.days,
      time: g.time,
      course_id: g.course_id,
      teacher_id: g.teacher_id,
      course_name: g.courses?.name || '',
      course_price: g.courses?.price || 0,
      teacher_name: g.teachers?.name || 'Biriktirilmagan',
      teacher_phone: g.teachers?.phone || '',
      student_count: g.enrollments ? g.enrollments.length : 0
    }));
  },

  getGroup: async (id) => {
    checkSupabase();
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id, name, days, time, course_id, teacher_id,
        courses (name, price),
        teachers (name, phone),
        enrollments (
          id, start_date,
          students (id, name, phone, parent_phone)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    const students = (data.enrollments || []).map(e => ({
      id: e.students?.id,
      name: e.students?.name,
      phone: e.students?.phone,
      parent_phone: e.students?.parent_phone,
      start_date: e.start_date,
      enrollment_id: e.id
    })).filter(s => s.id);

    return {
      id: data.id,
      name: data.name,
      days: data.days,
      time: data.time,
      course_name: data.courses?.name || '',
      course_price: data.courses?.price || 0,
      teacher_name: data.teachers?.name || 'Biriktirilmagan',
      teacher_phone: data.teachers?.phone || '',
      student_count: students.length,
      students
    };
  },

  createGroup: async ({ name, course_id, teacher_id, days, time }) => {
    checkSupabase();
    if (!name || !name.trim()) throw new Error('Guruh nomini kiriting');
    if (!course_id) throw new Error('Kursni tanlang');

    const cleanTeacherId = (teacher_id && Number(teacher_id) > 0) ? Number(teacher_id) : null;

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: name.trim(),
        course_id: Number(course_id),
        teacher_id: cleanTeacherId,
        days: (days || 'Du-Chor-Jum').trim(),
        time: (time || '14:00').trim()
      }])
      .select(`
        id, name, days, time, course_id, teacher_id,
        courses (name, price),
        teachers (name, phone)
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      days: data.days,
      time: data.time,
      course_id: data.course_id,
      teacher_id: data.teacher_id,
      course_name: data.courses?.name || '',
      course_price: data.courses?.price || 0,
      teacher_name: data.teachers?.name || 'Biriktirilmagan',
      teacher_phone: data.teachers?.phone || '',
      student_count: 0
    };
  },

  updateGroup: async (id, { name, course_id, teacher_id, days, time }) => {
    checkSupabase();
    if (!name || !name.trim()) throw new Error('Guruh nomini kiriting');
    if (!course_id) throw new Error('Kursni tanlang');

    const cleanTeacherId = (teacher_id && Number(teacher_id) > 0) ? Number(teacher_id) : null;

    const { data, error } = await supabase
      .from('groups')
      .update({
        name: name.trim(),
        course_id: Number(course_id),
        teacher_id: cleanTeacherId,
        days: (days || 'Du-Chor-Jum').trim(),
        time: (time || '14:00').trim()
      })
      .eq('id', id)
      .select(`
        id, name, days, time, course_id, teacher_id,
        courses (name, price),
        teachers (name, phone),
        enrollments (id)
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.name,
      days: data.days,
      time: data.time,
      course_id: data.course_id,
      teacher_id: data.teacher_id,
      course_name: data.courses?.name || '',
      course_price: data.courses?.price || 0,
      teacher_name: data.teachers?.name || 'Biriktirilmagan',
      teacher_phone: data.teachers?.phone || '',
      student_count: data.enrollments ? data.enrollments.length : 0
    };
  },

  deleteGroup: async (id) => {
    checkSupabase();
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // 5. Students (O'quvchilar)
  getStudents: async (search = '') => {
    checkSupabase();
    let query = supabase
      .from('students')
      .select(`
        id, name, phone, parent_phone, created_at,
        enrollments (
          id, start_date, group_id,
          groups (id, name, courses(price))
        )
      `)
      .order('id', { ascending: false });

    if (search && search.trim() !== '') {
      query = query.or(`name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%,parent_phone.ilike.%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      parent_phone: s.parent_phone,
      groups: (s.enrollments || []).map(e => ({
        id: e.groups?.id,
        name: e.groups?.name,
        price: e.groups?.courses?.price || 0,
        start_date: e.start_date,
        enrollment_id: e.id
      })).filter(g => g.id)
    }));
  },

  createStudent: async ({ name, phone, parent_phone, group_id, start_date }) => {
    checkSupabase();
    const cleanPhone = phone.trim();
    let cleanParent = parent_phone ? parent_phone.trim() : null;
    if (cleanParent && cleanParent.replace(/\D/g, '').length <= 3) {
      cleanParent = null;
    }

    // Telefon raqami bo'yicha takrorlanishni tekshirish
    const { data: existing, error: checkErr } = await supabase
      .from('students')
      .select('id, name, phone')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (checkErr) throw new Error(checkErr.message);
    if (existing) {
      throw new Error(`Ushbu telefon (${cleanPhone}) bilan "${existing.name}" ismli o'quvchi allaqachon mavjud!`);
    }

    const { data: st, error: stErr } = await supabase
      .from('students')
      .insert([{
        name: name.trim(),
        phone: cleanPhone,
        parent_phone: cleanParent
      }])
      .select()
      .single();

    if (stErr) throw new Error(stErr.message);

    let groups = [];
    if (group_id) {
      const sDate = start_date || new Date().toISOString().split('T')[0];
      const { data: enr, error: enrErr } = await supabase
        .from('enrollments')
        .insert([{
          student_id: st.id,
          group_id: Number(group_id),
          start_date: sDate
        }])
        .select('id, groups(id, name, courses(price))')
        .single();

      if (enrErr) {
        console.warn('Guruhga biriktirishda xatolik:', enrErr);
      } else if (enr) {
        groups.push({
          id: enr.groups?.id,
          name: enr.groups?.name,
          price: enr.groups?.courses?.price || 0,
          start_date: sDate,
          enrollment_id: enr.id
        });
      }
    }

    return { ...st, groups };
  },

  updateStudent: async (id, { name, phone, parent_phone }) => {
    checkSupabase();
    const cleanPhone = phone.trim();
    let cleanParent = parent_phone ? parent_phone.trim() : null;
    if (cleanParent && cleanParent.replace(/\D/g, '').length <= 3) {
      cleanParent = null;
    }

    // Telefon raqami boshqa o'quvchida mavjudligini tekshirish
    const { data: existing, error: checkErr } = await supabase
      .from('students')
      .select('id, name')
      .eq('phone', cleanPhone)
      .neq('id', id)
      .maybeSingle();

    if (checkErr) throw new Error(checkErr.message);
    if (existing) {
      throw new Error(`Ushbu telefon (${cleanPhone}) bilan "${existing.name}" ismli boshqa o'quvchi mavjud!`);
    }

    const { data, error } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        phone: cleanPhone,
        parent_phone: cleanParent
      })
      .eq('id', id)
      .select(`
        id, name, phone, parent_phone,
        enrollments (
          id, start_date, group_id,
          groups (id, name, courses(price))
        )
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      ...data,
      groups: (data.enrollments || []).map(e => ({
        id: e.groups?.id,
        name: e.groups?.name,
        price: e.groups?.courses?.price || 0,
        start_date: e.start_date,
        enrollment_id: e.id
      })).filter(g => g.id)
    };
  },

  deleteStudent: async (id) => {
    checkSupabase();
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // 6. Enrollments (Guruhga biriktirish)
  enrollStudent: async ({ student_id, group_id, start_date }) => {
    checkSupabase();
    const sDate = start_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        student_id: Number(student_id),
        group_id: Number(group_id),
        start_date: sDate
      }])
      .select('id, group_id, groups(name)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('O\'quvchi ushbu guruhga allaqachon biriktirilgan');
      }
      throw new Error(error.message);
    }

    return {
      id: data.id,
      student_id,
      group_id,
      group_name: data.groups?.name,
      start_date: sDate
    };
  },

  removeEnrollment: async (id) => {
    checkSupabase();
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // 7. Attendance (Davomat - 2-bosqich)
  getGroupAttendance: async (groupId, date) => {
    checkSupabase();
    // 1. Guruhdagi barcha o'quvchilarni olish
    const { data: enrolls, error: enrErr } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        students (id, name, phone)
      `)
      .eq('group_id', groupId);

    if (enrErr) throw new Error(enrErr.message);

    // 2. Shu sana uchun mavjud davomat yozuvlarini olish
    const { data: records, error: attErr } = await supabase
      .from('attendance')
      .select('*')
      .eq('group_id', groupId)
      .eq('date', date);

    if (attErr) throw new Error(attErr.message);

    const recordMap = new Map();
    (records || []).forEach(r => recordMap.set(r.student_id, r.status));

    // Birlashtirish
    return (enrolls || []).map(e => ({
      student_id: e.students?.id,
      student_name: e.students?.name,
      student_phone: e.students?.phone,
      status: recordMap.get(e.students?.id) || 'keldi' // default 'keldi'
    })).filter(s => s.student_id);
  },

  saveAttendance: async (groupId, date, items) => {
    checkSupabase();
    const rows = items.map(item => ({
      student_id: item.student_id,
      group_id: Number(groupId),
      date,
      status: item.status
    }));

    if (rows.length === 0) return [];

    const { data, error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_id,group_id,date' })
      .select();

    if (error) throw new Error(error.message);
    return data;
  },

  // 8. Payments (To'lovlar & Qarzdorlik - 2-bosqich)
  getPayments: async (selectedMonth = '') => {
    checkSupabase();
    let query = supabase
      .from('payments')
      .select(`
        id, amount, date, month, payment_method, created_at,
        students (id, name, phone)
      `)
      .order('date', { ascending: false });

    if (selectedMonth && selectedMonth.trim() !== '') {
      query = query.eq('month', selectedMonth.trim());
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(p => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.date,
      month: p.month,
      notes: p.notes,
      student_id: p.students?.id,
      student_name: p.students?.name || 'Noma\'lum o\'quvchi',
      student_phone: p.students?.phone || ''
    }));
  },

  createPayment: async ({ student_id, amount, date, month, payment_method }) => {
    checkSupabase();
    const insertPayload = {
      student_id: Number(student_id),
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      month: month || new Date().toISOString().substring(0, 7),
      payment_method: payment_method || 'naqd'
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([insertPayload])
      .select(`
        id, amount, date, month, payment_method,
        students (id, name, phone)
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      amount: Number(data.amount),
      date: data.date,
      month: data.month,
      payment_method: data.payment_method || 'naqd',
      student_id: data.students?.id,
      student_name: data.students?.name || 'Noma\'lum o\'quvchi',
      student_phone: data.students?.phone || ''
    };
  },

  deletePayment: async (id) => {
    checkSupabase();
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  // Qarzdorlarni hisoblash (Tanlangan oy uchun)
  getDebtors: async (targetMonth) => {
    checkSupabase();
    // 1. Barcha o'quvchilar va ularning guruhlari (kurs narxlari bilan)
    const { data: students, error: stErr } = await supabase
      .from('students')
      .select(`
        id, name, phone, parent_phone,
        enrollments (
          start_date,
          groups (id, name, courses(name, price))
        )
      `);

    if (stErr) throw new Error(stErr.message);

    // 2. Shu oy uchun amalga oshirilgan to'lovlar
    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('student_id, amount')
      .eq('month', targetMonth);

    if (payErr) throw new Error(payErr.message);

    // To'lovlar jamlanmasi
    const paidMap = new Map();
    (payments || []).forEach(p => {
      const current = paidMap.get(p.student_id) || 0;
      paidMap.set(p.student_id, current + Number(p.amount));
    });

    const debtors = [];

    (students || []).forEach(st => {
      const enrolls = st.enrollments || [];
      if (enrolls.length === 0) return; // Guruhda o'qimaydi

      // Jami talab qilinadigan oylik to'lov (barcha guruhlari narxi yig'indisi)
      let expectedTotal = 0;
      const groupNames = [];

      enrolls.forEach(e => {
        const price = Number(e.groups?.courses?.price || 0);
        expectedTotal += price;
        if (e.groups?.name) groupNames.push(e.groups.name);
      });

      const totalPaid = paidMap.get(st.id) || 0;
      const debtAmount = expectedTotal - totalPaid;

      // Agar qarz bo'lsa (to'lanmagan yoki qisman to'langan)
      if (debtAmount > 0) {
        debtors.push({
          student_id: st.id,
          name: st.name,
          phone: st.phone,
          parent_phone: st.parent_phone,
          groups: groupNames.join(', '),
          expected_amount: expectedTotal,
          paid_amount: totalPaid,
          debt_amount: debtAmount
        });
      }
    });

    return debtors;
  },

  // 9. Leads (Lidlar)
  getLeads: async () => {
    checkSupabase();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  createLead: async ({ name, phone, course_name, notes, status = 'yangi' }) => {
    checkSupabase();
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: name.trim(),
        phone: phone.trim(),
        course_name: course_name ? course_name.trim() : 'Aniqlanmagan',
        notes: notes ? notes.trim() : null,
        status: status || 'yangi'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateLead: async (id, { name, phone, course_name, notes, status }) => {
    checkSupabase();
    const updateObj = {};
    if (name !== undefined) updateObj.name = name.trim();
    if (phone !== undefined) updateObj.phone = phone.trim();
    if (course_name !== undefined) updateObj.course_name = course_name ? course_name.trim() : null;
    if (notes !== undefined) updateObj.notes = notes ? notes.trim() : null;
    if (status !== undefined) updateObj.status = status;

    const { data, error } = await supabase
      .from('leads')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateLeadStatus: async (id, status) => {
    checkSupabase();
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteLead: async (id) => {
    checkSupabase();
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id };
  },

  convertLeadToStudent: async (lead) => {
    checkSupabase();
    const phone = lead.phone.trim();
    // Telefon orqali avval tekshirish
    const { data: existing, error: checkErr } = await supabase
      .from('students')
      .select('id, name, phone')
      .eq('phone', phone)
      .maybeSingle();

    if (checkErr) throw new Error(checkErr.message);
    if (existing) {
      throw new Error(`Ushbu telefon (${phone}) bilan "${existing.name}" ismli o'quvchi allaqachon mavjud!`);
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{
        name: lead.name.trim(),
        phone: phone,
        notes: `Liddan aylantirildi. Kurs: ${lead.course_name || 'Aniqlanmagan'}${lead.notes ? ' | ' + lead.notes : ''}`
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getDashboardData: async () => {
    checkSupabase();
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [studentsRes, leadsRes, groupsRes, debtorsData] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact' }),
      supabase.from('leads').select('*').order('id', { ascending: false }),
      supabase.from('groups').select(`
        id, name, days, time, room, status,
        courses (name, price),
        teachers (name, phone),
        enrollments (id)
      `),
      api.getDebtors(currentMonth).catch(() => [])
    ]);

    const totalStudents = studentsRes.count ?? (studentsRes.data?.length || 0);
    const leads = leadsRes.data || [];
    const newLeads = leads.filter(l => l.status === 'yangi');
    const debtorsCount = debtorsData ? debtorsData.length : 0;
    const groups = (groupsRes.data || []).map(g => ({
      id: g.id,
      name: g.name,
      days: g.days,
      time: g.time,
      room: g.room,
      course_name: g.courses?.name || '',
      teacher_name: g.teachers?.name || '',
      teacher_phone: g.teachers?.phone || '',
      student_count: g.enrollments ? g.enrollments.length : 0
    }));

    const recentNewLeads = newLeads.slice(0, 5);

    return {
      totalStudents,
      newLeadsCount: newLeads.length,
      debtorsCount,
      totalGroups: groups.length,
      groups,
      recentNewLeads,
      currentMonth
    };
  }
};

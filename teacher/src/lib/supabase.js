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
 * O'qituvchiga tegishli barcha guruhlar va ularga biriktirilgan o'quvchilarni olish
 */
export async function fetchTeacherGroupsWithStudents(teacherId) {
  if (!supabase || !teacherId) return [];

  try {
    const { data: gData, error: gError } = await supabase
      .from('groups')
      .select('*, courses(name, price)')
      .eq('teacher_id', teacherId)
      .order('id', { ascending: false });

    if (gError) throw gError;
    if (!gData || gData.length === 0) return [];

    const groupIds = gData.map(g => g.id);
    const { data: enrData } = await supabase
      .from('enrollments')
      .select('*, students(*)')
      .in('group_id', groupIds);

    return gData.map(g => {
      const grStudents = (enrData || [])
        .filter(e => e.group_id === g.id && e.students)
        .map(e => ({
          id: e.students.id,
          name: e.students.name,
          phone: e.students.phone,
          parent_phone: e.students.parent_phone,
          notes: e.students.notes,
          start_date: e.start_date,
          group_id: g.id,
          group_name: g.name
        }));

      return {
        id: g.id,
        teacher_id: g.teacher_id,
        name: g.name,
        course_name: g.courses?.name || "Asosiy kurs",
        course_price: g.courses?.price || 0,
        days: g.days,
        time: g.time,
        room: g.room || '—',
        students: grStudents
      };
    });
  } catch (err) {
    console.error('fetchTeacherGroupsWithStudents error:', err);
    throw err;
  }
}

/**
 * Tanlangan guruh va sana bo'yicha davomat ma'lumotlarini olish
 */
export async function fetchGroupAttendance(groupId, date) {
  if (!supabase || !groupId || !date) return [];
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('group_id', groupId)
      .eq('date', date);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchGroupAttendance error:', err);
    throw err;
  }
}

/**
 * Davomatni saqlash (Upsert)
 */
export async function saveGroupAttendance(records) {
  if (!supabase || !records || records.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,group_id,date' });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('saveGroupAttendance error:', err);
    throw err;
  }
}

export default supabase;

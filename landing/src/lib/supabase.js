import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Ariza (Lead) qoldirish funksiyasi
export async function submitLead({ name, phone, course_name, notes }) {
  if (!supabase) {
    // Agar Supabase ulanmagan bo'lsa, konsolga va localStorage ga saqlaymiz (demo uchun)
    console.warn('Supabase URL/Key sozlanmagan, ariza lokal xotirada saqlandi');
    const existing = JSON.parse(localStorage.getItem('demo_leads') || '[]');
    existing.push({ id: Date.now(), name, phone, course_name, notes, status: 'yangi', created_at: new Date().toISOString() });
    localStorage.setItem('demo_leads', JSON.stringify(existing));
    return { success: true, demo: true };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name: name.trim(),
        phone: phone.trim(),
        course_name: course_name || 'Aniqlanmagan',
        notes: notes ? notes.trim() : null,
        status: 'yangi'
      }
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, data };
}

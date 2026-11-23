import React, { useState } from 'react';
import { LogOut, Database, Key, GraduationCap } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
import Modal from './Modal';

export default function Navbar({ pageTitle, teacher, onLogout }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsConfigOpen(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-stone-200/90 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-stone-900">{pageTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Status Button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.isConfigured ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            <Database className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            <span>{currentConfig.isConfigured ? 'Supabase: Ulangan' : 'Supabase: Sozlash'}</span>
          </button>

          {/* User profile info */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
            <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-medium text-xs shadow-xs">
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-stone-900 leading-tight">
                {teacher?.name || 'Ustoz'}
              </p>
              <p className="text-[10px] text-stone-500 font-mono tabular-nums">
                {teacher?.phone || 'Fan o\'qituvchisi'}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Tizimdan chiqish"
              className="ml-1 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Supabase Sozlamalari Modali */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Supabase API sozlamalari"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveConfig} className="space-y-3.5">
          <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-md text-xs text-stone-700 space-y-1">
            <p className="font-medium flex items-center gap-1.5 text-stone-900">
              <Key className="w-3.5 h-3.5 text-stone-500" strokeWidth={1.5} />
              Supabase Project URL va Anon Key
            </p>
            <p className="text-stone-500 leading-relaxed text-[11px]">
              Bularni Supabase loyihangizdan (<strong>Project Settings → API</strong>) olasiz. Kiritilgach, ma'lumotlar to'g'ridan-to'g'ri Supabase bazangiz bilan sinxronlanadi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Project URL
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Anon / Public Key
            </label>
            <textarea
              rows={4}
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs font-mono focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-md text-xs text-emerald-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Sozlamalar saqlandi! Sahifa yangilanmoqda...</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Saqlash va Ulanish
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

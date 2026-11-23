import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, Lock, Mail, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../api/supabase';
import { saveCredentialToBrowser } from '../lib/session';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase sozlamalar modali
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const config = getSupabaseConfig();
  const [cfgUrl, setCfgUrl] = useState(config.url);
  const [cfgKey, setCfgKey] = useState(config.key);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(emailOrUsername, password);
      saveCredentialToBrowser(emailOrUsername, password, 'Administrator');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(cfgUrl, cfgKey);
    setIsConfigOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans text-stone-900">
      <div className="w-full max-w-sm">
        {/* Logo va sarlavha */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1B4332] text-white mb-3 shadow-xs">
            <School className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h1 className="text-base font-semibold text-stone-900 tracking-tight">O'quv Markazi ERP & CRM</h1>
          <p className="text-xs text-stone-500 mt-0.5">Administrator paneli (admin.sayt.uz)</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-stone-200/90 p-6 shadow-xs">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200/60 rounded-md flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" action="#" name="admin-login" className="space-y-3.5">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-medium text-stone-700 mb-1">
                Admin Emaili yoki Logini
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@markaz.uz"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-stone-700 mb-1">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#1B4332] hover:bg-[#143326] active:bg-[#0f271d] text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Kirilmoqda...' : 'Tizimga kirish'}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </form>

          {/* Pastki yordam havolalari */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Key className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
              <span>Supabase sozlash</span>
            </button>
            <span className="text-stone-400">v2.0 Minimalist</span>
          </div>
        </div>
      </div>

      {/* Supabase Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-stone-200 shadow-md w-full max-w-md p-5">
            <h3 className="text-sm font-semibold text-stone-900 mb-1">Supabase API sozlamalari</h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Agar Supabase serveringiz o'zgargan bo'lsa, bu yerdan yangi URL va Anon Keyni saqlashingiz mumkin.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Project URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://xyz.supabase.co"
                  value={cfgUrl}
                  onChange={(e) => setCfgUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs font-mono focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Anon Key</label>
                <textarea
                  rows={4}
                  required
                  placeholder="eyJhbG..."
                  value={cfgKey}
                  onChange={(e) => setCfgKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-md text-xs font-mono focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200 transition-colors"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

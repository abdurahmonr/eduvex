import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { isSessionExpired, touchSession, clearSession, setupSessionHeartbeat } from '../lib/session';

const AuthContext = createContext(null);
const STORAGE_KEY = 'admin_session_last_active';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (!savedUser) return null;

    // 20 daqiqalik tekshiruv: agar sahifa yopilib 20 daqiqadan oshgan bo'lsa
    if (isSessionExpired(STORAGE_KEY)) {
      localStorage.removeItem('crm_user');
      localStorage.removeItem('crm_token');
      clearSession(STORAGE_KEY);
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('crm_user');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Faollikni kuzatish va 20 daqiqalik avtomatik logout
  useEffect(() => {
    if (!user) return;

    const cleanupHeartbeat = setupSessionHeartbeat(STORAGE_KEY, () => {
      logout();
    });

    return () => {
      cleanupHeartbeat();
    };
  }, [user]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    const token = res.token || res.session?.access_token || 'admin_session';
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_user', JSON.stringify(res.user));
    touchSession(STORAGE_KEY);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    clearSession(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

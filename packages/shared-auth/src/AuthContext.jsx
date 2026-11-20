import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from './client.js';

export const AuthContext = createContext({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  signOut: async () => {}
});

/**
 * Auth Provider Scaffolding for Phase 01
 * Ready for Phase 02 live session hydration.
 */
export function AuthProvider({ children, initialRole = null }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    const client = getSupabaseClient();
    await client.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, signOut }}>
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

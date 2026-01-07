import { useMemo, useState, useEffect, useCallback } from 'react';
// Firestore credential check (no Firebase Auth session for admin)
import { adminSignInOrCreate } from '@/services/adminAuthFirebase';
// Firestore doc expected fields: name, phn_number, password_hash, role='admin'
import { AdminAuthContext } from '@/context/adminAuthContextCore';

export default function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [ready, setReady] = useState(false);

  // Simple cookie helpers
  const setCookie = (name, value, days) => {
    try {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
    } catch {
      // ignore cookie errors
    }
  };
  const getCookie = (name) => {
    try {
      return document.cookie
        .split('; ')
        .find((row) => row.startsWith(name + '='))
        ?.split('=')[1] || '';
    } catch { return ''; }
  };

  useEffect(() => {
    // Load from localStorage first
    const raw = localStorage.getItem('sfm_admin_user');
    if (raw) {
      try { setAdminUser(JSON.parse(raw)); } catch {
        // ignore parse errors
      }
    } else {
      // Fallback to cookie (1-day expiry)
      const cookieVal = getCookie('sfm_admin_user');
      if (cookieVal) {
        try { setAdminUser(JSON.parse(decodeURIComponent(cookieVal))); } catch {
          // ignore parse errors
        }
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(async ({ phn_number, password, name }) => {
    const profile = await adminSignInOrCreate({ phn_number, password, name });
    localStorage.setItem('sfm_admin_user', JSON.stringify(profile));
    setCookie('sfm_admin_user', JSON.stringify(profile), 1);
    setAdminUser(profile);
    setShowAdminLogin(false);
    return profile;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sfm_admin_user');
    setCookie('sfm_admin_user', '', -1);
    setAdminUser(null);
  }, []);

  const value = useMemo(() => ({
    adminUser,
    setAdminUser,
    showAdminLogin,
    setShowAdminLogin,
    ready,
    login,
    logout,
  }), [adminUser, showAdminLogin, ready, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

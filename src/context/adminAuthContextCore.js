import { createContext } from 'react';

export const AdminAuthContext = createContext({
  adminUser: null,
  setAdminUser: () => {},
  showAdminLogin: false,
  setShowAdminLogin: () => {},
  ready: false,
  login: async () => {},
  logout: () => {},
});

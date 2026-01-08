import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginAdmin,
  fetchAdminProfile
} from '../../utils/adminApi.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        setAdmin(null);
        return;
      }
      
      console.log('[Auth] Bootstrapping with existing token');
      try {
        const profile = await fetchAdminProfile();
        console.log('[Auth] Profile fetched successfully:', profile);
        setAdmin(profile);
        setError(null);
      } catch (err) {
        console.error('[Auth] Profile fetch failed:', err);
        logout();
        setError(err.message || 'Session expired');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('[Auth] Attempting login for:', credentials.email);
      const result = await loginAdmin(credentials);
      
      // Debug: Log the full response structure
      console.log('[Auth] Login response:', result);
      
      // Backend returns: { success: true, data: { token, admin: { id, email } } }
      // After unwrap, result should be: { token, admin: { id, email } }
      // Extract token and admin from result
      const nextToken = result?.token || result?.data?.token;
      const profile = result?.admin || result?.data?.admin;

      if (!nextToken) {
        console.error('[Auth] Token not found in response:', result);
        throw new Error('Token not received from server. Please check backend configuration.');
      }

      console.log('[Auth] Token received, storing in localStorage');
      localStorage.setItem('admin_token', nextToken);
      setToken(nextToken);
      setAdmin(profile || { id: 'unknown', email: credentials.email });
      setError(null);

      console.log('[Auth] Login successful');
      return profile || { id: 'unknown', email: credentials.email };
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        loading,
        error,
        login,
        logout,
        setAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wildtrail_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wildtrail_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Fetch fresh profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('wildtrail_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid token:', err.message);
        // Clean up stale session
        setToken(null);
        setUser(null);
        localStorage.removeItem('wildtrail_token');
        localStorage.removeItem('wildtrail_user');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('wildtrail_token', res.token);
      localStorage.setItem('wildtrail_user', JSON.stringify(res.user));
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('wildtrail_token', res.token);
      localStorage.setItem('wildtrail_user', JSON.stringify(res.user));
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wildtrail_token');
    localStorage.removeItem('wildtrail_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.auth.updateProfile(profileData);
    if (res.success && res.user) {
      setUser(prev => ({ ...prev, ...res.user }));
      localStorage.setItem('wildtrail_user', JSON.stringify({ ...user, ...res.user }));
      return res.user;
    }
    throw new Error(res.message || 'Update profile failed');
  };

  // Quick 1-click login for demo purposes
  const quickDemoLogin = async (role = 'user') => {
    if (role === 'admin') {
      return login('admin@wildtrail.com', 'admin@123');
    } else {
      return login('demo@wildtrail.com', 'user@123');
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        quickDemoLogin,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab
      }}
    >
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

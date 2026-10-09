import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('lp_token');
    setLoading(true);
    try {
      const data = await authApi.getProfile();
      if (data.user) {
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        if (!token) localStorage.removeItem('lp_token');
      }
    } catch (err) {
      // If error is unauthorized, clear token
      if (err.status === 401) {
        localStorage.removeItem('lp_token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      if (data.token) {
        localStorage.setItem('lp_token', data.token);
      }
      if (data.user) {
        setUser(data.user);
      } else {
        await checkAuth();
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await authApi.register({ name, email, password });
      if (data.token) {
        localStorage.setItem('lp_token', data.token);
      }
      if (data.user) {
        setUser(data.user);
      } else {
        await checkAuth();
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('lp_token');
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser: checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;

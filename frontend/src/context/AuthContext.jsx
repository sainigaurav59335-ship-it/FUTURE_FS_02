import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('crm_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('crm_token');
          }
        } catch (err) {
          console.error('Session validation failed:', err.message);
          localStorage.removeItem('crm_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data.token) {
        localStorage.setItem('crm_token', res.data.token);
        setUser({
          _id: res.data._id,
          username: res.data.username,
          email: res.data.email
        });
        return { success: true };
      }
      return { success: false, error: 'Token missing' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await api.register(username, email, password);
      if (res.success && res.data.token) {
        localStorage.setItem('crm_token', res.data.token);
        setUser({
          _id: res.data._id,
          username: res.data.username,
          email: res.data.email
        });
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('crm_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

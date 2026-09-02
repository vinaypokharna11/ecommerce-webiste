'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth modal management for checkout trigger
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);

  // Check customer session on mount
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.warn('Customer auth check failed', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Universal Login (Customer or Admin)
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.isAdmin || data.role === 'admin' || data.role === 'superadmin') {
        if (data.token) {
          localStorage.setItem('nakoda_admin_token', data.token);
          localStorage.setItem('shopease_admin_token', data.token);
        }
        setIsAuthModalOpen(false);
        return { success: true, isAdmin: true, redirectTo: '/admin', user: data.user };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      if (authCallback) {
        authCallback(data.user);
        setAuthCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true, isAdmin: false, user: data.user };
    }

    return { success: false, error: data.error || 'Invalid credentials' };
  };

  // Customer Signup
  const signup = async (formData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.user);
      setIsAuthenticated(true);
      if (authCallback) {
        authCallback(data.user);
        setAuthCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'Failed to create account' };
  };

  // Customer Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update Profile
  const updateProfile = async (data) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const openAuthModal = (callback = null) => {
    setAuthCallback(() => callback);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        checkAuth,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
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

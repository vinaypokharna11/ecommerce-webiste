'use client';

// ============================================================
// IMPORTS
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';

// ============================================================
// CONTEXT CREATION
// ============================================================
const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Manages customer session state, checkout login interception modals,
 * and profile synchronization.
 */
export const AuthProvider = ({ children }) => {
  // ============================================================
  // STATE
  // ============================================================
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth modal management for checkout interception & guest wishlist prompt
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);
  const [authCancelCallback, setAuthCancelCallback] = useState(null);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: '',
    subtitle: '',
    defaultTab: 'login',
  });

  // ============================================================
  // SESSION INITIALIZATION
  // ============================================================
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getSession();

      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ============================================================
  // AUTHENTICATION ACTIONS
  // ============================================================

  /**
   * Universal Login (Customer or Admin)
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email.trim(), password.trim());

      if (data.success) {
        try {
          localStorage.removeItem('nakoda_orders_v2');
          localStorage.removeItem('nakoda_orders');
        } catch (e) {}
        if (data.isAdmin || data.role === 'admin' || data.role === 'superadmin') {
          // Session is preserved securely via HttpOnly admin_token cookie
          try {
            localStorage.removeItem('nakoda_admin_token');
            localStorage.removeItem('shopease_admin_token');
          } catch (e) {}
          setAuthCancelCallback(null);
          setIsAuthModalOpen(false);
          return { success: true, isAdmin: true, redirectTo: '/admin', user: data.user };
        }

        setUser(data.user);
        setIsAuthenticated(true);
        setAuthCancelCallback(null);
        if (authCallback) {
          authCallback(data.user);
          setAuthCallback(null);
        }
        setIsAuthModalOpen(false);
        return { success: true, isAdmin: false, user: data.user };
      }

      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  /**
   * Customer Signup
   */
  const signup = async (formData) => {
    try {
      const data = await authService.signup(formData);

      if (data.success) {
        try {
          localStorage.removeItem('nakoda_orders_v2');
          localStorage.removeItem('nakoda_orders');
        } catch (e) {}
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthCancelCallback(null);
        if (authCallback) {
          authCallback(data.user);
          setAuthCallback(null);
        }
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Failed to create account' };
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  /**
   * Customer Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('nakoda_orders_v2');
      localStorage.removeItem('nakoda_orders');
    } catch (e) {}
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Customer Profile Update
   */
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // MODAL CONTROLS
  // ============================================================
  const openAuthModal = (callback = null, options = {}) => {
    setAuthCallback(() => callback);
    setAuthCancelCallback(() => (typeof options?.onCancel === 'function' ? options.onCancel : null));
    setAuthModalConfig({
      title: options?.title || '',
      subtitle: options?.subtitle || '',
      defaultTab: options?.defaultTab || 'login',
    });
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    if (authCancelCallback) {
      try {
        authCancelCallback();
      } catch (e) {
        console.error('Error in auth cancel callback:', e);
      }
    }
    setIsAuthModalOpen(false);
    setAuthCallback(null);
    setAuthCancelCallback(null);
    setAuthModalConfig({ title: '', subtitle: '', defaultTab: 'login' });
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
        authModalConfig,
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

export default AuthContext;

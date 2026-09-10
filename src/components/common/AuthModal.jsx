'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup, authModalConfig } = useAuth();
  const [tab, setTab] = useState(authModalConfig?.defaultTab || 'login'); // 'login' | 'signup'

  React.useEffect(() => {
    if (authModalConfig?.defaultTab) {
      setTab(authModalConfig.defaultTab);
    }
    setError('');
  }, [authModalConfig, isAuthModalOpen]);

  // Lock body scroll and prevent background moving while modal is open
  React.useEffect(() => {
    if (!isAuthModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    } else {
      firePartyPopper();
      if (res.isAdmin || res.redirectTo === '/admin' || res.user?.role === 'admin' || res.user?.role === 'superadmin') {
        closeAuthModal();
        window.location.href = '/admin';
        return;
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setError('Name, email, and password are required.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await signup({
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
    });
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account');
    } else {
      firePartyPopper();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/50 backdrop-blur-md -z-10"
      />

      {/* Centering Wrapper with vertical scroll padding */}
      <div 
        className="min-h-full flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10"
        onClick={closeAuthModal}
      >
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-[32px] border border-black/[0.08] shadow-2xl p-4 xs:p-5 sm:p-7 md:p-8 my-auto"
        >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close auth modal"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] flex items-center justify-center text-[#1D1D1F] transition-all cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-md">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F]">
            {authModalConfig?.title || (tab === 'login' ? 'Sign In to Nakoda' : 'Create Customer Account')}
          </h3>
          <p className="text-xs text-[#777777] mt-1">
            {authModalConfig?.subtitle || (tab === 'login'
              ? 'Sign in to complete your checkout and track orders'
              : 'Join Nakoda to save addresses and view order history')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-full bg-[#F5F5F7] p-1 mb-4 sm:mb-5 border border-black/[0.05]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-1.5 sm:py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#1D1D1F] text-white shadow-sm'
                : 'text-[#777777] hover:text-[#1D1D1F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
            }}
            className={`flex-1 py-1.5 sm:py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-[#1D1D1F] text-white shadow-sm'
                : 'text-[#777777] hover:text-[#1D1D1F]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 mb-4 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form Container */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#1D1D1F] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#777777]" />}
                </button>
              </div>
            </div>

            {/* Prominent Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 sm:py-3.5 px-6 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3 sm:space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1D1D1F] mb-1 uppercase tracking-wider">
                Password (Min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#777777]/70 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#1D1D1F] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#777777]" />}
                </button>
              </div>
            </div>

            {/* Prominent Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 sm:py-3.5 px-6 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 sm:mt-5 text-center">
          <p className="text-[10px] sm:text-[11px] text-[#777777] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your personal data is encrypted & stored securely</span>
          </p>
        </div>
      </motion.div>
    </div>
  </div>
  );
};

export default AuthModal;

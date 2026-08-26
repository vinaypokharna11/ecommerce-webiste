'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('tab') === 'signup' ? 'signup' : 'login';

  const { login, signup, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' | 'signup'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already authenticated and not admin, redirect to storefront
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      const redirect = searchParams?.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, user, router, searchParams]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        if (res.isAdmin) {
          setSuccessMessage('Admin credentials verified! Redirecting to Admin Portal...');
          firePartyPopper();
          setTimeout(() => {
            window.location.href = '/admin';
          }, 400);
        } else {
          setSuccessMessage('Welcome back! Logging you in...');
          firePartyPopper();
          const redirect = searchParams?.get('redirect') || '/';
          setTimeout(() => {
            router.push(redirect);
          }, 500);
        }
      } else {
        setError(res.error || 'Invalid credentials. Please check your email & password.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Name, email, and password are required to create an account.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword.trim(),
      });

      if (res.success) {
        firePartyPopper();
        setSuccessMessage('Account created successfully! Welcome to Nakoda Imitation 🎉');
        setTimeout(() => {
          const redirect = searchParams?.get('redirect') || '/';
          router.push(redirect);
        }, 800);
      } else {
        setError(res.error || 'Failed to create account. Email may already be registered.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Fill Helper for Admin
  const handleFillAdmin = () => {
    setActiveTab('login');
    setLoginEmail('admin@nakodaimitation.com');
    setLoginPassword('admin123');
    setError('');
    setSuccessMessage('Admin credentials populated. Click Sign In to open Admin Portal!');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#171717] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#9FD842] selection:text-[#171717]">
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#9FD842]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#8EC731]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[#171717] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#171717]">
            Nakoda Imitation
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#171717] hover:bg-[#F3FCDA] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative z-10"
        >
          {/* Brand Icon Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-xs text-[#777777] mt-1">
              {activeTab === 'login'
                ? 'Sign in to access your orders, saved items, or admin dashboard'
                : 'Sign up for the first time to track orders & access exclusive prices'}
            </p>
          </div>

          {/* Tab Switcher: Login vs Sign Up */}
          <div className="flex bg-[#EEEEEC] p-1 rounded-full border border-black/5 mb-5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'signup'
                  ? 'bg-[#9FD842] text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New? Sign Up</span>
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 mb-4 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-4 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* ── Tab 1: LOGIN FORM ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com or admin@nakodaimitation.com"
                    autoComplete="username"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#171717] p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Admin Quick Fill Pill */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-[#777777]">
                <span>Are you the store admin?</span>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="font-bold text-[#709E1E] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Fill</span>
                </button>
              </div>
            </form>
          )}

          {/* ── Tab 2: SIGNUP FORM ── */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                  Full Name <span className="text-[#709E1E]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                  Email Address <span className="text-[#709E1E]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                  Phone (WhatsApp) <span className="text-[10px] text-[#777777] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
                  Create Password <span className="text-[#709E1E]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-11 pr-11 py-2.5 sm:py-3 rounded-2xl border border-black/10 bg-[#EEEEEC] text-sm text-[#171717] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#171717] p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create My Account</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#777777]">
        © 2026 Nakoda Imitation. All rights reserved.
      </footer>
    </div>
  );
}

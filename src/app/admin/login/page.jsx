'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const token = localStorage.getItem('nakoda_admin_token') || localStorage.getItem('shopease_admin_token');
        if (!token) return;

        const res = await fetch('/api/admin/auth', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.authenticated) {
          router.replace('/admin');
          return;
        } else {
          // Clean expired or invalid tokens
          localStorage.removeItem('nakoda_admin_token');
          localStorage.removeItem('shopease_admin_token');
        }
      } catch (e) {
        localStorage.removeItem('nakoda_admin_token');
        localStorage.removeItem('shopease_admin_token');
      }
    }

    checkExistingAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        try {
          localStorage.removeItem('nakoda_admin_token');
          localStorage.removeItem('shopease_admin_token');
        } catch (e) {}
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid administrator credentials. Access denied.');
      }
    } catch (err) {
      setError('Unable to connect to the authentication service. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#171717] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#9FD842] selection:text-[#171717]">
      {/* Ambient Organic Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#9FD842]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#8EC731]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#171717]">Nakoda Imitation</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#171717] hover:bg-[#F3FCDA] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-[32px] border border-black/5 p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative z-10"
        >
          {/* Lock Icon Badge */}
          <div className="w-14 h-14 rounded-full bg-[#171717] flex items-center justify-center text-[#9FD842] shadow-md mx-auto mb-5">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3FCDA] border border-[#9FD842]/30 text-xs font-extrabold text-[#709E1E] mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#709E1E]" />
              <span>Protected Administrator Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-[#777777] mt-1">
              Sign in to manage jewelry catalog, customer orders, and inquiries
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 mb-5 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#777777]">
        © 2026 Nakoda Imitation. Secured Administrator Management Interface.
      </footer>
    </div>
  );
}

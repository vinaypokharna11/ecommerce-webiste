'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('shopease_admin_token', data.token);
        }
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
    <div className="min-h-screen bg-[#FAF9FF] text-[#15152A] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#6257FF] selection:text-white">
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] ambient-glow-lavender rounded-full blur-[140px] pointer-events-none -z-10 opacity-70" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] ambient-glow-pink rounded-full blur-[140px] pointer-events-none -z-10 opacity-50" />

      {/* Header Bar */}
      <header className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#15152A]">ShopEase</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#6257FF] hover:bg-[#FAF9FF] shadow-xs transition-all"
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
          className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6FD] p-7 sm:p-9 shadow-[0_20px_60px_rgba(98,87,255,0.12)] relative z-10"
        >
          {/* Lock Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#EC5AC8] flex items-center justify-center text-white shadow-[0_8px_25px_rgba(98,87,255,0.35)] mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-bold text-[#6257FF] mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected Administrator Area</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-[#626276] mt-1">
              Sign in with your administrator credentials to manage catalog, orders, and inquiries
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
              <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shopease.com"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EAE6FD] bg-[#FAF9FF] text-sm text-[#15152A] placeholder-[#8E8EA0] focus:outline-none focus:border-[#6257FF] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-[#EAE6FD] bg-[#FAF9FF] text-sm text-[#15152A] placeholder-[#8E8EA0] focus:outline-none focus:border-[#6257FF] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8EA0] hover:text-[#15152A] p-1"
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
      <footer className="p-6 text-center text-xs text-[#8E8EA0]">
        © 2026 ShopEase. Secured Administrator Management Interface.
      </footer>
    </div>
  );
}

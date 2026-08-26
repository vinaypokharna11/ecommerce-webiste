'use client';

import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  onSubmit,
  onFillAdmin,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
      {onFillAdmin && (
        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-[#777777]">
          <span>Are you the store admin?</span>
          <button
            type="button"
            onClick={onFillAdmin}
            className="font-bold text-[#709E1E] hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Fill</span>
          </button>
        </div>
      )}
    </form>
  );
}

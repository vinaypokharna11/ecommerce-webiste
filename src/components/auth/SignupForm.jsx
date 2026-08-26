'use client';

import React from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, Sparkles } from 'lucide-react';

export function SignupForm({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div>
        <label className="block text-xs font-bold text-[#171717] mb-1 uppercase tracking-wider">
          Full Name <span className="text-[#709E1E]">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
}

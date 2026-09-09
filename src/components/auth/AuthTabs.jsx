'use client';

import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex bg-[#ECE5DC] p-1 rounded-full border border-black/[0.06] mb-5 shadow-inner">
      <button
        type="button"
        onClick={() => onTabChange('login')}
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
        onClick={() => onTabChange('signup')}
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
  );
}

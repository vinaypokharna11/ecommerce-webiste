'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, LayoutDashboard, LogOut, Package, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminQuickBar = () => {
  const pathname = usePathname();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('shopease_admin_token') : null;
        if (!token) {
          setIsAdminLoggedIn(false);
          return;
        }

        const res = await fetch('/api/admin/auth', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
        }
      } catch (e) {
        setIsAdminLoggedIn(false);
      }
    }

    verifyAdmin();
  }, [pathname]);

  // Don't show inside the admin portal pages themselves
  if (!isAdminLoggedIn || pathname?.startsWith('/admin') || isDismissed) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('shopease_admin_token');
    setIsAdminLoggedIn(false);
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        aria-label="Administrator Quick Bar"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] sm:w-auto font-sans pointer-events-auto"
      >
        <div className="bg-[#171717] text-white px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#9FD842]/40 flex items-center justify-between gap-3 sm:gap-4 backdrop-blur-md">
          
          {/* Left badge */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9FD842] animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
              <ShieldCheck className="w-4 h-4 text-[#9FD842]" />
              <span className="hidden sm:inline">Admin Mode Active</span>
              <span className="sm:hidden">Admin</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] text-xs font-extrabold transition-all active:scale-95 shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Hide Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

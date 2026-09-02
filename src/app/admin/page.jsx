'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true, false
  const [adminUser, setAdminUser] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth(isPeriodic = false) {
      try {
        const token = localStorage.getItem('nakoda_admin_token') || localStorage.getItem('shopease_admin_token');
        const res = await fetch('/api/admin/auth', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.authenticated) {
            setIsAuthenticated(true);
            setAdminUser(data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('nakoda_admin_token');
            localStorage.removeItem('shopease_admin_token');
            if (isPeriodic || isAuthenticated === true) {
              setIsSessionExpired(true);
            }
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }

    checkAuth(false);

    // Periodic heartbeat every 3 minutes to auto-detect 12-hour expiration
    const interval = setInterval(() => {
      checkAuth(true);
    }, 3 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('nakoda_admin_token');
    localStorage.removeItem('shopease_admin_token');
    router.push('/admin/login');
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-10 h-10 border-3 border-[#171717] border-t-[#9FD842] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#171717]">Verifying Administrator Session...</p>
      </div>
    );
  }

  // Not authenticated gate
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-4 font-sans selection:bg-[#9FD842] selection:text-[#171717]">
        {/* Glows */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#9FD842]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] border border-black/10 p-8 sm:p-9 shadow-2xl text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#171717] text-[#9FD842] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          
          {isSessionExpired ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-extrabold text-amber-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Session Expired (12-Hour Limit Reached)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3FCDA] border border-[#9FD842]/30 text-xs font-extrabold text-[#709E1E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator Access Required</span>
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">
            {isSessionExpired ? 'Session Expired' : 'Admin Portal'}
          </h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            {isSessionExpired 
              ? 'Your secure 12-hour administrator session has ended. Please sign in again to continue managing Nakoda Imitation.'
              : 'Please authenticate to access the Nakoda Imitation store catalog controls, inventory, and inquiries panel.'}
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              className="w-full py-3.5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>Go to Admin Login</span>
              <ArrowRight className="w-4 h-4 text-[#9FD842]" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-full text-xs font-bold text-[#777777] hover:bg-[#EEEEEC] transition-colors"
            >
              Back to Customer Store
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="relative min-h-screen bg-[#F5F5F3]">
      <AdminLayout
        onExitAdmin={() => router.push('/')}
        onLogout={handleLogout}
        adminUser={adminUser}
      />
    </div>
  );
}

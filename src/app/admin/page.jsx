'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true, false
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem('shopease_admin_token');
        const res = await fetch('/api/admin/auth', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('shopease_admin_token');
    router.push('/admin/login');
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#6257FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#6257FF]">Verifying Admin Session...</p>
      </div>
    );
  }

  // Not authenticated gate
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl border border-[#EAE6FD] p-8 shadow-xl text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#15152A]">Admin Authentication Required</h2>
          <p className="text-xs text-[#626276] leading-relaxed">
            You must be logged in as an authorized store administrator to access the catalog controls and database management panel.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="w-full py-3 rounded-2xl gradient-btn-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-btn"
            >
              <span>Go to Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#626276] hover:bg-[#FAF9FF]"
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
    <div className="relative min-h-screen bg-[#FAF9FF]">
      <AdminLayout
        onExitAdmin={() => router.push('/')}
        onLogout={handleLogout}
        adminUser={adminUser}
      />
    </div>
  );
}

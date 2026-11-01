'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    // Log client-side error gracefully without breaking UI
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col justify-between font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Header bar */}
      <header className="w-full border-b border-black/[0.05] bg-white/80 backdrop-blur-md py-4 px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm">
            N
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1D1D1F]">
            Nakoda Store
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main error boundary presentation */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-50 text-red-500 mb-6 shadow-xs border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] max-w-sm mx-auto mb-8 leading-relaxed">
            An unexpected error occurred while loading this page. Please try refreshing or return to the storefront.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-bold hover:bg-black active:scale-95 transition-all inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-[#1D1D1F] border border-black/10 text-xs font-bold hover:bg-neutral-50 active:scale-95 transition-all inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="w-full py-6 text-center text-xs text-[#86868B] border-t border-black/[0.05]">
        © {new Date().getFullYear()} Nakoda Store. All rights reserved.
      </footer>
    </div>
  );
}

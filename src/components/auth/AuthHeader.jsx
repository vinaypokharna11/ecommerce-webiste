'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export function AuthHeader({ storeName = 'Nakoda Imitation', backHref = '/' }) {
  return (
    <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
      <Link href={backHref} className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-full bg-[#171717] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#171717]">
          {storeName}
        </span>
      </Link>

      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/5 text-xs font-bold text-[#171717] hover:bg-[#F3FCDA] shadow-sm transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Store</span>
      </Link>
    </header>
  );
}

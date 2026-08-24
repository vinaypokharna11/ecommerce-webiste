'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContactInquirePage } from '@/components/ContactInquirePage';
import { Toast } from '@/components/Toast';
import { useCatalog } from '@/context/CatalogContext';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';

function InquireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, storeConfig } = useCatalog();
  const [toasts, setToasts] = useState([]);

  const productId = searchParams.get('product');
  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return products.find((p) => p.id === productId) || null;
  }, [productId, products]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleNavClick = (id) => {
    if (id === 'admin') {
      router.push('/admin');
      return;
    }
    if (id === 'home' || id === 'catalog' || id === 'offers' || id === 'cart' || id === 'profile') {
      router.push('/');
      return;
    }
    if (id === 'contact') {
      router.push('/contact');
      return;
    }
  };

  const handleFooterLinkClick = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('contact')) {
      router.push('/contact');
    } else if (lower.includes('whatsapp')) {
      window.open(createHelpWhatsAppUrl(storeConfig.whatsappNumber), '_blank');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] text-[#15152A] flex flex-col font-sans overflow-x-hidden selection:bg-[#6257FF] selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] ambient-glow-lavender rounded-full blur-[140px] pointer-events-none -z-20 opacity-70" />
      <div className="fixed top-[400px] -right-40 w-[600px] h-[600px] ambient-glow-pink rounded-full blur-[140px] pointer-events-none -z-20 opacity-50" />

      <Navbar activeTab="inquire" onNavClick={handleNavClick} />

      <main className="flex-1 w-full">
        <ContactInquirePage
          initialMode="inquire"
          selectedProduct={selectedProduct}
          onNotify={addToast}
          onExploreCatalog={() => router.push('/')}
        />
      </main>

      <Footer onLinkClick={handleFooterLinkClick} />
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

export default function InquireRoutePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FAF9FF]" />}>
      <InquireContent />
    </React.Suspense>
  );
}

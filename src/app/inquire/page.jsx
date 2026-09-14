'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, Footer, ContactInquirePage, Toast } from '@/components';
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nakoda:scroll-to-top'));
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    if (id === 'contact') {
      router.push('/contact');
      return;
    }
    router.push(id === 'home' ? '/' : `/?tab=${id}`);
  };

  const handleFooterLinkClick = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('contact')) {
      router.push('/contact');
    } else if (lower.includes('catalog') || lower.includes('product') || lower.includes('shop')) {
      router.push('/?tab=catalog');
    } else if (lower.includes('offer')) {
      router.push('/?tab=offers');
    } else if (lower.includes('cart')) {
      router.push('/?tab=cart');
    } else if (lower.includes('profile')) {
      router.push('/?tab=profile');
    } else if (lower.includes('whatsapp')) {
      window.open(createHelpWhatsAppUrl(storeConfig.whatsappNumber), '_blank');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F6F5F0] text-[#171717] flex flex-col font-sans overflow-x-hidden selection:bg-[#9FD842] selection:text-[#171717]">
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#F6F5F0]" />}>
      <InquireContent />
    </React.Suspense>
  );
}

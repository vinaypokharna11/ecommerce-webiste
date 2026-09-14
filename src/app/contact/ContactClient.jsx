'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar, Footer, ContactInquirePage, Toast } from '@/components';
import { useCatalog } from '@/context/CatalogContext';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';

export default function ContactClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storeConfig, products } = useCatalog();
  const [toasts, setToasts] = useState([]);

  // Determine mode from URL ?tab= param (?tab=inquire opens inquiry form)
  const tabParam = searchParams.get('tab');
  const productId = searchParams.get('product');
  const initialMode = tabParam === 'inquire' ? 'inquire' : 'contact';

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
      return;
    }
    router.push(id === 'home' ? '/' : `/?tab=${id}`);
  };

  const handleFooterLinkClick = (label, href) => {
    const lower = label.toLowerCase();
    if (href && href.startsWith('http')) {
      window.open(href, '_blank');
      return;
    }
    if (lower.includes('inquire') || lower.includes('bulk')) {
      router.push('/contact?tab=inquire');
    } else if (lower.includes('contact') || lower.includes('faq')) {
      router.push('/contact');
    } else if (lower.includes('catalog') || lower.includes('product') || lower.includes('shop') || lower.includes('new') || lower.includes('best')) {
      router.push('/?tab=catalog');
    } else if (lower.includes('offer') || lower.includes('deal')) {
      router.push('/?tab=offers');
    } else if (lower.includes('cart') || lower.includes('bag')) {
      router.push('/?tab=cart');
    } else if (lower.includes('admin')) {
      router.push('/admin/login');
    } else if (lower.includes('profile') || lower.includes('account') || lower.includes('order')) {
      router.push('/?tab=profile');
    } else if (lower.includes('whatsapp')) {
      window.open(createHelpWhatsAppUrl(storeConfig.whatsappNumber), '_blank');
    } else {
      router.push(href || '/');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0804] text-[#F0EAE0] flex flex-col font-sans overflow-x-hidden selection:bg-[#C9A84C] selection:text-[#0A0804]">

      <Navbar activeTab="contact" onNavClick={handleNavClick} />

      <main className="flex-1 w-full">
        <ContactInquirePage
          initialMode={initialMode}
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

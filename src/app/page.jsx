'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeatureBenefits } from '@/components/FeatureBenefits';
import { Categories } from '@/components/Categories';
import { PopularProducts } from '@/components/PopularProducts';
import { PromoBanner } from '@/components/PromoBanner';
import { CatalogPage } from '@/components/CatalogPage';
import { OffersPage } from '@/components/OffersPage';
import { CartPage } from '@/components/CartPage';
import { ProfilePage, INITIAL_ORDERS } from '@/components/ProfilePage';
import { ContactInquirePage } from '@/components/ContactInquirePage';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { Footer } from '@/components/Footer';
import { Toast } from '@/components/Toast';
import { QuickViewModal } from '@/components/QuickViewModal';
import { useCatalog } from '@/context/CatalogContext';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';
import { SlidersHorizontal, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorefrontPage() {
  const router = useRouter();
  const { products, storeConfig, catalogStats } = useCatalog();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  
  // Initial sample cart items
  const [cartItems, setCartItems] = useState(() => {
    const first = products[0] || {};
    const third = products[2] || {};
    return {
      [first.id || 'prod-1']: { ...first, quantity: 1 },
      [third.id || 'prod-3']: { ...third, quantity: 1 },
    };
  });

  const [wishlist, setWishlist] = useState({
    'prod-2': true,
  });
  const [toasts, setToasts] = useState([]);

  // Calculate cart counts & total amount
  const { totalCartCount, totalCartAmount, cartItemsList } = useMemo(() => {
    const list = Object.values(cartItems).filter((item) => item.quantity > 0);
    const count = list.reduce((sum, item) => sum + item.quantity, 0);
    const amount = list.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    return {
      totalCartCount: count,
      totalCartAmount: amount,
      cartItemsList: list,
    };
  }, [cartItems]);

  // Toast dispatcher
  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Nav item interaction
  const handleNavClick = (id, label) => {
    if (id === 'admin') {
      router.push('/admin');
      return;
    }

    const routableTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    if (routableTabs.includes(id)) {
      // If navigating away from contact, clear inquiry product
      if (id !== 'contact') setInquiryProduct(null);
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Product inquiry jump handler — opens contact page in inquire mode
  const handleOpenProductInquiry = (product) => {
    setInquiryProduct(product);
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category click interaction from Home
  const handleCategoryClick = (category) => {
    const catId = category?.id || 'all';
    setSelectedCategory(catId);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to cart handler
  const handleAddToCart = (product) => {
    const qtyToAdd = product.quantity || 1;
    setCartItems((prev) => {
      const existing = prev[product.id];
      const currentQty = existing ? existing.quantity : 0;
      return {
        ...prev,
        [product.id]: {
          ...product,
          quantity: currentQty + qtyToAdd,
        },
      };
    });

    addToast(
      'cart',
      'Added to Cart! ✓',
      `${product.name} has been added to your shopping bag.`
    );
  };

  // Update quantity handler
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems((prev) => {
      if (newQuantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQuantity,
        },
      };
    });
  };

  // Favorite toggle handler
  const handleToggleFavorite = (productId) => {
    setWishlist((prev) => {
      const isFav = !prev[productId];
      if (isFav) {
        addToast('heart', 'Saved to Wishlist ❤️', 'Item has been added to your saved list.');
      } else {
        addToast('info', 'Removed from Wishlist', 'Item was removed from your saved list.');
      }
      return { ...prev, [productId]: isFav };
    });
  };

  // Switch to catalog
  const handleExploreCatalog = (cat = 'all') => {
    setSelectedCategory(cat);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order placed handler
  const handlePlaceOrder = async (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    addToast(
      'cart',
      'Order Confirmed! 🎉',
      `Order ${newOrder.id} has been placed successfully.`
    );

    // Also persist order to backend database & trigger automated emails
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (e) {
      console.warn('Order background sync notice:', e);
    }
  };

  // Smart Footer link handler
  const handleFooterLinkClick = (label) => {
    const lower = label.toLowerCase();
    if ((lower.includes('product') && !lower.includes('inquiry')) || lower.includes('arrival') || lower.includes('seller')) {
      handleExploreCatalog('all');
    } else if (lower.includes('offer')) {
      setActiveTab('offers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('inquire') || lower.includes('bulk') || lower.includes('corporate') || lower.includes('product inquiry')) {
      setInquiryProduct(null);
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('contact') || lower.includes('help') || lower.includes('faq') || lower.includes('location') || lower.includes('visit')) {
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('whatsapp')) {
      window.open(createHelpWhatsAppUrl(storeConfig.whatsappNumber), '_blank');
    } else if (lower.includes('about')) {
      addToast('info', 'Store Location 📍', `${storeConfig.name}, ${storeConfig.address}. Open: ${storeConfig.hours}`);
    } else if (lower.includes('return') || lower.includes('shipping')) {
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('privacy') || lower.includes('terms') || lower.includes('cookie')) {
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('admin')) {
      router.push('/admin');
    } else {
      handleNavClick(lower, label);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] text-[#15152A] flex flex-col font-sans overflow-x-hidden selection:bg-[#6257FF] selection:text-white">
      
      {/* Global Background Ambient Glow Layers */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] ambient-glow-lavender rounded-full blur-[140px] pointer-events-none -z-20 opacity-70" />
      <div className="fixed top-[400px] -right-40 w-[600px] h-[600px] ambient-glow-pink rounded-full blur-[140px] pointer-events-none -z-20 opacity-50" />
      <div className="fixed top-[900px] -left-40 w-[600px] h-[600px] ambient-glow-purple rounded-full blur-[140px] pointer-events-none -z-20 opacity-40" />

      {/* Floating Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        activeTab={activeTab}
        onNavClick={handleNavClick}
      />

      {/* Main Content Area: Switches smoothly between Home, Catalog, Offers, Inquire, Contact, Cart, Profile */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <>
            <HeroSection onExploreClick={() => handleExploreCatalog('all')} />
            <FeatureBenefits />
            <Categories
              onCategoryClick={handleCategoryClick}
              onViewAllClick={() => handleExploreCatalog('all')}
            />
            <PopularProducts
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onViewAllClick={() => handleExploreCatalog('all')}
              onQuickView={setQuickViewProduct}
              onInquire={handleOpenProductInquiry}
            />
            <PromoBanner onCheckOffers={() => handleNavClick('offers', 'Offers')} />
          </>
        )}

        {activeTab === 'catalog' && (
          <CatalogPage
            cartItems={cartItems}
            wishlist={wishlist}
            initialCategory={selectedCategory}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onToggleFavorite={handleToggleFavorite}
            onInquire={handleOpenProductInquiry}
            onNotify={addToast}
          />
        )}

        {activeTab === 'offers' && (
          <OffersPage onExploreCatalog={() => handleExploreCatalog('all')} />
        )}

        {/* Single unified Contact Us tab — handles both Contact and Inquire modes */}
        {activeTab === 'contact' && (
          <ContactInquirePage
            initialMode={inquiryProduct ? 'inquire' : 'contact'}
            selectedProduct={inquiryProduct}
            onNotify={addToast}
            onExploreCatalog={() => handleExploreCatalog('all')}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onExploreCatalog={() => handleExploreCatalog('all')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            orders={orders}
            onExploreCatalog={() => handleExploreCatalog('all')}
            onNavigate={handleNavClick}
          />
        )}
      </main>

      {/* Floating Bottom Cart Bar for mobile & quick WhatsApp order */}
      <FloatingCartBar
        cartItems={cartItemsList}
        totalCount={totalCartCount}
        totalAmount={totalCartAmount}
        activeTab={activeTab}
        onOpenCartModal={() => handleNavClick('cart', 'Cart')}
      />

      {/* Quick Floating "Admin Panel" launcher button */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#15152A]/90 hover:bg-[#15152A] text-white shadow-[0_10px_30px_rgba(21,21,42,0.3)] backdrop-blur-md border border-white/20 text-xs font-bold transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6257FF] to-[#EC5AC8] flex items-center justify-center text-white">
            <Lock className="w-3 h-3" />
          </div>
          <span>Admin Portal</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold text-[#FFD6F0]">
            {catalogStats.totalProducts} Items
          </span>
        </motion.button>
      </div>

      {/* Footer */}
      <Footer onLinkClick={handleFooterLinkClick} />

      {/* Interactive Micro-Toasts */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        cartQuantity={quickViewProduct ? (cartItems[quickViewProduct.id]?.quantity || 0) : 0}
        onUpdateQuantity={handleUpdateQuantity}
        onInquire={handleOpenProductInquiry}
      />
    </div>
  );
}

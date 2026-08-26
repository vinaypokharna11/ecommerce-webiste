'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeatureBenefits } from '@/components/FeatureBenefits';
import { Categories } from '@/components/Categories';
import { PopularProducts } from '@/components/PopularProducts';
import { PromoBanner } from '@/components/PromoBanner';
import { RecentlyViewed } from '@/components/RecentlyViewed';
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
import { useAuth } from '@/context/AuthContext';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';
import { motion } from 'framer-motion';

function StorefrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, storeConfig, catalogStats } = useCatalog();
  const { user } = useAuth();

  const tabParam = searchParams.get('tab');
  const categoryParam = searchParams.get('category');

  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    return validTabs.includes(tabParam) ? tabParam : 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => categoryParam || 'all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Synchronize state when URL query params change (e.g. back/forward navigation or external links)
  useEffect(() => {
    const validTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    const currentTab = searchParams.get('tab');
    if (currentTab && validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    } else if (!currentTab) {
      setActiveTab('home');
    }

    const currentCat = searchParams.get('category');
    if (currentCat) {
      setSelectedCategory(currentCat);
    }
  }, [searchParams]);

  // Listen to browser popstate for back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab') || 'home';
      const cat = urlParams.get('category') || 'all';
      setActiveTab(tab);
      setSelectedCategory(cat);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Track recently viewed products
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(['prod-1', 'prod-2', 'prod-3', 'prod-5']);

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
    'prod-4': true,
  });
  const [toasts, setToasts] = useState([]);
  const lastToastRef = useRef({ key: '', ts: 0 });

  const recordRecentlyViewed = useCallback((productId) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  }, []);

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

  // Toast dispatcher (with double-trigger deduplication)
  const addToast = useCallback((type, title, message) => {
    const key = `${title}-${message}`;
    const now = Date.now();
    if (lastToastRef.current.key === key && now - lastToastRef.current.ts < 500) {
      return;
    }
    lastToastRef.current = { key, ts: now };

    const id = now + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Nav item interaction with smooth browser URL synchronization
  const handleNavClick = (id, label) => {
    if (id === 'admin') {
      router.push('/admin');
      return;
    }
    const routableTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    if (routableTabs.includes(id)) {
      if (id !== 'contact') setInquiryProduct(null);
      setActiveTab(id);
      const newUrl = id === 'home' ? '/' : `/?tab=${id}`;
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab: id }, '', newUrl);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Product inquiry jump handler
  const handleOpenProductInquiry = (product) => {
    setInquiryProduct(product);
    setActiveTab('contact');
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'contact' }, '', `/?tab=contact&product=${product?.id || ''}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category click interaction on Home page (filters inline without switching tab)
  const handleCategoryClick = (category) => {
    const catId = category?.id || 'all';
    setSelectedCategory((prev) => (prev === catId ? 'all' : catId));
  };

  const handleResetCategory = () => {
    setSelectedCategory('all');
  };

  // Quick view handler with tracking
  const handleQuickView = (product) => {
    if (product?.id) recordRecentlyViewed(product.id);
    setQuickViewProduct(product);
  };

  // Add to cart handler
  const handleAddToCart = (product) => {
    if (product?.id) recordRecentlyViewed(product.id);
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
      'success',
      'Added to Cart! 🛍️',
      `${product.name} (x${qtyToAdd}) has been added to your shopping bag.`
    );
  };

  // Update quantity handler
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems((prev) => {
      const current = prev[productId];
      if (!current) return prev;

      if (newQuantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        addToast('info', 'Item Removed 🗑️', `${current.name} was removed from your bag.`);
        return next;
      }

      return {
        ...prev,
        [productId]: {
          ...current,
          quantity: newQuantity,
        },
      };
    });
  };

  // Wishlist favorite toggle (handles both full product object and ID string)
  const handleToggleFavorite = (productOrId) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId?.id;
    if (!productId) return;
    const foundProduct = typeof productOrId === 'object' && productOrId?.name 
      ? productOrId 
      : products.find((p) => p.id === productId);
    const productName = foundProduct?.name || 'Item';

    const isCurrentlyFav = !!wishlist[productId];
    if (isCurrentlyFav) {
      addToast('info', 'Removed from Wishlist 💔', `${productName} was removed from favorites.`);
    } else {
      addToast('success', 'Saved to Wishlist ❤️', `${productName} added to your favorites.`);
    }

    setWishlist((prev) => {
      const next = { ...prev };
      if (isCurrentlyFav) {
        delete next[productId];
      } else {
        next[productId] = true;
      }
      return next;
    });
  };

  // Order placement from Cart
  const handlePlaceOrder = (orderData) => {
    setOrders((prev) => [orderData, ...prev]);
    addToast(
      'success',
      'Order Confirmed! 🎉',
      `Order ${orderData.id} has been placed. We'll update you as soon as it ships!`
    );
  };

  // General Explore Catalog helper
  const handleExploreCatalog = (categoryId = 'all') => {
    setSelectedCategory(categoryId);
    setActiveTab('catalog');
    const newUrl = categoryId && categoryId !== 'all' 
      ? `/?tab=catalog&category=${categoryId}` 
      : '/?tab=catalog';
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'catalog', category: categoryId }, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Footer navigation
  const handleFooterLinkClick = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('catalog') || lower.includes('product') || lower.includes('shop') || lower.includes('men') || lower.includes('women') || lower.includes('electro') || lower.includes('trend')) {
      handleExploreCatalog('all');
    } else if (lower.includes('offer') || lower.includes('deal') || lower.includes('coupon') || lower.includes('discount')) {
      setActiveTab('offers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('contact') || lower.includes('help') || lower.includes('support') || lower.includes('inquir') || lower.includes('bulk')) {
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('profile') || lower.includes('account') || lower.includes('order')) {
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('cart') || lower.includes('bag') || lower.includes('checkout')) {
      setActiveTab('cart');
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
    } else {
      handleNavClick(lower, label);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F3] text-[#171717] flex flex-col font-sans overflow-x-hidden selection:bg-[#9FD842] selection:text-[#171717]">
      
      {/* Floating Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        activeTab={activeTab}
        onNavClick={handleNavClick}
        user={user}
      />

      {/* Main Content Area: Home, Catalog, Offers, Contact, Cart, Profile */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <>
            <HeroSection 
              onExploreClick={() => handleExploreCatalog('all')}
            />
            <Categories
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />
            <PopularProducts
              cartItems={cartItems}
              wishlist={wishlist}
              selectedCategory={selectedCategory}
              onResetCategory={handleResetCategory}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onToggleFavorite={handleToggleFavorite}
              onViewAllClick={() => handleExploreCatalog('all')}
              onQuickView={handleQuickView}
            />
            <FeatureBenefits />
            <PromoBanner onCheckOffers={() => handleNavClick('offers', 'Offers')} />
            
            {/* 1. Recently Viewed Section at the End of Home Page */}
            <RecentlyViewed
              products={products}
              recentlyViewedIds={recentlyViewedIds}
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
              onToggleFavorite={handleToggleFavorite}
              onExploreCatalog={() => handleExploreCatalog('all')}
            />
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
            wishlist={wishlist}
            products={products}
            onUpdateQuantity={handleUpdateQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
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

      {/* Footer */}
      <Footer onLinkClick={handleFooterLinkClick} />

      {/* Interactive Micro-Toasts */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Quick View Details Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        cartQuantity={quickViewProduct ? (cartItems[quickViewProduct.id]?.quantity || 0) : 0}
        onUpdateQuantity={handleUpdateQuantity}
        isFavorite={quickViewProduct ? !!wishlist[quickViewProduct.id] : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F3]" />}>
      <StorefrontContent />
    </Suspense>
  );
}

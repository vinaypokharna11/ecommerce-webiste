'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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

export default function StorefrontPage() {
  const router = useRouter();
  const { products, storeConfig, catalogStats } = useCatalog();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  
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

  // Toast dispatcher
  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Nav item interaction
  const handleNavClick = (id, label) => {
    const routableTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    if (routableTabs.includes(id)) {
      if (id !== 'contact') setInquiryProduct(null);
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Product inquiry jump handler
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

  // Wishlist favorite toggle
  const handleToggleFavorite = (product) => {
    setWishlist((prev) => {
      const isFav = !!prev[product.id];
      const next = { ...prev };
      if (isFav) {
        delete next[product.id];
        addToast('info', 'Removed from Wishlist', `${product.name} removed.`);
      } else {
        next[product.id] = true;
        addToast('success', 'Saved to Wishlist ❤️', `${product.name} added to your favorites.`);
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
              onCategoryClick={handleCategoryClick}
              onViewAllClick={() => handleExploreCatalog('all')}
            />
            <PopularProducts
              cartItems={cartItems}
              wishlist={wishlist}
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

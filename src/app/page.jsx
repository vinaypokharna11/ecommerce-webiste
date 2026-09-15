'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Navbar,
  HeroSection,
  Categories,
  PopularProducts,
  FeatureBenefits,
  PromoBanner,
  RecentlyViewed,
  CatalogPage,
  OffersPage,
  CartPage,
  ProfilePage,
  ContactInquirePage,
  QuickViewModal,
  Footer,
  Toast,
  BrandLoadingScreen,
} from '@/components';
import { useCatalog } from '@/context/CatalogContext';
import { useAuth } from '@/context/AuthContext';
import { createHelpWhatsAppUrl } from '@/utils/whatsapp';
import { getProductSizes } from '@/utils/productOptions';
import { motion } from 'framer-motion';

function StorefrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, storeConfig, catalogStats } = useCatalog();
  const { user, openAuthModal } = useAuth();

  const tabParam = searchParams.get('tab');
  const categoryParam = searchParams.get('category');

  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'profile'];
    return validTabs.includes(tabParam) ? tabParam : 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => categoryParam || 'all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isClientStorageLoaded, setIsClientStorageLoaded] = useState(false);

  // Brand Loading Screen & Navbar Morph Animation state
  const [isBrandLoading, setIsBrandLoading] = useState(true);
  const [isLogoHidden, setIsLogoHidden] = useState(true);

  // Synchronize activeTab whenever searchParams changes (e.g. Back/Forward navigation, direct links)
  useEffect(() => {
    const validTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'wishlist', 'profile'];
    const currentTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'home';
    setActiveTab(currentTab);
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [tabParam, categoryParam]);

  // Synchronize activeTab on browser Back/Forward (popstate event)
  useEffect(() => {
    const handlePopState = (e) => {
      if (e?.state?.modal === 'product-quickview' || quickViewProduct) {
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      const validTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'wishlist', 'profile'];
      setActiveTab(tab && validTabs.includes(tab) ? tab : 'home');
      const cat = urlParams.get('category');
      if (cat) setSelectedCategory(cat);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quickViewProduct]);

  // Ensure the page always starts from the top whenever switching tabs/pages from navbar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resetScroll = () => {
      window.dispatchEvent(new Event('nakoda:scroll-to-top'));
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const raf = requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 60);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [activeTab]);

  // Cart & Wishlist state: strictly isolated per user session
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  // Track previous user to detect login, logout, or account switches
  const prevUserRef = useRef(user);
  const isCartSyncedWithBackendRef = useRef(false);

  // Clean mount: load recently viewed & orders; clean up any legacy un-scoped carts
  useEffect(() => {
    try {
      // Remove all legacy un-scoped storage to ensure cart and wishlist start 100% empty by default
      const keysToPurge = [
        'nakoda_cart_v2',
        'nakoda_wishlist_v2',
        'nakoda_cart',
        'nakoda_wishlist',
        'shopease_cart',
        'shopease_cart_v1',
        'shopease_wishlist',
        'cart',
        'cartItems',
        'wishlist',
        'nakoda_recent_v2',
        'nakoda_recent',
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(k));

      const savedRecent = localStorage.getItem('nakoda_recent_v3');
      if (savedRecent) {
        try {
          setRecentlyViewedIds(JSON.parse(savedRecent));
        } catch (e) {}
      }

      const savedOrders = localStorage.getItem('nakoda_orders_v2');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn('Failed to load user activity storage', e);
    } finally {
      setIsClientStorageLoaded(true);
    }
  }, []);

  // Save recently viewed on user activity
  useEffect(() => {
    if (!isClientStorageLoaded) return;
    try {
      localStorage.setItem('nakoda_recent_v3', JSON.stringify(recentlyViewedIds));
    } catch (e) {}
  }, [recentlyViewedIds, isClientStorageLoaded]);

  // Save orders on user activity
  useEffect(() => {
    if (!isClientStorageLoaded) return;
    try {
      localStorage.setItem('nakoda_orders_v2', JSON.stringify(orders));
    } catch (e) {}
  }, [orders, isClientStorageLoaded]);

  // ─── USER TRANSITION & LOGOUT CLEANUP ──────────────────────────────────────────
  useEffect(() => {
    const prevUserId = prevUserRef.current ? (prevUserRef.current.id || prevUserRef.current._id || prevUserRef.current.email) : null;
    const currentUserId = user ? (user.id || user._id || user.email) : null;

    if (prevUserId && !currentUserId) {
      // ─── LOGOUT BEHAVIOR: Wipe in-memory cart and wishlist state completely ───
      setCartItems({});
      setWishlist({});
      isCartSyncedWithBackendRef.current = false;
      try {
        localStorage.removeItem('nakoda_cart_v2');
        localStorage.removeItem('nakoda_wishlist_v2');
        localStorage.removeItem(`nakoda_cart_${prevUserId}`);
        localStorage.removeItem(`nakoda_wishlist_${prevUserId}`);
      } catch (e) {}
    } else if (prevUserId !== currentUserId && currentUserId) {
      // ─── USER SWITCH / LOGIN: Reset in-memory states before fetching new user data ───
      setCartItems({});
      if (prevUserId) {
        setWishlist({});
      }
      isCartSyncedWithBackendRef.current = false;
    }

    prevUserRef.current = user;
  }, [user]);

  // ─── SYNCHRONIZE WISHLIST AND CART FROM BACKEND (AUTHENTICATED ONLY) ───────────
  useEffect(() => {
    if (!user) {
      // Guest users do not have persistent backend cart/wishlist
      isCartSyncedWithBackendRef.current = false;
      return;
    }

    let isMounted = true;

    // 1. Fetch persistent wishlist belonging ONLY to this user
    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.wishlist)) {
          const freshWishlist = {};
          data.wishlist.forEach((item) => {
            if (item.productId) freshWishlist[item.productId] = true;
          });
          setWishlist((prev) => ({ ...freshWishlist, ...prev }));
        }
      })
      .catch(() => {});

    // 2. Fetch persistent cart belonging ONLY to this user
    fetch('/api/cart')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.cart && Array.isArray(data.cart.items)) {
          const freshCart = {};
          data.cart.items.forEach((it) => {
            if (it.productId) {
              const catalogProd = (products || []).find((p) => p.id === it.productId);
              freshCart[it.productId] = {
                ...(catalogProd || {}),
                id: it.productId,
                productId: it.productId,
                name: catalogProd ? catalogProd.name : (it.name || 'Product'),
                price: typeof it.price === 'number' && it.price > 0 ? it.price : (catalogProd ? catalogProd.price : 0),
                image: catalogProd ? catalogProd.image : (it.image || ''),
                quantity: Math.max(1, Math.min(99, it.quantity || 1)),
                selectedColor: it.selectedColor || '',
                selectedSize: it.selectedSize || '',
              };
            }
          });
          setCartItems(freshCart);
        } else {
          setCartItems({});
        }
        isCartSyncedWithBackendRef.current = true;
      })
      .catch(() => {
        if (isMounted) isCartSyncedWithBackendRef.current = true;
      });

    return () => {
      isMounted = false;
    };
  }, [user, products]);

  // ─── SYNCHRONIZE CART CHANGES TO MONGODB ATLAS (AUTHENTICATED ONLY) ───────────
  const cartSyncTimeoutRef = useRef(null);
  useEffect(() => {
    // Only synchronize after the initial cart fetch from the server is complete
    if (!user || !isCartSyncedWithBackendRef.current) return;

    if (cartSyncTimeoutRef.current) clearTimeout(cartSyncTimeoutRef.current);
    cartSyncTimeoutRef.current = setTimeout(() => {
      const itemsList = Object.entries(cartItems)
        .filter(([_, item]) => item && item.quantity > 0)
        .map(([id, item]) => ({
          productId: id,
          quantity: Math.max(1, Math.min(99, item.quantity || 1)),
          selectedColor: item.selectedColor || '',
          selectedSize: item.selectedSize || '',
          name: item.name || '',
          price: item.price || 0,
          image: item.image || '',
        }));

      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsList }),
      }).catch((err) => {
        console.warn('Cart background synchronization failed:', err);
      });
    }, 800);

    return () => {
      if (cartSyncTimeoutRef.current) clearTimeout(cartSyncTimeoutRef.current);
    };
  }, [cartItems, user]);

  const [toasts, setToasts] = useState([]);
  const lastToastRef = useRef({ key: '', ts: 0 });


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

  const recordRecentlyViewed = useCallback((productId) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  }, []);

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

  // Clear recently viewed history
  const handleClearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem('nakoda_recent_v3');
      localStorage.removeItem('nakoda_recent_v2');
    } catch (e) {}
    addToast('info', 'History Cleared', 'Recently viewed items have been cleared.');
  }, [addToast]);

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Nav item interaction with smooth browser URL synchronization and instant top scroll
  const handleNavClick = (id, label) => {
    if (id === 'admin') {
      router.push('/admin');
      return;
    }
    const routableTabs = ['home', 'catalog', 'offers', 'contact', 'cart', 'wishlist', 'profile'];
    if (routableTabs.includes(id)) {
      if (id !== 'contact') setInquiryProduct(null);
      setActiveTab(id);
      const newUrl = id === 'home' ? '/' : `/?tab=${id}`;
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab: id }, '', newUrl);
        window.dispatchEvent(new Event('nakoda:scroll-to-top'));
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
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

  // Category click interaction on Home page (navigates to catalog filtered by category)
  const handleCategoryClick = (category) => {
    const catId = typeof category === 'string' ? category : (category?.id || 'all');
    handleExploreCatalog(catId);
  };

  const handleResetCategory = () => {
    setSelectedCategory('all');
  };

  // Quick view handler with tracking
  const handleQuickView = (product) => {
    if (product?.id) recordRecentlyViewed(product.id);
    setQuickViewProduct(product);
  };

  // Add to cart handler with stock verification and snapshot preservation
  const handleAddToCart = (product) => {
    if (!product || !product.id) return;
    const qtyToAdd = Math.max(1, parseInt(product.quantity, 10) || 1);

    // Stock limit verification
    const fullProd = products?.find((p) => String(p.id).trim() === String(product.id).trim()) || product;
    const stockLimit = typeof fullProd.stockCount === 'number' 
      ? Math.max(0, fullProd.stockCount) 
      : (typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 99);

    if (fullProd.stockStatus === 'out_of_stock' || stockLimit <= 0) {
      addToast('error', 'Out of Stock ⚠️', `${product.name} is currently out of stock.`);
      return;
    }

    const existing = cartItems[product.id];
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty >= stockLimit) {
      addToast('info', 'Stock Limit Reached ⚠️', `You already have the maximum available stock (${stockLimit}) in your bag.`);
      return;
    }

    // Require explicit size selection if product has sizes (clothing & shoes)
    const availableSizes = getProductSizes(product);
    if (availableSizes.length > 0 && !product.selectedSize && !product.selectedVariant) {
      addToast('error', 'Select Size First ⚠️', `Please select a size for "${product.name}" before adding to your bag.`);
      return;
    }

    const chosenSize = product.selectedSize || product.selectedVariant || '';
    const actualQtyToAdd = Math.min(qtyToAdd, stockLimit - currentQty);

    setCartItems((prev) => {
      const prevItem = prev[product.id];
      const prevQty = prevItem ? prevItem.quantity : 0;
      const newQty = Math.min(stockLimit, prevQty + actualQtyToAdd);

      return {
        ...prev,
        [product.id]: {
          ...product,
          id: product.id,
          productId: product.id,
          name: product.name || prevItem?.name || 'Product',
          price: typeof product.price === 'number' ? product.price : (prevItem?.price || 0),
          image: product.image || prevItem?.image || '',
          quantity: newQty,
          selectedColor: product.selectedColor || prevItem?.selectedColor || '',
          selectedSize: chosenSize || prevItem?.selectedSize || '',
        },
      };
    });

    addToast(
      'success',
      'Added to Cart! 🛍️',
      `${product.name} (x${actualQtyToAdd}) has been added to your shopping bag.`
    );
  };

  // Update quantity handler with stock limit protection and item removal
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

      const fullProd = products?.find((p) => String(p.id).trim() === String(productId).trim()) || current;
      const stockLimit = typeof fullProd.stockCount === 'number' 
        ? Math.max(0, fullProd.stockCount) 
        : (typeof current.stockCount === 'number' ? Math.max(0, current.stockCount) : 99);

      if (newQuantity > stockLimit) {
        addToast('info', 'Maximum Stock Reached ⚠️', `Only ${stockLimit} unit${stockLimit === 1 ? '' : 's'} available in stock for ${current.name}.`);
        return prev;
      }

      const cappedQty = Math.min(stockLimit, Math.max(1, newQuantity));

      return {
        ...prev,
        [productId]: {
          ...current,
          quantity: cappedQty,
        },
      };
    });
  };

  // Update size handler for cart items
  const handleUpdateSize = (productId, newSize) => {
    setCartItems((prev) => {
      const current = prev[productId];
      if (!current) return prev;

      return {
        ...prev,
        [productId]: {
          ...current,
          selectedSize: newSize,
        },
      };
    });
    addToast('info', 'Size Updated 📏', `Size set to ${newSize}.`);
  };

  // Update color handler for cart items
  const handleUpdateColor = (productId, newColor) => {
    setCartItems((prev) => {
      const current = prev[productId];
      if (!current) return prev;

      return {
        ...prev,
        [productId]: {
          ...current,
          selectedColor: newColor,
        },
      };
    });
    addToast('info', 'Color Updated 🎨', `Color set to ${newColor}.`);
  };

  // Wishlist favorite toggle (handles guest prompting, auto-revert, authenticated persistence & rollback)
  const handleToggleFavorite = (productOrId) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId?.id;
    if (!productId) return;
    const foundProduct = typeof productOrId === 'object' && productOrId?.name 
      ? productOrId 
      : products.find((p) => p.id === productId);
    const productName = foundProduct?.name || 'Item';

    // ─── GUEST USER BEHAVIOR ───
    if (!user) {
      // 1. Temporarily show the product as selected/liked in the UI
      setWishlist((prev) => ({ ...prev, [productId]: true }));

      // 2. Clearly tell the user that they need to log in or create an account
      addToast(
        'info',
        'Sign in required 🔒',
        'Please sign in or create an account to save products to your wishlist.'
      );

      // 3. Immediately open the Login/Signup popup/modal
      openAuthModal(
        // On successful login / signup:
        async (loggedInUser) => {
          // Product remains in wishlist UI
          setWishlist((prev) => ({ ...prev, [productId]: true }));
          // Save permanently to the newly authenticated user's DB wishlist
          try {
            const res = await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            });
            const data = await res.json();
            if (data.success) {
              addToast('success', 'Saved to Wishlist ❤️', `${productName} added to your wishlist.`);
            } else {
              // Revert if API fails
              setWishlist((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
              });
              addToast('error', 'Error', data.error || 'Failed to save to wishlist.');
            }
          } catch (e) {
            setWishlist((prev) => {
              const next = { ...prev };
              delete next[productId];
              return next;
            });
            addToast('error', 'Error', 'Failed to connect to wishlist service.');
          }
        },
        // Modal options & Cancel handler:
        {
          title: 'Save to your Wishlist ❤️',
          subtitle: 'Please sign in or create an account to save products to your wishlist.',
          defaultTab: 'login',
          onCancel: () => {
            // Automatically remove the temporary wishlist/heart state.
            // The product should return to its normal unliked state.
            setWishlist((prev) => {
              const next = { ...prev };
              delete next[productId];
              return next;
            });
          },
        }
      );
      return;
    }

    // ─── AUTHENTICATED USER BEHAVIOR ───
    const isCurrentlyFav = !!wishlist[productId];

    // Optimistic UI update
    setWishlist((prev) => {
      const next = { ...prev };
      if (isCurrentlyFav) {
        delete next[productId];
      } else {
        next[productId] = true;
      }
      return next;
    });

    if (isCurrentlyFav) {
      addToast('info', 'Removed from Wishlist 💔', `${productName} was removed from favorites.`);
      fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            // Revert optimistic update on failure
            setWishlist((prev) => ({ ...prev, [productId]: true }));
            addToast('error', 'Error', 'Failed to remove from wishlist. Changes reverted.');
          }
        })
        .catch(() => {
          setWishlist((prev) => ({ ...prev, [productId]: true }));
          addToast('error', 'Error', 'Connection failed. Changes reverted.');
        });
    } else {
      addToast('success', 'Saved to Wishlist ❤️', `${productName} added to your favorites.`);
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            // Revert optimistic update on failure
            setWishlist((prev) => {
              const next = { ...prev };
              delete next[productId];
              return next;
            });
            addToast('error', 'Error', data.error || 'Failed to add to wishlist. Changes reverted.');
          }
        })
        .catch(() => {
          setWishlist((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
          addToast('error', 'Error', 'Connection failed. Changes reverted.');
        });
    }
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
      window.dispatchEvent(new Event('nakoda:scroll-to-top'));
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
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
    } else if (lower.includes('admin')) {
      router.push('/admin/login');
    } else if (lower.includes('privacy') || lower.includes('terms') || lower.includes('cookie')) {
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavClick(lower, label);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col font-sans overflow-x-hidden selection:bg-[#0071E3] selection:text-white">
      
      {/* Brand Loading Screen with Navbar Morph Animation */}
      {isBrandLoading && (
        <BrandLoadingScreen
          onLanded={() => setIsLogoHidden(false)}
          onComplete={() => setIsBrandLoading(false)}
        />
      )}

      {/* Primary Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={Object.keys(wishlist).length}
        activeTab={activeTab}
        onNavClick={handleNavClick}
        onExploreClick={handleExploreCatalog}
        user={user}
        isLogoHidden={isLogoHidden}
      />

      {/* Main Content Area: Home, Catalog, Offers, Contact, Cart, Profile */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <>
            <HeroSection 
              onExploreClick={handleExploreCatalog}
              onNavClick={handleNavClick}
              cartCount={totalCartCount}
              user={user}
              activeTab={activeTab}
            />
            <Categories
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
              onExploreCatalog={handleExploreCatalog}
            />
            <PopularProducts
              cartItems={cartItems}
              wishlist={wishlist}
              selectedCategory={selectedCategory}
              onResetCategory={handleResetCategory}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateSize={handleUpdateSize}
              onToggleFavorite={handleToggleFavorite}
              onViewAllClick={() => handleExploreCatalog('all')}
              onQuickView={handleQuickView}
              onNotify={addToast}
            />
            <FeatureBenefits />
            <PromoBanner onCheckOffers={() => handleNavClick('offers', 'Offers')} />
            <RecentlyViewed
              products={products}
              recentlyViewedIds={recentlyViewedIds}
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
              onToggleFavorite={handleToggleFavorite}
              onExploreCatalog={() => handleExploreCatalog('all')}
              onClearRecent={handleClearRecentlyViewed}
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
            onUpdateSize={handleUpdateSize}
            onToggleFavorite={handleToggleFavorite}
            onQuickView={handleQuickView}
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

        {(activeTab === 'cart' || activeTab === 'wishlist') && (
          <CartPage
            initialTab={activeTab === 'wishlist' ? 'wishlist' : 'cart'}
            cartItems={cartItems}
            wishlist={wishlist}
            products={products}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateSize={handleUpdateSize}
            onUpdateColor={handleUpdateColor}
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
        onNotify={addToast}
      />
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFD]" />}>
      <StorefrontContent />
    </Suspense>
  );
}

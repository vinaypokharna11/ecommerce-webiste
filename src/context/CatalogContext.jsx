'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  CATALOG_PRODUCTS as DEFAULT_PRODUCTS, 
  CATALOG_CATEGORIES as DEFAULT_CATALOG_CATEGORIES, 
  CATEGORIES as DEFAULT_HOME_CATEGORIES,
  STORE_CONFIG as DEFAULT_STORE_CONFIG,
  HERO_ASSETS
} from '../data/mockData';

// Initial default offers
export const DEFAULT_OFFERS = [
  {
    id: 'electronics',
    title: '20% OFF',
    subtitle: 'on Electronics',
    code: 'ELEC20',
    discountPercent: 20,
    category: 'electronics',
    description: 'Valid on all wireless audio, smartwatches, speakers, and accessories.',
    gradient: 'from-[#6257FF] to-[#4F46E5]',
    bgLight: 'bg-[#F5F3FF]',
    textColor: 'text-[#6257FF]',
    borderColor: 'border-[#EAE6FD]',
    badgeColor: 'bg-[#EDE9FE] text-[#6257FF]',
    icon: '🎧',
    expiry: 'Valid till Aug 31',
    popular: false,
    isActive: true,
  },
  {
    id: 'fashion',
    title: '30% OFF',
    subtitle: 'on Fashion',
    code: 'FASH30',
    discountPercent: 30,
    category: 'clothing',
    description: 'Valid on all clothing, footwear, shirts, jackets, and casual wear.',
    gradient: 'from-[#EC5AC8] to-[#BE185D]',
    bgLight: 'bg-[#FFF0FB]',
    textColor: 'text-[#EC5AC8]',
    borderColor: 'border-[#FCD6F2]',
    badgeColor: 'bg-[#FCE7F3] text-[#EC5AC8]',
    icon: '👕',
    expiry: 'Valid till Sep 5',
    popular: true,
    isActive: true,
  },
  {
    id: 'home',
    title: '15% OFF',
    subtitle: 'on Home & Living',
    code: 'HOME15',
    discountPercent: 15,
    category: 'home-living',
    description: 'Valid on ceramic diffusers, potted plants, decorative items, and home essentials.',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    bgLight: 'bg-[#F5F3FF]',
    textColor: 'text-[#8B5CF6]',
    borderColor: 'border-[#DDD6FE]',
    badgeColor: 'bg-[#EDE9FE] text-[#8B5CF6]',
    icon: '🏠',
    expiry: 'Valid till Sep 10',
    popular: false,
    isActive: true,
  },
  {
    id: 'accessories',
    title: '25% OFF',
    subtitle: 'on Accessories',
    code: 'ACC25',
    discountPercent: 25,
    category: 'accessories',
    description: 'Flat 25% off on backpacks, wallets, sunglasses, and all accessories.',
    gradient: 'from-[#0891B2] to-[#0E7490]',
    bgLight: 'bg-[#F0F9FF]',
    textColor: 'text-[#0891B2]',
    borderColor: 'border-[#BAE6FD]',
    badgeColor: 'bg-[#E0F2FE] text-[#0891B2]',
    icon: '🕶️',
    expiry: 'Valid till Aug 28',
    popular: false,
    isActive: true,
  },
  {
    id: 'footwear',
    title: '35% OFF',
    subtitle: 'on Footwear',
    code: 'FEET35',
    discountPercent: 35,
    category: 'footwear',
    description: 'Sneakers, loafers, running shoes — all footwear at 35% off!',
    gradient: 'from-[#059669] to-[#047857]',
    bgLight: 'bg-[#F0FDF4]',
    textColor: 'text-[#059669]',
    borderColor: 'border-[#BBF7D0]',
    badgeColor: 'bg-[#D1FAE5] text-[#059669]',
    icon: '👟',
    expiry: 'Valid till Sep 15',
    popular: false,
    isActive: true,
  },
  {
    id: 'gifting',
    title: '10% OFF',
    subtitle: 'on Gift Hampers',
    code: 'GIFT10',
    discountPercent: 10,
    category: 'accessories',
    description: 'Special discount on all curated gift boxes and festive hampers.',
    gradient: 'from-[#D97706] to-[#B45309]',
    bgLight: 'bg-[#FFFBEB]',
    textColor: 'text-[#D97706]',
    borderColor: 'border-[#FDE68A]',
    badgeColor: 'bg-[#FEF3C7] text-[#D97706]',
    icon: '🎁',
    expiry: 'Valid till Sep 20',
    popular: false,
    isActive: true,
  },
];

// Unified default categories with consistent counts
export const INITIAL_CATEGORIES = [
  { id: 'clothing', name: 'Clothing', icon: 'Shirt', color: '#EC5AC8', accentBg: 'bg-[#FFF0FB]', iconColor: 'text-[#EC5AC8]', itemCount: '4 Items', count: 4, description: 'Shirts, jackets, and trendy apparel' },
  { id: 'footwear', name: 'Footwear', icon: 'Footprints', color: '#059669', accentBg: 'bg-[#F0FDF4]', iconColor: 'text-[#059669]', itemCount: '3 Items', count: 3, description: 'Sneakers, runners, and leather loafers' },
  { id: 'electronics', name: 'Electronics', icon: 'Headphones', color: '#6257FF', accentBg: 'bg-[#F5F3FF]', iconColor: 'text-[#6257FF]', itemCount: '4 Items', count: 4, description: 'Audio gear, smartwatches & speakers' },
  { id: 'accessories', name: 'Accessories', icon: 'Watch', color: '#0891B2', accentBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0891B2]', itemCount: '3 Items', count: 3, description: 'Bags, wallets, sunglasses & gifts' },
  { id: 'home-living', name: 'Home & Living', icon: 'Armchair', color: '#8B5CF6', accentBg: 'bg-[#F5F3FF]', iconColor: 'text-[#8B5CF6]', itemCount: '2 Items', count: 2, description: 'Plants, aroma diffusers & home decor' },
  { id: 'beauty', name: 'Beauty & Care', icon: 'Sparkles', color: '#EC5AC8', accentBg: 'bg-[#FFF0FB]', iconColor: 'text-[#EC5AC8]', itemCount: '0 Items', count: 0, description: 'Skincare, wellness & self-care items' },
];

const STORAGE_KEYS = {
  PRODUCTS: 'shopease_admin_products_v1',
  CATEGORIES: 'shopease_admin_categories_v1',
  OFFERS: 'shopease_admin_offers_v1',
  CONFIG: 'shopease_admin_config_v1',
  ACTIVITY: 'shopease_admin_activity_v1',
};

const CatalogContext = createContext(null);

export const CatalogProvider = ({ children }) => {
  // 1. Deterministic Initial States (Guarantees matching Server HTML and initial Client DOM)
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [storeConfig, setStoreConfig] = useState(DEFAULT_STORE_CONFIG);
  const [activities, setActivities] = useState(() => [
    { id: 1, title: 'Store Catalog Initialized', time: 'Just now', type: 'system', icon: 'Sparkles' },
    { id: 2, title: '16 default products loaded', time: 'Just now', type: 'product', icon: 'Package' },
    { id: 3, title: '6 promotional offers active', time: 'Just now', type: 'offer', icon: 'Tag' },
  ]);

  const isHydratedRef = useRef(false);

  // Load from localStorage on client mount without triggering hydration mismatch
  useEffect(() => {
    try {
      const savedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProds) setProducts(JSON.parse(savedProds));

      const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCats) setCategories(JSON.parse(savedCats));

      const savedOffers = localStorage.getItem(STORAGE_KEYS.OFFERS);
      if (savedOffers) setOffers(JSON.parse(savedOffers));

      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          if (!parsed.name || parsed.name === 'ShopEase') {
            parsed.name = 'Nakoda Imitation';
            parsed.tagline = 'Premium Imitation Jewelry & Lifestyle Collection';
          }
          setStoreConfig(parsed);
        } catch (e) {}
      }

      const savedAct = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (savedAct) setActivities(JSON.parse(savedAct));
    } catch (e) {
      console.warn('Failed to read from localStorage', e);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Persist changes to localStorage once client is hydrated
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    } catch (e) {
      console.warn('Failed to save offers to localStorage', e);
    }
  }, [offers]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(storeConfig));
    } catch (e) {
      console.warn('Failed to save config to localStorage', e);
    }
  }, [storeConfig]);

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const broadcastChannelRef = useRef(null);

  // Helper to construct authorization headers for admin REST APIs
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('nakoda_admin_token') || localStorage.getItem('shopease_admin_token')) 
      : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Activity Logger
  const logActivity = useCallback((title, type = 'info', icon = 'Check') => {
    const newAct = {
      id: Date.now() + Math.random(),
      title,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      type,
      icon,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
  }, []);

  // Fetch full live catalog from backend REST APIs & Persistent DB
  const fetchCatalogData = useCallback(async () => {
    try {
      const [prodRes, catRes, offRes, cfgRes] = await Promise.allSettled([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/offers').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.success && Array.isArray(prodRes.value.products)) {
        setProducts(prodRes.value.products);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.success && Array.isArray(catRes.value.categories)) {
        setCategories(catRes.value.categories);
      }
      if (offRes.status === 'fulfilled' && offRes.value?.success && Array.isArray(offRes.value.offers)) {
        setOffers(offRes.value.offers);
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value?.success && cfgRes.value.storeConfig) {
        const cfg = cfgRes.value.storeConfig;
        if (!cfg.name || cfg.name === 'ShopEase') {
          cfg.name = 'Nakoda Imitation';
          cfg.tagline = 'Premium Imitation Jewelry & Lifestyle Collection';
        }
        setStoreConfig(cfg);
      }
    } catch (err) {
      console.info('Using local client cache for catalog');
    }
  }, []);

  // Initial Sync on Client Mount
  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // Broadcast to other open browser tabs
  const broadcastLocal = useCallback((type, payload) => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type, payload });
      } catch (e) {}
    }
  }, []);

  // Real-time Event Handler (from SSE stream and BroadcastChannel)
  const handleRealtimeEvent = useCallback((event) => {
    if (!event || !event.type) return;
    const { type, payload } = event;

    switch (type) {
      case 'PRODUCT_CREATED':
        if (payload?.product) {
          setProducts((prev) => [payload.product, ...prev.filter((p) => String(p.id).trim() !== String(payload.product.id).trim())]);
        }
        fetchCatalogData();
        break;
      case 'PRODUCT_UPDATED':
        if (payload?.product) {
          setProducts((prev) => prev.map((p) => (String(p.id).trim() === String(payload.product.id).trim() ? { ...p, ...payload.product } : p)));
        }
        fetchCatalogData();
        break;
      case 'PRODUCT_DELETED':
        if (payload?.id) {
          const delId = String(payload.id).trim();
          setProducts((prev) => prev.filter((p) => String(p.id).trim() !== delId));
        }
        fetchCatalogData();
        break;
      case 'PRODUCTS_BULK_DELETED':
        if (Array.isArray(payload?.ids)) {
          const idSet = new Set(payload.ids.map((x) => String(x).trim()));
          setProducts((prev) => prev.filter((p) => !idSet.has(String(p.id).trim())));
        }
        fetchCatalogData();
        break;
      case 'CATEGORY_CREATED':
        if (payload?.category) {
          setCategories((prev) => [...prev.filter((c) => c.id !== payload.category.id), payload.category]);
        }
        fetchCatalogData();
        break;
      case 'CATEGORY_UPDATED':
        if (payload?.category) {
          setCategories((prev) => prev.map((c) => (c.id === payload.category.id ? { ...c, ...payload.category } : c)));
        }
        fetchCatalogData();
        break;
      case 'CATEGORY_DELETED':
        if (payload?.id) {
          setCategories((prev) => prev.filter((c) => c.id !== payload.id));
        }
        fetchCatalogData();
        break;
      case 'OFFER_CREATED':
        if (payload?.offer) {
          setOffers((prev) => [payload.offer, ...prev.filter((o) => o.id !== payload.offer.id)]);
        }
        fetchCatalogData();
        break;
      case 'OFFER_UPDATED':
        if (payload?.offer) {
          setOffers((prev) => prev.map((o) => (o.id === payload.offer.id ? { ...o, ...payload.offer } : o)));
        }
        fetchCatalogData();
        break;
      case 'OFFER_DELETED':
        if (payload?.id) {
          setOffers((prev) => prev.filter((o) => o.id !== payload.id));
        }
        fetchCatalogData();
        break;
      case 'CONFIG_UPDATED':
        if (payload?.storeConfig) {
          setStoreConfig(payload.storeConfig);
        }
        fetchCatalogData();
        break;
      case 'CATALOG_SEEDED':
      case 'CATALOG_CLEARED':
      case 'SEED_TEMPLATE_UPDATED':
        fetchCatalogData();
        break;
      default:
        break;
    }
  }, [fetchCatalogData]);

  // Connect to SSE Live Stream & Cross-Tab Broadcast Channel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Cross-Tab Real-Time Sync Channel
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('nakoda_realtime_v1');
        broadcastChannelRef.current = bc;
        bc.onmessage = (ev) => {
          if (ev.data) handleRealtimeEvent(ev.data);
        };
      }
    } catch (e) {}

    // 2. Server-Sent Events (SSE) Persistent Real-time Stream
    let eventSource = null;
    let reconnectTimeout = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/realtime');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };

        eventSource.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (data.type && data.type !== 'CONNECTED') {
              handleRealtimeEvent(data);
            }
          } catch (err) {}
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Auto-reconnect after 3s
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        setIsLiveConnected(false);
      }
    }

    connectSSE();

    // 3. Tab Visibility listener (Auto-refresh whenever tab becomes active)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCatalogData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Periodic lightweight heartbeat sync every 45 seconds
    const syncInterval = setInterval(() => {
      fetchCatalogData();
    }, 45000);

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncInterval);
    };
  }, [handleRealtimeEvent, fetchCatalogData]);

  // ─────────────────── Product Actions ───────────────────
  const addProduct = useCallback(async (productData) => {
    const id = productData.id || `prod-${Date.now()}`;
    const newProduct = {
      ...productData,
      id,
      rating: Number(productData.rating) || 5.0,
      reviews: Number(productData.reviews) || 0,
      discountPercent: productData.oldPrice && productData.price && productData.oldPrice > productData.price
        ? Math.round(((productData.oldPrice - productData.price) / productData.oldPrice) * 100)
        : Number(productData.discountPercent) || 0,
      stockCount: Number(productData.stockCount) || 0,
      stockStatus: Number(productData.stockCount) <= 0 
        ? 'out_of_stock' 
        : Number(productData.stockCount) < 5 
        ? 'low_stock' 
        : 'in_stock',
      tags: Array.isArray(productData.tags) 
        ? productData.tags 
        : typeof productData.tags === 'string' 
        ? productData.tags.split(',').map((t) => t.trim()).filter(Boolean) 
        : [],
    };

    // 1. Immediate optimistic state update
    setProducts((prev) => [newProduct, ...prev.filter((p) => String(p.id).trim() !== String(newProduct.id).trim())]);
    broadcastLocal('PRODUCT_CREATED', { product: newProduct });
    logActivity(`Added new product "${newProduct.name}"`, 'product', 'Plus');

    // 2. Persist to MongoDB Server / Fallback JSON database
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [
          data.product,
          ...prev.filter(
            (p) => String(p.id).trim() !== String(newProduct.id).trim() && String(p.id).trim() !== String(data.product.id).trim()
          ),
        ]);
        broadcastLocal('PRODUCT_CREATED', { product: data.product });
      }
    } catch (e) {
      console.warn('Product save to DB failed', e);
    }

    return newProduct;
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const updateProduct = useCallback(async (id, updatedFields) => {
    const cleanId = String(id).trim();
    let mergedProduct = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (String(p.id).trim() === cleanId) {
          const merged = { ...p, ...updatedFields };
          if (merged.oldPrice && merged.price && merged.oldPrice > merged.price) {
            merged.discountPercent = Math.round(((merged.oldPrice - merged.price) / merged.oldPrice) * 100);
          }
          if (merged.stockCount !== undefined) {
            const count = Number(merged.stockCount);
            merged.stockCount = count;
            if (count <= 0) merged.stockStatus = 'out_of_stock';
            else if (count < 5) merged.stockStatus = 'low_stock';
            else merged.stockStatus = 'in_stock';
          }
          mergedProduct = merged;
          return merged;
        }
        return p;
      })
    );
    if (mergedProduct) {
      broadcastLocal('PRODUCT_UPDATED', { product: mergedProduct });
    }
    logActivity(`Updated product "${updatedFields.name || cleanId}"`, 'product', 'Edit3');

    try {
      await fetch(`/api/products/${cleanId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.warn('Product update to DB failed', e);
    }
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const deleteProduct = useCallback(async (id) => {
    const cleanId = String(id).trim();
    let deletedName = cleanId;
    setProducts((prev) => {
      const target = prev.find((p) => String(p.id).trim() === cleanId);
      if (target) deletedName = target.name;
      return prev.filter((p) => String(p.id).trim() !== cleanId);
    });
    broadcastLocal('PRODUCT_DELETED', { id: cleanId });
    logActivity(`Deleted product "${deletedName}"`, 'delete', 'Trash2');

    try {
      await fetch(`/api/products/${cleanId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Product delete to DB failed', e);
    }
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const duplicateProduct = useCallback(async (id) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const duplicated = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Copy)`,
      badge: 'NEW',
      badgeType: 'new',
    };
    setProducts((prev) => [duplicated, ...prev]);
    logActivity(`Duplicated product "${source.name}"`, 'product', 'Copy');

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(duplicated),
      });
    } catch (e) {}

    return duplicated;
  }, [products, logActivity]);

  const togglePopular = useCallback(async (id) => {
    let nextVal = false;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          nextVal = !p.isPopular;
          logActivity(`${nextVal ? 'Featured' : 'Unfeatured'} "${p.name}" on Homepage`, 'feature', 'Star');
          return { ...p, isPopular: nextVal };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPopular: nextVal }),
      });
    } catch (e) {}
  }, [logActivity]);

  const toggleFeatured = useCallback(async (id) => {
    let nextVal = false;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          nextVal = !p.isFeatured;
          logActivity(`${nextVal ? 'Marked' : 'Unmarked'} "${p.name}" as Featured`, 'feature', 'Sparkles');
          return { ...p, isFeatured: nextVal };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isFeatured: nextVal }),
      });
    } catch (e) {}
  }, [logActivity]);

  const updateProductStock = useCallback(async (id, countOrDelta, isDelta = false) => {
    let newCount = 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const current = p.stockCount || 0;
          newCount = Math.max(0, isDelta ? current + countOrDelta : countOrDelta);
          let status = 'in_stock';
          if (newCount === 0) status = 'out_of_stock';
          else if (newCount < 5) status = 'low_stock';
          return { ...p, stockCount: newCount, stockStatus: status };
        }
        return p;
      })
    );
    logActivity(`Adjusted stock for product #${id}`, 'inventory', 'Package');

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stockCount: newCount }),
      });
    } catch (e) {}
  }, [logActivity]);

  // Bulk Product Actions
  const bulkUpdateCategory = useCallback(async (productIds, newCategory, newCategoryName) => {
    setProducts((prev) =>
      prev.map((p) =>
        productIds.includes(p.id)
          ? { ...p, category: newCategory, categoryName: newCategoryName || newCategory }
          : p
      )
    );
    logActivity(`Bulk moved ${productIds.length} products to "${newCategoryName || newCategory}"`, 'bulk', 'Layers');

    try {
      await Promise.allSettled(
        productIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ category: newCategory, categoryName: newCategoryName || newCategory }),
          })
        )
      );
    } catch (e) {}
  }, [logActivity]);

  const bulkApplyDiscount = useCallback(async (productIds, discountPercent) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (productIds.includes(p.id)) {
          const basePrice = p.oldPrice || p.price;
          const newPrice = Math.round(basePrice * (1 - discountPercent / 100));
          return {
            ...p,
            oldPrice: basePrice,
            price: newPrice,
            discountPercent,
            badge: `${discountPercent}% OFF`,
            badgeType: 'discount',
          };
        }
        return p;
      })
    );
    logActivity(`Applied ${discountPercent}% discount to ${productIds.length} products`, 'offer', 'Tag');

    try {
      await Promise.allSettled(
        productIds.map((id) => {
          const p = products.find((x) => x.id === id);
          const basePrice = p?.oldPrice || p?.price || 1000;
          const newPrice = Math.round(basePrice * (1 - discountPercent / 100));
          return fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              oldPrice: basePrice,
              price: newPrice,
              discountPercent,
              badge: `${discountPercent}% OFF`,
              badgeType: 'discount',
            }),
          });
        })
      );
    } catch (e) {}
  }, [products, logActivity]);

  const bulkDeleteProducts = useCallback(async (productIds) => {
    setProducts((prev) => prev.filter((p) => !productIds.includes(p.id)));
    broadcastLocal('PRODUCTS_BULK_DELETED', { ids: productIds });
    logActivity(`Bulk deleted ${productIds.length} products`, 'delete', 'Trash2');

    try {
      await Promise.allSettled(
        productIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          })
        )
      );
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const bulkUpdateStockStatus = useCallback(async (productIds, stockStatus, stockCount = 10) => {
    setProducts((prev) =>
      prev.map((p) =>
        productIds.includes(p.id)
          ? { ...p, stockStatus, stockCount: stockStatus === 'out_of_stock' ? 0 : stockCount }
          : p
      )
    );
    logActivity(`Bulk updated stock for ${productIds.length} products to ${stockStatus}`, 'inventory', 'Package');

    try {
      await Promise.allSettled(
        productIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              stockStatus,
              stockCount: stockStatus === 'out_of_stock' ? 0 : stockCount,
            }),
          })
        )
      );
    } catch (e) {}
  }, [getAuthHeaders, logActivity]);

  // ─────────────────── Category Actions ───────────────────
  const addCategory = useCallback(async (categoryData) => {
    const id = categoryData.id || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      ...categoryData,
      id,
      color: categoryData.color || '#6257FF',
      accentBg: categoryData.accentBg || 'bg-[#F5F3FF]',
      iconColor: categoryData.iconColor || 'text-[#6257FF]',
      icon: categoryData.icon || 'LayoutGrid',
      itemCount: '0 Items',
    };
    setCategories((prev) => [...prev.filter((c) => c.id !== newCat.id), newCat]);
    broadcastLocal('CATEGORY_CREATED', { category: newCat });
    logActivity(`Created category "${newCat.name}"`, 'category', 'FolderPlus');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) => [...prev.filter((c) => c.id !== newCat.id && c.id !== data.category.id), data.category]);
      }
    } catch (e) {}
    return newCat;
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const updateCategory = useCallback(async (id, updatedFields) => {
    let mergedCat = null;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          mergedCat = { ...c, ...updatedFields };
          return mergedCat;
        }
        return c;
      })
    );
    if (mergedCat) {
      broadcastLocal('CATEGORY_UPDATED', { category: mergedCat });
    }
    if (updatedFields.name) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === id ? { ...p, categoryName: updatedFields.name } : p
        )
      );
    }
    logActivity(`Updated category "${updatedFields.name || id}"`, 'category', 'Edit3');

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const deleteCategory = useCallback(async (id) => {
    let catName = id;
    setCategories((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) catName = target.name;
      return prev.filter((c) => c.id !== id);
    });
    broadcastLocal('CATEGORY_DELETED', { id });
    logActivity(`Deleted category "${catName}"`, 'delete', 'Trash2');

    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  // ─────────────────── Offers Actions ───────────────────
  const addOffer = useCallback(async (offerData) => {
    const id = offerData.id || `offer-${Date.now()}`;
    const newOffer = {
      ...offerData,
      id,
      code: (offerData.code || 'SAVE10').toUpperCase().trim(),
      isActive: offerData.isActive !== false,
      popular: !!offerData.popular,
      gradient: offerData.gradient || 'from-[#6257FF] to-[#4F46E5]',
      bgLight: offerData.bgLight || 'bg-[#F5F3FF]',
      textColor: offerData.textColor || 'text-[#6257FF]',
      borderColor: offerData.borderColor || 'border-[#EAE6FD]',
      badgeColor: offerData.badgeColor || 'bg-[#EDE9FE] text-[#6257FF]',
      icon: offerData.icon || '🎁',
    };
    setOffers((prev) => [newOffer, ...prev.filter((o) => o.id !== newOffer.id)]);
    broadcastLocal('OFFER_CREATED', { offer: newOffer });
    logActivity(`Created promo offer "${newOffer.code}" (${newOffer.title})`, 'offer', 'Tag');

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newOffer),
      });
      const data = await res.json();
      if (data.success && data.offer) {
        setOffers((prev) => [data.offer, ...prev.filter((o) => o.id !== newOffer.id && o.id !== data.offer.id)]);
      }
    } catch (e) {}
    return newOffer;
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const updateOffer = useCallback(async (id, updatedFields) => {
    let mergedOffer = null;
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          mergedOffer = { ...o, ...updatedFields };
          return mergedOffer;
        }
        return o;
      })
    );
    if (mergedOffer) {
      broadcastLocal('OFFER_UPDATED', { offer: mergedOffer });
    }
    logActivity(`Updated offer "${updatedFields.code || id}"`, 'offer', 'Edit3');

    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const deleteOffer = useCallback(async (id) => {
    let codeName = id;
    setOffers((prev) => {
      const target = prev.find((o) => o.id === id);
      if (target) codeName = target.code || target.id;
      return prev.filter((o) => o.id !== id);
    });
    broadcastLocal('OFFER_DELETED', { id });
    logActivity(`Deleted offer "${codeName}"`, 'delete', 'Trash2');

    try {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const toggleOfferActive = useCallback(async (id) => {
    let nextVal = false;
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          nextVal = !o.isActive;
          logActivity(`${nextVal ? 'Activated' : 'Paused'} offer "${o.code}"`, 'offer', 'ToggleRight');
          return { ...o, isActive: nextVal };
        }
        return o;
      })
    );

    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: nextVal }),
      });
    } catch (e) {}
  }, [getAuthHeaders, logActivity]);

  // ─────────────────── Store Settings & Master Seed Actions ───────────────────
  const updateStoreConfig = useCallback(async (newConfig) => {
    setStoreConfig((prev) => ({ ...prev, ...newConfig }));
    broadcastLocal('CONFIG_UPDATED', { storeConfig: newConfig });
    logActivity('Updated store contact & configuration', 'settings', 'Settings');

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newConfig),
      });
    } catch (e) {}
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const restoreMasterSeed = useCallback(async () => {
    logActivity('Restoring master seed catalog into live database...', 'system', 'RotateCcw');
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'restore_defaults' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCatalogData();
        logActivity('Catalog successfully seeded from master template', 'system', 'CheckCircle2');
        return { success: true, count: data.count };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [getAuthHeaders, fetchCatalogData, logActivity]);

  const saveCurrentAsMasterSeed = useCallback(async () => {
    logActivity('Saving current catalog as updateable master seed template...', 'system', 'Save');
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_seed',
          template: { products, categories, offers, storeConfig },
        }),
      });
      const data = await res.json();
      if (data.success) {
        logActivity(`Master seed template updated to v${data.template?.version || 1}`, 'system', 'CheckCircle2');
        return { success: true, version: data.template?.version };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [getAuthHeaders, products, categories, offers, storeConfig, logActivity]);

  const clearAllCatalog = useCallback(async () => {
    setProducts([]);
    setCategories([]);
    setOffers([]);
    broadcastLocal('CATALOG_CLEARED', {});
    logActivity('Permanently wiped all catalog products, categories, and offers', 'delete', 'Trash2');

    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'clear_catalog' }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [getAuthHeaders, broadcastLocal, logActivity]);

  const resetToDefaults = useCallback(() => {
    restoreMasterSeed();
  }, [restoreMasterSeed]);

  const exportCatalogJson = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      storeConfig,
      products,
      categories,
      offers,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nakoda-imitation-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logActivity('Exported store catalog backup JSON', 'system', 'Download');
  }, [storeConfig, products, categories, offers, logActivity]);

  const importCatalogJson = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (Array.isArray(parsed.offers)) setOffers(parsed.offers);
      if (parsed.storeConfig) setStoreConfig(parsed.storeConfig);
      logActivity('Imported catalog backup successfully', 'system', 'Upload');
      return { success: true, count: parsed.products?.length || 0 };
    } catch (err) {
      console.error('Import failed', err);
      return { success: false, error: err.message };
    }
  }, [logActivity]);

  // ─────────────────── Derived Statistics ───────────────────
  const catalogStats = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stockStatus === 'low_stock' || (p.stockCount > 0 && p.stockCount < 5));
    const outOfStock = products.filter((p) => p.stockStatus === 'out_of_stock' || p.stockCount <= 0);
    const inStock = products.filter((p) => p.stockStatus === 'in_stock' && p.stockCount >= 5);
    const featured = products.filter((p) => p.isPopular || p.isFeatured);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * (p.stockCount || 1)), 0);
    const activeOffers = offers.filter((o) => o.isActive !== false);

    // Products per category count
    const countByCat = {};
    products.forEach((p) => {
      countByCat[p.category] = (countByCat[p.category] || 0) + 1;
    });

    return {
      totalProducts,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      inStockCount: inStock.length,
      featuredCount: featured.length,
      totalInventoryValue,
      activeOffersCount: activeOffers.length,
      totalCategoriesCount: categories.length,
      countByCat,
      lowStockList: lowStock,
      outOfStockList: outOfStock,
      featuredList: featured,
    };
  }, [products, categories, offers]);

  // Dynamic category list for the storefront with dynamic product counts
  const storefrontCategories = useMemo(() => {
    const allCount = products.length;
    const catList = [
      { id: 'all', name: 'All Products', count: allCount, icon: 'LayoutGrid', color: '#6257FF', accentBg: 'bg-[#F5F3FF]', iconColor: 'text-[#6257FF]' },
      ...categories.map((c) => ({
        ...c,
        count: catalogStats.countByCat[c.id] || 0,
      })),
    ];
    return catList;
  }, [categories, products.length, catalogStats.countByCat]);

  // Featured / Popular products for the home page
  const homePopularProducts = useMemo(() => {
    const flagged = products.filter((p) => p.isPopular || p.isFeatured);
    return flagged.length > 0 ? flagged.slice(0, 8) : products.slice(0, 4);
  }, [products]);

  const value = {
    products,
    categories,
    offers,
    storeConfig,
    activities,
    catalogStats,
    storefrontCategories,
    homePopularProducts,
    isLiveConnected,
    // Operations
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    togglePopular,
    toggleFeatured,
    updateProductStock,
    bulkUpdateCategory,
    bulkApplyDiscount,
    bulkDeleteProducts,
    bulkUpdateStockStatus,
    addCategory,
    updateCategory,
    deleteCategory,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    updateStoreConfig,
    restoreMasterSeed,
    saveCurrentAsMasterSeed,
    clearAllCatalog,
    resetToDefaults,
    fetchCatalogData,
    refreshCatalog: fetchCatalogData,
    exportCatalogJson,
    importCatalogJson,
    logActivity,
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};

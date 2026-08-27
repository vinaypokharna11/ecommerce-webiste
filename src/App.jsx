import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeatureBenefits } from './components/FeatureBenefits';
import { Categories } from './components/Categories';
import { PopularProducts } from './components/PopularProducts';
import { PromoBanner } from './components/PromoBanner';
import { CatalogPage } from './components/CatalogPage';
import { OffersPage } from './components/OffersPage';
import { CartPage } from './components/CartPage';
import { ProfilePage, INITIAL_ORDERS } from './components/ProfilePage';
import { FloatingCartBar } from './components/FloatingCartBar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { QuickViewModal } from './components/QuickViewModal';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { createHelpWhatsAppUrl } from './utils/whatsapp';
import { SlidersHorizontal, ArrowLeft, Sparkles } from 'lucide-react';

function AppContent() {
  const { products, storeConfig, catalogStats } = useCatalog();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState({});
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
    const routableTabs = ['home', 'catalog', 'offers', 'cart', 'profile', 'admin'];
    if (routableTabs.includes(id)) {
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // Favorite toggle handler (handles both product object and string ID)
  const handleToggleFavorite = (productOrId) => {
    const productId = typeof productOrId === 'string' ? productOrId : productOrId?.id;
    if (!productId) return;
    const foundProduct = typeof productOrId === 'object' && productOrId?.name 
      ? productOrId 
      : products.find((p) => p.id === productId);
    const productName = foundProduct?.name || 'Item';

    const isCurrentlyFav = !wishlist[productId];
    if (isCurrentlyFav) {
      addToast('heart', 'Saved to Wishlist ❤️', `${productName} added to your favorites.`);
    } else {
      addToast('info', 'Removed from Wishlist 💔', `${productName} was removed from favorites.`);
    }

    setWishlist((prev) => ({ ...prev, [productId]: isCurrentlyFav }));
  };

  // Switch to catalog
  const handleExploreCatalog = (cat = 'all') => {
    setSelectedCategory(cat);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order placed handler
  const handlePlaceOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    addToast(
      'cart',
      'Order Confirmed! 🎉',
      `Order ${newOrder.id} has been placed successfully.`
    );
  };

  // Smart Footer link handler
  const handleFooterLinkClick = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('product') || lower.includes('arrival') || lower.includes('seller')) {
      handleExploreCatalog('all');
    } else if (lower.includes('offer')) {
      setActiveTab('offers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lower.includes('whatsapp') || lower.includes('help')) {
      window.open(createHelpWhatsAppUrl(storeConfig.whatsappNumber), '_blank');
    } else if (lower.includes('about') || lower.includes('location')) {
      addToast('info', 'Store Location 📍', `${storeConfig.name}, ${storeConfig.address}. Open: ${storeConfig.hours}`);
    } else if (lower.includes('return') || lower.includes('shipping')) {
      addToast('info', 'Store Policies 🚚', `Enjoy free shipping on orders above ${storeConfig.currency}999 & easy 7-day returns!`);
    } else if (lower.includes('privacy') || lower.includes('terms') || lower.includes('cookie')) {
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavClick(lower, label);
    }
  };

  // If in Admin Mode, render the Admin Panel layout full screen
  if (activeTab === 'admin') {
    return (
      <div className="relative min-h-screen bg-[#FAF9FF]">
        <AdminLayout onExitAdmin={() => handleNavClick('home', 'Home')} />
        <Toast toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

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

      {/* Main Content Area: Switches smoothly between Home, Catalog, Offers, Cart, Profile */}
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
            onNotify={addToast}
          />
        )}

        {activeTab === 'offers' && (
          <OffersPage onExploreCatalog={() => handleExploreCatalog('all')} />
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

      {/* Quick Floating "Admin Panel" launcher pill on the bottom left corner */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavClick('admin', 'Admin Panel')}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#15152A]/90 hover:bg-[#15152A] text-white shadow-[0_10px_30px_rgba(21,21,42,0.3)] backdrop-blur-md border border-white/20 text-xs font-bold transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6257FF] to-[#EC5AC8] flex items-center justify-center text-white">
            <SlidersHorizontal className="w-3 h-3" />
          </div>
          <span>Admin Panel</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold text-[#FFD6F0]">
            {catalogStats.totalProducts} Items
          </span>
        </motion.button>
      </div>

      {/* Footer */}
      <Footer onLinkClick={handleFooterLinkClick} />

      {/* Interactive Micro-Toasts */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Quick View Modal (Available on Home & Catalog) */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        cartQuantity={quickViewProduct ? (cartItems[quickViewProduct.id]?.quantity || 0) : 0}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}

export function App() {
  return (
    <CatalogProvider>
      <AppContent />
    </CatalogProvider>
  );
}

export default App;

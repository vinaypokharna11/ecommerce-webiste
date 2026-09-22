/**
 * Central Barrel Export for Components
 * Organizes components into clean semantic layers:
 * layout, common, product, home, cart, catalog, offers, profile, contact.
 */

// Layout
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';
export { default as FloatingCartBar } from './layout/FloatingCartBar';
export { default as SmoothScrollProvider } from './layout/SmoothScrollProvider';
export { default as GsapScrollAnimations } from './layout/GsapScrollAnimations';
export { default as NavigationProgressBar } from './layout/NavigationProgressBar';

// Common / Modals / Notifications / Animations
export { default as Toast } from './common/Toast';
export { default as QuickViewModal } from './common/QuickViewModal';
export { default as AuthModal } from './common/AuthModal';
export { default as BrandLoadingScreen } from './common/BrandLoadingScreen';
export { TextScatter, ScatterItem } from './ui/text-scatter';
export { Hero17 } from './ui/hero-17';
export { AccordionGallery } from './ui/AccordionGallery';
export { InfiniteMenu } from './ui/InfiniteMenu';
export { default as ScrollStack, ScrollStackItem } from './ui/ScrollStack';

// Product Catalog & Browsing
export { default as ProductCard } from './product/ProductCard';
export { default as PopularProducts } from './product/PopularProducts';
export { default as Categories } from './product/Categories';
export { default as RecentlyViewed } from './product/RecentlyViewed';
export { default as FilterDrawer } from './product/FilterDrawer';

// Home Page Sections
export { default as HeroSection } from './home/HeroSection';
export { default as FeatureBenefits } from './home/FeatureBenefits';
export { default as PromoBanner } from './home/PromoBanner';

// Domain Pages
export { default as CartPage } from './cart/CartPage';
export { default as CatalogPage } from './catalog/CatalogPage';
export { default as OffersPage } from './offers/OffersPage';
export { default as ProfilePage } from './profile/ProfilePage';
export { default as ContactInquirePage } from './contact/ContactInquirePage';
export { OrderChatModal } from './orders/OrderChatModal';

import './globals.css';
import { CatalogProvider } from '@/context/CatalogContext';

export const metadata = {
  title: {
    default: 'ShopEase — Shop Smart. Live Better.',
    template: '%s | ShopEase',
  },
  description: 'Explore high quality products, exclusive offers, and instant WhatsApp ordering at ShopEase — your trusted neighborhood store in Bangalore.',
  keywords: ['ShopEase', 'online store', 'Bangalore shop', 'electronics', 'fashion', 'home living', 'WhatsApp order', 'bulk inquiry'],
  authors: [{ name: 'ShopEase Store' }],
  creator: 'ShopEase',
  metadataBase: new URL('https://shopease.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://shopease.in',
    title: 'ShopEase — Shop Smart. Live Better.',
    description: 'Quality products, exclusive deals & instant WhatsApp ordering. Electronics, Fashion, Home Living & more.',
    siteName: 'ShopEase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopEase — Shop Smart. Live Better.',
    description: 'Quality products, exclusive deals & instant WhatsApp ordering. Electronics, Fashion, Home Living & more.',
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: '#6257FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#6257FF" />
      </head>
      <body className="bg-[#FAF9FF] text-[#15152A] font-sans antialiased selection:bg-[#6257FF] selection:text-white">
        <CatalogProvider>
          {children}
        </CatalogProvider>
      </body>
    </html>
  );
}

import './globals.css';
import { CatalogProvider } from '@/context/CatalogContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const metadata = {
  title: {
    default: 'Nakoda Imitation — Premium Jewelry & Lifestyle',
    template: '%s | Nakoda Imitation',
  },
  description: 'Explore premium imitation jewelry, fashion accessories, and instant WhatsApp ordering at Nakoda Imitation in Bangalore.',
  keywords: ['Nakoda Imitation', 'imitation jewelry', 'online store', 'Bangalore jewelry', 'fashion accessories', 'WhatsApp order'],
  authors: [{ name: 'Nakoda Imitation Store' }],
  creator: 'Nakoda Imitation',
  metadataBase: new URL('https://nakodaimitation.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nakodaimitation.com',
    title: 'Nakoda Imitation — Premium Jewelry & Lifestyle',
    description: 'Premium imitation jewelry, fashion accessories & instant WhatsApp ordering.',
    siteName: 'Nakoda Imitation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nakoda Imitation — Premium Jewelry & Lifestyle',
    description: 'Premium imitation jewelry, fashion accessories & instant WhatsApp ordering.',
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: '#9FD842',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#9FD842" />
      </head>
      <body className="bg-[#F5F5F3] text-[#171717] font-sans antialiased selection:bg-[#9FD842] selection:text-[#171717]">
        <AuthProvider>
          <CatalogProvider>
            {children}
            <AuthModal />
          </CatalogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

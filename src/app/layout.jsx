import './globals.css';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import { CatalogProvider } from '@/context/CatalogContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { GsapScrollAnimations } from '@/components/GsapScrollAnimations';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

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
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#9FD842" />
      </head>
      <body
        className="bg-[#F5F5F3] text-[#171717] font-sans antialiased selection:bg-[#9FD842] selection:text-[#171717]"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <AuthProvider>
            <CatalogProvider>
              <GsapScrollAnimations>
                {children}
                <AuthModal />
              </GsapScrollAnimations>
            </CatalogProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

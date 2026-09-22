import './globals.css';
import { DM_Sans } from 'next/font/google';
import { CatalogProvider } from '@/context/CatalogContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal, SmoothScrollProvider, GsapScrollAnimations, NavigationProgressBar } from '@/components';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Nakoda Store — Premium Shopping & Lifestyle',
    template: '%s | Nakoda Store',
  },
  description: 'Shop premium bags, jewelry, trolleys, gourmet papad, apparel, undergarments, electronics and more with fast Pan-India delivery and WhatsApp ordering.',
  keywords: ['online store', 'ecommerce', 'bags', 'jewelry', 'trolley bags', 'papad', 'undergarments', 'fashion', 'electronics', 'Vapi shopping', 'Gujarat shopping'],
  authors: [{ name: 'Nakoda Store' }],
  creator: 'Nakoda Store',
  metadataBase: new URL('https://nakodaimitation.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: '/favicon.jpg',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body
        className="bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-[#0071E3] selection:text-white"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <AuthProvider>
            <CatalogProvider>
              <GsapScrollAnimations>
                <NavigationProgressBar />
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

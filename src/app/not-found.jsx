import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Compass, Home } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | Nakoda Imitation',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col justify-between font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Top Brand Bar */}
      <header className="w-full border-b border-black/[0.05] bg-white/80 backdrop-blur-md py-4 px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm">
            N
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1D1D1F]">
            Nakoda Imitation
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#F5F5F7] text-[#1D1D1F] mb-6 shadow-xs border border-black/[0.04]">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0071E3]">404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] max-w-sm mx-auto mb-8 leading-relaxed">
            The link you followed might be broken, or the page may have been removed or renamed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-bold hover:bg-black active:scale-95 transition-all inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/?tab=catalog"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold hover:bg-[#E8E8ED] active:scale-95 transition-all inline-flex items-center justify-center gap-2 border border-black/[0.04]"
            >
              <Compass className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-6 text-center text-xs text-[#86868B] border-t border-black/[0.04]">
        © 2026 Nakoda Imitation. All rights reserved.
      </footer>
    </div>
  );
}

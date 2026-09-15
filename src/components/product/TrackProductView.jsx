'use client';

import { useEffect } from 'react';

/**
 * TrackProductView
 * 
 * Lightweight client component to record visits on dedicated product pages
 * into localStorage ('nakoda_recent_v3').
 */
export function TrackProductView({ productId }) {
  useEffect(() => {
    if (!productId || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('nakoda_recent_v3');
      const prev = raw ? JSON.parse(raw) : [];
      const updated = [productId, ...prev.filter((id) => id !== productId)].slice(0, 8);
      localStorage.setItem('nakoda_recent_v3', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to track recently viewed product', e);
    }
  }, [productId]);

  return null;
}

export default TrackProductView;

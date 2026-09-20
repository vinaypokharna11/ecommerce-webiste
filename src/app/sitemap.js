import { getProducts, getCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Next.js Dynamic Sitemap Generator (/sitemap.xml)
 * Automatically aggregates static routes, product categories, and active products
 * for search engine indexation (Google, Bing, DuckDuckGo).
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nakodaimitation.com';

  // 1. Static Storefront Pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Categories
  let categoryRoutes = [];
  try {
    const categories = await getCategories();
    categoryRoutes = (categories || []).map((cat) => ({
      url: `${baseUrl}/catalog?category=${encodeURIComponent(cat.id || cat.slug || '')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.warn('Sitemap category fetch notice:', e.message);
  }

  // 3. Dynamic Products
  let productRoutes = [];
  try {
    const products = await getProducts({});
    productRoutes = (products || []).map((p) => ({
      url: `${baseUrl}/product/${encodeURIComponent(p.id)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }));
  } catch (e) {
    console.warn('Sitemap product fetch notice:', e.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

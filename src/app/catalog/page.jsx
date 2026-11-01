import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Catalog & Collections — Nakoda Imitation',
  description: 'Explore the complete jewelry and fashion accessories catalog at Nakoda Imitation.',
};

export default async function CatalogRoutePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams?.category;
  redirect(category ? `/?tab=catalog&category=${encodeURIComponent(category)}` : '/?tab=catalog');
}

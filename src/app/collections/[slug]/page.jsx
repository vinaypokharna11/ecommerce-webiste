import { notFound, redirect } from 'next/navigation';
import { getExploreCollectionByIdOrSlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = await getExploreCollectionByIdOrSlug(slug);

  if (!collection || collection.isDeleted || collection.isActive === false) {
    return {
      title: 'Collection Not Found — Nakoda Imitation',
    };
  }

  return {
    title: `${collection.name} — Explore Collection | Nakoda Imitation`,
    description: collection.description || `Browse the ${collection.name} collection at Nakoda Imitation.`,
  };
}

export default async function CollectionDetailPage({ params }) {
  const { slug } = await params;
  const collection = await getExploreCollectionByIdOrSlug(slug);

  // If deleted or hidden from public storefront, return 404
  if (!collection || collection.isDeleted || collection.isActive === false) {
    notFound();
  }

  const targetCategory = collection.categoryId || collection.id;
  redirect(`/?tab=catalog&category=${encodeURIComponent(targetCategory)}`);
}

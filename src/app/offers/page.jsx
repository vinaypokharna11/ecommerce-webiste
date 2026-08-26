import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Exclusive Offers & Deals — Nakoda Imitation',
  description: 'Special discounts, promo coupon codes, and bundle offers at Nakoda Imitation.',
};

export default function OffersRoutePage() {
  redirect('/?tab=offers');
}

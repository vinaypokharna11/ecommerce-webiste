import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Shopping Bag & Checkout — Nakoda Imitation',
  description: 'View your cart items, apply discount coupons, and complete instant WhatsApp checkout at Nakoda Imitation.',
};

export default function CartRoutePage() {
  redirect('/?tab=cart');
}

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Saved Wishlist — Nakoda Imitation',
  description: 'View and manage your saved favorite products and jewelry at Nakoda Imitation.',
};

export default function WishlistRoutePage() {
  redirect('/?tab=wishlist');
}

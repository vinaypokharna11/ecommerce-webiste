import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Account & Orders — Nakoda Imitation',
  description: 'Manage your profile, view past orders, tracked shipments, and delivery addresses.',
};

export default function ProfileRoutePage() {
  redirect('/?tab=profile');
}

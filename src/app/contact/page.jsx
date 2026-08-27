import { Suspense } from 'react';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us & Inquiries | Nakoda Imitation',
  description: 'Get in touch with Nakoda Imitation. Submit product inquiries, bulk order requests, or contact our support team. WhatsApp, email, and in-store visit options available.',
};

export default function ContactRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9FF]" />}>
      <ContactClient />
    </Suspense>
  );
}

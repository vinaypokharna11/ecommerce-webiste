'use client';

import React, { Suspense } from 'react';
import { LoginContent } from '../login/page';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F5F0]" />}>
      <LoginContent defaultTab="signup" />
    </Suspense>
  );
}


'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firePartyPopper } from '@/utils/confetti';
import { AuthHeader, AuthCard } from '@/components/auth';

export function LoginContent({ defaultTab = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTab = searchParams?.get('tab');
  const initialMode = paramTab ? (paramTab === 'signup' ? 'signup' : 'login') : defaultTab;

  const { login, signup, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' | 'signup'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already authenticated and not admin, redirect to storefront
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      const redirect = searchParams?.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, user, router, searchParams]);

  // Handle Tab Switch
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setError('');
    setSuccessMessage('');
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        if (res.isAdmin) {
          setSuccessMessage('Admin credentials verified! Opening Admin Portal...');
          firePartyPopper();
          setTimeout(() => {
            window.location.href = '/admin';
          }, 200);
        } else {
          setSuccessMessage('Welcome back! Logging you in...');
          firePartyPopper();
          const redirect = searchParams?.get('redirect') || '/';
          setTimeout(() => {
            router.push(redirect);
          }, 500);
        }
      } else {
        setError(res.error || 'Invalid credentials. Please check your email & password.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Name, email, and password are required to create an account.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword.trim(),
      });

      if (res.success) {
        firePartyPopper();
        setSuccessMessage('Account created successfully! Welcome to Nakoda Imitation 🎉');
        setTimeout(() => {
          const redirect = searchParams?.get('redirect') || '/';
          router.push(redirect);
        }, 800);
      } else {
        setError(res.error || 'Failed to create account. Email may already be registered.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#171717] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#9FD842] selection:text-[#171717]">
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#9FD842]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#8EC731]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <AuthHeader storeName="Nakoda Imitation" backHref="/" />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthCard
          activeTab={activeTab}
          onTabChange={handleTabChange}
          error={error}
          successMessage={successMessage}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          handleLogin={handleLogin}
          signupName={signupName}
          setSignupName={setSignupName}
          signupEmail={signupEmail}
          setSignupEmail={setSignupEmail}
          signupPhone={signupPhone}
          setSignupPhone={setSignupPhone}
          signupPassword={signupPassword}
          setSignupPassword={setSignupPassword}
          handleSignup={handleSignup}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
        />
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#777777]">
        © 2026 Nakoda Imitation. All rights reserved.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F3]" />}>
      <LoginContent defaultTab="login" />
    </Suspense>
  );
}

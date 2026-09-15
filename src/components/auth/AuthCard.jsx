'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AuthTabs } from './AuthTabs';
import { AuthMessage } from './AuthMessage';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthCard({
  activeTab,
  onTabChange,
  error,
  successMessage,
  // Login props
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  handleLogin,
  // Signup props
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupPhone,
  setSignupPhone,
  signupPassword,
  setSignupPassword,
  handleSignup,
  // Shared state
  showPassword,
  setShowPassword,
  isLoading,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[32px] border border-black/[0.08] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative z-10"
    >
      {/* Brand Icon Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-[16px] bg-[#171717] flex items-center justify-center mx-auto mb-3 shadow-md">
          <span className="text-[#9FD842] text-xl font-black tracking-tight">N</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
          {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          {activeTab === 'login'
            ? 'Sign in to access your orders, saved items, and account details'
            : 'Sign up for the first time to track orders & access exclusive prices'}
        </p>
      </div>

      {/* Tab Switcher: Login vs Sign Up */}
      <AuthTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Alerts / Error & Success Banners */}
      <AuthMessage error={error} successMessage={successMessage} />

      {/* Tab 1: Login Form */}
      {activeTab === 'login' && (
        <LoginForm
          email={loginEmail}
          setEmail={setLoginEmail}
          password={loginPassword}
          setPassword={setLoginPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          onSubmit={handleLogin}
        />
      )}

      {/* Tab 2: Signup Form */}
      {activeTab === 'signup' && (
        <SignupForm
          name={signupName}
          setName={setSignupName}
          email={signupEmail}
          setEmail={setSignupEmail}
          phone={signupPhone}
          setPhone={setSignupPhone}
          password={signupPassword}
          setPassword={setSignupPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          onSubmit={handleSignup}
        />
      )}
    </motion.div>
  );
}

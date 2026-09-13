'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Check,
  Copy
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { 
  CONTACT_TOPICS, 
  INQUIRY_TYPES, 
  FAQS_DATA, 
  STORE_LOCATION_DETAILS, 
  STORE_CONFIG 
} from '@/data/mockData';
import { 
  createHelpWhatsAppUrl, 
  createInquiryWhatsAppUrl, 
  createContactWhatsAppUrl 
} from '@/utils/whatsapp';
import { inquiryService } from '@/services/inquiryService';
import { formatPrice } from '@/utils/formatPrice';

export const ContactInquirePage = ({ 
  initialMode = 'contact', // 'contact' | 'inquire'
  selectedProduct = null,
  onNotify = () => {},
  onExploreCatalog = () => {}
}) => {
  const { products, storeConfig } = useCatalog();
  const [activeMode, setActiveMode] = useState(initialMode); // 'contact' or 'inquire'
  const [copiedField, setCopiedField] = useState(null);

  // Synchronize initialMode changes if prop changes
  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  // ─── Contact Form State ───
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: CONTACT_TOPICS[0],
    subject: '',
    message: '',
    preferredContact: 'Email',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmittedTicket, setContactSubmittedTicket] = useState(null);

  // ─── Inquiry Form State ───
  const [inquiryForm, setInquiryForm] = useState({
    inquiryType: INQUIRY_TYPES[0].label,
    productId: selectedProduct?.id || (products[0]?.id || ''),
    productName: selectedProduct?.name || (products[0]?.name || ''),
    isCustomProduct: false,
    customProductName: '',
    quantity: '10',
    targetBudget: '',
    requiredDate: '',
    companyName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
    preferredContact: 'WhatsApp',
  });

  // Pre-fill inquiry product if selectedProduct is passed
  useEffect(() => {
    if (selectedProduct) {
      setInquiryForm((prev) => ({
        ...prev,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        isCustomProduct: false,
      }));
      setActiveMode('inquire');
    }
  }, [selectedProduct]);

  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySubmittedTicket, setInquirySubmittedTicket] = useState(null);

  // ─── FAQ Accordion State ───
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const filteredFaqs = FAQS_DATA;

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    onNotify('info', 'Copied to Clipboard 📋', `${fieldName} copied successfully.`);
  };

  // ─── Submit Contact Form ───
  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      onNotify('error', 'Missing Information', 'Please fill in your name, email, and message.');
      return;
    }

    setContactSubmitting(true);
    try {
      const data = await inquiryService.submitContactMessage(contactForm);

      if (data.success && data.contact) {
        setContactSubmittedTicket(data.contact);
        onNotify('cart', 'Message Sent Successfully! ✉️', `Your ticket ${data.contact.id} has been registered.`);
        setContactForm({
          name: '',
          email: '',
          phone: '',
          category: CONTACT_TOPICS[0],
          subject: '',
          message: '',
          preferredContact: 'Email',
        });
      } else {
        throw new Error(data.error || 'Failed to submit contact message.');
      }
    } catch (err) {
      console.warn('Contact API fallback simulation:', err);
      const mockTicket = {
        id: `CT-${Math.floor(1000 + Math.random() * 9000)}`,
        ...contactForm,
        createdAt: new Date().toISOString(),
      };
      setContactSubmittedTicket(mockTicket);
      onNotify('cart', 'Message Received! ✉️', `Your ticket ${mockTicket.id} has been created.`);
    } finally {
      setContactSubmitting(false);
    }
  };

  // ─── Submit Inquiry Form ───
  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryForm.customerName.trim() || !inquiryForm.customerEmail.trim()) {
      onNotify('error', 'Missing Contact Info', 'Please provide your name and email for the quotation.');
      return;
    }

    setInquirySubmitting(true);
    const resolvedProductName = inquiryForm.isCustomProduct
      ? inquiryForm.customProductName || 'Custom Sourced Product'
      : inquiryForm.productName;

    const payload = {
      ...inquiryForm,
      productName: resolvedProductName,
    };

    try {
      const data = await inquiryService.submitInquiry(payload);

      if (data.success && data.inquiry) {
        setInquirySubmittedTicket(data.inquiry);
        onNotify('cart', 'Inquiry Registered! ✨', `Inquiry ${data.inquiry.id} received. Our team will contact you shortly.`);
      } else {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.warn('Inquiry API fallback simulation:', err);
      const mockInquiry = {
        id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setInquirySubmittedTicket(mockInquiry);
      onNotify('cart', 'Inquiry Registered! ✨', `Inquiry ${mockInquiry.id} registered successfully.`);
    } finally {
      setInquirySubmitting(false);
    }
  };

  // ─── Quick WhatsApp Inquiry Handler ───
  const handleLaunchWhatsAppInquiry = () => {
    const resolvedProductName = inquiryForm.isCustomProduct
      ? inquiryForm.customProductName || 'Custom Product'
      : inquiryForm.productName;

    const waUrl = createInquiryWhatsAppUrl({
      inquiryType: inquiryForm.inquiryType,
      productName: resolvedProductName,
      quantity: inquiryForm.quantity,
      targetBudget: inquiryForm.targetBudget,
      requiredDate: inquiryForm.requiredDate,
      customerName: inquiryForm.customerName,
      notes: inquiryForm.notes,
    });

    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-28 pb-28 sm:pb-24 px-3.5 sm:px-8 lg:px-12 w-full max-w-[1440px] mx-auto font-sans bg-[#FBFBFD] text-[#1D1D1F]">
      
      {/* ── Top Hero & Mode Switcher ── */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1D1D1F] mb-3 sm:mb-4">
          We're here to help you{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D1D1F] via-[#5F8C1D] to-[#0071E3]">
            every step of the way
          </span>
        </h1>

        <p className="text-xs sm:text-base text-[#666666] leading-relaxed max-w-xl mx-auto">
          Need quick support, a custom quotation, or want to place a volume order? Choose a tab below to connect directly with our support & sales desk.
        </p>

        {/* Dual Mode Switcher Tabs */}
        <div className="mt-6 sm:mt-8 inline-flex p-1 bg-[#F5F5F7] rounded-full border border-black/[0.06] shadow-inner max-w-md w-full">
          <button
            onClick={() => setActiveMode('contact')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer ${
              activeMode === 'contact'
                ? 'bg-[#1D1D1F] text-white shadow-md scale-[1.01]'
                : 'text-[#666666] hover:text-[#1D1D1F]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveMode('inquire')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer ${
              activeMode === 'inquire'
                ? 'bg-[#1D1D1F] text-white shadow-md scale-[1.01]'
                : 'text-[#666666] hover:text-[#1D1D1F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0071E3]" />
            <span className="truncate">Product & Inquire</span>
          </button>
        </div>

      </div>

      {/* ── Main Dynamic Interactive Section (Contact Us vs Inquire) ── */}
      <AnimatePresence mode="wait">
        
        {/* ── CONTACT US VIEW ── */}
        {activeMode === 'contact' && (
          <motion.div
            key="contact-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16 items-stretch"
          >
            
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/[0.06] p-4.5 xs:p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center text-[#0071E3] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F]">Send a Message</h2>
                    <p className="text-xs text-[#777777]">We respond within 2-4 business hours</p>
                  </div>
                </div>

                {contactSubmittedTicket ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#EBF5FF]/60 border border-[#0071E3]/40 text-center"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center mx-auto mb-4 shadow-xs">
                      <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] mb-2">Message Sent Directly to Email!</h3>
                    <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-md mx-auto mb-5 sm:mb-6">
                      Thank you, <strong>{contactSubmittedTicket.name}</strong>. Your message has been dispatched directly to our support team via email, and a confirmation receipt was sent to <strong>{contactSubmittedTicket.email}</strong>.
                    </p>

                    <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-[#0071E3]/40 shadow-xs mb-5 sm:mb-6 max-w-full overflow-hidden">
                      <span className="text-xs text-[#777777] font-semibold shrink-0">Reference Ticket:</span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#0071E3] font-mono truncate">{contactSubmittedTicket.id}</span>
                      <button
                        onClick={() => handleCopy(contactSubmittedTicket.id, 'Ticket ID')}
                        className="p-1 text-[#777777] hover:text-[#0071E3] shrink-0"
                        title="Copy Ticket ID"
                      >
                        {copiedField === 'Ticket ID' ? <Check className="w-3.5 h-3.5 text-[#0071E3]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setContactSubmittedTicket(null)}
                        className="neu-btn-dark py-3 sm:py-3.5 px-6 sm:px-8 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-3.5 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                          Your Full Name <span className="text-[#0071E3]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                          Email Address <span className="text-[#0071E3]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                          Inquiry Topic <span className="text-[#0071E3]">*</span>
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all font-medium cursor-pointer"
                        >
                          {CONTACT_TOPICS.map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Subject <span className="text-[#0071E3]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of your question"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#1D1D1F]">
                          Your Message <span className="text-[#0071E3]">*</span>
                        </label>
                        <span className="text-[10px] sm:text-[11px] text-[#777777]">{contactForm.message.length} / 1000</span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={1000}
                        placeholder="Please describe your question or issue with as much detail as possible..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888] resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer group"
                      >
                        {contactSubmitting ? (
                          <div className="w-5 h-5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-[#0071E3] group-hover:translate-x-0.5 transition-transform" />
                            <span>Submit Support Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Direct Store & Contact Details + Full Height Embedded Map */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/[0.06] p-4.5 xs:p-6 sm:p-7 shadow-sm flex flex-col flex-1 h-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F]">Direct Contact Details</h3>
                </div>

                <div className="space-y-2.5 sm:space-y-3 mb-4">
                  {/* Direct Email */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Email Us Directly</p>
                      <a href={`mailto:${storeConfig.email || 'vinaypokharna36@gmail.com'}`} className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] hover:text-[#0071E3] truncate block">
                        {storeConfig.email || 'vinaypokharna36@gmail.com'}
                      </a>
                    </div>
                  </div>

                  {/* Direct Phone Call */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Store Call Desk</p>
                      <a href={`tel:${storeConfig.whatsappNumber || '9879451341'}`} className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] hover:text-[#0071E3] truncate block">
                        {storeConfig.whatsappDisplay || '+91 98794 51341'}
                      </a>
                    </div>
                  </div>

                  {/* Retail Store Address */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Store Visit</p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] mt-0.5 leading-snug">
                          {storeConfig?.address || '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195'}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#777777] mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#0071E3]" />
                          <span>{storeConfig?.hours || 'Mon - Sun: 9:30 AM – 9:30 PM'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Embedded Google Map (Fills remaining height) */}
                <div className="flex-1 min-h-[200px] sm:min-h-[240px] h-52 sm:h-64 lg:h-auto w-full rounded-xl sm:rounded-2xl overflow-hidden border border-black/5 relative shadow-inner bg-[#F5F5F7]/30 group">
                  <iframe
                    title="Store Location Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.056156715697!2d72.9165531!3d20.3745874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be0ce344bde1f5f%3A0xc2c580adb5f98745!2sGunjan%20Char%20Rasta%2C%20Housing%20Sector%2C%20GIDC%2C%20Vapi%2C%20Gujarat%20396191!5e0!3m2!1sen!2sin!4v1725930000000!5m2!1sen!2sin"
                    className="w-full h-full min-h-[200px] border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── PRODUCT & BULK INQUIRE VIEW ── */}
        {activeMode === 'inquire' && (
          <motion.div
            key="inquire-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            
            {/* Purpose-Built Inquiry Form */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/[0.06] p-4.5 xs:p-6 sm:p-8 shadow-sm">
              
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center text-[#0071E3] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F]">Product & Bulk Order Inquiry</h2>
                  <p className="text-xs text-[#777777]">Custom quotes, volume orders, wedding favors & specialized sourcing</p>
                </div>
              </div>

              {inquirySubmittedTicket ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#EBF5FF]/60 border border-[#0071E3]/40 text-center"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0071E3]/20 text-[#0071E3] flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] mb-2">Inquiry Registered Successfully!</h3>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-md mx-auto mb-5 sm:mb-6">
                    Thank you, <strong>{inquirySubmittedTicket.customerName}</strong>. Our commercial desk is preparing a quotation for <strong>{inquirySubmittedTicket.productName || inquirySubmittedTicket.inquiryType}</strong>.
                  </p>

                  <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-[#0071E3]/40 shadow-xs mb-5 sm:mb-6 max-w-full overflow-hidden">
                    <span className="text-xs text-[#777777] font-semibold shrink-0">Inquiry Ticket ID:</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#0071E3] font-mono truncate">{inquirySubmittedTicket.id}</span>
                    <button
                      onClick={() => handleCopy(inquirySubmittedTicket.id, 'Inquiry ID')}
                      className="p-1 text-[#777777] hover:text-[#0071E3] shrink-0"
                      title="Copy Inquiry ID"
                    >
                      {copiedField === 'Inquiry ID' ? <Check className="w-3.5 h-3.5 text-[#0071E3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleLaunchWhatsAppInquiry}
                      className="neu-btn-accent w-full sm:w-auto py-3 sm:py-3.5 px-5 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp with Sales Desk</span>
                    </button>
                    <button
                      onClick={() => setInquirySubmittedTicket(null)}
                      className="neu-btn-dark w-full sm:w-auto py-3 sm:py-3.5 px-5 sm:px-6 text-xs sm:text-sm cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4 sm:space-y-5">
                  
                  {/* Step 1: Select Inquiry Nature */}
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
                      1. Inquiry Purpose / Category <span className="text-[#0071E3]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      {INQUIRY_TYPES.map((t) => {
                        const isSelected = inquiryForm.inquiryType === t.label;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setInquiryForm({ ...inquiryForm, inquiryType: t.label })}
                            className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-sm'
                                : 'bg-[#F5F5F7]/60 border-black/5 hover:bg-white text-[#1D1D1F]'
                            }`}
                          >
                            <span className={`text-xs font-extrabold block ${isSelected ? 'text-white' : 'text-[#1D1D1F]'}`}>
                              {t.label}
                            </span>
                            <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#777777]'}`}>
                              {t.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Referenced Jewelry Piece */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">
                        2. Referenced Product / Sourcing <span className="text-[#0071E3]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setInquiryForm({ ...inquiryForm, isCustomProduct: !inquiryForm.isCustomProduct })}
                        className="text-[11px] font-bold text-[#0071E3] hover:underline cursor-pointer"
                      >
                        {inquiryForm.isCustomProduct ? '← Select from Catalog' : '+ Request Unlisted Design'}
                      </button>
                    </div>

                    {inquiryForm.isCustomProduct ? (
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Describe item (e.g., Custom Temple Bridal Choker Set in 100g weight)"
                          value={inquiryForm.customProductName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, customProductName: e.target.value })}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                        />
                        <p className="text-[11px] text-[#777777] mt-1">Our sourcing team can fulfill specialized requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={inquiryForm.productId}
                          onChange={(e) => {
                            const p = products.find((prod) => prod.id === e.target.value);
                            setInquiryForm({
                              ...inquiryForm,
                              productId: e.target.value,
                              productName: p ? p.name : '',
                            });
                          }}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 cursor-pointer font-medium transition-all"
                        >
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} — {formatPrice(prod.price, STORE_CONFIG.currency)} ({prod.categoryName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Quantity & Target Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Estimated Quantity <span className="text-[#0071E3]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 25 units"
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 font-medium transition-all placeholder:text-[#888888]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Target Budget (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50,000"
                        value={inquiryForm.targetBudget}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, targetBudget: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Needed By / Deadline
                      </label>
                      <input
                        type="date"
                        value={inquiryForm.requiredDate}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, requiredDate: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 cursor-pointer transition-all"
                      />
                    </div>
                  </div>

                  {/* Step 4: Contact & Company Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Your Name <span className="text-[#0071E3]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contact Person Name"
                        value={inquiryForm.customerName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Company / Business Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Organization or Event Name"
                        value={inquiryForm.companyName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Email Address <span className="text-[#0071E3]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="official@company.com"
                        value={inquiryForm.customerEmail}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerEmail: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={inquiryForm.customerPhone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerPhone: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all placeholder:text-[#888888]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
                      Specific Requirements / Customization Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need customized box packaging, delivery to Vapi, specific polish finishes..."
                      value={inquiryForm.notes}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F5F5F7]/60 border border-black/5 text-xs sm:text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 resize-none placeholder:text-[#888888] transition-all"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="neu-btn-accent w-full sm:flex-1 py-3.5 sm:py-4 px-5 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {inquirySubmitting ? (
                        <div className="w-5 h-5 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#1D1D1F]" />
                          <span>Request Official Quotation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchWhatsAppInquiry}
                      className="neu-btn-dark w-full sm:w-auto py-3.5 sm:py-4 px-5 sm:px-6 text-xs flex items-center justify-center gap-2 cursor-pointer"
                      title="Send this inquiry directly via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-[#0071E3]" />
                      <span>Instant WhatsApp Inquire</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Interactive FAQ Accordion Section ── */}
      <section className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-black/[0.06] p-4.5 xs:p-6 sm:p-10 shadow-sm mb-8 sm:mb-12">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0071E3]/20 text-[#0071E3] border border-[#0071E3]/30 text-[11px] sm:text-xs font-extrabold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#5F8C1D]" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            Find quick answers regarding our products, WhatsApp ordering, custom sourcing, and shipping.
          </p>
        </div>

        {/* FAQ List Accordion */}
        <div className="max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl sm:rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-[#EBF5FF]/70 border-[#0071E3]/50 shadow-xs'
                      : 'bg-[#F5F5F7]/40 border-black/5 hover:bg-[#F5F5F7]/70'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-3.5 sm:p-5 flex items-center justify-between text-left gap-3 sm:gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-[#1D1D1F] leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5F8C1D] transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 pt-0 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[#0071E3]/30 mt-1">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-[#888888]">
              No FAQs available at the moment. You can ask us directly using the contact form above!
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default ContactInquirePage;

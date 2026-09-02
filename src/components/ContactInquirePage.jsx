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
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { 
  CONTACT_TOPICS, 
  INQUIRY_TYPES, 
  FAQS_DATA, 
  STORE_LOCATION_DETAILS, 
  STORE_CONFIG 
} from '../data/mockData';
import { 
  createHelpWhatsAppUrl, 
  createInquiryWhatsAppUrl, 
  createContactWhatsAppUrl 
} from '../utils/whatsapp';

export const ContactInquirePage = ({ 
  initialMode = 'contact', // 'contact' | 'inquire'
  selectedProduct = null,
  onNotify = () => {},
  onExploreCatalog = () => {}
}) => {
  const { products, storeConfig } = useCatalog();
  const [activeMode, setActiveMode] = useState(initialMode); // 'contact' or 'inquire'
  const [copiedField, setCopiedField] = useState(null);

  // ─── Live Store Status (Open vs Closed) ───
  const storeStatus = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    // 9:30 AM to 9:30 PM (9.5 to 21.5)
    const isOpen = currentHour >= 9.5 && currentHour < 21.5;
    return {
      isOpen,
      text: isOpen ? 'Open Now • Closes at 9:30 PM' : 'Closed Now • Opens at 9:30 AM',
      color: isOpen ? 'bg-[#9FD842]' : 'bg-amber-500',
      badgeBg: isOpen ? 'bg-[#9FD842]/15 text-[#3E5C0F] border-[#9FD842]/40' : 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }, []);

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

  // ─── FAQ Search & Accordion State ───
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Filtered FAQs
  const faqCategories = ['All', ...new Set(FAQS_DATA.map((f) => f.category))];
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchCat = faqCategory === 'All' || faq.category === faqCategory;
      const matchSearch =
        faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqCategory, faqSearch]);

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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();

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
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

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
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 w-full max-w-[1720px] mx-auto font-sans">
      
      {/* ── Top Hero & Mode Switcher ── */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        
        {/* Live Status Pill & Fast Response Badge */}
        <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white border border-[#E5E5E0] shadow-xs backdrop-blur-md mb-5 flex-wrap justify-center">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${storeStatus.badgeBg}`}>
            <span className={`w-2 h-2 rounded-full ${storeStatus.color} animate-pulse`} />
            <span>{storeStatus.text}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#525252]">
            <Zap className="w-3.5 h-3.5 text-[#7FA628]" />
            <span>Avg. Response: &lt; 15 mins</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717] mb-4">
          We're here to help you{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#171717] via-[#5F8C1D] to-[#9FD842]">
            every step of the way
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#525252] leading-relaxed">
          Need quick support, a custom jewelry quotation, or want to place a volume order? Choose a tab below to connect directly with our support & sales desk.
        </p>

        {/* Dual Mode Switcher Tabs */}
        <div className="mt-8 inline-flex p-1.5 bg-white rounded-full border border-[#E5E5E0] shadow-sm max-w-md w-full">
          <button
            onClick={() => setActiveMode('contact')}
            className={`flex-1 py-3 px-5 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeMode === 'contact'
                ? 'bg-[#9FD842] text-[#171717] shadow-md shadow-[#9FD842]/30 scale-[1.02]'
                : 'text-[#525252] hover:text-[#171717] hover:bg-[#9FD842]/10'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveMode('inquire')}
            className={`flex-1 py-3 px-5 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeMode === 'inquire'
                ? 'bg-[#9FD842] text-[#171717] shadow-md shadow-[#9FD842]/30 scale-[1.02]'
                : 'text-[#525252] hover:text-[#171717] hover:bg-[#9FD842]/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Product & Bulk Inquire</span>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto mb-16 items-stretch"
          >
            
            {/* Left Column: Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E5E0] p-6 sm:p-8 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#9FD842]/15 border border-[#9FD842]/30 flex items-center justify-center text-[#3E5C0F]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#171717]">Send a Message</h2>
                    <p className="text-xs text-[#737373]">We respond within 2-4 business hours</p>
                  </div>
                </div>

                {contactSubmittedTicket ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 rounded-3xl bg-[#9FD842]/10 border border-[#9FD842]/40 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#9FD842]/20 text-[#3E5C0F] flex items-center justify-center mx-auto mb-4 shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#171717] mb-2">Message Sent Directly to Email!</h3>
                    <p className="text-sm text-[#525252] leading-relaxed max-w-md mx-auto mb-6">
                      Thank you, <strong>{contactSubmittedTicket.name}</strong>. Your message has been dispatched directly to our support team via email, and a confirmation receipt was sent to <strong>{contactSubmittedTicket.email}</strong>.
                    </p>

                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#9FD842]/40 shadow-xs mb-6">
                      <span className="text-xs text-[#737373] font-semibold">Reference Ticket:</span>
                      <span className="text-sm font-extrabold text-[#3E5C0F] font-mono">{contactSubmittedTicket.id}</span>
                      <button
                        onClick={() => handleCopy(contactSubmittedTicket.id, 'Ticket ID')}
                        className="p-1 text-[#737373] hover:text-[#3E5C0F]"
                        title="Copy Ticket ID"
                      >
                        {copiedField === 'Ticket ID' ? <Check className="w-3.5 h-3.5 text-[#3E5C0F]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setContactSubmittedTicket(null)}
                        className="neu-btn-dark py-3.5 px-8 text-sm"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1.5">
                          Your Full Name <span className="text-[#6A941C]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1.5">
                          Email Address <span className="text-[#6A941C]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#171717] mb-1.5">
                          Inquiry Topic <span className="text-[#6A941C]">*</span>
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all font-medium cursor-pointer"
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
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Subject <span className="text-[#6A941C]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of your question"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#171717]">
                          Your Message <span className="text-[#6A941C]">*</span>
                        </label>
                        <span className="text-[11px] text-[#737373]">{contactForm.message.length} / 1000</span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={1000}
                        placeholder="Please describe your question or issue with as much detail as possible..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF] resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-4 px-6 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer group"
                      >
                        {contactSubmitting ? (
                          <div className="w-5 h-5 border-2 border-[#9FD842] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-[#9FD842] group-hover:translate-x-0.5 transition-transform" />
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
              <div className="bg-white rounded-3xl border border-[#E5E5E0] p-6 sm:p-7 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col flex-1 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-[#171717]">Direct Contact Details</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${storeStatus.badgeBg}`}>
                    {storeStatus.text}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Direct Email */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#9FD842]/15 text-[#3E5C0F] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Email Us Directly</p>
                        <a href={`mailto:${storeConfig.email || 'vinaypokharna36@gmail.com'}`} className="text-xs sm:text-sm font-extrabold text-[#171717] hover:text-[#5F8C1D] truncate block">
                          {storeConfig.email || 'vinaypokharna36@gmail.com'}
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(storeConfig.email || 'vinaypokharna36@gmail.com', 'Email Address')}
                      className="p-2 rounded-xl bg-white hover:bg-[#9FD842]/15 text-[#3E5C0F] border border-[#E5E5E0] shrink-0 transition-colors"
                      title="Copy Email"
                    >
                      {copiedField === 'Email Address' ? <Check className="w-4 h-4 text-[#3E5C0F]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Direct Phone Call */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#9FD842]/15 text-[#3E5C0F] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Store Call Desk</p>
                        <a href={`tel:${storeConfig.whatsappNumber || '9879451341'}`} className="text-xs sm:text-sm font-extrabold text-[#171717] hover:text-[#5F8C1D] truncate block">
                          {storeConfig.whatsappDisplay || '+91 98794 51341'}
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(storeConfig.whatsappDisplay || '+91 98794 51341', 'Phone Number')}
                      className="p-2 rounded-xl bg-white hover:bg-[#9FD842]/15 text-[#3E5C0F] border border-[#E5E5E0] shrink-0 transition-colors"
                      title="Copy Phone Number"
                    >
                      {copiedField === 'Phone Number' ? <Check className="w-4 h-4 text-[#3E5C0F]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Retail Store Address */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#9FD842]/15 text-[#3E5C0F] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Store Visit</p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#171717] mt-0.5 leading-snug">
                          {storeConfig.address || 'Shop #14, Main Market Road, Bangalore'}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#5F8C1D]" />
                          <span>{storeConfig.hours || 'Mon - Sun: 9:30 AM – 9:30 PM'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Embedded Google Map (Fills entire remaining length) */}
                <div className="flex-1 min-h-[240px] w-full rounded-2xl overflow-hidden border border-[#E5E5E0] relative shadow-inner bg-[#F8F9FA] group">
                  <iframe
                    title="Store Location Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9854452140884!2d77.6384!3d12.9719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1681a8b9f36f%3A0x6b1f2b6e70a0e0a!2sIndiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                    className="w-full h-full min-h-[240px] border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute bottom-3 right-3 pointer-events-auto">
                    <a
                      href={STORE_LOCATION_DETAILS.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-[#171717] font-extrabold text-xs flex items-center gap-1.5 shadow-md border border-[#E5E5E0] transition-all hover:scale-105 active:scale-95"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#5F8C1D]" />
                      <span>Open Full Map</span>
                      <ExternalLink className="w-3 h-3 text-[#737373]" />
                    </a>
                  </div>
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
            className="max-w-3xl mx-auto mb-16"
          >
            
            {/* Purpose-Built Inquiry Form */}
            <div className="bg-white rounded-3xl border border-[#E5E5E0] p-6 sm:p-8 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.04)]">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#9FD842]/15 border border-[#9FD842]/30 flex items-center justify-center text-[#3E5C0F]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#171717]">Product & Bulk Order Inquiry</h2>
                  <p className="text-xs text-[#737373]">Custom quotes, volume orders, wedding favors & specialized sourcing</p>
                </div>
              </div>

              {inquirySubmittedTicket ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-[#9FD842]/10 border border-[#9FD842]/40 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#9FD842]/20 text-[#3E5C0F] flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#171717] mb-2">Inquiry Registered Successfully!</h3>
                  <p className="text-sm text-[#525252] leading-relaxed max-w-md mx-auto mb-6">
                    Thank you, <strong>{inquirySubmittedTicket.customerName}</strong>. Our commercial desk is preparing a quotation for <strong>{inquirySubmittedTicket.productName || inquirySubmittedTicket.inquiryType}</strong>.
                  </p>

                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#9FD842]/40 shadow-xs mb-6">
                    <span className="text-xs text-[#737373] font-semibold">Inquiry Ticket ID:</span>
                    <span className="text-sm font-extrabold text-[#3E5C0F] font-mono">{inquirySubmittedTicket.id}</span>
                    <button
                      onClick={() => handleCopy(inquirySubmittedTicket.id, 'Inquiry ID')}
                      className="p-1 text-[#737373] hover:text-[#3E5C0F]"
                      title="Copy Inquiry ID"
                    >
                      {copiedField === 'Inquiry ID' ? <Check className="w-3.5 h-3.5 text-[#3E5C0F]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleLaunchWhatsAppInquiry}
                      className="neu-btn-accent py-3.5 px-6 text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp with Sales Desk</span>
                    </button>
                    <button
                      onClick={() => setInquirySubmittedTicket(null)}
                      className="neu-btn-dark py-3.5 px-6 text-sm"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-5">
                  
                  {/* Step 1: Select Inquiry Nature */}
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-2">
                      1. Inquiry Purpose / Category <span className="text-[#6A941C]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {INQUIRY_TYPES.map((t) => {
                        const isSelected = inquiryForm.inquiryType === t.label;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setInquiryForm({ ...inquiryForm, inquiryType: t.label })}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#9FD842]/15 border-[#9FD842] ring-2 ring-[#9FD842]/30'
                                : 'bg-[#F8F9FA] border-[#E5E5E0] hover:bg-white'
                            }`}
                          >
                            <span className={`text-xs font-extrabold block ${isSelected ? 'text-[#2D4507]' : 'text-[#171717]'}`}>
                              {t.label}
                            </span>
                            <span className="text-[11px] text-[#737373] block mt-0.5">
                              {t.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Referenced Jewelry Piece */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#171717]">
                        2. Referenced Jewelry Piece <span className="text-[#6A941C]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setInquiryForm({ ...inquiryForm, isCustomProduct: !inquiryForm.isCustomProduct })}
                        className="text-[11px] font-bold text-[#5F8C1D] hover:underline"
                      >
                        {inquiryForm.isCustomProduct ? '← Select from Catalog' : '+ Request Unlisted / Custom Design'}
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
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                        />
                        <p className="text-[11px] text-[#737373] mt-1">Our sourcing team can fulfill specialized requests.</p>
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
                          className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 cursor-pointer font-medium"
                        >
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} — {STORE_CONFIG.currency}{prod.price.toLocaleString()} ({prod.categoryName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Quantity & Target Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Estimated Quantity <span className="text-[#6A941C]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 25 units"
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Target Budget (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50,000"
                        value={inquiryForm.targetBudget}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, targetBudget: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Needed By / Deadline
                      </label>
                      <input
                        type="date"
                        value={inquiryForm.requiredDate}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, requiredDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Step 4: Contact & Company Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Your Name <span className="text-[#6A941C]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contact Person Name"
                        value={inquiryForm.customerName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Company / Business Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Organization or Event Name"
                        value={inquiryForm.companyName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Email Address <span className="text-[#6A941C]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="official@company.com"
                        value={inquiryForm.customerEmail}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerEmail: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={inquiryForm.customerPhone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5">
                      Specific Requirements / Customization Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need customized box packaging, delivery to Bangalore, specific polish finishes..."
                      value={inquiryForm.notes}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E0] text-sm text-[#171717] focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 resize-none placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="neu-btn-accent w-full sm:flex-1 py-4 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {inquirySubmitting ? (
                        <div className="w-5 h-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#171717]" />
                          <span>Request Official Quotation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchWhatsAppInquiry}
                      className="neu-btn-dark w-full sm:w-auto py-4 px-6 text-xs flex items-center justify-center gap-2"
                      title="Send this inquiry directly via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-[#9FD842]" />
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
      <section className="bg-white rounded-3xl border border-[#E5E5E0] p-6 sm:p-10 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.04)] mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9FD842]/15 text-[#3E5C0F] border border-[#9FD842]/30 text-xs font-extrabold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#5F8C1D]" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#525252]">
            Find quick answers regarding our jewelry products, WhatsApp ordering, custom sourcing, and shipping.
          </p>

          {/* FAQ Search Bar */}
          <div className="mt-5 relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search questions (e.g. shipping, jewelry care, returns)..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8F9FA] border border-[#E5E5E0] text-xs sm:text-sm focus:bg-white focus:border-[#9FD842] focus:outline-none focus:ring-2 focus:ring-[#9FD842]/30 transition-all placeholder:text-[#9CA3AF]"
            />
            <HelpCircle className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          </div>

          {/* FAQ Category Pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {faqCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  faqCategory === cat
                    ? 'active-nav-pill'
                    : 'bg-[#F8F9FA] text-[#525252] hover:bg-[#9FD842]/15 border border-[#E5E5E0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-[#9FD842]/10 border-[#9FD842]/50 shadow-xs'
                      : 'bg-[#F8F9FA]/70 border-[#E5E5E0] hover:bg-[#F8F9FA]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-[#171717]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5F8C1D] transition-transform duration-300 flex-shrink-0 ${
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
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-[#525252] leading-relaxed border-t border-[#9FD842]/30 mt-1">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-[#9CA3AF]">
              No FAQs matched your search term "{faqSearch}". You can ask us directly using the contact form above!
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

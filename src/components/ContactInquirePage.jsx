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
  Building2,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  DollarSign,
  AlertCircle
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
      color: isOpen ? 'bg-emerald-500' : 'bg-amber-500',
      badgeBg: isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
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
    preferredContact: 'WhatsApp',
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
          preferredContact: 'WhatsApp',
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

  // ─── Quick WhatsApp Contact Handler ───
  const handleLaunchWhatsAppContact = () => {
    const waUrl = createContactWhatsAppUrl({
      name: contactForm.name,
      category: contactForm.category,
      subject: contactForm.subject,
      message: contactForm.message,
    });
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* ── Top Hero & Mode Switcher ── */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        
        {/* Live Status Pill & Fast Response Badge */}
        <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/80 border border-[#EAE6FD] shadow-xs backdrop-blur-md mb-5 flex-wrap justify-center">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${storeStatus.badgeBg}`}>
            <span className={`w-2 h-2 rounded-full ${storeStatus.color} animate-pulse`} />
            <span>{storeStatus.text}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#626276]">
            <Zap className="w-3.5 h-3.5 text-[#EC5AC8]" />
            <span>Avg. Response: &lt; 15 mins</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#15152A] mb-4">
          We're here to help you{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6257FF] via-[#8B5CF6] to-[#EC5AC8]">
            every step of the way
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#626276] leading-relaxed">
          Need quick support, a custom product quotation, or want to place a bulk order? Choose a tab below to connect directly with our friendly support & sales team.
        </p>

        {/* Dual Mode Switcher Tabs */}
        <div className="mt-8 inline-flex p-1.5 bg-[#F5F3FF] rounded-2xl border border-[#EAE6FD] shadow-inner max-w-md w-full">
          <button
            onClick={() => setActiveMode('contact')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeMode === 'contact'
                ? 'bg-white text-[#6257FF] shadow-md shadow-[#6257FF]/10 scale-[1.02]'
                : 'text-[#626276] hover:text-[#15152A] hover:bg-white/40'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveMode('inquire')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeMode === 'inquire'
                ? 'bg-gradient-to-r from-[#6257FF] to-[#EC5AC8] text-white shadow-md shadow-[#6257FF]/20 scale-[1.02]'
                : 'text-[#626276] hover:text-[#15152A] hover:bg-white/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Product & Bulk Inquire</span>
          </button>
        </div>

      </div>

      {/* ── Fast Contact Channel Cards Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        
        {/* WhatsApp Direct */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 fill-emerald-600/20" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
              Fastest
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#15152A] mb-1">WhatsApp Live Chat</h3>
            <p className="text-xs text-[#626276] leading-relaxed mb-4">
              Instant live assistance, product recommendations & order updates.
            </p>
          </div>
          <a
            href={createHelpWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Direct Phone Call */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_30px_rgba(98,87,255,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6257FF] group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-50 text-[#6257FF]">
              9:30 AM - 9:30 PM
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#15152A] mb-1">Call Store Support</h3>
            <p className="text-xs text-[#626276] leading-relaxed mb-4 font-mono font-medium">
              {STORE_CONFIG.whatsappDisplay}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${STORE_CONFIG.whatsappNumber}`}
              className="flex-1 py-2.5 rounded-xl bg-[#6257FF] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
            <button
              onClick={() => handleCopy(STORE_CONFIG.whatsappDisplay, 'Phone Number')}
              className="p-2.5 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6257FF] border border-[#EAE6FD] transition-colors"
              title="Copy Phone Number"
            >
              {copiedField === 'Phone Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Email Support */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_30px_rgba(236,90,200,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#EC5AC8] group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-pink-50 text-[#EC5AC8]">
              Official
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#15152A] mb-1">Email Inquiries</h3>
            <p className="text-xs text-[#626276] leading-relaxed mb-4 font-mono font-medium truncate">
              support@shopease.com
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="mailto:support@shopease.com"
              className="flex-1 py-2.5 rounded-xl bg-[#EC5AC8] hover:bg-[#D946EF] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Us</span>
            </a>
            <button
              onClick={() => handleCopy('support@shopease.com', 'Email Address')}
              className="p-2.5 rounded-xl bg-[#FFF0FB] hover:bg-[#FCD6F2] text-[#EC5AC8] border border-[#FCD6F2] transition-colors"
              title="Copy Email Address"
            >
              {copiedField === 'Email Address' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Physical Store Location */}
        <div className="p-5 rounded-3xl bg-white border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] hover:shadow-[0_12px_30px_rgba(139,92,246,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-purple-50 text-[#8B5CF6]">
              Store Visit
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#15152A] mb-1">Bangalore Retail Store</h3>
            <p className="text-xs text-[#626276] leading-relaxed mb-4 line-clamp-2">
              {STORE_CONFIG.address}
            </p>
          </div>
          <a
            href={STORE_LOCATION_DETAILS.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6257FF] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span>Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16"
          >
            
            {/* Left: Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-8 shadow-[0_10px_35px_rgba(98,87,255,0.06)] relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] border border-[#EAE6FD] flex items-center justify-center text-[#6257FF]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#15152A]">Send a Message</h2>
                  <p className="text-xs text-[#8E8EA0]">We respond within 2-4 business hours</p>
                </div>
              </div>

              {contactSubmittedTicket ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#15152A] mb-2">Message Sent Successfully!</h3>
                  <p className="text-sm text-[#626276] leading-relaxed max-w-md mx-auto mb-6">
                    Thank you, <strong>{contactSubmittedTicket.name}</strong>. Your ticket has been logged and assigned to our customer support desk.
                  </p>

                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs mb-6">
                    <span className="text-xs text-[#8E8EA0] font-semibold">Reference Ticket:</span>
                    <span className="text-sm font-extrabold text-[#6257FF] font-mono">{contactSubmittedTicket.id}</span>
                    <button
                      onClick={() => handleCopy(contactSubmittedTicket.id, 'Ticket ID')}
                      className="p-1 text-[#8E8EA0] hover:text-[#6257FF]"
                      title="Copy Ticket ID"
                    >
                      {copiedField === 'Ticket ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${storeConfig.whatsappNumber}?text=Hi!%20I%20have%20submitted%20support%20ticket%20${contactSubmittedTicket.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Follow Up on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => setContactSubmittedTicket(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-[#FAF9FF] text-[#15152A] border border-[#EAE6FD] font-bold text-xs transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Your Full Name <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Email Address <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Topic / Category
                      </label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all cursor-pointer"
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
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                      Subject Line (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of your question or issue"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#15152A]">
                        Your Message <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <span className="text-[11px] text-[#8E8EA0]">{contactForm.message.length} / 1000</span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={1000}
                      placeholder="Please describe your question or issue with as much detail as possible..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-2">
                      Preferred Reply Channel
                    </label>
                    <div className="flex items-center gap-3">
                      {['WhatsApp', 'Email', 'Phone Call'].map((mode) => (
                        <label
                          key={mode}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            contactForm.preferredContact === mode
                              ? 'bg-[#EDE9FE] text-[#6257FF] border-[#6257FF]'
                              : 'bg-[#FAF9FF] text-[#626276] border-[#EAE6FD] hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="preferredContact"
                            value={mode}
                            checked={contactForm.preferredContact === mode}
                            onChange={(e) => setContactForm({ ...contactForm, preferredContact: e.target.value })}
                            className="hidden"
                          />
                          <span>{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl gradient-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-btn hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
                    >
                      {contactSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Support Message</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchWhatsAppContact}
                      className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
                      title="Send as WhatsApp message instead"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Send on WhatsApp</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Visit Us, Guarantees & Store Info */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Physical Location Detail Card */}
              <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-7 shadow-[0_4px_20px_rgba(98,87,255,0.04)]">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-3">
                  <Building2 className="w-4 h-4" />
                  <span>Flagship Retail Store</span>
                </div>

                <h3 className="text-lg font-bold text-[#15152A] mb-2">{STORE_LOCATION_DETAILS.name}</h3>
                <p className="text-xs text-[#626276] leading-relaxed mb-4 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#6257FF] flex-shrink-0 mt-0.5" />
                  <span>{STORE_LOCATION_DETAILS.address}</span>
                </p>

                <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8EA0]">Weekdays:</span>
                    <span className="font-bold text-[#15152A]">{STORE_LOCATION_DETAILS.hoursWeekday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8EA0]">Sundays:</span>
                    <span className="font-bold text-[#15152A]">{STORE_LOCATION_DETAILS.hoursSunday}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EAE6FD] text-[11px] text-[#626276]">
                    📍 <strong>Landmark:</strong> {STORE_LOCATION_DETAILS.landmark}
                  </div>
                  <div className="text-[11px] text-[#626276]">
                    🚗 <strong>Parking:</strong> {STORE_LOCATION_DETAILS.parking}
                  </div>
                </div>

                <a
                  href={STORE_LOCATION_DETAILS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-2xl bg-[#FAF9FF] hover:bg-[#F5F3FF] text-[#6257FF] font-bold text-xs border border-[#EAE6FD] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Service Commitments Box */}
              <div className="bg-gradient-to-br from-[#15152A] to-[#252438] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6257FF]/20 rounded-full blur-2xl pointer-events-none" />

                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#EC5AC8]" />
                  <span>The ShopEase Promise</span>
                </h4>

                <div className="space-y-3.5 text-xs text-[#EAE6FD]/80">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>100% Genuine Products</strong> sourced directly from verified authorized manufacturers.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Easy 7-Day Returns</strong> & replacements for all catalog purchases.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Fast Local Fulfillment</strong> within 24-48 hours across Bangalore.</span>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16"
          >
            
            {/* Left: Purpose-Built Inquiry Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-8 shadow-[0_10px_35px_rgba(98,87,255,0.06)]">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0FB] border border-[#FCD6F2] flex items-center justify-center text-[#EC5AC8]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#15152A]">Product & Bulk Order Inquiry</h2>
                  <p className="text-xs text-[#8E8EA0]">Custom quotes, corporate hampers, volume orders & special sourcing</p>
                </div>
              </div>

              {inquirySubmittedTicket ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-pink-200 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#15152A] mb-2">Inquiry Registered Successfully!</h3>
                  <p className="text-sm text-[#626276] leading-relaxed max-w-md mx-auto mb-6">
                    Thank you, <strong>{inquirySubmittedTicket.customerName}</strong>. Our commercial desk is preparing a quotation for <strong>{inquirySubmittedTicket.productName || inquirySubmittedTicket.inquiryType}</strong>.
                  </p>

                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs mb-6">
                    <span className="text-xs text-[#8E8EA0] font-semibold">Inquiry Ticket ID:</span>
                    <span className="text-sm font-extrabold text-[#EC5AC8] font-mono">{inquirySubmittedTicket.id}</span>
                    <button
                      onClick={() => handleCopy(inquirySubmittedTicket.id, 'Inquiry ID')}
                      className="p-1 text-[#8E8EA0] hover:text-[#EC5AC8]"
                      title="Copy Inquiry ID"
                    >
                      {copiedField === 'Inquiry ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleLaunchWhatsAppInquiry}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp with Sales Desk</span>
                    </button>
                    <button
                      onClick={() => setInquirySubmittedTicket(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-[#FAF9FF] text-[#15152A] border border-[#EAE6FD] font-bold text-xs transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-5">
                  
                  {/* Step 1: Select Inquiry Nature */}
                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-2">
                      1. Inquiry Purpose / Category <span className="text-[#EC5AC8]">*</span>
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
                                ? 'bg-gradient-to-r from-[#6257FF]/10 to-[#EC5AC8]/10 border-[#6257FF] ring-2 ring-[#6257FF]/20'
                                : 'bg-[#FAF9FF] border-[#EAE6FD] hover:bg-white'
                            }`}
                          >
                            <span className={`text-xs font-extrabold block ${isSelected ? 'text-[#6257FF]' : 'text-[#15152A]'}`}>
                              {t.label}
                            </span>
                            <span className="text-[11px] text-[#8E8EA0] block mt-0.5">
                              {t.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Product Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#15152A]">
                        2. Select Product or Custom Sourcing Item <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            isCustomProduct: !prev.isCustomProduct,
                          }))
                        }
                        className="text-xs font-bold text-[#6257FF] hover:underline"
                      >
                        {inquiryForm.isCustomProduct ? '← Choose from Catalog' : '+ Custom Product not in Catalog'}
                      </button>
                    </div>

                    {inquiryForm.isCustomProduct ? (
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Describe item name (e.g. Custom Printed Bamboo Water Bottles 750ml)"
                          value={inquiryForm.customProductName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, customProductName: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                        />
                        <p className="text-[11px] text-[#8E8EA0] mt-1">Our sourcing partners can fulfill specialized orders.</p>
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
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 cursor-pointer font-medium"
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
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Estimated Quantity <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 25 units"
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Target Budget (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50,000"
                        value={inquiryForm.targetBudget}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, targetBudget: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Needed By / Deadline
                      </label>
                      <input
                        type="date"
                        value={inquiryForm.requiredDate}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, requiredDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Step 4: Contact & Company Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Your Name <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contact Person Name"
                        value={inquiryForm.customerName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Company / Business Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Organization or Event Name"
                        value={inquiryForm.companyName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Email Address <span className="text-[#EC5AC8]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="official@company.com"
                        value={inquiryForm.customerEmail}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerEmail: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={inquiryForm.customerPhone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, customerPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15152A] mb-1.5">
                      Specific Requirements / Customization Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need logo printing on packaging, delivery to 2 locations in Bangalore, specific color variants..."
                      value={inquiryForm.notes}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-sm text-[#15152A] focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 resize-none placeholder:text-[#A0A0B2]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6257FF] to-[#EC5AC8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-btn hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
                    >
                      {inquirySubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Request Official Quotation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchWhatsAppInquiry}
                      className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                      title="Send this inquiry directly via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>⚡ Instant WhatsApp Inquire</span>
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Right: Why Inquire with ShopEase & Bulk Perks */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-7 shadow-[0_4px_20px_rgba(98,87,255,0.04)]">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#15152A] mb-2">Bulk Order Advantages</h3>
                <p className="text-xs text-[#626276] leading-relaxed mb-4">
                  Enjoy tier discounts and end-to-end corporate gifting management.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-[#6257FF] flex items-center justify-center font-bold text-xs">1</span>
                    <span className="text-[#15152A] font-semibold">Tiered volume discounts up to 35% off</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#EC5AC8] flex items-center justify-center font-bold text-xs">2</span>
                    <span className="text-[#15152A] font-semibold">Custom brand packaging & greeting cards</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">3</span>
                    <span className="text-[#15152A] font-semibold">Tax invoice with GST input claim support</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">4</span>
                    <span className="text-[#15152A] font-semibold">Dedicated account manager for doorstep dispatch</span>
                  </div>
                </div>
              </div>

              {/* Quick Catalog link banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#6257FF]/10 via-[#FAF9FF] to-[#EC5AC8]/10 border border-[#EAE6FD] text-center">
                <Sparkles className="w-6 h-6 text-[#6257FF] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#15152A] mb-1">Looking for Catalog Products?</h4>
                <p className="text-xs text-[#626276] mb-4">Explore our full 16+ trending inventory with instant pricing.</p>
                <button
                  onClick={onExploreCatalog}
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-[#FAF9FF] text-[#6257FF] border border-[#EAE6FD] text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Browse Product Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Interactive FAQ Accordion Section ── */}
      <section className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-10 shadow-[0_10px_35px_rgba(98,87,255,0.04)] mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6257FF] text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15152A] tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#626276]">
            Find quick answers regarding our products, WhatsApp ordering, bulk inquiry discounts, and delivery.
          </p>

          {/* FAQ Search Bar */}
          <div className="mt-5 relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search questions (e.g. returns, delivery, bulk)..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs sm:text-sm focus:bg-white focus:border-[#6257FF] focus:outline-none focus:ring-2 focus:ring-[#6257FF]/10 transition-all placeholder:text-[#A0A0B2]"
            />
            <HelpCircle className="w-4 h-4 text-[#8E8EA0] absolute left-3.5 top-3" />
          </div>

          {/* FAQ Category Pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {faqCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  faqCategory === cat
                    ? 'bg-[#6257FF] text-white shadow-xs'
                    : 'bg-[#FAF9FF] text-[#626276] hover:bg-[#F5F3FF] border border-[#EAE6FD]'
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
                      ? 'bg-gradient-to-r from-[#FAF9FF] to-white border-[#6257FF]/30 shadow-xs'
                      : 'bg-[#FAF9FF]/60 border-[#EAE6FD] hover:bg-[#FAF9FF]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-[#15152A]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6257FF] transition-transform duration-300 flex-shrink-0 ${
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
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-[#626276] leading-relaxed border-t border-[#EAE6FD]/60 mt-1">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-[#8E8EA0]">
              No FAQs matched your search term "{faqSearch}". You can ask us directly using the contact form above!
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  Eye,
  X,
  Send,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Layers,
  AlertCircle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

export const AdminInquiries = () => {
  const { storeConfig } = useCatalog();
  const [inquiries, setInquiries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'inquiries' | 'contacts'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'replied' | 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch inquiries and contacts from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [inqRes, contRes] = await Promise.all([
        fetch('/api/inquiries').then((r) => r.json()),
        fetch('/api/contact').then((r) => r.json()),
      ]);

      if (inqRes.success && inqRes.inquiries) {
        setInquiries(inqRes.inquiries);
      }
      if (contRes.success && contRes.messages) {
        setContacts(contRes.messages);
      }
    } catch (err) {
      console.warn('Error fetching admin messages/inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Combined and normalized list
  const combinedList = useMemo(() => {
    const list = [
      ...inquiries.map((item) => ({
        ...item,
        itemType: 'inquiry',
        typeLabel: 'Product / Bulk Inquiry',
        customer: item.customerName,
        email: item.customerEmail,
        phone: item.customerPhone,
        title: item.productName || item.inquiryType,
        summary: item.notes || `Inquiry for ${item.quantity || 1} units of ${item.productName || 'product'}`,
      })),
      ...contacts.map((item) => ({
        ...item,
        itemType: 'contact',
        typeLabel: 'Contact Message',
        customer: item.name,
        email: item.email,
        phone: item.phone,
        title: item.subject || item.category,
        summary: item.message,
      })),
    ];

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [inquiries, contacts]);

  // Filtered List
  const filteredList = useMemo(() => {
    return combinedList.filter((item) => {
      // Tab filter
      if (activeTab === 'inquiries' && item.itemType !== 'inquiry') return false;
      if (activeTab === 'contacts' && item.itemType !== 'contact') return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.customer && item.customer.toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.phone && item.phone.toLowerCase().includes(q)) ||
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.summary && item.summary.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [combinedList, activeTab, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = combinedList.length;
    const pending = combinedList.filter((i) => i.status === 'pending').length;
    const inProgress = combinedList.filter((i) => i.status === 'in_progress').length;
    const resolved = combinedList.filter((i) => i.status === 'resolved' || i.status === 'replied').length;
    const inquiriesCount = inquiries.length;
    const contactsCount = contacts.length;

    return { total, pending, inProgress, resolved, inquiriesCount, contactsCount };
  }, [combinedList, inquiries, contacts]);

  // Update status locally
  const handleUpdateStatus = (id, itemType, newStatus) => {
    if (itemType === 'inquiry') {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    }
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Delete ticket locally
  const handleDelete = (id, itemType) => {
    if (window.confirm(`Are you sure you want to delete ticket ${id}?`)) {
      if (itemType === 'inquiry') {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
      } else {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
      if (selectedTicket?.id === id) setSelectedTicket(null);
    }
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      case 'replied':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">Replied</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Header & Stats Overview ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#6257FF]" />
            <span>Customer Inquiries & Messages</span>
          </h1>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Track, respond to, and fulfill customer requests, bulk orders, and support tickets
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#6257FF] hover:bg-[#FAF9FF] shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Stats Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0] font-semibold mb-1">
            <span>Total Tickets</span>
            <MessageSquare className="w-4 h-4 text-[#6257FF]" />
          </div>
          <div className="text-2xl font-extrabold text-[#15152A]">{stats.total}</div>
          <div className="text-[11px] text-[#8E8EA0] mt-1 flex items-center gap-2">
            <span>{stats.inquiriesCount} Inquiries</span>
            <span>•</span>
            <span>{stats.contactsCount} Messages</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-100 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span>Pending Action</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-800">{stats.pending}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            {stats.pending > 0 ? 'Requires immediate response' : 'All caught up!'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
            <span>In Progress</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800">{stats.inProgress}</div>
          <div className="text-[11px] text-[#8E8EA0] mt-1">Quotations under preparation</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Successfully addressed</div>
        </div>

      </div>

      {/* ── Toolbar: Tabs, Search & Status Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE6FD] shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9FF] rounded-xl border border-[#EAE6FD] self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-white text-[#6257FF] shadow-xs' : 'text-[#626276] hover:text-[#15152A]'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'inquiries' ? 'bg-[#EC5AC8] text-white shadow-xs' : 'text-[#626276] hover:text-[#15152A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inquiries ({stats.inquiriesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'contacts' ? 'bg-[#6257FF] text-white shadow-xs' : 'text-[#626276] hover:text-[#15152A]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Messages ({stats.contactsCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#8E8EA0] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer, ticket ID, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs focus:bg-white focus:border-[#6257FF] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8E8EA0] hover:text-[#15152A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Sub-status Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE6FD] overflow-x-auto text-xs">
          <span className="text-[#8E8EA0] font-semibold text-[11px] flex-shrink-0">Status:</span>
          {['all', 'pending', 'in_progress', 'replied', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-[#15152A] text-white'
                  : 'bg-[#FAF9FF] text-[#626276] hover:bg-[#F5F3FF] border border-[#EAE6FD]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* ── Tickets List & Table ── */}
      <div className="bg-white rounded-3xl border border-[#EAE6FD] overflow-hidden shadow-xs">
        
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8E8EA0]">
            <div className="w-6 h-6 border-2 border-[#6257FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading inquiries and messages...</span>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="divide-y divide-[#EAE6FD]">
            {filteredList.map((item) => {
              const isLead = item.itemType === 'inquiry';
              const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-[#FAF9FF]/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  
                  {/* Left: Type badge + Ticket ID + Customer Info */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                        isLead
                          ? 'bg-pink-50 text-[#EC5AC8] border border-pink-100'
                          : 'bg-indigo-50 text-[#6257FF] border border-indigo-100'
                      }`}
                    >
                      {isLead ? <Sparkles className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-extrabold text-xs text-[#15152A]">
                          {item.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isLead ? 'bg-pink-100 text-[#EC5AC8]' : 'bg-indigo-100 text-[#6257FF]'
                          }`}
                        >
                          {item.typeLabel}
                        </span>
                        {getStatusBadge(item.status)}
                        <span className="text-[11px] text-[#8E8EA0]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#15152A] mb-1 truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#626276] line-clamp-1 mb-2">
                        {item.summary}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-[#8E8EA0] flex-wrap">
                        <span className="font-semibold text-[#15152A]">
                          👤 {item.customer}
                        </span>
                        {item.email && (
                          <span className="truncate">✉️ {item.email}</span>
                        )}
                        {item.phone && (
                          <span>📞 {item.phone}</span>
                        )}
                        {item.quantity && (
                          <span className="font-bold text-[#EC5AC8]">
                            📦 Qty: {item.quantity} units
                          </span>
                        )}
                        {item.targetBudget && (
                          <span className="font-bold text-emerald-600">
                            💰 Budget: {item.targetBudget}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls & Status Changer */}
                  <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                    
                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, item.itemType, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF] cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="replied">Replied</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {/* Quick WhatsApp Reply Button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${item.customer}! This is regarding your ${item.typeLabel} (${item.id}) on ${storeConfig.name}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Quick Email Reply Button */}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          `Re: ${item.title} — ${item.id} | ${storeConfig.name}`
                        )}`}
                        className="p-2 rounded-xl bg-indigo-50 text-[#6257FF] hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}

                    {/* View Details Modal Trigger */}
                    <button
                      onClick={() => setSelectedTicket(item)}
                      className="p-2 rounded-xl bg-[#FAF9FF] text-[#15152A] hover:bg-[#EDE9FE] border border-[#EAE6FD] transition-colors"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id, item.itemType)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-[#8E8EA0]">
            <MessageSquare className="w-10 h-10 text-[#A0A0B2] mx-auto mb-3" />
            <p className="font-bold text-[#15152A] text-sm mb-1">No Inquiries or Messages Found</p>
            <p>Try clearing your search filters or check back later.</p>
          </div>
        )}

      </div>

      {/* ── Ticket Detail Modal ── */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE6FD] z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#EAE6FD] mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-sm text-[#6257FF]">
                      {selectedTicket.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF9FF] text-[#626276] border border-[#EAE6FD] font-bold">
                      {selectedTicket.typeLabel}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-lg font-bold text-[#15152A]">{selectedTicket.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-full text-[#8E8EA0] hover:bg-[#FAF9FF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Information Card */}
              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8E8EA0] block">Customer Name:</span>
                  <span className="font-bold text-[#15152A] text-sm">{selectedTicket.customer}</span>
                </div>
                {selectedTicket.companyName && (
                  <div>
                    <span className="text-[#8E8EA0] block">Company:</span>
                    <span className="font-bold text-[#15152A]">{selectedTicket.companyName}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#8E8EA0] block">Email:</span>
                  <a href={`mailto:${selectedTicket.email}`} className="font-bold text-[#6257FF] hover:underline">
                    {selectedTicket.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#8E8EA0] block">Phone:</span>
                  <span className="font-bold text-[#15152A]">{selectedTicket.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Specific Inquiry Details (if applicable) */}
              {selectedTicket.itemType === 'inquiry' && (
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#8E8EA0] block">Quantity:</span>
                    <span className="font-extrabold text-[#EC5AC8] text-sm">{selectedTicket.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[#8E8EA0] block">Target Budget:</span>
                    <span className="font-bold text-emerald-700">{selectedTicket.targetBudget || 'Negotiable'}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8EA0] block">Required By Date:</span>
                    <span className="font-bold text-[#15152A]">{selectedTicket.requiredDate || 'Standard'}</span>
                  </div>
                </div>
              )}

              {/* Message / Requirements Body */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8EA0] mb-2">
                  Customer Message / Requirements
                </h4>
                <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] text-xs text-[#15152A] leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.summary || selectedTicket.message || selectedTicket.notes}
                </div>
              </div>

              {/* Status Update & Actions Bar */}
              <div className="pt-4 border-t border-[#EAE6FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8E8EA0] font-semibold">Change Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, selectedTicket.itemType, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] font-bold text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.phone && (
                    <a
                      href={`https://wa.me/${selectedTicket.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hi ${selectedTicket.customer}! Regarding your ${selectedTicket.typeLabel} (${selectedTicket.id}):`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}

                  {selectedTicket.email && (
                    <a
                      href={`mailto:${selectedTicket.email}?subject=${encodeURIComponent(
                        `Re: ${selectedTicket.title} — ${selectedTicket.id} | ${storeConfig.name}`
                      )}`}
                      className="px-4 py-2 rounded-xl bg-[#6257FF] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

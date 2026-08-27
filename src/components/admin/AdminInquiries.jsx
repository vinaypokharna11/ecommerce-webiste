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
  Check,
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

  // Fetch inquiries and contacts from API with Auth Token
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('shopease_admin_token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [inqRes, contRes] = await Promise.all([
        fetch('/api/inquiries', { headers }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/contact', { headers }).then((r) => r.json()).catch(() => ({ success: false })),
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
        typeLabel: 'Jewelry / Bulk Inquiry',
        customer: item.customerName,
        email: item.customerEmail,
        phone: item.customerPhone,
        title: item.productName || item.inquiryType,
        summary: item.notes || `Inquiry for ${item.quantity || 1} units of ${item.productName || 'product'}`,
      })),
      ...contacts.map((item) => ({
        ...item,
        itemType: 'contact',
        typeLabel: 'Customer Message',
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

  // Update status locally & remotely
  const handleUpdateStatus = async (id, itemType, newStatus) => {
    if (itemType === 'inquiry') {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      try {
        const token = localStorage.getItem('shopease_admin_token');
        await fetch('/api/inquiries', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ id, status: newStatus }),
        });
      } catch (e) {}
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    }
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Delete ticket locally & remotely
  const handleDelete = async (id, itemType) => {
    if (window.confirm(`Are you sure you want to delete ticket ${id}?`)) {
      if (itemType === 'inquiry') {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        try {
          const token = localStorage.getItem('shopease_admin_token');
          await fetch(`/api/inquiries?id=${id}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        } catch (e) {}
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">Pending</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">In Progress</span>;
      case 'replied':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F3FCDA] text-[#709E1E] border border-[#9FD842]/40">Replied</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">Resolved</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEEEEC] text-[#555555] border border-black/10">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Top Header & Stats Overview ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#709E1E]" />
            <span>Customer Inquiries & Messages</span>
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Track and fulfill custom jewelry inquiries, bulk wholesale orders, and store support tickets
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/10 text-xs font-bold text-[#171717] hover:bg-[#EEEEEC] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* ── Stats Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#777777] font-semibold mb-1">
            <span>Total Requests</span>
            <MessageSquare className="w-4 h-4 text-[#171717]" />
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">{stats.total}</div>
          <div className="text-[11px] text-[#888888] mt-1 flex items-center gap-2">
            <span>{stats.inquiriesCount} Inquiries</span>
            <span>•</span>
            <span>{stats.contactsCount} Messages</span>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-amber-200 bg-amber-50/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Pending Action</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{stats.pending}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {stats.pending > 0 ? 'Requires response' : 'All clear!'}
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
            <span>In Progress</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{stats.inProgress}</div>
          <div className="text-[11px] text-[#777777] mt-1">Quotations under preparation</div>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-emerald-200 bg-emerald-50/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Successfully addressed</div>
        </div>

      </div>

      {/* ── Toolbar: Tabs, Search & Status Filters ── */}
      <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EEEEEC] rounded-full self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#555555] hover:text-[#171717]'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inquiries' ? 'bg-[#171717] text-[#9FD842] shadow-xs' : 'text-[#555555] hover:text-[#171717]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inquiries ({stats.inquiriesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'contacts' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#555555] hover:text-[#171717]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Messages ({stats.contactsCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by customer, ticket ID, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#EEEEEC] border border-black/5 text-xs text-[#171717] placeholder-[#888888] focus:bg-white focus:ring-2 focus:ring-[#9FD842] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#777777] hover:text-[#171717]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Sub-status Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/10 overflow-x-auto text-xs">
          <span className="text-[#777777] font-semibold text-[11px] flex-shrink-0">Status:</span>
          {['all', 'pending', 'in_progress', 'replied', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-bold capitalize transition-colors flex-shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#EEEEEC] text-[#555555] hover:bg-[#E2E2DE]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* ── Tickets List & Table ── */}
      <div className="bg-white rounded-[28px] border border-black/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        
        {loading ? (
          <div className="p-12 text-center text-xs text-[#777777]">
            <div className="w-6 h-6 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading inquiries and messages...</span>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="divide-y divide-black/5">
            {filteredList.map((item) => {
              const isLead = item.itemType === 'inquiry';
              const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-[#EEEEEC]/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  
                  {/* Left: Type badge + Ticket ID + Customer Info */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                        isLead
                          ? 'bg-[#F3FCDA] text-[#709E1E] border border-[#9FD842]/30'
                          : 'bg-[#EEEEEC] text-[#171717] border border-black/10'
                      }`}
                    >
                      {isLead ? <Sparkles className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-extrabold text-xs text-[#171717]">
                          {item.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLead ? 'bg-[#F3FCDA] text-[#709E1E]' : 'bg-[#EEEEEC] text-[#555555]'
                          }`}
                        >
                          {item.typeLabel}
                        </span>
                        {getStatusBadge(item.status)}
                        <span className="text-[11px] text-[#888888]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#171717] mb-1 truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#666666] line-clamp-1 mb-2">
                        {item.summary}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-[#777777] flex-wrap">
                        <span className="font-semibold text-[#171717]">
                          👤 {item.customer}
                        </span>
                        {item.email && (
                          <span className="truncate">✉️ {item.email}</span>
                        )}
                        {item.phone && (
                          <span>📞 {item.phone}</span>
                        )}
                        {item.quantity && (
                          <span className="font-bold text-[#709E1E]">
                            📦 Qty: {item.quantity} units
                          </span>
                        )}
                        {item.targetBudget && (
                          <span className="font-bold text-emerald-700">
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
                      className="px-3 py-1.5 rounded-full bg-[#EEEEEC] border border-black/10 text-xs font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
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
                          `Hi ${item.customer}! This is regarding your inquiry (${item.id}) with Nakoda Imitation.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Quick Email Reply Button */}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          `Re: ${item.title} — ${item.id} | Nakoda Imitation`
                        )}`}
                        className="p-2 rounded-full bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE] border border-black/10 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}

                    {/* View Details Modal Trigger */}
                    <button
                      onClick={() => setSelectedTicket(item)}
                      className="p-2 rounded-full bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE] border border-black/10 transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id, item.itemType)}
                      className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
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
          <div className="p-16 text-center text-xs text-[#777777]">
            <MessageSquare className="w-10 h-10 text-[#AAAAAA] mx-auto mb-3" />
            <p className="font-bold text-[#171717] text-sm mb-1">No Inquiries or Messages Found</p>
            <p>Customer inquiries submitted from the website will automatically appear here.</p>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-black/10 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-black/10 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-sm text-[#709E1E]">
                      {selectedTicket.id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEEEEC] text-[#555555] font-bold">
                      {selectedTicket.typeLabel}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-lg font-bold text-[#171717]">{selectedTicket.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-full text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Information Card */}
              <div className="p-5 rounded-2xl bg-[#F8FDF0] border border-[#9FD842]/30 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#777777] block">Customer Name:</span>
                  <span className="font-bold text-[#171717] text-sm">{selectedTicket.customer}</span>
                </div>
                {selectedTicket.companyName && (
                  <div>
                    <span className="text-[#777777] block">Company / Business:</span>
                    <span className="font-bold text-[#171717]">{selectedTicket.companyName}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#777777] block">Email Address:</span>
                  <a href={`mailto:${selectedTicket.email}`} className="font-bold text-[#709E1E] hover:underline">
                    {selectedTicket.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#777777] block">Phone / WhatsApp:</span>
                  <span className="font-bold text-[#171717]">{selectedTicket.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Specific Inquiry Details (if applicable) */}
              {selectedTicket.itemType === 'inquiry' && (
                <div className="p-4 rounded-2xl bg-[#EEEEEC] border border-black/5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#777777] block">Requested Quantity:</span>
                    <span className="font-extrabold text-[#709E1E] text-sm">{selectedTicket.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Target Budget:</span>
                    <span className="font-bold text-emerald-700">{selectedTicket.targetBudget || 'Negotiable'}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Required Date:</span>
                    <span className="font-bold text-[#171717]">{selectedTicket.requiredDate || 'Standard'}</span>
                  </div>
                </div>
              )}

              {/* Message / Requirements Body */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2">
                  Customer Message / Requirements
                </h4>
                <div className="p-4 rounded-2xl bg-[#EEEEEC] border border-black/5 text-xs text-[#171717] leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedTicket.summary || selectedTicket.message || selectedTicket.notes}
                </div>
              </div>

              {/* Status Update & Actions Bar */}
              <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#777777] font-semibold">Change Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, selectedTicket.itemType, e.target.value)}
                    className="px-3 py-1.5 rounded-full bg-[#EEEEEC] border border-black/10 font-bold text-xs cursor-pointer"
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
                        `Hi ${selectedTicket.customer}! This is Nakoda Imitation regarding your inquiry (${selectedTicket.id}):`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}

                  {selectedTicket.email && (
                    <a
                      href={`mailto:${selectedTicket.email}?subject=${encodeURIComponent(
                        `Re: ${selectedTicket.title} — ${selectedTicket.id} | Nakoda Imitation`
                      )}`}
                      className="px-4 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
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

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  Eye,
  Printer,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Check,
  ExternalLink,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { useCatalog } from '@/context/CatalogContext';
import { OrderChatModal } from '@/components/orders/OrderChatModal';

export const AdminOrders = ({ adminUser }) => {
  const { storeConfig } = useCatalog();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search State
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Action State
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);

  // Modals
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [orderToReject, setOrderToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customRejectionNote, setCustomRejectionNote] = useState('');

  const currency = storeConfig?.currency || '₹';

  // Load orders from API
  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders({ scope: 'admin' });
      if (data && data.orders) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load seller orders');
    } finally {
      if (!isSilent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      const st = (o.status || 'pending').toLowerCase();
      if (counts[st] !== undefined) counts[st] += 1;
    });
    return counts;
  }, [orders]);

  // Total Revenue of accepted/completed orders
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => ['accepted', 'processing', 'shipped', 'delivered'].includes((o.status || '').toLowerCase()))
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Status Tab Filter
    if (activeStatusTab !== 'all') {
      list = list.filter((o) => (o.status || 'pending').toLowerCase() === activeStatusTab.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const idMatch = (o.id || '').toLowerCase().includes(query);
        const nameMatch = (o.customerName || '').toLowerCase().includes(query);
        const emailMatch = (o.customerEmail || '').toLowerCase().includes(query);
        const phoneMatch = (o.customerPhone || '').includes(query);
        const itemMatch = (o.items || []).some((item) =>
          (item.name || '').toLowerCase().includes(query)
        );
        return idMatch || nameMatch || emailMatch || phoneMatch || itemMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      if (sortOrder === 'newest') return dateB - dateA;
      if (sortOrder === 'oldest') return dateA - dateB;
      if (sortOrder === 'highest') return (b.amount || 0) - (a.amount || 0);
      if (sortOrder === 'lowest') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    return list;
  }, [orders, activeStatusTab, searchQuery, sortOrder]);

  // Accept Order Handler
  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await orderService.acceptOrder(orderId);
      if (res && res.success) {
        setActionSuccess(`Order ${orderId} accepted successfully! Stock decremented.`);
        // Optimistically update order in state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: 'accepted', statusLabel: 'Accepted', acceptedAt: new Date().toISOString() }
              : o
          )
        );
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev) => ({
            ...prev,
            status: 'accepted',
            statusLabel: 'Accepted',
            acceptedAt: new Date().toISOString(),
          }));
        }
      } else {
        throw new Error(res?.error || 'Failed to accept order');
      }
    } catch (err) {
      console.error('Accept order error:', err);
      setActionError(err.message || 'Error accepting order');
    } finally {
      setProcessingOrderId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Reject Order Handler
  const handleConfirmReject = async () => {
    if (!orderToReject) return;
    const finalReason = customRejectionNote.trim() || rejectionReason || 'Unavailable for fulfillment';
    setProcessingOrderId(orderToReject.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await orderService.rejectOrder(orderToReject.id, finalReason);
      if (res && res.success) {
        setActionSuccess(`Order ${orderToReject.id} rejected.`);
        // Optimistically update order in state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderToReject.id
              ? {
                  ...o,
                  status: 'rejected',
                  statusLabel: 'Rejected',
                  rejectionReason: finalReason,
                  rejectedAt: new Date().toISOString(),
                }
              : o
          )
        );
        if (selectedOrderForDetails?.id === orderToReject.id) {
          setSelectedOrderForDetails((prev) => ({
            ...prev,
            status: 'rejected',
            statusLabel: 'Rejected',
            rejectionReason: finalReason,
            rejectedAt: new Date().toISOString(),
          }));
        }
        setOrderToReject(null);
        setRejectionReason('');
        setCustomRejectionNote('');
      } else {
        throw new Error(res?.error || 'Failed to reject order');
      }
    } catch (err) {
      console.error('Reject order error:', err);
      setActionError(err.message || 'Error rejecting order');
    } finally {
      setProcessingOrderId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Advance Order Status (for accepted orders)
  const handleUpdateStatus = async (orderId, newStatus) => {
    setProcessingOrderId(orderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res && res.success) {
        const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        setActionSuccess(`Order ${orderId} updated to ${statusLabel}.`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, statusLabel } : o))
        );
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev) => ({ ...prev, status: newStatus, statusLabel }));
        }
      } else {
        throw new Error(res?.error || 'Failed to update order status');
      }
    } catch (err) {
      setActionError(err.message || 'Error updating order status');
    } finally {
      setProcessingOrderId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Status Badge Component
  const getStatusBadge = (status) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Pending Approval
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF8D6] text-[#446610] border border-[#9FD842]/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#709E1E]" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: statusCounts.all },
    { id: 'pending', label: 'Pending Approval', count: statusCounts.pending, alert: statusCounts.pending > 0 },
    { id: 'accepted', label: 'Accepted', count: statusCounts.accepted },
    { id: 'processing', label: 'Processing', count: statusCounts.processing },
    { id: 'shipped', label: 'Shipped', count: statusCounts.shipped },
    { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
    { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];

  const predefinedReasons = [
    'Item(s) currently out of stock',
    'Customer requested cancellation before fulfillment',
    'Unable to ship / deliver to delivery pincode',
    'Pricing or item specification discrepancy',
    'Suspicious or unverifiable order details',
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Header & Summary Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#171717] text-[#9FD842] flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                Seller Order Management
              </h1>
              <p className="text-xs text-[#777777] font-medium">
                Review, accept, or reject incoming customer orders and manage fulfillment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl bg-white border border-black/10 hover:bg-[#EEEEEC] text-[#171717] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#9FD842]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Global Alerts (Success / Error) ── */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-xl bg-[#EEEEEC] text-[#171717] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#171717]">{statusCounts.all}</div>
          <div className="text-[11px] text-[#777777] font-medium mt-0.5">Lifetime orders placed</div>
        </div>

        <div className={`bg-white rounded-2xl p-4 border shadow-xs transition-all ${
          statusCounts.pending > 0 ? 'border-amber-300 ring-2 ring-amber-200/60 bg-gradient-to-br from-white to-amber-50/40' : 'border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Action</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900 flex items-center gap-2">
            {statusCounts.pending}
            {statusCounts.pending > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold uppercase">
                Needs Review
              </span>
            )}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting seller acceptance</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#446610] uppercase tracking-wider">Active Pipeline</span>
            <div className="w-7 h-7 rounded-xl bg-[#EAF8D6] text-[#446610] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#171717]">
            {statusCounts.accepted + statusCounts.processing + statusCounts.shipped}
          </div>
          <div className="text-[11px] text-[#777777] font-medium mt-0.5">Accepted, processing, shipped</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Confirmed Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#171717]">
            {currency}{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#777777] font-medium mt-0.5">From accepted & completed orders</div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-white rounded-2xl p-2 border border-black/10 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-[#555555] hover:bg-[#EEEEEC] hover:text-[#171717]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    isActive
                      ? 'bg-[#9FD842] text-[#171717]'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-[#EEEEEC] text-[#777777]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search & Sorting Bar ── */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-black/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, customer, phone, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F6F5F0] border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9FD842] focus:bg-white transition-all text-[#171717]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#171717] p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-medium text-[#777777]">
            Showing <strong className="text-[#171717]">{filteredOrders.length}</strong> of {orders.length}
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F6F5F0] border border-black/10 text-xs font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </select>
        </div>
      </div>

      {/* ── Orders List / Cards ── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-black/10 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-[#171717] border-t-[#9FD842] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#777777]">Loading seller orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-black/10 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F5F0] text-[#777777] flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#171717]">No Orders Found</h3>
          <p className="text-xs text-[#777777] max-w-sm">
            {searchQuery
              ? `No orders match your search "${searchQuery}". Try searching with different keywords.`
              : activeStatusTab !== 'all'
              ? `There are currently no orders in "${activeStatusTab}" status.`
              : 'You have no customer orders yet. When customers place orders, they will appear here for your confirmation.'}
          </p>
          {(searchQuery || activeStatusTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveStatusTab('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer hover:bg-black"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isPending = (order.status || 'pending').toLowerCase() === 'pending';
            const isAccepted = (order.status || '').toLowerCase() === 'accepted';
            const isRejected = (order.status || '').toLowerCase() === 'rejected';
            const isProcessingThis = processingOrderId === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200/80 bg-gradient-to-r from-white via-white to-amber-50/20'
                    : 'border-black/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Order ID, Date, Status, Customer Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-extrabold text-base text-[#171717] tracking-tight">
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-[11px] text-[#777777] font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {order.date || new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EEEEEC] font-bold text-[#171717]">
                        {order.paymentMethod || order.payMethod || 'Cash on Delivery'}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#555555]">
                      <div className="flex items-center gap-1.5 truncate">
                        <strong className="text-[#171717]">{order.customerName || 'Customer'}</strong>
                        {order.customerEmail && (
                          <span className="text-[#777777] truncate">({order.customerEmail})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                        <span>{order.customerPhone || 'N/A'}</span>
                        {order.customerPhone && (
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${order.customerName}, regarding your order ${order.id} at Nakoda Imitation:`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                          >
                            WhatsApp <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="sm:col-span-2 flex items-start gap-1.5 text-[11px] text-[#777777] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="truncate">
                          {order.deliveryAddress || order.shippingAddress || 'Store Pickup'}
                        </span>
                      </div>
                    </div>

                    {/* Rejection Note Alert */}
                    {isRejected && order.rejectionReason && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <strong>Rejection Reason:</strong> {order.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Items Thumbnails & Quantities */}
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full lg:max-w-xs py-1">
                    {(order.items || []).slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-12 rounded-xl bg-[#F6F5F0] border border-black/10 overflow-hidden shrink-0 group"
                        title={`${item.name} (x${item.quantity})`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#777777]">
                            Item
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-[#171717] text-white text-[9px] font-extrabold px-1 rounded-tl">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                    {(order.items || []).length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-[#EEEEEC] text-[#777777] text-xs font-bold flex items-center justify-center shrink-0">
                        +{(order.items || []).length - 3}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Price & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#777777] font-medium">Total Bill</div>
                      <div className="text-lg sm:text-xl font-black text-[#171717]">
                        {currency}{(Number(order.amount) || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Contextual Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="px-3 py-2 rounded-xl bg-[#EEEEEC] hover:bg-[#E3DFD5] text-[#171717] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Bill</span>
                      </button>

                      <button
                        onClick={() => setChatOrder(order)}
                        className="px-3 py-2 rounded-xl bg-[#F6F5F0] hover:bg-[#E3DFD5] text-[#171717] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-black/5"
                        title="Chat with Customer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span className="hidden sm:inline">Chat</span>
                      </button>

                      {/* Pending Actions: Accept & Reject */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={isProcessingThis}
                            className="px-4 py-2 rounded-xl bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isProcessingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Accept Order</span>
                          </button>

                          <button
                            onClick={() => {
                              setOrderToReject(order);
                              setRejectionReason(predefinedReasons[0]);
                              setCustomRejectionNote('');
                            }}
                            disabled={isProcessingThis}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {/* Advance Status Dropdown for Accepted Orders */}
                      {isAccepted && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={isProcessingThis}
                          className="px-3 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                        >
                          <option value="accepted" disabled>Status: Accepted</option>
                          <option value="processing">Move to Processing</option>
                          <option value="shipped">Mark as Shipped</option>
                          <option value="delivered">Mark as Delivered</option>
                          <option value="cancelled">Cancel Order</option>
                        </select>
                      )}

                      {/* Advance Status for Processing / Shipped */}
                      {['processing', 'shipped'].includes((order.status || '').toLowerCase()) && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={isProcessingThis}
                          className="px-3 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
                        >
                          <option value={order.status} disabled>
                            Status: {order.statusLabel || order.status}
                          </option>
                          {order.status === 'processing' && <option value="shipped">Mark as Shipped</option>}
                          <option value="delivered">Mark as Delivered</option>
                          <option value="cancelled">Cancel Order</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Order Rejection Confirmation ── */}
      <AnimatePresence>
        {orderToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-extrabold text-base text-[#171717]">
                    Reject Order {orderToReject.id}
                  </h3>
                </div>
                <button
                  onClick={() => setOrderToReject(null)}
                  className="p-1 rounded-lg text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-[#555555] leading-relaxed">
                  Rejecting this order will permanently cancel it, preserve inventory without deduction, and notify customer <strong>{orderToReject.customerName}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">
                    Select Rejection Reason
                  </label>
                  <div className="space-y-1.5">
                    {predefinedReasons.map((reason, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          rejectionReason === reason
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'border-black/10 hover:bg-[#F6F5F0] text-[#555555]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reason}
                          checked={rejectionReason === reason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="accent-rose-600"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">
                    Or Custom Message / Notes for Customer
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional details to explain the cancellation..."
                    value={customRejectionNote}
                    onChange={(e) => setCustomRejectionNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F6F5F0] border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-black/10">
                <button
                  onClick={() => setOrderToReject(null)}
                  className="px-4 py-2 rounded-xl bg-[#EEEEEC] text-[#171717] font-bold text-xs hover:bg-[#E3DFD5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={processingOrderId === orderToReject.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {processingOrderId === orderToReject.id && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Detailed Bill & Order Inspection ── */}
      <AnimatePresence>
        {selectedOrderForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-black/10 my-8 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#171717] text-[#9FD842] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-lg text-[#171717]">
                        Order Bill & Invoice
                      </h2>
                      {getStatusBadge(selectedOrderForDetails.status)}
                    </div>
                    <p className="text-xs text-[#777777]">
                      Order #{selectedOrderForDetails.id} • Placed on {selectedOrderForDetails.date || new Date(selectedOrderForDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-[#EEEEEC] text-[#171717] hover:bg-[#E3DFD5] transition-all cursor-pointer"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOrderForDetails(null)}
                    className="p-2 rounded-xl text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                {/* Store & Customer Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F6F5F0] border border-black/5 text-xs">
                  <div>
                    <span className="font-bold text-[#777777] uppercase text-[10px] tracking-wider block mb-1">
                      Customer & Shipping Details
                    </span>
                    <p className="font-extrabold text-sm text-[#171717]">
                      {selectedOrderForDetails.customerName}
                    </p>
                    <p className="text-[#555555] mt-0.5">{selectedOrderForDetails.customerPhone}</p>
                    {selectedOrderForDetails.customerEmail && (
                      <p className="text-[#555555]">{selectedOrderForDetails.customerEmail}</p>
                    )}
                    <p className="text-[#777777] mt-1.5 leading-relaxed">
                      {selectedOrderForDetails.deliveryAddress || selectedOrderForDetails.shippingAddress || 'Store Pickup'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#777777] uppercase text-[10px] tracking-wider block mb-1">
                      Order Summary & Tracking
                    </span>
                    <div className="space-y-1 text-[#555555]">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <strong className="text-[#171717]">
                          {selectedOrderForDetails.paymentMethod || selectedOrderForDetails.payMethod || 'COD'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <strong className="text-[#171717] capitalize">
                          {selectedOrderForDetails.paymentStatus || 'Pending'}
                        </strong>
                      </div>
                      {selectedOrderForDetails.acceptedAt && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Accepted At:</span>
                          <strong>{new Date(selectedOrderForDetails.acceptedAt).toLocaleString()}</strong>
                        </div>
                      )}
                      {selectedOrderForDetails.rejectedAt && (
                        <div className="flex justify-between text-rose-700">
                          <span>Rejected At:</span>
                          <strong>{new Date(selectedOrderForDetails.rejectedAt).toLocaleString()}</strong>
                        </div>
                      )}
                      {selectedOrderForDetails.couponCode && (
                        <div className="flex justify-between text-[#709E1E]">
                          <span>Coupon Code:</span>
                          <strong>{selectedOrderForDetails.couponCode} ({selectedOrderForDetails.discountPercent}% OFF)</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h4 className="text-xs font-bold text-[#777777] uppercase tracking-wider mb-2.5">
                    Purchased Items ({(selectedOrderForDetails.items || []).length})
                  </h4>
                  <div className="rounded-2xl border border-black/10 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F6F5F0] text-[#777777] font-bold border-b border-black/10 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {(selectedOrderForDetails.items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#F6F5F0]/50 transition-colors">
                            <td className="p-3 flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-black/10 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EEEEEC] text-[#777777] flex items-center justify-center shrink-0 text-[10px] font-bold">
                                  Item
                                </div>
                              )}
                              <div>
                                <span className="font-extrabold text-[#171717] block">
                                  {item.name}
                                </span>
                                {(item.selectedSize || item.selectedColor) && (
                                  <span className="text-[10px] text-[#777777]">
                                    {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                                    {item.selectedSize && item.selectedColor ? ' • ' : ''}
                                    {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center font-bold text-[#171717]">
                              x{item.quantity}
                            </td>
                            <td className="p-3 text-right text-[#555555]">
                              {currency}{Number(item.price || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-extrabold text-[#171717]">
                              {currency}{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="p-4 rounded-2xl bg-[#EEEEEC]/60 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-[#777777]">
                    Thank you for doing business with {storeConfig?.name || 'Nakoda Imitation'}
                  </div>
                  <div className="space-y-1.5 text-xs text-right min-w-[200px]">
                    <div className="flex justify-between text-[#555555]">
                      <span>Items Subtotal:</span>
                      <span>{currency}{(Number(selectedOrderForDetails.amount) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#555555]">
                      <span>Shipping / Delivery:</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>
                    <div className="pt-2 border-t border-black/10 flex justify-between text-base font-black text-[#171717]">
                      <span>Grand Total:</span>
                      <span>{currency}{(Number(selectedOrderForDetails.amount) || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions for Pending orders */}
                <div className="pt-4 border-t border-black/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const ord = selectedOrderForDetails;
                      setChatOrder(ord);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#F6F5F0] hover:bg-[#E3DFD5] text-[#171717] font-bold text-xs flex items-center gap-1.5 border border-black/10 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#0071E3]" />
                    <span>Chat With Customer</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {(selectedOrderForDetails.status || 'pending').toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            const ord = selectedOrderForDetails;
                            setSelectedOrderForDetails(null);
                            setOrderToReject(ord);
                            setRejectionReason(predefinedReasons[0]);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer"
                        >
                          Reject This Order
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(selectedOrderForDetails.id)}
                          disabled={processingOrderId === selectedOrderForDetails.id}
                          className="px-5 py-2.5 rounded-xl bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-black text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {processingOrderId === selectedOrderForDetails.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Accept Order & Decrement Stock</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer ↔ Seller Order Chat Modal */}
      {chatOrder && (
        <OrderChatModal
          isOpen={Boolean(chatOrder)}
          onClose={() => setChatOrder(null)}
          orderId={chatOrder.id}
          customerName={chatOrder.customerName}
          orderStatus={chatOrder.status}
          role="seller"
        />
      )}
    </div>
  );
};

export default AdminOrders;

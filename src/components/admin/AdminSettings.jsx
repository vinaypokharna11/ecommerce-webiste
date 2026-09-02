'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Store,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  FileText,
  ShieldCheck,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Cloud,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Save,
  Radio,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

export const AdminSettings = () => {
  const {
    storeConfig,
    updateStoreConfig,
    restoreMasterSeed,
    saveCurrentAsMasterSeed,
    clearAllCatalog,
    resetToDefaults,
    exportCatalogJson,
    importCatalogJson,
    products,
    categories,
    offers,
    isLiveConnected,
  } = useCatalog();

  const [formData, setFormData] = useState({ ...storeConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [seedActionLoading, setSeedActionLoading] = useState(false);
  const [seedActionMessage, setSeedActionMessage] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@nakodaimitation.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  // Cloudinary Diagnostics State
  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState(null);

  const handleTestCloudinaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTestingCloudinary(true);
    setCloudinaryTestResult(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'nakoda_imitation/test');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCloudinaryTestResult({
          success: true,
          url: data.url,
          isCloudinary: data.isCloudinary,
          message: data.isCloudinary
            ? 'Successfully uploaded and optimized on Cloudinary CDN!'
            : 'Uploaded with local fallback (Add Cloudinary keys to .env.local to enable CDN).',
        });
      } else {
        setCloudinaryTestResult({
          success: false,
          message: data.error || 'Failed to upload test image',
        });
      }
    } catch (err) {
      setCloudinaryTestResult({
        success: false,
        message: 'Network error connecting to /api/upload endpoint',
      });
    } finally {
      setIsTestingCloudinary(false);
      e.target.value = '';
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) return;

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailAddress.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({
          success: true,
          message: data.message || `Test email dispatched to ${testEmailAddress}!`,
          isMock: data.isMock,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data.error || 'Failed to dispatch test email',
        });
      }
    } catch (err) {
      setTestEmailResult({
        success: false,
        message: 'Network error connecting to email API endpoint',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const result = importCatalogJson(importJsonText.trim());
    if (result.success) {
      setImportStatus({ success: true, message: `Successfully restored ${result.count} products!` });
      setImportJsonText('');
    } else {
      setImportStatus({ success: false, message: `Import error: ${result.error}` });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importCatalogJson(content);
        if (result.success) {
          setImportStatus({ success: true, message: `Imported backup from file with ${result.count} products!` });
        } else {
          setImportStatus({ success: false, message: `File import failed: ${result.error}` });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveMasterSeed = async () => {
    setSeedActionLoading(true);
    setSeedActionMessage(null);
    const res = await saveCurrentAsMasterSeed();
    setSeedActionLoading(false);
    if (res.success) {
      setSeedActionMessage({ success: true, text: `Successfully saved active catalog as Master Seed Template v${res.version}!` });
    } else {
      setSeedActionMessage({ success: false, text: res.error || 'Failed to update master seed template.' });
    }
  };

  const handleRestoreMasterSeed = async () => {
    setSeedActionLoading(true);
    setSeedActionMessage(null);
    const res = await restoreMasterSeed();
    setSeedActionLoading(false);
    setIsResetModalOpen(false);
    if (res.success) {
      setSeedActionMessage({ success: true, text: `Successfully restored active catalog with ${res.count} items from Master Seed Template!` });
    } else {
      setSeedActionMessage({ success: false, text: res.error || 'Failed to restore from seed template.' });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Wipe ALL products, categories, and offers from the active database? The store will remain clean & empty across refreshes until you add items or seed demo products.')) {
      setSeedActionLoading(true);
      setSeedActionMessage(null);
      const res = await clearAllCatalog();
      setSeedActionLoading(false);
      if (res.success) {
        setSeedActionMessage({ success: true, text: 'Catalog successfully wiped and emptied.' });
      } else {
        setSeedActionMessage({ success: false, text: res.error || 'Failed to clear catalog.' });
      }
    }
  };

  const handleConfirmReset = () => {
    handleRestoreMasterSeed();
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
          Store Settings & Backup
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
          Configure store identity, WhatsApp ordering phone number, and backup/restore catalog data
        </p>
      </div>

      {/* ── Store Details Form ── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[28px] border border-black/10 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/10">
          <div className="w-10 h-10 rounded-2xl bg-[#171717] flex items-center justify-center text-[#9FD842] shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#171717]">Store Information & WhatsApp Ordering</h2>
            <p className="text-xs text-[#777777]">Configures customer checkout WhatsApp destination, footer address, and contact details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Store Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              WhatsApp Order Phone (No spaces/symbols, with country code)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
              <input
                type="text"
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-mono font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
              />
            </div>
            <p className="text-[11px] text-[#888888] mt-1 font-mono">Example: 919876543210 for India (+91)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Display Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#171717]" />
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Physical Store Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-[#777777]" />
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842] resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Store Timings / Support Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 w-4 h-4 text-[#777777]" />
              <input
                type="text"
                value={formData.timings || '10:00 AM – 9:00 PM (Mon – Sun)'}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-xs text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
              />
            </div>
          </div>
        </div>

        {/* Currency & Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-black/10">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currency || '₹'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-center text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Standard Delivery (₹)
            </label>
            <input
              type="number"
              value={formData.deliveryFee || 0}
              onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 uppercase tracking-wider">
              Free Delivery Threshold (₹)
            </label>
            <input
              type="number"
              value={formData.freeDeliveryThreshold || 999}
              onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-2xl border border-black/10 bg-[#EEEEEC]/50 text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-black/10 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3FCDA] text-[#709E1E] text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Store settings updated live!</span>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#9FD842]" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>

      {/* ── Catalog Backup & Data Portability ── */}
      <div className="bg-white rounded-[28px] border border-black/10 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-black/10">
          <div className="w-10 h-10 rounded-2xl bg-[#EEEEEC] flex items-center justify-center text-[#171717]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#171717]">Catalog Backup & Data Portability</h2>
            <p className="text-xs text-[#777777]">Download full store backup JSON or restore past catalogs in 1 click</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#EEEEEC]/40 border border-black/5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717] mb-1">Export Full Store Backup</h3>
              <p className="text-xs text-[#666666] mb-4">
                Downloads a complete snapshot of all {products.length} products, {categories.length} categories, and promo offers.
              </p>
            </div>
            <button
              type="button"
              onClick={exportCatalogJson}
              className="w-full py-2.5 rounded-full bg-white hover:bg-[#EEEEEC] text-[#171717] font-bold text-xs border border-black/10 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#709E1E]" />
              <span>Download Backup (JSON)</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#EEEEEC]/40 border border-black/5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717] mb-1">Upload Backup File</h3>
              <p className="text-xs text-[#666666] mb-4">
                Restore a previously exported backup file to synchronize products and categories.
              </p>
            </div>
            <label className="w-full py-2.5 rounded-full bg-white hover:bg-[#EEEEEC] text-[#171717] font-bold text-xs border border-black/10 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#709E1E]" />
              <span>Choose Backup JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold ${
            importStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {importStatus.message}
          </div>
        )}
      </div>

      {/* ── Cloudinary Image CDN & Upload Diagnostics ── */}
      <div className="bg-white rounded-[28px] border border-black/10 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-black/10">
          <div className="w-10 h-10 rounded-2xl bg-[#F3FCDA] text-[#709E1E] flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#171717]">Cloudinary Image CDN Integration</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F3FCDA] text-[#5F8C1D] border border-[#9FD842]/40">
                Active & Integrated
              </span>
            </div>
            <p className="text-xs text-[#777777]">
              High-speed image compression, auto-WebP conversion (<code className="bg-black/5 px-1 rounded">f_auto, q_auto</code>), and secure cloud storage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 text-xs text-[#666666] space-y-2">
            <p>
              Product photos uploaded via the Product Editor and Cropper are automatically processed and delivered via Cloudinary's worldwide CDN.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[#888888] flex-wrap">
              <span>• Auto Quality & WebP</span>
              <span>• Lossless Compression</span>
              <span>• Instant Global Edge Delivery</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="w-full py-3 px-5 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95">
              <ImageIcon className="w-4 h-4 text-[#9FD842]" />
              <span>{isTestingCloudinary ? 'Uploading & Testing...' : 'Test Cloudinary Upload'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isTestingCloudinary}
                onChange={handleTestCloudinaryUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {cloudinaryTestResult && (
          <div className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            cloudinaryTestResult.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {cloudinaryTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-bold block">{cloudinaryTestResult.message}</span>
                {cloudinaryTestResult.url && (
                  <span className="text-[11px] text-emerald-700 truncate block mt-0.5 max-w-md">
                    CDN URL: {cloudinaryTestResult.url}
                  </span>
                )}
              </div>
            </div>

            {cloudinaryTestResult.url && (
              <a
                href={cloudinaryTestResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white text-[#171717] border border-emerald-200 hover:bg-emerald-100 transition-colors flex-shrink-0"
                title="View in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Updateable Master Seed Template & Real-Time Sync Controls ── */}
      <div className="bg-white rounded-[28px] border border-black/10 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-black/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3FCDA] text-[#709E1E] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#171717]">Master Seed Template & Real-Time Sync</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isLiveConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{isLiveConnected ? 'Live Stream Active' : 'Connecting...'}</span>
                </span>
              </div>
              <p className="text-xs text-[#777777] mt-0.5">
                Updateable master seed template allows you to save custom store setups or restore defaults anytime
              </p>
            </div>
          </div>
        </div>

        {seedActionMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold ${
              seedActionMessage.success
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {seedActionMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Save Active as Master Seed */}
          <div className="p-4 rounded-2xl bg-[#EEEEEC]/50 border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-extrabold text-[#171717] flex items-center gap-1.5 mb-1">
                <Save className="w-3.5 h-3.5 text-[#709E1E]" />
                <span>Save as Master Seed</span>
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Saves your current {products.length} products & {categories.length} categories as the new permanent master template.
              </p>
            </div>
            <button
              onClick={handleSaveMasterSeed}
              disabled={seedActionLoading}
              className="w-full py-2.5 px-4 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {seedActionLoading ? 'Saving...' : 'Update Master Seed'}
            </button>
          </div>

          {/* Action 2: Restore from Master Seed */}
          <div className="p-4 rounded-2xl bg-[#EEEEEC]/50 border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-extrabold text-[#171717] flex items-center gap-1.5 mb-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#6257FF]" />
                <span>Restore from Master Seed</span>
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Repopulates the live database with all items from your current master seed template.
              </p>
            </div>
            <button
              onClick={() => setIsResetModalOpen(true)}
              disabled={seedActionLoading}
              className="w-full py-2.5 px-4 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {seedActionLoading ? 'Restoring...' : 'Restore Seed Catalog'}
            </button>
          </div>

          {/* Action 3: Permanently Wipe Catalog */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear All Active Items</span>
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Empties all products & categories. Database stays permanently clean and empty across refreshes.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              disabled={seedActionLoading}
              className="w-full py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {seedActionLoading ? 'Wiping...' : 'Clear Catalog'}
            </button>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-6 border border-black/10 shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#F3FCDA] text-[#709E1E] flex items-center justify-center mx-auto mb-4 border border-[#9FD842]/30">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#171717] mb-1">
                Restore Catalog from Master Seed?
              </h3>
              <p className="text-xs text-[#777777] mb-6 leading-relaxed">
                This will load and populate your database with items from the current Master Seed Template. Any newly added unsaved products will be replaced.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#777777] hover:bg-[#EEEEEC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-6 py-2.5 rounded-full bg-[#171717] hover:bg-black text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Yes, Restore Seed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

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
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

export const AdminSettings = () => {
  const {
    storeConfig,
    updateStoreConfig,
    resetToDefaults,
    exportCatalogJson,
    importCatalogJson,
    products,
    categories,
    offers,
  } = useCatalog();

  const [formData, setFormData] = useState({ ...storeConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@shopease.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

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

  const handleConfirmReset = () => {
    resetToDefaults();
    setIsResetModalOpen(false);
    setFormData(storeConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
          Store Settings & Backup
        </h1>
        <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
          Configure store identity, WhatsApp ordering phone number, and backup/restore catalog data
        </p>
      </div>

      {/* ── Store Details Form ── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-8 shadow-[0_4px_20px_rgba(98,87,255,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EAE6FD]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#15152A]">Store Information & WhatsApp Contact</h2>
            <p className="text-xs text-[#626276]">Used for direct WhatsApp checkout, footer information, and headers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              Store Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              Tagline / Subheading
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              WhatsApp Order Phone (No spaces/symbols, with country code)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-mono font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
              />
            </div>
            <p className="text-[11px] text-[#8E8EA0] mt-1">Example: 919876543210 for India (+91)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              Display Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6257FF]" />
              <input
                type="text"
                value={formData.whatsappDisplay}
                onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              Store Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm font-bold text-[#15152A] focus:outline-none focus:border-[#6257FF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#15152A] mb-1.5 uppercase tracking-wider">
            Business Operating Hours
          </label>
          <input
            type="text"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-[#EAE6FD] text-sm text-[#15152A] focus:outline-none focus:border-[#6257FF]"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EAE6FD]">
          {saveSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
              <Check className="w-4 h-4" />
              Settings Saved Successfully!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl gradient-btn-primary text-white font-bold text-xs sm:text-sm shadow-btn hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>

      {/* ── SMTP Email & Notifications Section ── */}
      <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-8 shadow-[0_4px_20px_rgba(98,87,255,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EAE6FD]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6257FF] to-[#EC5AC8] text-white flex items-center justify-center shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#15152A]">SMTP Email & Notification Engine</h2>
            <p className="text-xs text-[#626276]">Automatic order confirmation emails to customers and new order alerts to store administrator</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA0] block mb-1">Email Transporter</span>
            <span className="text-xs font-extrabold text-[#15152A] block">Nodemailer SMTP</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready / Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA0] block mb-1">Customer Order Mail</span>
            <span className="text-xs font-extrabold text-[#15152A] block">Instant Receipt & Tracking</span>
            <span className="text-[11px] text-[#6257FF] font-semibold mt-1 block">Branded HTML Template</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA0] block mb-1">Admin Order Alerts</span>
            <span className="text-xs font-extrabold text-[#15152A] block">Real-time Order Alerts</span>
            <span className="text-[11px] text-[#EC5AC8] font-semibold mt-1 block">Items & Value Summary</span>
          </div>
        </div>

        {/* Live SMTP Tester Form */}
        <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#15152A] mb-1">
              Live SMTP Connection Tester
            </h3>
            <p className="text-xs text-[#626276]">
              Send a real-time verification email to any inbox to verify your SMTP server dispatch.
            </p>
          </div>

          <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE6FD] bg-white text-xs text-[#15152A] focus:outline-none focus:border-[#6257FF] font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTestEmail}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-btn-primary text-white font-bold text-xs shadow-btn hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-60"
            >
              {isSendingTestEmail ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Test Email</span>
            </button>
          </form>

          {testEmailResult && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              testEmailResult.success
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {testEmailResult.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{testEmailResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Backup, Export & Factory Reset Section ── */}
      <div className="bg-white rounded-3xl border border-[#EAE6FD] p-6 sm:p-8 shadow-[0_4px_20px_rgba(98,87,255,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EAE6FD]">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#15152A]">Catalog Backup & Data Controls</h2>
            <p className="text-xs text-[#626276]">Export full JSON backup, restore data, or reset to original sample catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Export */}
          <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6FD] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#15152A] mb-1">Export Catalog to JSON</h3>
              <p className="text-xs text-[#626276] leading-relaxed">
                Download a JSON snapshot containing all {products.length} products, {categories.length} categories, and {offers.length} active coupons.
              </p>
            </div>
            <button
              onClick={exportCatalogJson}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EAE6FD] text-xs font-bold text-[#6257FF] hover:bg-[#EDE9FE] shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          {/* Factory Reset */}
          <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-700 mb-1">Reset to Factory Defaults</h3>
              <p className="text-xs text-[#626276] leading-relaxed">
                Restore the initial set of 16 mock products, 6 categories, and 6 offers. All custom changes will be overwritten.
              </p>
            </div>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Factory Defaults</span>
            </button>
          </div>
        </div>

        {/* Import JSON File / Text */}
        <div className="pt-4 border-t border-[#EAE6FD] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#15152A]">
            Import Catalog Backup File
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-[#8B5CF6]/50 bg-[#FAF9FF] text-xs font-bold text-[#6257FF] hover:bg-[#EDE9FE] cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Choose Backup JSON File to Upload</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              importStatus.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {importStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

      </div>

      {/* ── Reset Confirmation Dialog ── */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="fixed inset-0 bg-[#15152A]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-[#EAE6FD] shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#15152A] mb-1">
                Restore Factory Defaults?
              </h3>
              <p className="text-xs text-[#626276] max-w-xs mx-auto mb-6">
                This will reset all products, categories, and offers back to the pristine default store catalog.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#626276] hover:bg-[#FAF9FF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                >
                  Yes, Reset Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

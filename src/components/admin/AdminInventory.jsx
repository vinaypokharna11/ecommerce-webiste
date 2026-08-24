import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { STORE_CONFIG } from '../../data/mockData';

export const AdminInventory = () => {
  const { products, updateProductStock, bulkUpdateStockStatus } = useCatalog();
  const [filter, setFilter] = useState('all'); // 'all', 'out_of_stock', 'low_stock', 'in_stock'
  const [searchQuery, setSearchQuery] = useState('');

  const outOfStockProducts = products.filter((p) => p.stockCount === 0 || p.stockStatus === 'out_of_stock');
  const lowStockProducts = products.filter((p) => p.stockCount > 0 && p.stockCount < 5);
  const inStockProducts = products.filter((p) => p.stockCount >= 5 && p.stockStatus === 'in_stock');

  const filteredList = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.categoryName?.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filter === 'out_of_stock') return p.stockCount === 0 || p.stockStatus === 'out_of_stock';
    if (filter === 'low_stock') return p.stockCount > 0 && p.stockCount < 5;
    if (filter === 'in_stock') return p.stockCount >= 5;
    return true;
  });

  const handleRestockAllLow = () => {
    const ids = [...outOfStockProducts, ...lowStockProducts].map((p) => p.id);
    if (ids.length === 0) return;
    if (window.confirm(`Restock all ${ids.length} low/out-of-stock products to 15 units?`)) {
      bulkUpdateStockStatus(ids, 'in_stock', 15);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15152A] tracking-tight">
            Inventory & Stock Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#626276] mt-0.5">
            Monitor real-time inventory levels, out-of-stock alerts, and stock adjustments
          </p>
        </div>

        <button
          onClick={handleRestockAllLow}
          disabled={outOfStockProducts.length + lowStockProducts.length === 0}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restock All Low Items (+15)</span>
        </button>
      </div>

      {/* ── Inventory KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* In Stock */}
        <div
          onClick={() => setFilter('in_stock')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filter === 'in_stock'
              ? 'bg-[#F0FDF4] border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-[#EAE6FD] hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
              Healthy
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#15152A]">{inStockProducts.length}</div>
          <div className="text-xs text-[#626276] mt-0.5">Products In Stock (5+ units)</div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setFilter('low_stock')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filter === 'low_stock'
              ? 'bg-[#FFFBEB] border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-[#EAE6FD] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full">
              Attention
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#15152A]">{lowStockProducts.length}</div>
          <div className="text-xs text-[#626276] mt-0.5">Low Stock Items (1 to 4 units)</div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setFilter('out_of_stock')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filter === 'out_of_stock'
              ? 'bg-[#FFF1F2] border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-[#EAE6FD] hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100/60 px-2.5 py-0.5 rounded-full">
              Urgent
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#15152A]">{outOfStockProducts.length}</div>
          <div className="text-xs text-[#626276] mt-0.5">Out of Stock (0 units)</div>
        </div>
      </div>

      {/* ── Table & Search Bar ── */}
      <div className="bg-white rounded-3xl border border-[#EAE6FD] shadow-[0_4px_20px_rgba(98,87,255,0.04)] overflow-hidden">
        
        {/* Controls */}
        <div className="p-4 border-b border-[#EAE6FD] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9FF]/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-[#EAE6FD] text-xs text-[#15152A] focus:outline-none focus:border-[#6257FF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-[#6257FF] text-white' : 'bg-white text-[#626276] border border-[#EAE6FD]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-rose-200'
              }`}
            >
              Out of Stock ({outOfStockProducts.length})
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'low_stock' ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 border border-amber-200'
              }`}
            >
              Low Stock ({lowStockProducts.length})
            </button>
          </div>
        </div>

        {/* Stock List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE6FD] bg-[#FAF9FF] text-[11px] font-bold text-[#8E8EA0] uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Current Units</th>
                <th className="py-3 px-4 text-right">Quick Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6FD]/60 text-xs">
              {filteredList.map((product) => {
                const count = product.stockCount ?? 10;
                const isOut = count === 0 || product.stockStatus === 'out_of_stock';
                const isLow = count > 0 && count < 5;

                return (
                  <tr key={product.id} className="hover:bg-[#F9F8FF] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF9FF] border border-[#EAE6FD] p-1 flex items-center justify-center flex-shrink-0">
                          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <div className="font-bold text-[#15152A] line-clamp-1">{product.name}</div>
                          <span className="text-[10px] font-mono text-[#8E8EA0]">SKU: {product.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#626276]">
                      {product.categoryName || product.category}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-[#15152A]">
                      {STORE_CONFIG.currency}{product.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Low ({count})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock ({count})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-sm">
                      <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}>
                        {count}
                      </span>
                    </td>

                    {/* Quick Replenish Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateProductStock(product.id, -1, true)}
                          className="px-2 py-1 rounded-lg bg-[#FAF9FF] border border-[#EAE6FD] text-xs font-bold text-[#626276] hover:bg-[#EDE9FE]"
                          title="Decrease 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateProductStock(product.id, 1, true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 border border-emerald-200"
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => updateProductStock(product.id, 5, true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 border border-emerald-200"
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateProductStock(product.id, 20, true)}
                          className="px-2.5 py-1 rounded-lg bg-[#6257FF] text-white font-bold hover:bg-[#5044ED]"
                          title="Add 20"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
